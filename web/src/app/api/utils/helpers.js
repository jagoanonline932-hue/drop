import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
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
  return rows[0] || null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized", status: 401 };
  return { user };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized", status: 401 };
  const adminRoles = [
    "super_admin",
    "staff_admin",
    "finance_admin",
    "cs_admin",
  ];
  if (!adminRoles.includes(user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { user };
}

export function generateOrderNumber(prefix = "HD") {
  const ts = Date.now().toString().slice(-9);
  const rnd = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${ts}${rnd}`;
}

export function generateReferralCode(userId) {
  const rnd = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HD${String(userId).padStart(4, "0")}${rnd}`;
}

export async function ensureProfile(userId) {
  const rows =
    await sql`SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1`;
  if (rows.length === 0) {
    const refCode = generateReferralCode(userId);
    await sql`
      INSERT INTO user_profiles (user_id, role, referral_code)
      VALUES (${userId}, 'member', ${refCode})
      ON CONFLICT (user_id) DO NOTHING
    `;
    const newRows =
      await sql`SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1`;
    return newRows[0];
  }
  if (!rows[0].referral_code) {
    const refCode = generateReferralCode(userId);
    await sql`UPDATE user_profiles SET referral_code = ${refCode} WHERE user_id = ${userId}`;
  }
  return rows[0];
}

export async function logActivity(
  userId,
  action,
  description = null,
  metadata = null,
) {
  try {
    await sql`
      INSERT INTO activity_logs (user_id, action, description, metadata)
      VALUES (${userId}, ${action}, ${description}, ${metadata ? JSON.stringify(metadata) : null})
    `;
  } catch (e) {
    console.error("logActivity failed", e);
  }
}

export async function getSetting(key, fallback = null) {
  const rows =
    await sql`SELECT setting_value FROM site_settings WHERE setting_key = ${key} LIMIT 1`;
  return rows[0]?.setting_value ?? fallback;
}

export async function getAllSettings() {
  const rows = await sql`SELECT setting_key, setting_value FROM site_settings`;
  return rows.reduce((acc, r) => {
    acc[r.setting_key] = r.setting_value;
    return acc;
  }, {});
}

export async function sendFonnteNotification(phone, message) {
  try {
    const settings =
      await sql`SELECT api_token, is_active FROM fonnte_settings WHERE id = 1 LIMIT 1`;
    if (!settings[0]?.is_active || !settings[0]?.api_token) return false;
    if (!phone) return false;
    const cleanPhone = String(phone).replace(/^0/, "62").replace(/\D/g, "");
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: settings[0].api_token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        target: cleanPhone,
        message: message,
        countryCode: "62",
      }).toString(),
    });
    return res.ok;
  } catch (e) {
    console.error("Fonnte error:", e);
    return false;
  }
}

export function formatTemplate(template, vars = {}) {
  if (!template) return "";
  let result = template;
  Object.keys(vars).forEach((k) => {
    result = result.replace(new RegExp(`{${k}}`, "g"), vars[k] ?? "");
  });
  return result;
}

export async function notifyMember(
  userId,
  title,
  message,
  type = "info",
  link = null,
  sendWa = false,
  waVars = {},
  fonnteTemplate = null,
) {
  try {
    await sql`
      INSERT INTO notifications (user_id, title, message, notification_type, link)
      VALUES (${userId}, ${title}, ${message}, ${type}, ${link})
    `;
    if (sendWa) {
      const userRows = await sql`
        SELECT u.name, p.whatsapp, p.phone FROM auth_users u
        LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ${userId} LIMIT 1
      `;
      const u = userRows[0];
      if (u && (u.whatsapp || u.phone)) {
        const phone = u.whatsapp || u.phone;
        let waMessage = message;
        const allowedTpl = [
          "template_payment_success",
          "template_payment_pending",
          "template_resi_upload",
          "template_refund",
          "template_return",
          "template_hold",
          "template_vip_expired",
          "template_referral",
          "template_order_status",
          "template_topup_success",
          "template_topup_pending",
          "template_withdraw_request",
          "template_withdraw_approved",
          "template_withdraw_rejected",
          "template_withdraw_otp",
          "template_order_created",
          "template_order_shipped",
          "template_order_delivered",
          "template_vip_upgrade",
          "template_balance_adjusted",
          "template_welcome",
          "template_followup_inactive",
          "template_followup_no_order",
          "template_followup_low_balance",
        ];
        if (fonnteTemplate && allowedTpl.includes(fonnteTemplate)) {
          const fonnte =
            await sql`SELECT * FROM fonnte_settings WHERE id = 1 LIMIT 1`;
          const tpl = fonnte[0]?.[fonnteTemplate];
          if (tpl) {
            waMessage = formatTemplate(tpl, {
              name: u.name || "Member",
              ...waVars,
            });
          }
        }
        await sendFonnteNotification(phone, waMessage);
      }
    }
  } catch (e) {
    console.error("notifyMember error:", e);
  }
}
