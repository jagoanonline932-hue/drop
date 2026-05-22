import sql from "@/app/api/utils/sql";

// Extract client IP from request
export function getClientIp(request) {
  try {
    const h = request.headers;
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      h.get("cf-connecting-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

export function getUserAgent(request) {
  try {
    return request.headers.get("user-agent") || "unknown";
  } catch {
    return "unknown";
  }
}

// Lightweight device fingerprint (UA-based; client can also pass one)
export function deviceFingerprint(request, clientFp = null) {
  if (clientFp && typeof clientFp === "string") return clientFp.slice(0, 128);
  const ua = getUserAgent(request);
  const lang = request.headers.get("accept-language") || "";
  let h = 0;
  const s = ua + "|" + lang;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return `fp_${Math.abs(h).toString(36)}`;
}

export async function logPaymentAudit({
  reference_type,
  reference_id,
  user_id,
  actor_type = "system",
  actor_id = null,
  action,
  status_before = null,
  status_after = null,
  amount = null,
  ip_address = null,
  metadata = null,
}) {
  try {
    await sql`
      INSERT INTO payment_audit_logs
        (reference_type, reference_id, user_id, actor_type, actor_id, action,
         status_before, status_after, amount, ip_address, metadata)
      VALUES
        (${reference_type}, ${reference_id}, ${user_id}, ${actor_type}, ${actor_id}, ${action},
         ${status_before}, ${status_after}, ${amount}, ${ip_address},
         ${metadata ? JSON.stringify(metadata) : null})
    `;
  } catch (e) {
    console.error("logPaymentAudit failed:", e);
  }
}

export async function logSuspicious({
  user_id,
  activity_type,
  severity = "medium",
  ip_address = null,
  user_agent = null,
  device_fingerprint = null,
  reference_type = null,
  reference_id = null,
  description = null,
  metadata = null,
}) {
  try {
    await sql`
      INSERT INTO suspicious_activity_logs
        (user_id, activity_type, severity, ip_address, user_agent, device_fingerprint,
         reference_type, reference_id, description, metadata)
      VALUES
        (${user_id}, ${activity_type}, ${severity}, ${ip_address}, ${user_agent}, ${device_fingerprint},
         ${reference_type}, ${reference_id}, ${description},
         ${metadata ? JSON.stringify(metadata) : null})
    `;
  } catch (e) {
    console.error("logSuspicious failed:", e);
  }
}

// Returns { blocked, reason } if user should be temporarily blocked from OTP/withdraw
export async function checkUserOtpBlock(userId) {
  try {
    // 1. Too many failed OTP verifications in last 30 min => block
    const recent = await sql`
      SELECT COALESCE(SUM(attempts), 0) AS total_attempts,
             COUNT(*) FILTER (WHERE attempts >= 5) AS hard_fails
      FROM withdraw_otps
      WHERE user_id = ${userId}
        AND created_at > NOW() - INTERVAL '30 minutes'
    `;
    if (Number(recent[0]?.hard_fails || 0) >= 3) {
      return {
        blocked: true,
        reason:
          "Akun Anda diblok sementara karena terlalu banyak percobaan OTP gagal. Coba lagi dalam 30 menit.",
      };
    }
    // 2. Suspicious activity flagged but unresolved (auto-block severity high)
    const susp = await sql`
      SELECT COUNT(*) AS cnt FROM suspicious_activity_logs
      WHERE user_id = ${userId}
        AND severity IN ('high','critical')
        AND resolved = false
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    if (Number(susp[0]?.cnt || 0) >= 1) {
      return {
        blocked: true,
        reason:
          "Aktivitas mencurigakan terdeteksi pada akun Anda. Hubungi admin untuk membuka blokir.",
      };
    }
    return { blocked: false };
  } catch (e) {
    console.error("checkUserOtpBlock failed:", e);
    return { blocked: false };
  }
}
