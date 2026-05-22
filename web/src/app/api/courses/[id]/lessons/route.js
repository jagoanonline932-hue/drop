import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

export async function GET(request, { params }) {
  try {
    const user = await getSessionUser();
    const { id } = params;
    const c = (await sql`SELECT * FROM courses WHERE id = ${id} LIMIT 1`)[0];
    if (!c) return Response.json({ error: "Not found" }, { status: 404 });
    if (c.is_vip_only && !user?.vip_status)
      return Response.json({ error: "VIP only" }, { status: 403 });
    const rows =
      await sql`SELECT * FROM lessons WHERE course_id = ${id} AND is_active = true ORDER BY order_position ASC, id ASC`;
    return Response.json({ lessons: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
