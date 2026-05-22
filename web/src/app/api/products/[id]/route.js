import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const user = await getSessionUser();
    const isVip = user?.vip_status;
    const productRows = await sql`
      SELECT p.*, c.name AS category_name, w.name AS warehouse_name, w.address AS warehouse_address,
        w.pickup_time AS warehouse_pickup, w.logo AS warehouse_logo, w.photo AS warehouse_photo,
        a.name AS aggregator_name, a.logo AS aggregator_logo
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      LEFT JOIN aggregators a ON a.id = p.aggregator_id
      WHERE p.id = ${id} LIMIT 1
    `;
    if (!productRows[0])
      return Response.json({ error: "Not found" }, { status: 404 });
    const product = productRows[0];
    if (product.is_vip_only && !isVip) {
      return Response.json({ error: "VIP Only" }, { status: 403 });
    }
    const variants =
      await sql`SELECT * FROM product_variants WHERE product_id = ${id} AND is_active = true ORDER BY id ASC`;
    const expeditions = await sql`
      SELECT e.* FROM product_expeditions pe
      JOIN expeditions e ON e.id = pe.expedition_id
      WHERE pe.product_id = ${id} AND e.is_active = true
    `;
    return Response.json({ product, variants, expeditions });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
