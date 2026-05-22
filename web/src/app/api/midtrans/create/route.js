// Create Midtrans Snap transaction for topup
import sql from "@/app/api/utils/sql";
import {
  getSessionUser,
  generateOrderNumber,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";
import {
  getClientIp,
  getUserAgent,
  deviceFingerprint,
  logPaymentAudit,
  logSuspicious,
} from "@/app/api/utils/finance";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount || 0);
    const clientFp = body.device_fp || null;
    const ip = getClientIp(request);
    const ua = getUserAgent(request);
    const fp = deviceFingerprint(request, clientFp);

    // 1) Load settings
    const settings = await sql`
      SELECT mode, merchant_id, client_key, server_key, is_active, is_maintenance,
             min_topup, max_topup, expiry_minutes,
             enable_qris, enable_va, enable_ewallet, enable_cc,
             maintenance_title, maintenance_description, maintenance_until
      FROM midtrans_settings WHERE id = 1 LIMIT 1
    `;
    const s = settings[0];
    if (!s || !s.is_active) {
      return Response.json(
        { error: "Midtrans tidak aktif. Hubungi admin." },
        { status: 400 },
      );
    }
    if (s.is_maintenance) {
      return Response.json(
        {
          error: s.maintenance_title || "Payment system sedang maintenance",
          maintenance: true,
          description:
            s.maintenance_description ||
            "Silakan coba kembali beberapa saat lagi.",
          until: s.maintenance_until,
        },
        { status: 503 },
      );
    }
    if (!s.server_key || !s.client_key) {
      return Response.json(
        { error: "Midtrans belum dikonfigurasi (server/client key kosong)." },
        { status: 400 },
      );
    }

    const minTopup = Number(s.min_topup || 10000);
    const maxTopup = Number(s.max_topup || 50000000);
    if (amount < minTopup) {
      return Response.json(
        { error: `Minimal topup Rp ${minTopup.toLocaleString("id-ID")}` },
        { status: 400 },
      );
    }
    if (amount > maxTopup) {
      return Response.json(
        { error: `Maksimal topup Rp ${maxTopup.toLocaleString("id-ID")}` },
        { status: 400 },
      );
    }

    // 2) Anti-duplicate: block if user has another pending Midtrans topup in last 5 min with same amount
    const dupe = await sql`
      SELECT id FROM topups
      WHERE user_id = ${user.id}
        AND payment_method = 'midtrans'
        AND status = 'pending'
        AND amount = ${amount}
        AND created_at > NOW() - INTERVAL '5 minutes'
      LIMIT 1
    `;
    if (dupe[0]) {
      await logSuspicious({
        user_id: user.id,
        activity_type: "duplicate_topup_attempt",
        severity: "low",
        ip_address: ip,
        user_agent: ua,
        device_fingerprint: fp,
        reference_type: "topup",
        reference_id: dupe[0].id,
        description: `Duplicate Midtrans topup attempt amount=${amount}`,
      });
      return Response.json(
        {
          error:
            "Anda baru saja membuat topup dengan nominal yang sama. Selesaikan pembayaran sebelumnya atau tunggu 5 menit.",
        },
        { status: 429 },
      );
    }

    // 3) Create topup record (pending)
    const num = generateOrderNumber("MTP");
    const orderId = `${num}-${Date.now().toString(36)}`;
    const expiryMin = Math.max(
      5,
      Math.min(1440, Number(s.expiry_minutes) || 60),
    );
    const expiresAt = new Date(Date.now() + expiryMin * 60 * 1000);

    const inserted = await sql`
      INSERT INTO topups
        (user_id, topup_number, amount, payment_method, status,
         midtrans_order_id, expires_at, notes)
      VALUES
        (${user.id}, ${num}, ${amount}, 'midtrans', 'pending',
         ${orderId}, ${expiresAt.toISOString()}, 'Midtrans Snap')
      RETURNING *
    `;
    const topup = inserted[0];

    // 4) Build enabled payment list
    const enabled = [];
    if (s.enable_va)
      enabled.push(
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "echannel",
        "other_va",
      );
    if (s.enable_qris) enabled.push("other_qris");
    if (s.enable_ewallet) enabled.push("gopay", "shopeepay", "dana");
    if (s.enable_cc) enabled.push("credit_card");

    // 5) Call Midtrans Snap API
    const baseUrl =
      s.mode === "production"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const authHeader =
      "Basic " + Buffer.from(s.server_key + ":").toString("base64");

    const snapBody = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: user.full_name || user.name || "Member",
        email: user.email || "no-email@hyperdrop.local",
        phone: user.whatsapp || user.phone || "",
      },
      item_details: [
        {
          id: "topup",
          price: Math.round(amount),
          quantity: 1,
          name: `Topup Saldo HyperDrop ${num}`,
          category: "Topup",
        },
      ],
      enabled_payments: enabled.length > 0 ? enabled : undefined,
      expiry: {
        unit: "minutes",
        duration: expiryMin,
      },
      credit_card: s.enable_cc ? { secure: true } : undefined,
    };

    let snapRes;
    try {
      const resp = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(snapBody),
      });
      snapRes = await resp.json().catch(() => ({}));
      if (!resp.ok || !snapRes.token) {
        await sql`UPDATE topups SET status = 'failed', notes = ${`Midtrans error: ${JSON.stringify(snapRes).slice(0, 400)}`} WHERE id = ${topup.id}`;
        await logPaymentAudit({
          reference_type: "topup",
          reference_id: topup.id,
          user_id: user.id,
          actor_type: "system",
          action: "midtrans_snap_create_failed",
          status_before: "pending",
          status_after: "failed",
          amount,
          ip_address: ip,
          metadata: { snap_response: snapRes },
        });
        return Response.json(
          {
            error:
              snapRes?.error_messages?.[0] ||
              "Gagal membuat transaksi Midtrans",
          },
          { status: 502 },
        );
      }
    } catch (e) {
      console.error("Midtrans Snap call failed:", e);
      await sql`UPDATE topups SET status = 'failed', notes = 'Midtrans network error' WHERE id = ${topup.id}`;
      return Response.json(
        { error: "Gagal koneksi ke Midtrans. Coba lagi sebentar." },
        { status: 502 },
      );
    }

    // 6) Save snap token/url
    await sql`
      UPDATE topups
      SET midtrans_snap_token = ${snapRes.token},
          midtrans_redirect_url = ${snapRes.redirect_url || null},
          midtrans_response = ${JSON.stringify({ create: snapRes })}::jsonb,
          updated_at = NOW()
      WHERE id = ${topup.id}
    `;

    await logPaymentAudit({
      reference_type: "topup",
      reference_id: topup.id,
      user_id: user.id,
      actor_type: "user",
      actor_id: user.id,
      action: "midtrans_snap_created",
      status_after: "pending",
      amount,
      ip_address: ip,
      metadata: { order_id: orderId, mode: s.mode },
    });

    await logActivity(
      user.id,
      "midtrans_create",
      `Midtrans topup ${num} Rp ${amount}`,
    );

    await notifyMember(
      user.id,
      "Topup Midtrans Dibuat",
      `Selesaikan pembayaran topup ${num} sebesar Rp ${amount.toLocaleString("id-ID")} sebelum kedaluwarsa.`,
      "info",
      "/dashboard/topup",
      true,
      { amount: amount.toLocaleString("id-ID"), order: num },
      "template_topup_pending",
    );

    return Response.json({
      ok: true,
      topup_number: num,
      order_id: orderId,
      snap_token: snapRes.token,
      redirect_url: snapRes.redirect_url || null,
      client_key: s.client_key,
      mode: s.mode,
      expires_at: expiresAt.toISOString(),
      amount,
    });
  } catch (e) {
    console.error("Midtrans create error:", e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
