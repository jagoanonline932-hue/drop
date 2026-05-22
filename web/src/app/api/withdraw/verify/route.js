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
  logSuspicious,
  logPaymentAudit,
  checkUserOtpBlock,
} from "@/app/api/utils/finance";

// Verify OTP & create withdraw — atomic + anti-fraud
export async function POST(request) {
  const ip = getClientIp(request);
  const ua = getUserAgent(request);
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await request.json().catch(() => ({}));
    const otp = String(b.otp || "").trim();
    const amount = Number(b.amount || 0);
    const fp = deviceFingerprint(request, b.device_fp);

    if (!otp)
      return Response.json({ error: "Kode OTP wajib diisi" }, { status: 400 });

    // Block check
    const block = await checkUserOtpBlock(user.id);
    if (block.blocked) {
      return Response.json(
        { error: block.reason, blocked: true },
        { status: 403 },
      );
    }

    // Find latest unused OTP for this user
    const found = await sql`
      SELECT * FROM withdraw_otps
      WHERE user_id = ${user.id} AND used = false AND expires_at > NOW()
      ORDER BY id DESC LIMIT 1
    `;
    if (!found[0])
      return Response.json(
        {
          error: "OTP tidak ditemukan atau sudah kedaluwarsa. Minta kode baru.",
        },
        { status: 400 },
      );

    if (found[0].attempts >= 5) {
      await sql`UPDATE withdraw_otps SET used = true, status = 'blocked' WHERE id = ${found[0].id}`;
      await logSuspicious({
        user_id: user.id,
        activity_type: "otp_brute_force",
        severity: "high",
        ip_address: ip,
        user_agent: ua,
        device_fingerprint: fp,
        reference_type: "withdraw_otp",
        reference_id: found[0].id,
        description: "OTP brute force — 5 wrong attempts hit cap",
      });
      return Response.json(
        { error: "Terlalu banyak percobaan salah. Minta kode OTP baru." },
        { status: 400 },
      );
    }

    if (String(found[0].otp_code) !== otp) {
      await sql`UPDATE withdraw_otps SET attempts = attempts + 1 WHERE id = ${found[0].id}`;
      return Response.json(
        {
          error: `Kode OTP salah (${found[0].attempts + 1}/5). Cek WhatsApp Anda.`,
        },
        { status: 400 },
      );
    }

    if (Number(found[0].amount) !== amount) {
      await logSuspicious({
        user_id: user.id,
        activity_type: "otp_amount_tamper",
        severity: "high",
        ip_address: ip,
        user_agent: ua,
        device_fingerprint: fp,
        reference_type: "withdraw_otp",
        reference_id: found[0].id,
        description: `OTP amount mismatch req=${amount} otp=${found[0].amount}`,
      });
      return Response.json(
        { error: "Nominal berbeda dari saat minta OTP. Minta kode baru." },
        { status: 400 },
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
    const fee = Number(
      settings.find((s) => s.setting_key === "withdraw_fee")?.setting_value ||
        2500,
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
        { error: "Data rekening belum lengkap" },
        { status: 400 },
      );

    // Anti-duplicate: prevent rapid duplicate withdraw with same amount within 60s
    const dupe = await sql`
      SELECT id FROM withdrawals
      WHERE user_id = ${user.id}
        AND amount = ${amount}
        AND created_at > NOW() - INTERVAL '60 seconds'
      LIMIT 1
    `;
    if (dupe[0]) {
      await logSuspicious({
        user_id: user.id,
        activity_type: "duplicate_withdraw_attempt",
        severity: "medium",
        ip_address: ip,
        user_agent: ua,
        device_fingerprint: fp,
        reference_type: "withdraw",
        reference_id: dupe[0].id,
        description: `Duplicate withdraw attempt amount=${amount}`,
      });
      return Response.json(
        { error: "Permintaan withdraw duplikat terdeteksi. Tunggu 1 menit." },
        { status: 429 },
      );
    }

    // Mark OTP verified
    await sql`
      UPDATE withdraw_otps
      SET used = true, status = 'verified', verified_at = NOW()
      WHERE id = ${found[0].id}
    `;

    // Create withdraw atomically: insert + deduct balance + ledger
    const net = amount - fee;
    const num = generateOrderNumber("WD");
    const result = await sql`
      INSERT INTO withdrawals
        (user_id, withdraw_number, amount, fee, net_amount,
         bank_name, bank_account_number, bank_account_holder, status)
      VALUES
        (${user.id}, ${num}, ${amount}, ${fee}, ${net},
         ${user.bank_name}, ${user.bank_account_number}, ${user.bank_account_holder},
         'pending')
      RETURNING *
    `;
    await sql.transaction([
      sql`UPDATE user_profiles
          SET balance = balance - ${amount}, updated_at = NOW()
          WHERE user_id = ${user.id}`,
      sql`INSERT INTO balance_transactions
            (user_id, transaction_type, amount, balance_before, balance_after,
             reference_type, reference_id, description)
          SELECT ${user.id}, 'withdraw_pending', ${-amount},
                 balance + ${amount}, balance, 'withdraw', ${result[0].id},
                 ${`Withdraw ${num} (pending) — verified by OTP`}
          FROM user_profiles WHERE user_id = ${user.id}`,
    ]);

    await logPaymentAudit({
      reference_type: "withdraw",
      reference_id: result[0].id,
      user_id: user.id,
      actor_type: "user",
      actor_id: user.id,
      action: "withdraw_otp_verified",
      status_after: "pending",
      amount,
      ip_address: ip,
      metadata: { otp_id: found[0].id, device_fp: fp },
    });
    await logActivity(
      user.id,
      "create_withdraw_otp",
      `Withdraw ${num} Rp ${amount} (OTP verified)`,
    );
    await notifyMember(
      user.id,
      "Withdraw Berhasil Diajukan ✓",
      `Withdraw ${num} sebesar Rp ${amount.toLocaleString("id-ID")} berhasil diverifikasi dan diajukan. Menunggu approval admin.`,
      "success",
      "/dashboard/withdraw",
      true,
      { amount: amount.toLocaleString("id-ID"), order: num },
      "template_withdraw_request",
    );

    return Response.json({ withdraw: result[0] });
  } catch (e) {
    console.error("withdraw verify error:", e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
