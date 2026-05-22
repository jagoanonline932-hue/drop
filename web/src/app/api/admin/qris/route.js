import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM qris_settings WHERE id = 1 LIMIT 1`;
  return Response.json({ qris: rows[0] || null });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    const exists = await sql`SELECT id FROM qris_settings WHERE id = 1 LIMIT 1`;
    if (!exists[0]) {
      await sql`INSERT INTO qris_settings (id, name, qris_image, logo, is_maintenance, is_active) VALUES (1, ${b.name || "QRIS"}, ${b.qris_image || null}, ${b.logo || null}, ${b.is_maintenance === true}, ${b.is_active !== false})`;
    } else {
      await sql`UPDATE qris_settings SET name = COALESCE(${b.name || null}, name), qris_image = COALESCE(${b.qris_image || null}, qris_image), logo = COALESCE(${b.logo || null}, logo), is_maintenance = COALESCE(${b.is_maintenance ?? null}, is_maintenance), is_active = COALESCE(${b.is_active ?? null}, is_active), updated_at = NOW() WHERE id = 1`;
    }
    const rows = await sql`SELECT * FROM qris_settings WHERE id = 1 LIMIT 1`;
    return Response.json({ qris: rows[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
