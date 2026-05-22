import sql from "@/app/api/utils/sql";
import {
  requireAdmin,
  sendFonnteNotification,
  formatTemplate,
} from "@/app/api/utils/helpers";

const ALLOWED_BOOL = [
  "is_active",
  "notify_payment_success",
  "notify_payment_pending",
  "notify_resi_upload",
  "notify_refund",
  "notify_return",
  "notify_hold",
  "notify_vip_expired",
  "notify_referral_success",
  "notify_order_status",
  "notify_topup_success",
  "notify_topup_pending",
  "notify_withdraw_request",
  "notify_withdraw_approved",
  "notify_withdraw_rejected",
  "notify_withdraw_otp",
  "notify_order_created",
  "notify_order_shipped",
  "notify_order_delivered",
  "notify_vip_upgrade",
  "notify_balance_adjusted",
  "notify_welcome",
  "notify_followup_inactive",
  "notify_followup_no_order",
  "notify_followup_low_balance",
];

const ALLOWED_TEXT = [
  "api_token",
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

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM fonnte_settings WHERE id = 1 LIMIT 1`;
  return Response.json({ fonnte: rows[0] || null });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();

    // Special: broadcast action
    if (b.action === "broadcast") {
      const exists =
        await sql`SELECT id, is_active, api_token FROM fonnte_settings WHERE id = 1 LIMIT 1`;
      if (!exists[0]?.is_active || !exists[0]?.api_token) {
        return Response.json(
          { error: "Fonnte belum aktif / token kosong" },
          { status: 400 },
        );
      }
      const message = String(b.message || "").trim();
      if (!message)
        return Response.json({ error: "Pesan kosong" }, { status: 400 });
      const target = b.target || "all";

      let where = `WHERE p.is_active = true AND COALESCE(p.whatsapp, p.phone, '') <> ''`;
      if (target === "vip") where += ` AND p.vip_status = true`;
      if (target === "non_vip") where += ` AND p.vip_status = false`;
      if (target === "no_order") {
        where += ` AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)`;
      }
      if (target === "low_balance") where += ` AND p.balance < 50000`;

      const rowsTargets = await sql(
        `SELECT u.id, u.name, COALESCE(p.whatsapp, p.phone) AS phone, p.full_name
           FROM auth_users u JOIN user_profiles p ON p.user_id = u.id
           ${where}
           LIMIT 1000`,
        [],
      );

      let sent = 0;
      let failed = 0;
      for (const m of rowsTargets) {
        try {
          const msg = formatTemplate(message, {
            name: m.full_name || m.name || "Member",
          });
          const ok = await sendFonnteNotification(m.phone, msg);
          if (ok) sent++;
          else failed++;
        } catch {
          failed++;
        }
      }
      return Response.json({
        ok: true,
        sent,
        failed,
        total: rowsTargets.length,
      });
    }

    // Regular settings update
    const exists =
      await sql`SELECT id FROM fonnte_settings WHERE id = 1 LIMIT 1`;
    if (!exists[0]) {
      await sql`INSERT INTO fonnte_settings (id) VALUES (1)`;
    }
    const sets = [];
    const vals = [];
    for (const k of [...ALLOWED_BOOL, ...ALLOWED_TEXT]) {
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    }
    if (b.custom_templates !== undefined) {
      sets.push(`custom_templates = $${vals.length + 1}::jsonb`);
      vals.push(JSON.stringify(b.custom_templates || []));
    }
    if (sets.length > 0) {
      sets.push("updated_at = NOW()");
      const q = `UPDATE fonnte_settings SET ${sets.join(", ")} WHERE id = 1`;
      await sql(q, vals);
    }
    const rows = await sql`SELECT * FROM fonnte_settings WHERE id = 1 LIMIT 1`;
    return Response.json({ fonnte: rows[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

// Test send (one-off)
export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    const { phone, message } = b;
    if (!phone || !message)
      return Response.json(
        { error: "phone & message required" },
        { status: 400 },
      );
    const settings =
      await sql`SELECT api_token FROM fonnte_settings WHERE id = 1 LIMIT 1`;
    if (!settings[0]?.api_token)
      return Response.json({ error: "Token not set" }, { status: 400 });
    const cleanPhone = String(phone).replace(/^0/, "62").replace(/\D/g, "");
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: settings[0].api_token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        target: cleanPhone,
        message,
        countryCode: "62",
      }).toString(),
    });
    const data = await res.json().catch(() => ({}));
    return Response.json({ ok: res.ok, response: data });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
