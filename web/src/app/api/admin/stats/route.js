import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM trusted_stats ORDER BY id ASC`;
  return Response.json({ stats: rows });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const b = await request.json();
  if (!b.stat_key)
    return Response.json({ error: "stat_key required" }, { status: 400 });
  await sql`INSERT INTO trusted_stats (stat_key, stat_value, label, updated_at) VALUES (${b.stat_key}, ${b.stat_value || 0}, ${b.label || null}, NOW()) ON CONFLICT (stat_key) DO UPDATE SET stat_value = EXCLUDED.stat_value, label = COALESCE(EXCLUDED.label, trusted_stats.label), updated_at = NOW()`;
  return Response.json({ ok: true });
}
