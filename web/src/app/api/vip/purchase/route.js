import sql from "@/app/api/utils/sql";
import {
  getSessionUser,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

export async function GET() {
  try {
    const rows =
      await sql`SELECT * FROM vip_packages WHERE is_active = true ORDER BY order_position ASC, id ASC`;
    return Response.json({ packages: rows });
  } catch (e) {
    return Response.json({ packages: [] });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await request.json();
    if (!b.package_id)
      return Response.json({ error: "package_id required" }, { status: 400 });
    const pkg = (
      await sql`SELECT * FROM vip_packages WHERE id = ${b.package_id} AND is_active = true LIMIT 1`
    )[0];
    if (!pkg)
      return Response.json({ error: "Paket tidak ditemukan" }, { status: 404 });

    // Create pending purchase
    const result = await sql`
      INSERT INTO vip_purchases (user_id, package_id, amount, payment_method, payment_proof_url, status, notes)
      VALUES (${user.id}, ${pkg.id}, ${pkg.price}, ${b.payment_method || "transfer"}, ${b.payment_proof_url || null}, 'pending', ${b.notes || null})
      RETURNING *
    `;
    await logActivity(user.id, "vip_purchase", `Apply VIP ${pkg.name}`);
    await notifyMember(
      user.id,
      "Pembelian VIP Diajukan",
      `Pembelian ${pkg.name} sebesar Rp ${Number(pkg.price).toLocaleString("id-ID")} menunggu verifikasi.`,
      "info",
      "/dashboard/upgrade-vip",
    );
    return Response.json({ purchase: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
