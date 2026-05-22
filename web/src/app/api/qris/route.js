import sql from "@/app/api/utils/sql";
export async function GET() {
  const rows = await sql`SELECT * FROM qris_settings WHERE id = 1 LIMIT 1`;
  return Response.json({ qris: rows[0] || null });
}
