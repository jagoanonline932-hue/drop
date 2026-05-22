import sql from "@/app/api/utils/sql";
import {
  getSessionUser,
  sendFonnteNotification,
  formatTemplate,
} from "@/app/api/utils/helpers";
import {
  getClientIp,
  getUserAgent,
  deviceFingerprint,
  logSuspicious,
  checkUserOtpBlock,
} from "@/app/api/utils/finance";

// Request OTP (POST) — generates code, stores it, sends via Fonnte WhatsApp
// Hardened with: IP logging, device fingerprint, anti-spam resend, brute-force block
export async function POST(request) {
  const ip = getClientIp(request);
  const ua = getUserAgent(request);
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const b = await request.json().catch(() => ({}));
    const amount = Number(b.amount || 0);
    const fp = deviceFingerprint(request, b.device_fp);

    // 0) Block check
    const block = await checkUserOtpBlock(user.id);
    if (block.blocked) {
      return Response.json(
        { error: block.reason, blocked: true },
        { status: 403 },
      );
    }

    // Settings
    const settings = await sql`
      SELECT setting_key, setting_value FROM site_settings
      WHERE setting_key IN ('min_withdraw','withdraw_fee')
    `;
    const minW = Number(
      settings.find((s) => s.setting_key === "min_withdraw")?.setting_value ||
        50000,
    );
    if (amount < minW)
      return Response.json(
        { error: `Minimal withdraw Rp ${minW.toLocaleString("id-ID")}` },
        { status: 400 },
      );
    if (Number(user.balance) < amount)
      return Response.json({ error: "Saldo tidak cukup" }, { status: 400 });
    if (
      !user.bank_name ||
      !user.bank_account_number ||
      !user.bank_account_holder
    )
      return Response.json(
        { error: "Lengkapi data rekening dulu di Pengaturan" },
        { status: 400 },
      );

    const phone = user.whatsapp || user.phone;
    if (!phone)
      return Response.json(
        { error: "Nomor WhatsApp belum diatur di Pengaturan" },
        { status: 400 },
      );

    // Fonnte active check
    const fonnte = await sql`
      SELECT api_token, is_active, template_withdraw_otp
      FROM fonnte_settings WHERE id = 1 LIMIT 1
    `;
    if (!fonnte[0]?.is_active || !fonnte[0]?.api_token) {
      return Response.json(
        {
          error:
            "Sistem OTP WhatsApp belum aktif. Hubungi admin untuk mengaktifkan Fonnte.",
        },
        { status: 500 },
      );
    }

    // Anti-spam: max 3 OTP requests / 10 min
    const recent10m = await sql`
      SELECT COUNT(*) AS cnt FROM withdraw_otps
      WHERE user_id = ${user.id}
        AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    if (Number(recent10m[0]?.cnt || 0) >= 3) {
      await logSuspicious({
        user_id: user.id,
        activity_type: "otp_spam_attempt",
        severity: "medium",
        ip_address: ip,
        user_agent: ua,
        device_fingerprint: fp,
        description: "More than 3 OTP requests in 10 min",
      });
      return Response.json(
        {
          error:
            "Terlalu banyak permintaan OTP. Tunggu beberapa menit lalu coba lagi.",
        },
        { status: 429 },
      );
    }

    // Cooldown 60s
    const recent = await sql`
      SELECT id, created_at, resend_count FROM withdraw_otps
      WHERE user_id = ${user.id} AND used = false AND expires_at > NOW()
        AND created_at > NOW() - INTERVAL '60 seconds'
      ORDER BY id DESC LIMIT 1
    `;
    if (recent[0]) {
      const seconds =
        60 - Math.floor((Date.now() - new Date(recent[0].created_at)) / 1000);
      return Response.json(
        {
          error: `OTP baru saja dikirim. Mohon tunggu ${Math.max(seconds, 1)} detik.`,
          cooldown_seconds: Math.max(seconds, 1),
        },
        { status: 429 },
      );
    }

    // Detect rapid withdraw bursts (multiple OTPs across short period with different amounts)
    const rapid = await sql`
      SELECT COUNT(DISTINCT amount) AS distinct_amounts
      FROM withdraw_otps
      WHERE user_id = ${user.id}
        AND created_at > NOW() - INTERVAL '15 minutes'
    `;
    if (Number(rapid[0]?.distinct_amounts || 0) >= 4) {
      await logSuspicious({
        user_id: user.id,
        activity_type: "rapid_withdraw_pattern",
        severity: "high",
        ip_address: ip,
        user_agent: ua,
        device_fingerprint: fp,
        description: "User tried 4+ different withdraw amounts within 15 min",
      });
    }

    // Invalidate old unused OTPs for this user
    await sql`
      UPDATE withdraw_otps
      SET used = true, status = 'invalidated'
      WHERE user_id = ${user.id} AND used = false
    `;

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const row = await sql`
      INSERT INTO withdraw_otps
        (user_id, otp_code, phone, amount, expires_at,
         ip_address, user_agent, device_fingerprint, status, delivery_status)
      VALUES
        (${user.id}, ${otp}, ${phone}, ${amount}, ${expiresAt.toISOString()},
         ${ip}, ${ua}, ${fp}, 'pending', 'sending')
      RETURNING id, expires_at
    `;

    // Send WhatsApp
    const template =
      fonnte[0].template_withdraw_otp ||
      "🔐 *KODE OTP WITHDRAW HYPERDROP*\n\nHalo {name},\n\nKode OTP untuk withdraw Rp {amount}:\n*{otp}*\n\nBerlaku 5 menit. Jangan bagikan kode ini ke siapapun.\n\n— HyperDrop Team";
    const message = formatTemplate(template, {
      name: user.full_name || user.name || "Member",
      amount: amount.toLocaleString("id-ID"),
      otp,
    });
    const sent = await sendFonnteNotification(phone, message);

    // Log delivery
    await sql`
      UPDATE withdraw_otps
      SET delivery_status = ${sent ? "delivered" : "failed"},
          status = ${sent ? "sent" : "failed"}
      WHERE id = ${row[0].id}
    `;
    await sql`
      INSERT INTO otp_resend_logs
        (user_id, otp_type, ip_address, user_agent, phone, amount, delivery_status)
      VALUES
        (${user.id}, 'withdraw', ${ip}, ${ua}, ${phone}, ${amount},
         ${sent ? "sent" : "failed"})
    `;

    return Response.json({
      ok: true,
      sent,
      otp_id: row[0].id,
      expires_at: row[0].expires_at,
      masked_phone:
        String(phone).replace(/^0/, "62").slice(0, 4) +
        "****" +
        String(phone).slice(-4),
      message: sent
        ? "OTP terkirim ke WhatsApp Anda"
        : "OTP berhasil dibuat tapi gagal terkirim ke WhatsApp. Hubungi admin.",
    });
  } catch (e) {
    console.error("withdraw OTP error:", e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
