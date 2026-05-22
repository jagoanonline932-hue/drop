import sql from "@/app/api/utils/sql";
import {
  requireAdmin,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`
    SELECT r.*, ru.name AS referrer_name, ru.email AS referrer_email,
      du.name AS referred_name, du.email AS referred_email,
      dp.vip_status AS referred_vip
    FROM referrals r
    LEFT JOIN auth_users ru ON ru.id = r.referrer_id
    LEFT JOIN auth_users du ON du.id = r.referred_id
    LEFT JOIN user_profiles dp ON dp.user_id = r.referred_id
    ORDER BY r.created_at DESC LIMIT 500
  `;
  return Response.json({ referrals: rows });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
    const ref = (
      await sql`SELECT * FROM referrals WHERE id = ${b.id} LIMIT 1`
    )[0];
    if (!ref) return Response.json({ error: "Not found" }, { status: 404 });

    if (b.status === "paid") {
      const commissionRow =
        await sql`SELECT setting_value FROM site_settings WHERE setting_key = 'referral_commission' LIMIT 1`;
      const commission = Number(
        b.commission || commissionRow[0]?.setting_value || 50000,
      );
      await sql`UPDATE referrals SET status = 'paid', commission = ${commission}, paid_at = NOW() WHERE id = ${b.id}`;
      await sql`UPDATE user_profiles SET balance = balance + ${commission}, updated_at = NOW() WHERE user_id = ${ref.referrer_id}`;
      await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
        SELECT ${ref.referrer_id}, 'referral_bonus', ${commission}, balance - ${commission}, balance, 'referral', ${ref.id}, ${`Bonus referral`}
        FROM user_profiles WHERE user_id = ${ref.referrer_id}`;
      await notifyMember(
        ref.referrer_id,
        "Bonus Referral Cair",
        `Selamat! Komisi referral Rp ${commission.toLocaleString("id-ID")} masuk ke saldo Anda.`,
        "success",
        "/dashboard/referral",
        true,
        { amount: commission.toLocaleString("id-ID") },
        "template_referral",
      );
    } else if (b.status === "rejected") {
      await sql`UPDATE referrals SET status = 'rejected', notes = ${b.notes || null} WHERE id = ${b.id}`;
    }
    await logActivity(
      r.user.id,
      "update_referral",
      `Referral ${b.id} -> ${b.status}`,
    );
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
