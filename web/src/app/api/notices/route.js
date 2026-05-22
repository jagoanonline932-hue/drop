import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

export async function GET() {
  try {
    const user = await getSessionUser();
    const role = user?.role || "member";
    const isVip = user?.vip_status;
    let targetRoles = ["all"];
    if (role === "member") {
      targetRoles.push(isVip ? "vip" : "non_vip", "member");
    } else {
      targetRoles.push("admin", role);
    }
    const rows = await sql`
      SELECT * FROM notices WHERE is_active = true
      AND (target_role = ANY(${targetRoles}))
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (ends_at IS NULL OR ends_at >= NOW())
      ORDER BY created_at DESC LIMIT 20
    `;
    return Response.json({ notices: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ notices: [] });
  }
}
