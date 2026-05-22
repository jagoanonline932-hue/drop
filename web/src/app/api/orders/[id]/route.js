import sql from "@/app/api/utils/sql";
import {
  getSessionUser,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

export async function GET(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const adminRoles = [
      "super_admin",
      "staff_admin",
      "finance_admin",
      "cs_admin",
    ];
    const isAdmin = adminRoles.includes(user.role);
    const { id } = params;
    const rows = await sql`
      SELECT o.*, p.name AS product_name, p.main_image AS product_image, p.images AS product_images,
        v.name AS variant_name, w.name AS warehouse_name, w.pickup_time AS warehouse_pickup,
        a.name AS aggregator_name, a.logo AS aggregator_logo,
        e.name AS expedition_name, e.logo AS expedition_logo,
        u.name AS member_name, u.email AS member_email,
        up.phone AS member_phone, up.whatsapp AS member_whatsapp
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      LEFT JOIN product_variants v ON v.id = o.variant_id
      LEFT JOIN warehouses w ON w.id = o.warehouse_id
      LEFT JOIN aggregators a ON a.id = o.aggregator_id
      LEFT JOIN expeditions e ON e.id = o.expedition_id
      LEFT JOIN auth_users u ON u.id = o.user_id
      LEFT JOIN user_profiles up ON up.user_id = o.user_id
      WHERE o.id = ${id} LIMIT 1
    `;
    if (!rows[0]) return Response.json({ error: "Not found" }, { status: 404 });
    if (!isAdmin && rows[0].user_id !== user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });
    return Response.json({ order: rows[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

// Member can upload tracking number / pdf for own order. Admin can change status.
export async function PUT(request, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const adminRoles = [
      "super_admin",
      "staff_admin",
      "finance_admin",
      "cs_admin",
    ];
    const isAdmin = adminRoles.includes(user.role);
    const { id } = params;
    const b = await request.json();

    const orderRows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
    if (!orderRows[0])
      return Response.json({ error: "Not found" }, { status: 404 });
    const order = orderRows[0];
    if (!isAdmin && order.user_id !== user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const memberAllowed = ["tracking_number", "resi_pdf_url"];
    const adminAllowed = [
      "status",
      "tracking_number",
      "resi_pdf_url",
      "admin_notes",
      "expedition_id",
      "payment_status",
    ];
    const allowed = isAdmin ? adminAllowed : memberAllowed;
    const sets = [],
      vals = [];
    for (const k of allowed) {
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    }
    if (sets.length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });

    // status transition side effects
    let newStatus = b.status;
    if (newStatus && newStatus !== order.status) {
      if (newStatus === "shipping") sets.push(`shipped_at = NOW()`);
      if (newStatus === "delivered") sets.push(`delivered_at = NOW()`);
      if (newStatus === "completed") sets.push(`completed_at = NOW()`);
      if (newStatus === "returned") sets.push(`returned_at = NOW()`);
      if (newStatus === "refund") sets.push(`refunded_at = NOW()`);
    }
    sets.push("updated_at = NOW()");
    vals.push(id);
    const q = `UPDATE orders SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const updated = (await sql(q, vals))[0];

    // Handle balance settlement
    if (isAdmin && newStatus && newStatus !== order.status) {
      const userId = order.user_id;
      const holdAmount =
        Number(order.product_price) * Number(order.quantity) +
        Number(order.shipping_cost) +
        Number(order.packing_fee);
      const profit = Number(order.member_profit);

      if (newStatus === "completed" || newStatus === "delivered") {
        // For Internal COD: profit goes to balance; for External: simply consume HOLD
        if (order.order_type === "internal_cod") {
          // Profit -> balance, HOLD released entirely (already moved to admin)
          await sql`
            UPDATE user_profiles SET
              balance_hold = balance_hold - ${holdAmount},
              balance = balance + ${profit},
              updated_at = NOW()
            WHERE user_id = ${userId}
          `;
          await sql`
            INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
            SELECT ${userId}, 'profit', ${profit}, balance - ${profit}, balance, 'order', ${id}, ${`Profit dari order ${order.order_number}`}
            FROM user_profiles WHERE user_id = ${userId}
          `;
        } else {
          // external: HOLD already used for product purchase, release HOLD
          await sql`UPDATE user_profiles SET balance_hold = balance_hold - ${holdAmount}, updated_at = NOW() WHERE user_id = ${userId}`;
          await sql`
            INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
            SELECT ${userId}, 'order_completed', ${-holdAmount}, balance + ${holdAmount}, balance, 'order', ${id}, ${`Order ${order.order_number} selesai`}
            FROM user_profiles WHERE user_id = ${userId}
          `;
        }
        await notifyMember(
          userId,
          "Order Selesai",
          `Order ${order.order_number} telah selesai.`,
          "success",
          "/dashboard/saldo",
          true,
          { order: order.order_number, status: "Selesai" },
          "template_order_status",
        );
      } else if (newStatus === "returned" || newStatus === "refund") {
        // Refund: produk price kembali. Packing fee tetap dipotong.
        const productPart =
          Number(order.product_price) * Number(order.quantity);
        const expRows =
          await sql`SELECT code FROM expeditions WHERE id = ${order.expedition_id} LIMIT 1`;
        const isSPX = (expRows[0]?.code || "").toUpperCase() === "SPX";
        const shippingRefund = isSPX ? Number(order.shipping_cost) : 0;
        const shippingLoss = isSPX ? 0 : Number(order.shipping_cost);
        const refundAmount = productPart + shippingRefund; // refund product + ongkir (SPX only)
        await sql`
          UPDATE user_profiles SET
            balance_hold = balance_hold - ${holdAmount},
            balance = balance + ${refundAmount},
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
        await sql`
          INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
          SELECT ${userId}, 'refund', ${refundAmount}, balance - ${refundAmount}, balance, 'order', ${id}, ${`Refund order ${order.order_number} (packing fee tidak direfund${shippingLoss > 0 ? ", selisih ongkir Rp " + shippingLoss.toLocaleString("id-ID") + " dipotong" : ""})`}
          FROM user_profiles WHERE user_id = ${userId}
        `;
        await notifyMember(
          userId,
          "Order Return/Refund",
          `Order ${order.order_number} di-return. Refund Rp ${refundAmount.toLocaleString("id-ID")}.`,
          "warning",
          "/dashboard/saldo",
          true,
          {
            order: order.order_number,
            amount: refundAmount.toLocaleString("id-ID"),
          },
          "template_refund",
        );
      } else if (newStatus === "cancelled") {
        // Release HOLD fully
        await sql`UPDATE user_profiles SET balance_hold = balance_hold - ${holdAmount}, balance = balance + ${holdAmount}, updated_at = NOW() WHERE user_id = ${userId}`;
        await sql`
          INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
          SELECT ${userId}, 'release_hold', ${holdAmount}, balance - ${holdAmount}, balance, 'order', ${id}, ${`Order ${order.order_number} dibatalkan`}
          FROM user_profiles WHERE user_id = ${userId}
        `;
        await notifyMember(
          userId,
          "Order Dibatalkan",
          `Order ${order.order_number} dibatalkan. Saldo HOLD dikembalikan.`,
          "info",
          "/dashboard/saldo",
          true,
          { order: order.order_number, status: "Dibatalkan" },
          "template_order_status",
        );
      }
    }

    // Member uploaded resi -> notify member
    if (!isAdmin && b.tracking_number) {
      await notifyMember(
        user.id,
        "Resi Berhasil Diupload",
        `Resi untuk order ${order.order_number} berhasil disimpan.`,
        "success",
        "/dashboard/tracking",
        true,
        { order: order.order_number },
        "template_resi_upload",
      );
    }

    await logActivity(
      user.id,
      "update_order",
      `Update order ${order.order_number}`,
      { order_id: id, status: newStatus },
    );
    return Response.json({ order: updated });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message || "Internal" }, { status: 500 });
  }
}
