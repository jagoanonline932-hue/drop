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
  const status = url.searchParams.get("status") || "";
  let where = "WHERE 1=1";
  const params = [];
  if (status) {
    params.push(status);
    where += ` AND w.status = $${params.length}`;
  }
  const q = `
    SELECT w.*, u.name AS user_name, u.email AS user_email, p.phone, p.whatsapp
    FROM withdrawals w
    LEFT JOIN auth_users u ON u.id = w.user_id
    LEFT JOIN user_profiles p ON p.user_id = w.user_id
    ${where}
    ORDER BY w.created_at DESC LIMIT 500
  `;
  const rows = await sql(q, params);
  return Response.json({ withdrawals: rows });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.id || !b.status)
      return Response.json({ error: "id & status required" }, { status: 400 });
    const w = (
      await sql`SELECT * FROM withdrawals WHERE id = ${b.id} LIMIT 1`
    )[0];
    if (!w) return Response.json({ error: "Not found" }, { status: 404 });

    if (b.status === "approved") {
      await sql`UPDATE withdrawals SET status = 'approved', processed_at = NOW(), processed_by = ${r.user.id}, admin_notes = ${b.admin_notes || null} WHERE id = ${b.id}`;
      // already deducted on create, just finalize
      await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
        SELECT ${w.user_id}, 'withdraw_completed', 0, balance, balance, 'withdraw', ${w.id}, ${`Withdraw ${w.withdraw_number} disetujui`}
        FROM user_profiles WHERE user_id = ${w.user_id}`;
      await notifyMember(
        w.user_id,
        "Withdraw Disetujui",
        `Withdraw ${w.withdraw_number} Rp ${Number(w.amount).toLocaleString("id-ID")} telah diproses.`,
        "success",
        "/dashboard/withdraw",
        true,
        { amount: Number(w.amount).toLocaleString("id-ID") },
        "template_payment_success",
      );
    } else if (b.status === "rejected") {
      // refund balance
      await sql`UPDATE withdrawals SET status = 'rejected', processed_at = NOW(), processed_by = ${r.user.id}, admin_notes = ${b.admin_notes || null} WHERE id = ${b.id}`;
      await sql`UPDATE user_profiles SET balance = balance + ${w.amount}, updated_at = NOW() WHERE user_id = ${w.user_id}`;
      await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
        SELECT ${w.user_id}, 'withdraw_refund', ${w.amount}, balance - ${w.amount}, balance, 'withdraw', ${w.id}, ${`Withdraw ${w.withdraw_number} ditolak`}
        FROM user_profiles WHERE user_id = ${w.user_id}`;
      await notifyMember(
        w.user_id,
        "Withdraw Ditolak",
        `Withdraw ${w.withdraw_number} ditolak. Saldo dikembalikan.`,
        "error",
        "/dashboard/withdraw",
        true,
      );
    }
    await logActivity(
      r.user.id,
      "approve_withdraw",
      `WD ${w.withdraw_number} -> ${b.status}`,
    );
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
