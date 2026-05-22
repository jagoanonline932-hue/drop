import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const rows =
      await sql`SELECT * FROM balance_transactions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 200`;
    return Response.json({ transactions: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
