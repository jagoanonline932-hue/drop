import sql from "@/app/api/utils/sql";
import {
  requireAdmin,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  let rows;
  if (userId) {
    rows =
      await sql`SELECT b.*, u.name AS user_name, u.email AS user_email FROM balance_adjustments b LEFT JOIN auth_users u ON u.id = b.user_id WHERE b.user_id = ${userId} ORDER BY b.created_at DESC LIMIT 200`;
  } else {
    rows =
      await sql`SELECT b.*, u.name AS user_name, u.email AS user_email FROM balance_adjustments b LEFT JOIN auth_users u ON u.id = b.user_id ORDER BY b.created_at DESC LIMIT 200`;
  }
  return Response.json({ adjustments: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.user_id || !b.amount || !b.description)
      return Response.json(
        { error: "user_id, amount, description required" },
        { status: 400 },
      );
    const amount = Number(b.amount);
    const type = b.adjustment_type || "manual";
    const result = await sql`
      INSERT INTO balance_adjustments (user_id, amount, adjustment_type, description, created_by)
      VALUES (${b.user_id}, ${amount}, ${type}, ${b.description}, ${r.user.id})
      RETURNING *
    `;
    await sql`UPDATE user_profiles SET balance = balance + ${amount}, updated_at = NOW() WHERE user_id = ${b.user_id}`;
    await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
      SELECT ${b.user_id}, 'admin_adjustment', ${amount}, balance - ${amount}, balance, 'adjustment', ${result[0].id}, ${b.description}
      FROM user_profiles WHERE user_id = ${b.user_id}`;
    await notifyMember(
      b.user_id,
      "Penyesuaian Saldo",
      `Saldo Anda disesuaikan: Rp ${amount.toLocaleString("id-ID")}. ${b.description}`,
      "info",
      "/dashboard/saldo",
    );
    await logActivity(
      r.user.id,
      "balance_adjust",
      `Adjust user ${b.user_id} amount ${amount}`,
    );
    return Response.json({ adjustment: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
