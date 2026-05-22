import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);
  let rows;
  if (search) {
    rows = await sql`
      SELECT p.*, c.name AS category_name, w.name AS warehouse_name, a.name AS aggregator_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      LEFT JOIN aggregators a ON a.id = p.aggregator_id
      WHERE p.name ILIKE ${"%" + search + "%"}
      ORDER BY p.created_at DESC LIMIT ${limit}
    `;
  } else {
    rows = await sql`
      SELECT p.*, c.name AS category_name, w.name AS warehouse_name, a.name AS aggregator_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      LEFT JOIN aggregators a ON a.id = p.aggregator_id
      ORDER BY p.created_at DESC LIMIT ${limit}
    `;
  }
  return Response.json({ products: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.name)
      return Response.json({ error: "name required" }, { status: 400 });
    const slug =
      b.slug ||
      (b.name + "-" + Date.now()).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const result = await sql`
      INSERT INTO products (name, slug, description, category_id, warehouse_id, aggregator_id,
        supplier_price, supplier_price_strike, recommended_price, stock, weight,
        is_vip_only, is_premium, is_active, marketing_kit_url, landing_page_url, main_image, images)
      VALUES (
        ${b.name}, ${slug}, ${b.description || null},
        ${b.category_id || null}, ${b.warehouse_id || null}, ${b.aggregator_id || null},
        ${b.supplier_price || 0}, ${b.supplier_price_strike || null}, ${b.recommended_price || 0},
        ${b.stock || 0}, ${b.weight || 1000},
        ${b.is_vip_only === true}, ${b.is_premium === true}, ${b.is_active !== false},
        ${b.marketing_kit_url || null}, ${b.landing_page_url || null}, ${b.main_image || null},
        ${JSON.stringify(b.images || [])}::jsonb
      )
      RETURNING *
    `;
    const productId = result[0].id;
    if (Array.isArray(b.expedition_ids)) {
      for (const eid of b.expedition_ids) {
        await sql`INSERT INTO product_expeditions (product_id, expedition_id) VALUES (${productId}, ${eid})`;
      }
    }
    return Response.json({ product: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
    const allowed = [
      "name",
      "description",
      "category_id",
      "warehouse_id",
      "aggregator_id",
      "supplier_price",
      "supplier_price_strike",
      "recommended_price",
      "stock",
      "weight",
      "is_vip_only",
      "is_premium",
      "is_active",
      "marketing_kit_url",
      "landing_page_url",
      "main_image",
    ];
    const sets = [],
      vals = [];
    for (const k of allowed) {
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    }
    if (b.images !== undefined) {
      sets.push(`images = $${vals.length + 1}::jsonb`);
      vals.push(JSON.stringify(b.images));
    }
    if (sets.length === 0 && !b.expedition_ids)
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    if (sets.length > 0) {
      sets.push("updated_at = NOW()");
      vals.push(b.id);
      const q = `UPDATE products SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
      await sql(q, vals);
    }
    if (Array.isArray(b.expedition_ids)) {
      await sql`DELETE FROM product_expeditions WHERE product_id = ${b.id}`;
      for (const eid of b.expedition_ids) {
        await sql`INSERT INTO product_expeditions (product_id, expedition_id) VALUES (${b.id}, ${eid})`;
      }
    }
    const result = await sql`SELECT * FROM products WHERE id = ${b.id}`;
    return Response.json({ product: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    await sql`DELETE FROM products WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
