import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM tooltips ORDER BY tooltip_key ASC`;
  return Response.json({ tooltips: rows });
}
export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.tooltip_key)
    return Response.json({ error: "tooltip_key required" }, { status: 400 });
  await sql`
    INSERT INTO tooltips (tooltip_key, content, is_active, updated_at)
    VALUES (${b.tooltip_key}, ${b.content || ""}, ${b.is_active !== false}, NOW())
    ON CONFLICT (tooltip_key) DO UPDATE SET content = EXCLUDED.content, is_active = EXCLUDED.is_active, updated_at = NOW()
  `;
  return Response.json({ ok: true });
}
