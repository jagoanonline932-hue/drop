import sql from "@/app/api/utils/sql";
export async function GET() {
  const rows =
    await sql`SELECT * FROM bank_accounts WHERE is_active = true AND is_maintenance = false ORDER BY order_position ASC`;
  return Response.json({ banks: rows });
}
