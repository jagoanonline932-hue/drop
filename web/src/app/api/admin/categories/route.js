import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM categories ORDER BY name ASC`;
  return Response.json({ categories: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.name)
    return Response.json({ error: "name required" }, { status: 400 });
  const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const result =
    await sql`INSERT INTO categories (name, slug, description, icon, is_active) VALUES (${b.name}, ${slug}, ${b.description || null}, ${b.icon || null}, ${b.is_active !== false}) RETURNING *`;
  return Response.json({ category: result[0] });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
  const allowed = ["name", "slug", "description", "icon", "is_active"];
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
  const q = `UPDATE categories SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
  const result = await sql(q, vals);
  return Response.json({ category: result[0] });
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM categories WHERE id = ${id}`;
  return Response.json({ ok: true });
}
