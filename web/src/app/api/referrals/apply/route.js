import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { ensureProfile } from "@/app/api/utils/helpers";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    await ensureProfile(userId);
    const body = await request.json();
    const code = String(body.code || "")
      .trim()
      .toUpperCase();
    if (!code)
      return Response.json({ error: "Code required" }, { status: 400 });

    const referrerRows =
      await sql`SELECT user_id FROM user_profiles WHERE referral_code = ${code} LIMIT 1`;
    if (referrerRows.length === 0)
      return Response.json({ error: "Invalid code" }, { status: 404 });
    const referrerId = referrerRows[0].user_id;
    if (referrerId === userId)
      return Response.json({ error: "Cannot refer self" }, { status: 400 });

    const current =
      await sql`SELECT referred_by FROM user_profiles WHERE user_id = ${userId} LIMIT 1`;
    if (current[0]?.referred_by)
      return Response.json({ error: "Already referred" }, { status: 400 });

    await sql`UPDATE user_profiles SET referred_by = ${referrerId} WHERE user_id = ${userId}`;
    await sql`INSERT INTO referrals (referrer_id, referred_id, status) VALUES (${referrerId}, ${userId}, 'pending')`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error("POST /api/referrals/apply", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
