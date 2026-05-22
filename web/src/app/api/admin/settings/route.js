import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT setting_key, setting_value, setting_type FROM site_settings ORDER BY setting_key`;
  const settings = rows.reduce((acc, r) => {
    acc[r.setting_key] = r.setting_value;
    return acc;
  }, {});
  return Response.json({ settings, rows });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid" }, { status: 400 });
    const entries = Object.entries(body);
    for (const [k, v] of entries) {
      await sql`
        INSERT INTO site_settings (setting_key, setting_value, updated_at)
        VALUES (${k}, ${String(v ?? "")}, NOW())
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
      `;
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
