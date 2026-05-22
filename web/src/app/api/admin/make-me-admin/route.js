import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { ensureProfile } from "@/app/api/utils/helpers";

// One-time helper to promote the logged in user to super_admin.
// After the first admin exists, you can delete this file for safety.
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    await ensureProfile(userId);
    await sql`UPDATE user_profiles SET role = 'super_admin' WHERE user_id = ${userId}`;
    return Response.json({
      ok: true,
      message: "You are now super_admin. Reload /admin.",
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
