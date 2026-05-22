import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT * FROM sliders ORDER BY order_position ASC, id ASC`;
  return Response.json({ sliders: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.image_url)
      return Response.json({ error: "image_url required" }, { status: 400 });
    const result = await sql`
      INSERT INTO sliders (title, subtitle, image_url, button_text, button_url, order_position, is_active)
      VALUES (${b.title || null}, ${b.subtitle || null}, ${b.image_url}, ${b.button_text || null}, ${b.button_url || null}, ${b.order_position || 0}, ${b.is_active !== false})
      RETURNING *
    `;
    return Response.json({ slider: result[0] });
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
      "title",
      "subtitle",
      "image_url",
      "button_text",
      "button_url",
      "order_position",
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
    sets.push("updated_at = NOW()");
    vals.push(b.id);
    const q = `UPDATE sliders SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    return Response.json({ slider: result[0] });
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
    await sql`DELETE FROM sliders WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
