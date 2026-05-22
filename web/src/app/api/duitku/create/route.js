import crypto from "node:crypto";
import sql from "@/app/api/utils/sql";

import {
  getSessionUser,
  generateOrderNumber,
  logActivity,
  notifyMember,
} from "@/app/api/utils/helpers";

// ========================================
// CREATE DUITKU INVOICE
// ========================================
export async function POST(request) {
  try {
    // ========================================
    // AUTH USER
    // ========================================
    const user = await getSessionUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ========================================
    // REQUEST BODY
    // ========================================
    const body = await request.json();

    const amount = Number(body.amount || 0);

    const paymentMethod = body.paymentMethod || "QRIS";

    // ========================================
    // VALIDATION
    // ========================================
    if (amount < 10000) {
      return Response.json(
        {
          error: "Minimal topup Rp 10.000",
        },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return Response.json(
        {
          error: "Metode pembayaran wajib dipilih",
        },
        { status: 400 }
      );
    }

    // ========================================
    // GET SETTINGS
    // ========================================
    const settings = await sql`
      SELECT *
      FROM duitku_settings
      WHERE id = 1
      LIMIT 1
    `;

    const cfg = settings[0];

    if (!cfg || !cfg.is_active || !cfg.merchant_code || !cfg.api_key) {
      return Response.json(
        {
          error: "Duitku belum dikonfigurasi admin",
        },
        { status: 400 }
      );
    }

    // ========================================
    // BASE URL
    // ========================================
    const baseUrl =
      process.env.NEXT_PUBLIC_CREATE_APP_URL ||
      request.headers.get("origin") ||
      "";

    const callbackUrl = cfg.callback_url || `${baseUrl}/api/duitku/callback`;

    const returnUrl =
      cfg.return_url || `${baseUrl}/dashboard/topup?duitku=success`;

    // ========================================
    // API HOST
    // ========================================
    const apiHost =
      cfg.mode === "production"
        ? "https://passport.duitku.com"
        : "https://sandbox-new.duitku.com";

    // ========================================
    // ORDER
    // ========================================
    const merchantOrderId = generateOrderNumber("DTK");

    const topupNumber = generateOrderNumber("TUP");

    // ========================================
    // SIGNATURE
    // MD5(merchantCode + merchantOrderId + amount + apiKey)
    // ========================================
    const signature = crypto
      .createHash("md5")
      .update(`${cfg.merchant_code}${merchantOrderId}${amount}${cfg.api_key}`)
      .digest("hex");

    // ========================================
    // PRODUCT DETAIL
    // ========================================
    const productDetails = `Topup HyperDrop Rp ${amount.toLocaleString(
      "id-ID"
    )}`;

    // ========================================
    // PAYLOAD
    // ========================================
    const payload = {
      merchantCode: cfg.merchant_code,

      paymentAmount: amount,

      paymentMethod,

      merchantOrderId,

      productDetails,

      email: user.email || "user@hyperdrop.id",

      customerVaName: (user.name || user.full_name || "Member").slice(0, 20),

      callbackUrl,

      returnUrl,

      signature,

      expiryPeriod: 60,
    };

    // ========================================
    // DEBUG
    // ========================================
    console.log("DUITKU API HOST:", apiHost);

    console.log("DUITKU PAYLOAD:", payload);

    // ========================================
    // SAVE TOPUP
    // ========================================
    const topupResult = await sql`
      INSERT INTO topups (
        user_id,
        topup_number,
        amount,
        payment_method,
        status,
        notes,
        duitku_merchant_order_id,
        created_at
      )
      VALUES (
        ${user.id},
        ${topupNumber},
        ${amount},
        ${paymentMethod},
        'pending',
        ${body.notes || null},
        ${merchantOrderId},
        NOW()
      )
      RETURNING *
    `;

    const topup = topupResult[0];

    // ========================================
    // FETCH DUITKU
    // ========================================
    let dRes = null;

    try {
      // TIMEOUT
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      const duitkuRequest = await fetch(
        `${apiHost}/webapi/api/merchant/v2/inquiry`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),

          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      // ========================================
      // RAW RESPONSE
      // ========================================
      const rawText = await duitkuRequest.text();

      console.log("DUITKU STATUS:", duitkuRequest.status);

      console.log("DUITKU RAW RESPONSE:", rawText);

      // ========================================
      // JSON PARSE
      // ========================================
      try {
        dRes = JSON.parse(rawText);
      } catch (jsonErr) {
        console.error("DUITKU JSON PARSE ERROR:", jsonErr);

        await sql`
          UPDATE topups
          SET
            status = 'rejected',
            admin_notes = 'Response Duitku bukan JSON',
            duitku_response = ${rawText},
            updated_at = NOW()
          WHERE id = ${topup.id}
        `;

        return Response.json(
          {
            error: "Response Duitku bukan JSON",
            raw: rawText,
          },
          { status: 500 }
        );
      }
    } catch (fetchErr) {
      console.error("DUITKU FETCH ERROR:", fetchErr);

      await sql`
        UPDATE topups
        SET
          status = 'rejected',
          admin_notes = ${fetchErr.message || "Fetch Duitku gagal"},
          updated_at = NOW()
        WHERE id = ${topup.id}
      `;

      return Response.json(
        {
          error: "Gagal terhubung ke Duitku",
          message: fetchErr.message,
        },
        { status: 502 }
      );
    }

    // ========================================
    // INVALID RESPONSE
    // ========================================
    if (!dRes || (dRes.statusCode && String(dRes.statusCode) !== "00")) {
      console.error("DUITKU ERROR RESPONSE:", dRes);

      await sql`
        UPDATE topups
        SET
          status = 'rejected',
          admin_notes = ${dRes?.statusMessage || "Duitku error"},
          duitku_response = ${JSON.stringify(dRes || {})},
          updated_at = NOW()
        WHERE id = ${topup.id}
      `;

      return Response.json(
        {
          error: dRes?.statusMessage || "Duitku error",
          duitku: dRes,
        },
        { status: 400 }
      );
    }

    // ========================================
    // UPDATE TOPUP
    // ========================================
    await sql`
      UPDATE topups
      SET
        duitku_reference = ${dRes.reference || null},
        duitku_payment_url = ${dRes.paymentUrl || null},
        duitku_response = ${JSON.stringify(dRes)},
        updated_at = NOW()
      WHERE id = ${topup.id}
    `;

    // ========================================
    // LOG ACTIVITY
    // ========================================
    await logActivity(
      user.id,
      "create_topup_duitku",
      `Topup ${topupNumber} via Duitku Rp ${amount}`
    );

    // ========================================
    // NOTIFICATION
    // ========================================
    await notifyMember(
      user.id,
      "Topup Menunggu Pembayaran",

      `Topup ${topupNumber} sebesar Rp ${amount.toLocaleString(
        "id-ID"
      )} menunggu pembayaran via Duitku.`,

      "info",

      "/dashboard/topup",

      true,

      {
        amount: amount.toLocaleString("id-ID"),

        order: topupNumber,
      },

      "template_topup_pending"
    );

    // ========================================
    // SUCCESS RESPONSE
    // ========================================
    return Response.json({
      success: true,

      topup_number: topupNumber,

      merchantOrderId,

      reference: dRes.reference,

      paymentUrl: dRes.paymentUrl,

      amount,

      paymentMethod,

      duitku: dRes,
    });
  } catch (e) {
    console.error("DUITKU INTERNAL ERROR:", e);

    return Response.json(
      {
        error: "Internal Server Error",

        message: e.message,
      },
      { status: 500 }
    );
  }
}