import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    // Top-level stats
    const [members, vipMembers, ordersToday, totalRevenue] = await Promise.all([
      sql`SELECT COUNT(*)::int AS c FROM auth_users`,
      sql`SELECT COUNT(*)::int AS c FROM user_profiles WHERE vip_status = true`,
      sql`SELECT COUNT(*)::int AS c FROM orders WHERE created_at >= CURRENT_DATE`,
      sql`SELECT COALESCE(SUM(admin_revenue), 0) AS s FROM orders WHERE status IN ('completed','delivered')`,
    ]);

    const ordersDaily = await sql`
      SELECT DATE(created_at) AS day, COUNT(*)::int AS count, COALESCE(SUM(total_cod), 0)::numeric AS total
      FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day ORDER BY day ASC
    `;
    const statusBreakdown =
      await sql`SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`;
    const expeditionBreakdown = await sql`
      SELECT COALESCE(e.name, 'Tanpa Ekspedisi') AS name, COUNT(*)::int AS count
      FROM orders o LEFT JOIN expeditions e ON e.id = o.expedition_id
      GROUP BY e.name ORDER BY count DESC LIMIT 10
    `;
    const paymentBreakdown = await sql`
      SELECT COALESCE(payment_method, 'unknown') AS method, COUNT(*)::int AS count, COALESCE(SUM(total_cod), 0)::numeric AS total
      FROM orders GROUP BY payment_method ORDER BY count DESC
    `;
    const memberGrowth = await sql`
      SELECT DATE(created_at) AS day, COUNT(*)::int AS count
      FROM user_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day ORDER BY day ASC
    `;
    const balanceFlow = await sql`
      SELECT DATE(created_at) AS day,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::numeric AS inflow,
        COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)::numeric AS outflow
      FROM balance_transactions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day ORDER BY day ASC
    `;
    const refundReturn =
      await sql`SELECT status, COUNT(*)::int AS count FROM orders WHERE status IN ('returned','refund') GROUP BY status`;

    return Response.json({
      summary: {
        total_members: members[0].c,
        vip_members: vipMembers[0].c,
        orders_today: ordersToday[0].c,
        total_revenue: Number(totalRevenue[0].s),
      },
      ordersDaily,
      statusBreakdown,
      expeditionBreakdown,
      paymentBreakdown,
      memberGrowth,
      balanceFlow,
      refundReturn,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
