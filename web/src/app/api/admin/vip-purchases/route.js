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
    SELECT vp.*, u.name AS user_name, u.email AS user_email, pkg.name AS package_name, pkg.duration_days, up.phone, up.whatsapp
    FROM vip_purchases vp
    LEFT JOIN auth_users u ON u.id = vp.user_id
    LEFT JOIN user_profiles up ON up.user_id = vp.user_id
    LEFT JOIN vip_packages pkg ON pkg.id = vp.package_id
    ORDER BY vp.created_at DESC LIMIT 500
  `;
  return Response.json({ purchases: rows });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.id || !b.status)
      return Response.json({ error: "id & status required" }, { status: 400 });
    const vp = (
      await sql`SELECT vp.*, pkg.duration_days, pkg.name AS pkg_name FROM vip_purchases vp LEFT JOIN vip_packages pkg ON pkg.id = vp.package_id WHERE vp.id = ${b.id} LIMIT 1`
    )[0];
    if (!vp) return Response.json({ error: "Not found" }, { status: 404 });

    if (b.status === "approved") {
      const days = Number(vp.duration_days || 365);
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      await sql`UPDATE vip_purchases SET status = 'approved', approved_at = NOW(), approved_by = ${r.user.id}, expires_at = ${expiresAt} WHERE id = ${b.id}`;
      await sql`UPDATE user_profiles SET vip_status = true, vip_expired_at = ${expiresAt}, updated_at = NOW() WHERE user_id = ${vp.user_id}`;

      // Process referral: if user has referred_by, mark referral as approved + commission
      const refRow = (
        await sql`SELECT referred_by FROM user_profiles WHERE user_id = ${vp.user_id} LIMIT 1`
      )[0];
      if (refRow?.referred_by) {
        const commRow = (
          await sql`SELECT setting_value FROM site_settings WHERE setting_key = 'referral_commission' LIMIT 1`
        )[0];
        const commission = Number(commRow?.setting_value || 50000);
        const refRec = (
          await sql`SELECT * FROM referrals WHERE referrer_id = ${refRow.referred_by} AND referred_id = ${vp.user_id} LIMIT 1`
        )[0];
        if (refRec && refRec.status !== "paid") {
          await sql`UPDATE referrals SET status = 'paid', commission = ${commission}, upgraded_vip_at = NOW(), paid_at = NOW() WHERE id = ${refRec.id}`;
          await sql`UPDATE user_profiles SET balance = balance + ${commission}, updated_at = NOW() WHERE user_id = ${refRow.referred_by}`;
          await sql`INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
            SELECT ${refRow.referred_by}, 'referral_bonus', ${commission}, balance - ${commission}, balance, 'referral', ${refRec.id}, ${`Bonus referral (member upgrade VIP)`}
            FROM user_profiles WHERE user_id = ${refRow.referred_by}`;
          await notifyMember(
            refRow.referred_by,
            "Bonus Referral Cair!",
            `Selamat! Member yang Anda ajak telah upgrade VIP. Komisi Rp ${commission.toLocaleString("id-ID")} masuk ke saldo.`,
            "success",
            "/dashboard/referral",
            true,
            { amount: commission.toLocaleString("id-ID") },
            "template_referral",
          );
        }
      }

      await notifyMember(
        vp.user_id,
        "VIP Aktif!",
        `Selamat! Paket ${vp.pkg_name} Anda telah aktif. Akses semua fitur premium HyperDrop.`,
        "success",
        "/dashboard",
        true,
      );
    } else if (b.status === "rejected") {
      await sql`UPDATE vip_purchases SET status = 'rejected', approved_at = NOW(), approved_by = ${r.user.id}, notes = ${b.notes || null} WHERE id = ${b.id}`;
      await notifyMember(
        vp.user_id,
        "Pembelian VIP Ditolak",
        `Pembelian VIP Anda ditolak. ${b.notes || ""}`,
        "error",
        "/dashboard/upgrade-vip",
        true,
      );
    }
    await logActivity(
      r.user.id,
      "vip_purchase_update",
      `VIP purchase ${b.id} -> ${b.status}`,
    );
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message || "Internal" }, { status: 500 });
  }
}
