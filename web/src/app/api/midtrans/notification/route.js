import sql from "@/app/api/utils/sql";
import { notifyMember, logActivity } from "@/app/api/utils/helpers";
import {
  logPaymentAudit,
  logSuspicious,
  getClientIp,
} from "@/app/api/utils/finance";
import crypto from "node:crypto";

// Midtrans Payment Notification handler
// Verifies signature & updates topup status atomically.
// Configure webhook URL in Midtrans dashboard:
//   <YOUR_URL>/api/midtrans/notification
export async function POST(request) {
  const ip = getClientIp(request);
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    if (!order_id || !signature_key || !status_code || !gross_amount) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const settings =
      await sql`SELECT mode, server_key, is_active FROM midtrans_settings WHERE id = 1 LIMIT 1`;
    if (!settings[0]?.is_active || !settings[0]?.server_key) {
      return Response.json(
        { error: "Midtrans not configured" },
        { status: 400 },
      );
    }

    // Verify signature: sha512(order_id + status_code + gross_amount + server_key)
    const computed = crypto
      .createHash("sha512")
      .update(
        `${order_id}${status_code}${gross_amount}${settings[0].server_key}`,
      )
      .digest("hex");
    if (computed !== signature_key) {
      console.warn("Midtrans signature mismatch", { order_id, ip });
      await logSuspicious({
        user_id: null,
        activity_type: "midtrans_invalid_signature",
        severity: "high",
        ip_address: ip,
        description: `Invalid signature for order ${order_id}`,
        metadata: { body },
      });
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Find topup by midtrans_order_id
    const topups = await sql`
      SELECT * FROM topups WHERE midtrans_order_id = ${order_id} LIMIT 1
    `;
    if (!topups[0]) {
      return Response.json({ error: "Topup not found" }, { status: 404 });
    }
    const topup = topups[0];

    // Idempotency — if already approved, just ack
    if (topup.status === "approved") {
      await logPaymentAudit({
        reference_type: "topup",
        reference_id: topup.id,
        user_id: topup.user_id,
        actor_type: "webhook",
        action: "duplicate_webhook_ignored",
        status_before: "approved",
        status_after: "approved",
        amount: topup.amount,
        ip_address: ip,
        metadata: { transaction_status, fraud_status },
      });
      return Response.json({ ok: true, already: true });
    }

    // Validate gross_amount matches (anti-tamper)
    if (Math.round(Number(gross_amount)) !== Math.round(Number(topup.amount))) {
      await logSuspicious({
        user_id: topup.user_id,
        activity_type: "midtrans_amount_mismatch",
        severity: "critical",
        ip_address: ip,
        reference_type: "topup",
        reference_id: topup.id,
        description: `Webhook gross_amount ${gross_amount} != topup amount ${topup.amount}`,
        metadata: { body },
      });
      return Response.json({ error: "Amount mismatch" }, { status: 400 });
    }

    let newStatus = "pending";
    if (
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement"
    ) {
      newStatus = "approved";
    } else if (transaction_status === "pending") {
      newStatus = "pending";
    } else if (["cancel", "deny", "failure"].includes(transaction_status)) {
      newStatus = "rejected";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    }

    const statusBefore = topup.status;

    if (newStatus === "approved") {
      // Atomic transaction: update topup + balance + ledger
      await sql.transaction([
        sql`UPDATE topups
            SET status = 'approved', approved_at = NOW(),
                midtrans_response = ${JSON.stringify(body)}::jsonb,
                updated_at = NOW()
            WHERE id = ${topup.id} AND status <> 'approved'`,
        sql`UPDATE user_profiles
            SET balance = balance + ${topup.amount}, updated_at = NOW()
            WHERE user_id = ${topup.user_id}`,
        sql`INSERT INTO balance_transactions
              (user_id, transaction_type, amount, balance_before, balance_after,
               reference_type, reference_id, description)
            SELECT ${topup.user_id}, 'topup_approved', ${topup.amount},
                   balance - ${topup.amount}, balance, 'topup', ${topup.id},
                   ${`Topup ${topup.topup_number} approved (Midtrans)`}
            FROM user_profiles WHERE user_id = ${topup.user_id}`,
      ]);

      await logPaymentAudit({
        reference_type: "topup",
        reference_id: topup.id,
        user_id: topup.user_id,
        actor_type: "webhook",
        action: "midtrans_settlement",
        status_before: statusBefore,
        status_after: "approved",
        amount: topup.amount,
        ip_address: ip,
        metadata: { transaction_status, fraud_status },
      });
      await logActivity(
        topup.user_id,
        "topup_approved_midtrans",
        `Topup ${topup.topup_number} Rp ${topup.amount}`,
      );
      await notifyMember(
        topup.user_id,
        "Topup Berhasil! 💰",
        `Topup Rp ${Number(topup.amount).toLocaleString("id-ID")} berhasil diproses. Saldo Anda sudah masuk.`,
        "success",
        "/dashboard/saldo",
        true,
        {
          amount: Number(topup.amount).toLocaleString("id-ID"),
          order: topup.topup_number,
        },
        "template_topup_success",
      );
    } else if (newStatus === "rejected" || newStatus === "expired") {
      await sql`
        UPDATE topups
        SET status = ${newStatus},
            midtrans_response = ${JSON.stringify(body)}::jsonb,
            updated_at = NOW()
        WHERE id = ${topup.id}
      `;
      await logPaymentAudit({
        reference_type: "topup",
        reference_id: topup.id,
        user_id: topup.user_id,
        actor_type: "webhook",
        action: `midtrans_${newStatus}`,
        status_before: statusBefore,
        status_after: newStatus,
        amount: topup.amount,
        ip_address: ip,
        metadata: { transaction_status, fraud_status },
      });
      await notifyMember(
        topup.user_id,
        newStatus === "expired" ? "Topup Kedaluwarsa" : "Topup Gagal",
        `Topup ${topup.topup_number} (Rp ${Number(topup.amount).toLocaleString("id-ID")}) ${newStatus === "expired" ? "kedaluwarsa" : "dibatalkan/gagal"}. Silakan buat topup baru.`,
        "warning",
        "/dashboard/topup",
        true,
        {
          amount: Number(topup.amount).toLocaleString("id-ID"),
          order: topup.topup_number,
        },
        "template_topup_pending",
      );
    } else {
      // Still pending — just store last response
      await sql`
        UPDATE topups
        SET midtrans_response = ${JSON.stringify(body)}::jsonb,
            updated_at = NOW()
        WHERE id = ${topup.id}
      `;
      await logPaymentAudit({
        reference_type: "topup",
        reference_id: topup.id,
        user_id: topup.user_id,
        actor_type: "webhook",
        action: "midtrans_pending_update",
        status_before: statusBefore,
        status_after: "pending",
        amount: topup.amount,
        ip_address: ip,
        metadata: { transaction_status, fraud_status },
      });
    }

    return Response.json({ ok: true, status: newStatus });
  } catch (e) {
    console.error("Midtrans notification error:", e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, message: "Midtrans webhook ready" });
}
