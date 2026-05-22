// Admin Payment Management — list / filter / analytics
import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const method = url.searchParams.get("method") || "";
    const q = url.searchParams.get("q") || "";
    const limit = Math.min(
      200,
      Math.max(10, Number(url.searchParams.get("limit") || 50)),
    );

    let where = "WHERE 1=1";
    const vals = [];
    if (status) {
      vals.push(status);
      where += ` AND t.status = $${vals.length}`;
    }
    if (method) {
      vals.push(method);
      where += ` AND t.payment_method = $${vals.length}`;
    }
    if (q) {
      vals.push(`%${q}%`);
      const i = vals.length;
      vals.push(`%${q}%`);
      const j = vals.length;
      where += ` AND (t.topup_number ILIKE $${i} OR u.name ILIKE $${j} OR u.email ILIKE $${j})`;
    }
    vals.push(limit);
    const limitIdx = vals.length;

    const topups = await sql(
      `SELECT t.id, t.topup_number, t.user_id, t.amount, t.payment_method, t.status,
              t.midtrans_order_id, t.midtrans_redirect_url, t.expires_at, t.approved_at,
              t.created_at, t.updated_at,
              u.name AS user_name, u.email AS user_email
       FROM topups t
       LEFT JOIN auth_users u ON u.id = t.user_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${limitIdx}`,
      vals,
    );

    const summary = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'approved' AND created_at::date = CURRENT_DATE) AS approved_today,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_total,
        COUNT(*) FILTER (WHERE status IN ('rejected','failed','expired') AND created_at::date = CURRENT_DATE) AS failed_today,
        COALESCE(SUM(amount) FILTER (WHERE status = 'approved' AND created_at::date = CURRENT_DATE), 0) AS revenue_today,
        COALESCE(SUM(amount) FILTER (WHERE status = 'approved' AND created_at > NOW() - INTERVAL '7 days'), 0) AS revenue_7d,
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS total_today,
        COUNT(*) AS total
      FROM topups
    `;

    // 14-day revenue series
    const series = await sql`
      SELECT date_trunc('day', created_at) AS d,
             COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) AS approved_amount,
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status = 'approved') AS approved,
             COUNT(*) FILTER (WHERE status IN ('rejected','failed','expired')) AS failed
      FROM topups
      WHERE created_at > NOW() - INTERVAL '14 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const successRate = await sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved
      FROM topups
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    const total7d = Number(successRate[0]?.total || 0);
    const approved7d = Number(successRate[0]?.approved || 0);
    const successPct =
      total7d > 0 ? Math.round((approved7d / total7d) * 1000) / 10 : 0;

    return Response.json({
      topups,
      summary: summary[0] || {},
      series,
      success_rate_7d: successPct,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
