import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const uid = user.id;
    const [
      salesDaily,
      profitDaily,
      balanceDaily,
      statusBreakdown,
      refStat,
      totalOrders,
      totalProfit,
    ] = await Promise.all([
      sql`SELECT DATE(created_at) AS day, COUNT(*)::int AS count, COALESCE(SUM(total_cod),0)::numeric AS total
        FROM orders WHERE user_id = ${uid} AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day ORDER BY day ASC`,
      sql`SELECT DATE(created_at) AS day, COALESCE(SUM(member_profit),0)::numeric AS profit
        FROM orders WHERE user_id = ${uid} AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day ORDER BY day ASC`,
      sql`SELECT DATE(created_at) AS day, COALESCE(SUM(amount),0)::numeric AS amount
        FROM balance_transactions WHERE user_id = ${uid} AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day ORDER BY day ASC`,
      sql`SELECT status, COUNT(*)::int AS count FROM orders WHERE user_id = ${uid} GROUP BY status`,
      sql`SELECT COUNT(*)::int AS total_ref, COALESCE(SUM(CASE WHEN status='paid' THEN commission ELSE 0 END),0)::numeric AS total_comm,
        COUNT(*) FILTER (WHERE status='paid')::int AS paid_count
        FROM referrals WHERE referrer_id = ${uid}`,
      sql`SELECT COUNT(*)::int AS c FROM orders WHERE user_id = ${uid}`,
      sql`SELECT COALESCE(SUM(member_profit),0)::numeric AS p FROM orders WHERE user_id = ${uid} AND status IN ('completed','delivered')`,
    ]);

    return Response.json({
      salesDaily,
      profitDaily,
      balanceDaily,
      statusBreakdown,
      referral: refStat[0],
      summary: {
        total_orders: totalOrders[0].c,
        total_profit: Number(totalProfit[0].p),
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
