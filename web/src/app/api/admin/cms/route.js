import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM cms_content`;
  const cms = rows.reduce((a, r) => {
    a[r.section] = r.content;
    return a;
  }, {});
  return Response.json({ cms });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.section || !b.content)
      return Response.json(
        { error: "section & content required" },
        { status: 400 },
      );
    await sql`
      INSERT INTO cms_content (section, content, updated_at)
      VALUES (${b.section}, ${JSON.stringify(b.content)}::jsonb, NOW())
      ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
