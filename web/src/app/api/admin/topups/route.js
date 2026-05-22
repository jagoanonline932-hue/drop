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
  const search = url.searchParams.get("search") || "";
  let where = "WHERE 1=1";
  const params = [];
  if (status) {
    params.push(status);
    where += ` AND t.status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (t.topup_number ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
  }
  const q = `
    SELECT t.*, u.name AS user_name, u.email AS user_email, p.phone, p.whatsapp,
      b.bank_name AS sel_bank_name, b.account_number AS sel_account_number
    FROM topups t
    LEFT JOIN auth_users u ON u.id = t.user_id
    LEFT JOIN user_profiles p ON p.user_id = t.user_id
    LEFT JOIN bank_accounts b ON b.id = t.bank_account_id
    ${where}
    ORDER BY t.created_at DESC LIMIT 500
  `;
  const rows = await sql(q, params);
  return Response.json({ topups: rows });
}

// Approve or reject
export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.id || !b.status)
      return Response.json({ error: "id & status required" }, { status: 400 });
    const t = (await sql`SELECT * FROM topups WHERE id = ${b.id} LIMIT 1`)[0];
    if (!t) return Response.json({ error: "Not found" }, { status: 404 });
    if (t.status === "approved")
      return Response.json({ error: "Already approved" }, { status: 400 });

    if (b.status === "approved") {
      await sql`UPDATE topups SET status = 'approved', approved_at = NOW(), approved_by = ${r.user.id}, admin_notes = ${b.admin_notes || null} WHERE id = ${b.id}`;
      await sql`UPDATE user_profiles SET balance = balance + ${t.amount}, updated_at = NOW() WHERE user_id = ${t.user_id}`;
      await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
        SELECT ${t.user_id}, 'topup', ${t.amount}, balance - ${t.amount}, balance, 'topup', ${t.id}, ${`Topup ${t.topup_number} disetujui`}
        FROM user_profiles WHERE user_id = ${t.user_id}`;
      await notifyMember(
        t.user_id,
        "Topup Berhasil",
        `Topup ${t.topup_number} sebesar Rp ${Number(t.amount).toLocaleString("id-ID")} telah disetujui.`,
        "success",
        "/dashboard/saldo",
        true,
        {
          amount: Number(t.amount).toLocaleString("id-ID"),
          order: t.topup_number,
        },
        "template_payment_success",
      );
    } else if (b.status === "rejected") {
      await sql`UPDATE topups SET status = 'rejected', approved_at = NOW(), approved_by = ${r.user.id}, admin_notes = ${b.admin_notes || null} WHERE id = ${b.id}`;
      await notifyMember(
        t.user_id,
        "Topup Ditolak",
        `Topup ${t.topup_number} ditolak. ${b.admin_notes || ""}`,
        "error",
        "/dashboard/topup",
        true,
      );
    }
    await logActivity(
      r.user.id,
      "approve_topup",
      `Topup ${t.topup_number} -> ${b.status}`,
    );
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
