import sql from "@/app/api/utils/sql";
import {
  getSessionUser,
  generateOrderNumber,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await sql`
      SELECT t.id, t.topup_number, t.user_id, t.amount, t.payment_method, t.status,
             t.bank_account_id, t.proof_url, t.notes, t.admin_notes,
             t.midtrans_order_id, t.midtrans_redirect_url, t.midtrans_snap_token,
             t.duitku_reference, t.duitku_merchant_order_id, t.duitku_payment_url, t.duitku_payment_method,
             t.expires_at, t.approved_at, t.created_at, t.updated_at,
             b.bank_name AS sel_bank_name, b.account_number AS sel_account_number
      FROM topups t LEFT JOIN bank_accounts b ON b.id = t.bank_account_id
      WHERE t.user_id = ${user.id} ORDER BY t.created_at DESC LIMIT 100
    `;
    return Response.json({ topups: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await request.json();
    const amount = Number(b.amount || 0);
    if (amount < 10000)
      return Response.json(
        { error: "Minimal topup Rp 10.000" },
        { status: 400 },
      );
    const method = b.payment_method;
    if (!["midtrans", "transfer", "qris"].includes(method))
      return Response.json({ error: "Metode tidak valid" }, { status: 400 });
    const num = generateOrderNumber("TUP");
    const result = await sql`
      INSERT INTO topups (user_id, topup_number, amount, payment_method, bank_account_id, proof_url, status, notes)
      VALUES (${user.id}, ${num}, ${amount}, ${method}, ${b.bank_account_id || null}, ${b.proof_url || null}, ${method === "midtrans" ? "pending" : "waiting_verification"}, ${b.notes || null})
      RETURNING *
    `;
    await logActivity(user.id, "create_topup", `Topup ${num} - Rp ${amount}`);
    await notifyMember(
      user.id,
      "Topup Dikirim",
      `Topup ${num} sebesar Rp ${amount.toLocaleString("id-ID")} menunggu verifikasi.`,
      "info",
      "/dashboard/topup",
      true,
      { amount: amount.toLocaleString("id-ID"), order: num },
      "template_payment_pending",
    );
    return Response.json({ topup: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
