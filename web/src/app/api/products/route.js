import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

// Member-facing products list (filters by VIP-only)
export async function GET(request) {
  try {
    const user = await getSessionUser();
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("category_id");
    const orderType = url.searchParams.get("order_type"); // 'external' = hide vip_only products
    const isVip = user?.vip_status;

    let where = "WHERE p.is_active = true";
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      where += ` AND p.name ILIKE $${params.length}`;
    }
    if (categoryId) {
      params.push(categoryId);
      where += ` AND p.category_id = $${params.length}`;
    }
    // For external order or non-VIP users, hide VIP-only products
    if (!isVip || orderType === "external") {
      where += ` AND p.is_vip_only = false`;
    }

    const q = `
      SELECT p.*, c.name AS category_name, w.name AS warehouse_name, w.pickup_time AS warehouse_pickup,
        w.logo AS warehouse_logo, a.name AS aggregator_name, a.logo AS aggregator_logo
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      LEFT JOIN aggregators a ON a.id = p.aggregator_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT 200
    `;
    const rows = await sql(q, params);
    return Response.json({ products: rows, is_vip: !!isVip });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
