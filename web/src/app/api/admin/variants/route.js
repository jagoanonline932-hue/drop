import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");
  let rows;
  if (productId) {
    rows =
      await sql`SELECT v.*, p.name AS product_name FROM product_variants v LEFT JOIN products p ON p.id = v.product_id WHERE v.product_id = ${productId} ORDER BY v.id ASC`;
  } else {
    rows =
      await sql`SELECT v.*, p.name AS product_name FROM product_variants v LEFT JOIN products p ON p.id = v.product_id ORDER BY v.id DESC LIMIT 200`;
  }
  return Response.json({ variants: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.product_id || !b.name)
      return Response.json(
        { error: "product_id & name required" },
        { status: 400 },
      );
    const result = await sql`
      INSERT INTO product_variants (product_id, name, sku, price, recommended_price, weight, stock, thumbnail, is_active)
      VALUES (${b.product_id}, ${b.name}, ${b.sku || null}, ${b.price || 0}, ${b.recommended_price || 0}, ${b.weight || 1000}, ${b.stock || 0}, ${b.thumbnail || null}, ${b.is_active !== false})
      RETURNING *
    `;
    return Response.json({ variant: result[0] });
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
      "sku",
      "price",
      "recommended_price",
      "weight",
      "stock",
      "thumbnail",
      "is_active",
    ];
    const sets = [],
      vals = [];
    for (const k of allowed) {
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    }
    if (sets.length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    vals.push(b.id);
    const q = `UPDATE product_variants SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    return Response.json({ variant: result[0] });
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
    await sql`DELETE FROM product_variants WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
