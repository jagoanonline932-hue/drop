import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT * FROM expeditions ORDER BY order_position ASC, id ASC`;
  return Response.json({ expeditions: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.name)
      return Response.json({ error: "name required" }, { status: 400 });
    const result = await sql`
      INSERT INTO expeditions (name, code, logo, is_vip_only, order_position, is_active, show_on_homepage)
      VALUES (${b.name}, ${b.code || null}, ${b.logo || null}, ${b.is_vip_only === true}, ${b.order_position || 0}, ${b.is_active !== false}, ${b.show_on_homepage !== false})
      RETURNING *
    `;
    return Response.json({ expedition: result[0] });
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
      "code",
      "logo",
      "is_vip_only",
      "order_position",
      "is_active",
      "show_on_homepage",
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
    const q = `UPDATE expeditions SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    return Response.json({ expedition: result[0] });
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
    await sql`DELETE FROM expeditions WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
