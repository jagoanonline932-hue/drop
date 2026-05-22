import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM warehouses ORDER BY id ASC`;
  return Response.json({ warehouses: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.name)
      return Response.json({ error: "name required" }, { status: 400 });
    const result = await sql`
      INSERT INTO warehouses (name, logo, photo, pickup_time, address, city, province, postal_code, phone, is_active)
      VALUES (${b.name}, ${b.logo || null}, ${b.photo || null}, ${b.pickup_time || null}, ${b.address || null}, ${b.city || null}, ${b.province || null}, ${b.postal_code || null}, ${b.phone || null}, ${b.is_active !== false})
      RETURNING *
    `;
    return Response.json({ warehouse: result[0] });
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
      "logo",
      "photo",
      "pickup_time",
      "address",
      "city",
      "province",
      "postal_code",
      "phone",
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
    const q = `UPDATE warehouses SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    return Response.json({ warehouse: result[0] });
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
    await sql`DELETE FROM warehouses WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
