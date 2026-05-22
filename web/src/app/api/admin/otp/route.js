// Admin OTP Management — list / analytics / actions
import sql from "@/app/api/utils/sql";
import {
  requireAdmin,
  sendFonnteNotification,
  formatTemplate,
} from "@/app/api/utils/helpers";
import { logSuspicious } from "@/app/api/utils/finance";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const q = url.searchParams.get("q") || "";
    const limit = Math.min(
      200,
      Math.max(10, Number(url.searchParams.get("limit") || 50)),
    );

    let where = "WHERE 1=1";
    const vals = [];
    if (status) {
      vals.push(status);
      where += ` AND o.status = $${vals.length}`;
    }
    if (q) {
      vals.push(`%${q}%`);
      where += ` AND (u.email ILIKE $${vals.length} OR u.name ILIKE $${vals.length} OR o.phone ILIKE $${vals.length})`;
    }
    vals.push(limit);
    const limitIdx = vals.length;

    const otps = await sql(
      `SELECT o.id, o.user_id, o.phone, o.amount, o.expires_at, o.used,
              o.attempts, o.status, o.delivery_status, o.ip_address, o.user_agent,
              o.device_fingerprint, o.verified_at, o.created_at,
              u.name AS user_name, u.email AS user_email
       FROM withdraw_otps o
       LEFT JOIN auth_users u ON u.id = o.user_id
       ${where}
       ORDER BY o.id DESC
       LIMIT $${limitIdx}`,
      vals,
    );

    const summary = await sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today,
        COUNT(*) FILTER (WHERE status = 'verified' AND created_at::date = CURRENT_DATE) AS verified_today,
        COUNT(*) FILTER (WHERE status IN ('failed','blocked','invalidated') AND created_at::date = CURRENT_DATE) AS failed_today,
        COUNT(*) FILTER (WHERE delivery_status = 'delivered' AND created_at::date = CURRENT_DATE) AS delivered_today,
        COUNT(*) FILTER (WHERE delivery_status = 'failed' AND created_at::date = CURRENT_DATE) AS undelivered_today,
        COUNT(*) AS total
      FROM withdraw_otps
    `;

    const recent7d = await sql`
      SELECT date_trunc('day', created_at) AS d,
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status = 'verified') AS verified,
             COUNT(*) FILTER (WHERE status IN ('failed','blocked')) AS failed
      FROM withdraw_otps
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const rate7d = await sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'verified') AS verified
      FROM withdraw_otps
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    const total7 = Number(rate7d[0]?.total || 0);
    const ver7 = Number(rate7d[0]?.verified || 0);
    const successPct = total7 > 0 ? Math.round((ver7 / total7) * 1000) / 10 : 0;

    const suspicious = await sql`
      SELECT id, user_id, activity_type, severity, ip_address, description, created_at, resolved
      FROM suspicious_activity_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY id DESC
      LIMIT 50
    `;

    return Response.json({
      otps,
      summary: summary[0] || {},
      series: recent7d,
      success_rate_7d: successPct,
      suspicious,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const { action, id, user_id } = await request.json();
    if (action === "invalidate" && id) {
      await sql`UPDATE withdraw_otps SET used = true, status = 'invalidated' WHERE id = ${id}`;
      return Response.json({ ok: true });
    }
    if (action === "resend" && id) {
      const rows =
        await sql`SELECT * FROM withdraw_otps WHERE id = ${id} LIMIT 1`;
      if (!rows[0])
        return Response.json({ error: "Not found" }, { status: 404 });
      const o = rows[0];
      if (o.used || new Date(o.expires_at) < new Date()) {
        return Response.json(
          { error: "OTP expired/used. Tidak bisa di-resend." },
          { status: 400 },
        );
      }
      const fonnte =
        await sql`SELECT api_token, is_active, template_withdraw_otp FROM fonnte_settings WHERE id = 1 LIMIT 1`;
      if (!fonnte[0]?.is_active)
        return Response.json({ error: "Fonnte tidak aktif" }, { status: 400 });
      const u =
        await sql`SELECT name FROM auth_users WHERE id = ${o.user_id} LIMIT 1`;
      const tpl =
        fonnte[0].template_withdraw_otp ||
        "🔐 *KODE OTP WITHDRAW HYPERDROP*\n\nHalo {name},\n\nKode OTP withdraw Rp {amount}:\n*{otp}*\n\nBerlaku 5 menit.";
      const msg = formatTemplate(tpl, {
        name: u[0]?.name || "Member",
        amount: Number(o.amount).toLocaleString("id-ID"),
        otp: o.otp_code,
      });
      const sent = await sendFonnteNotification(o.phone, msg);
      await sql`UPDATE withdraw_otps SET resend_count = COALESCE(resend_count,0) + 1, delivery_status = ${sent ? "delivered" : "failed"} WHERE id = ${id}`;
      return Response.json({ ok: true, sent });
    }
    if (action === "block_user" && user_id) {
      await logSuspicious({
        user_id,
        activity_type: "admin_manual_block",
        severity: "critical",
        description: "Admin manually blocked user from OTP/withdraw",
        metadata: { admin_id: r.user.id },
      });
      return Response.json({ ok: true });
    }
    if (action === "unblock_user" && user_id) {
      await sql`UPDATE suspicious_activity_logs SET resolved = true WHERE user_id = ${user_id} AND severity IN ('high','critical') AND resolved = false`;
      return Response.json({ ok: true });
    }
    if (action === "resolve_suspicious" && id) {
      await sql`UPDATE suspicious_activity_logs SET resolved = true WHERE id = ${id}`;
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Action tidak dikenali" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
