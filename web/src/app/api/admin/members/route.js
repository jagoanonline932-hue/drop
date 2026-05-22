import sql from "@/app/api/utils/sql";
import { requireAdmin, logActivity } from "@/app/api/utils/helpers";

export async function GET(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const role = url.searchParams.get("role") || "";
  const vipFilter = url.searchParams.get("vip"); // 'true' | 'false' | ''
  let where = "WHERE 1=1";
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR p.phone ILIKE $${params.length})`;
  }
  if (role) {
    params.push(role);
    where += ` AND p.role = $${params.length}`;
  }
  if (vipFilter === "true") where += ` AND p.vip_status = true`;
  if (vipFilter === "false") where += ` AND p.vip_status = false`;
  const q = `
    SELECT u.id, u.name, u.email, u.image,
      p.role, p.vip_status, p.vip_expired_at, p.balance, p.balance_hold,
      p.phone, p.whatsapp, p.referral_code, p.referred_by, p.created_at, p.is_active
    FROM auth_users u
    LEFT JOIN user_profiles p ON p.user_id = u.id
    ${where}
    ORDER BY p.created_at DESC NULLS LAST, u.id DESC
    LIMIT 500
  `;
  const rows = await sql(q, params);
  return Response.json({ members: rows });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.user_id)
      return Response.json({ error: "user_id required" }, { status: 400 });
    const allowed = [
      "role",
      "vip_status",
      "vip_expired_at",
      "is_active",
      "full_name",
      "phone",
      "whatsapp",
    ];
    const sets = [],
      vals = [];
    for (const k of allowed)
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    if (sets.length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    sets.push("updated_at = NOW()");
    vals.push(b.user_id);
    const q = `UPDATE user_profiles SET ${sets.join(", ")} WHERE user_id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    await logActivity(
      r.user.id,
      "update_member",
      `Update member ${b.user_id}`,
      b,
    );
    return Response.json({ profile: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
