import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT * FROM vip_packages ORDER BY order_position ASC, id ASC`;
  return Response.json({ packages: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.name || !b.price)
      return Response.json({ error: "name & price required" }, { status: 400 });
    const result = await sql`
      INSERT INTO vip_packages (name, price, duration_days, description, benefits, order_position, is_active)
      VALUES (${b.name}, ${b.price}, ${b.duration_days || 365}, ${b.description || null}, ${JSON.stringify(b.benefits || [])}::jsonb, ${b.order_position || 0}, ${b.is_active !== false})
      RETURNING *
    `;
    return Response.json({ package: result[0] });
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
      "price",
      "duration_days",
      "description",
      "order_position",
      "is_active",
    ];
    const sets = [],
      vals = [];
    for (const k of allowed)
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    if (b.benefits !== undefined) {
      sets.push(`benefits = $${vals.length + 1}::jsonb`);
      vals.push(JSON.stringify(b.benefits));
    }
    if (sets.length === 0)
      return Response.json({ error: "Nothing" }, { status: 400 });
    vals.push(b.id);
    const q = `UPDATE vip_packages SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    return Response.json({ package: result[0] });
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
    await sql`DELETE FROM vip_packages WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
