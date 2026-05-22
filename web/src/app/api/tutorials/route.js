import sql from "@/app/api/utils/sql";
export async function GET() {
  const rows =
    await sql`SELECT * FROM tutorials WHERE is_active = true ORDER BY order_position ASC, id ASC`;
  return Response.json({ tutorials: rows });
}
