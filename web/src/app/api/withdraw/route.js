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
    const rows =
      await sql`SELECT * FROM withdrawals WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 100`;
    return Response.json({ withdrawals: rows });
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
    const settings =
      await sql`SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('min_withdraw','withdraw_fee')`;
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
    if (
      !user.bank_name ||
      !user.bank_account_number ||
      !user.bank_account_holder
    ) {
      return Response.json(
        { error: "Lengkapi data rekening di Pengaturan terlebih dahulu" },
        { status: 400 },
      );
    }
    if (Number(user.balance) < amount)
      return Response.json({ error: "Saldo tidak cukup" }, { status: 400 });
    const net = amount - fee;
    const num = generateOrderNumber("WD");
    const result = await sql`
      INSERT INTO withdrawals (user_id, withdraw_number, amount, fee, net_amount, bank_name, bank_account_number, bank_account_holder, status)
      VALUES (${user.id}, ${num}, ${amount}, ${fee}, ${net}, ${user.bank_name}, ${user.bank_account_number}, ${user.bank_account_holder}, 'pending')
      RETURNING *
    `;
    // hold balance
    await sql`UPDATE user_profiles SET balance = balance - ${amount}, updated_at = NOW() WHERE user_id = ${user.id}`;
    await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
      SELECT ${user.id}, 'withdraw_pending', ${-amount}, balance + ${amount}, balance, 'withdraw', ${result[0].id}, ${`Withdraw ${num} (pending)`}
      FROM user_profiles WHERE user_id = ${user.id}`;
    await logActivity(
      user.id,
      "create_withdraw",
      `Withdraw ${num} Rp ${amount}`,
    );
    await notifyMember(
      user.id,
      "Withdraw Diajukan",
      `Withdraw ${num} sebesar Rp ${amount.toLocaleString("id-ID")} diajukan.`,
      "info",
      "/dashboard/withdraw",
      true,
      { amount: amount.toLocaleString("id-ID"), order: num },
      "template_payment_pending",
    );
    return Response.json({ withdraw: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
