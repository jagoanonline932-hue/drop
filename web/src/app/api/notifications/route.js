import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const url = new URL(request.url);
    const unread = url.searchParams.get("unread");
    if (unread) {
      const c =
        await sql`SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = ${userId} AND is_read = false`;
      return Response.json({ count: c[0].count });
    }
    const rows =
      await sql`SELECT * FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100`;
    return Response.json({ notifications: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const body = await request.json();
    if (body.markAllRead) {
      await sql`UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = ${userId} AND is_read = false`;
      return Response.json({ ok: true });
    }
    if (body.id) {
      await sql`UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = ${body.id} AND user_id = ${userId}`;
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Invalid" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
