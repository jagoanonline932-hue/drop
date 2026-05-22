import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM notices ORDER BY created_at DESC`;
  return Response.json({ notices: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.title || !b.content)
    return Response.json({ error: "required" }, { status: 400 });
  const result =
    await sql`INSERT INTO notices (title, content, notice_type, target_role, is_active, starts_at, ends_at) VALUES (${b.title}, ${b.content}, ${b.notice_type || "info"}, ${b.target_role || "all"}, ${b.is_active !== false}, ${b.starts_at || null}, ${b.ends_at || null}) RETURNING *`;
  return Response.json({ notice: result[0] });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
  const allowed = [
    "title",
    "content",
    "notice_type",
    "target_role",
    "is_active",
    "starts_at",
    "ends_at",
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
  const q = `UPDATE notices SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
  const result = await sql(q, vals);
  return Response.json({ notice: result[0] });
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM notices WHERE id = ${id}`;
  return Response.json({ ok: true });
}
