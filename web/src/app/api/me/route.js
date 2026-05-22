import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import {
  ensureProfile,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    await ensureProfile(userId);
    const rows = await sql`
      SELECT u.id, u.name, u.email, u.image,
        p.role, p.vip_status, p.vip_expired_at, p.balance, p.balance_hold,
        p.full_name, p.phone, p.whatsapp, p.referral_code, p.referred_by,
        p.province, p.city, p.district, p.postal_code, p.address,
        p.bank_name, p.bank_account_number, p.bank_account_holder, p.avatar, p.is_active
      FROM auth_users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;
    return Response.json({ user: rows[0] || null });
  } catch (e) {
    console.error("GET /api/me", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    await ensureProfile(userId);
    const body = await request.json();
    const allowed = [
      "full_name",
      "phone",
      "whatsapp",
      "province",
      "city",
      "district",
      "postal_code",
      "address",
      "bank_name",
      "bank_account_number",
      "bank_account_holder",
      "avatar",
    ];
    const updates = {};
    for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];
    if (Object.keys(updates).length === 0)
      return Response.json({ error: "No fields" }, { status: 400 });

    const setClauses = [];
    const values = [];
    Object.entries(updates).forEach(([k, v]) => {
      setClauses.push(`${k} = $${values.length + 1}`);
      values.push(v);
    });
    setClauses.push(`updated_at = NOW()`);
    values.push(userId);
    const q = `UPDATE user_profiles SET ${setClauses.join(", ")} WHERE user_id = $${values.length} RETURNING *`;
    const result = await sql(q, values);

    if (body.name && body.name !== session.user.name) {
      await sql`UPDATE auth_users SET name = ${body.name} WHERE id = ${userId}`;
    }
    return Response.json({ profile: result[0] });
  } catch (e) {
    console.error("PUT /api/me", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// Onboarding hook: send welcome notification (in-app + WhatsApp) once per user.
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    if (action === "welcome") {
      const already = await sql`
        SELECT id FROM activity_logs
        WHERE user_id = ${userId} AND action = 'welcome_sent'
        LIMIT 1
      `;
      if (already.length === 0) {
        await notifyMember(
          userId,
          "Selamat datang di HyperDrop! 🎉",
          "Akun Anda berhasil dibuat. Mulai topup saldo dan order pertamamu sekarang.",
          "success",
          "/dashboard",
          true,
          {},
          "template_welcome",
        );
        await logActivity(userId, "welcome_sent", "Welcome notification sent");
      }
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("POST /api/me", e);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
