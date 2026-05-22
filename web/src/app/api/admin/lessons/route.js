import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const courseId = url.searchParams.get("course_id");
  const rows = courseId
    ? await sql`SELECT * FROM lessons WHERE course_id = ${courseId} ORDER BY order_position ASC, id ASC`
    : await sql`SELECT * FROM lessons ORDER BY course_id ASC, order_position ASC LIMIT 500`;
  return Response.json({ lessons: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.course_id || !b.title || !b.youtube_url)
    return Response.json(
      { error: "course_id, title, youtube_url required" },
      { status: 400 },
    );
  const result = await sql`
    INSERT INTO lessons (course_id, title, description, youtube_url, duration, order_position, is_active)
    VALUES (${b.course_id}, ${b.title}, ${b.description || null}, ${b.youtube_url}, ${b.duration || null}, ${b.order_position || 0}, ${b.is_active !== false})
    RETURNING *
  `;
  return Response.json({ lesson: result[0] });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
  const allowed = [
    "title",
    "description",
    "youtube_url",
    "duration",
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
  const q = `UPDATE lessons SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
  const result = await sql(q, vals);
  return Response.json({ lesson: result[0] });
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM lessons WHERE id = ${id}`;
  return Response.json({ ok: true });
}
