import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT * FROM benefits ORDER BY order_position ASC, id ASC`;
  return Response.json({ benefits: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.title)
    return Response.json({ error: "title required" }, { status: 400 });
  const result =
    await sql`INSERT INTO benefits (title, description, icon, order_position, is_active) VALUES (${b.title}, ${b.description || null}, ${b.icon || null}, ${b.order_position || 0}, ${b.is_active !== false}) RETURNING *`;
  return Response.json({ benefit: result[0] });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
  const allowed = [
    "title",
    "description",
    "icon",
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
  const q = `UPDATE benefits SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
  const result = await sql(q, vals);
  return Response.json({ benefit: result[0] });
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM benefits WHERE id = ${id}`;
  return Response.json({ ok: true });
}
