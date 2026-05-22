import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT * FROM testimonials ORDER BY order_position ASC, id ASC`;
  return Response.json({ testimonials: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.name || !b.content)
    return Response.json({ error: "name & content required" }, { status: 400 });
  const result =
    await sql`INSERT INTO testimonials (name, role, avatar, content, rating, order_position, is_active) VALUES (${b.name}, ${b.role || null}, ${b.avatar || null}, ${b.content}, ${b.rating || 5}, ${b.order_position || 0}, ${b.is_active !== false}) RETURNING *`;
  return Response.json({ testimonial: result[0] });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
  const allowed = [
    "name",
    "role",
    "avatar",
    "content",
    "rating",
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
  if (sets.length === 0)
    return Response.json({ error: "Nothing" }, { status: 400 });
  vals.push(b.id);
  const q = `UPDATE testimonials SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
  const result = await sql(q, vals);
  return Response.json({ testimonial: result[0] });
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM testimonials WHERE id = ${id}`;
  return Response.json({ ok: true });
}
