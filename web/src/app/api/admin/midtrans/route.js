import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";
import { logPaymentAudit } from "@/app/api/utils/finance";

const ALLOWED = [
  "mode",
  "merchant_id",
  "client_key",
  "server_key",
  "is_active",
  "is_maintenance",
  "min_topup",
  "max_topup",
  "expiry_minutes",
  "enable_qris",
  "enable_va",
  "enable_ewallet",
  "enable_cc",
  "maintenance_title",
  "maintenance_description",
  "maintenance_until",
];

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM midtrans_settings WHERE id = 1 LIMIT 1`;
  return Response.json({ midtrans: rows[0] || null });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    const exists =
      await sql`SELECT * FROM midtrans_settings WHERE id = 1 LIMIT 1`;

    if (!exists[0]) {
      await sql`
        INSERT INTO midtrans_settings (id, mode, merchant_id, client_key, server_key, is_active, is_maintenance)
        VALUES (1, ${b.mode || "production"}, ${b.merchant_id || null},
                ${b.client_key || null}, ${b.server_key || null},
                ${b.is_active !== false}, ${b.is_maintenance === true})
      `;
    }

    const sets = [],
      vals = [];
    for (const k of ALLOWED) {
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    }
    if (sets.length > 0) {
      sets.push("updated_at = NOW()");
      const q = `UPDATE midtrans_settings SET ${sets.join(", ")} WHERE id = 1`;
      await sql(q, vals);
    }

    // Audit if maintenance toggled
    if (
      b.is_maintenance !== undefined &&
      b.is_maintenance !== exists[0]?.is_maintenance
    ) {
      await logPaymentAudit({
        reference_type: "payment_settings",
        reference_id: 1,
        user_id: r.user.id,
        actor_type: "admin",
        actor_id: r.user.id,
        action: b.is_maintenance
          ? "maintenance_enabled"
          : "maintenance_disabled",
        metadata: {
          title: b.maintenance_title,
          desc: b.maintenance_description,
        },
      });
    }

    const rows =
      await sql`SELECT * FROM midtrans_settings WHERE id = 1 LIMIT 1`;
    return Response.json({ midtrans: rows[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
