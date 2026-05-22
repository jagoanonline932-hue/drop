import sql from "@/app/api/utils/sql";
import {
  getSessionUser,
  generateOrderNumber,
  notifyMember,
  logActivity,
} from "@/app/api/utils/helpers";

// Member: list own orders. Admin: pass scope=all
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope") || "me";
    const adminRoles = [
      "super_admin",
      "staff_admin",
      "finance_admin",
      "cs_admin",
    ];
    const isAdmin = adminRoles.includes(user.role);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const type = url.searchParams.get("type") || "";
    const dateFrom = url.searchParams.get("from");
    const dateTo = url.searchParams.get("to");

    let where = "WHERE 1=1";
    const params = [];
    if (scope !== "all" || !isAdmin) {
      params.push(user.id);
      where += ` AND o.user_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (o.order_number ILIKE $${params.length} OR o.tracking_number ILIKE $${params.length} OR o.recipient_name ILIKE $${params.length} OR o.recipient_phone ILIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      where += ` AND o.status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      where += ` AND o.order_type = $${params.length}`;
    }
    if (dateFrom) {
      params.push(dateFrom);
      where += ` AND o.created_at >= $${params.length}`;
    }
    if (dateTo) {
      params.push(dateTo);
      where += ` AND o.created_at <= $${params.length}`;
    }

    const q = `
      SELECT o.*, p.name AS product_name, p.main_image AS product_image,
        v.name AS variant_name, w.name AS warehouse_name, w.pickup_time AS warehouse_pickup,
        a.name AS aggregator_name, a.logo AS aggregator_logo,
        e.name AS expedition_name, e.logo AS expedition_logo,
        u.name AS member_name, u.email AS member_email
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      LEFT JOIN product_variants v ON v.id = o.variant_id
      LEFT JOIN warehouses w ON w.id = o.warehouse_id
      LEFT JOIN aggregators a ON a.id = o.aggregator_id
      LEFT JOIN expeditions e ON e.id = o.expedition_id
      LEFT JOIN auth_users u ON u.id = o.user_id
      ${where}
      ORDER BY o.created_at DESC
      LIMIT 500
    `;
    const rows = await sql(q, params);
    return Response.json({ orders: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

// Create order - both internal_cod and external_aggregator
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await request.json();

    // settings
    const settingsRows =
      await sql`SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('cod_fee_percent','packing_fee')`;
    const settings = settingsRows.reduce((a, r) => {
      a[r.setting_key] = r.setting_value;
      return a;
    }, {});
    const codFeePercent = Number(settings.cod_fee_percent || 3);
    const packingFee = Number(settings.packing_fee || 2500);

    const orderType = b.order_type; // 'internal_cod' or 'external_aggregator'
    if (!orderType)
      return Response.json({ error: "order_type required" }, { status: 400 });
    if (!b.product_id)
      return Response.json({ error: "product_id required" }, { status: 400 });

    // Validate product
    const productRows =
      await sql`SELECT * FROM products WHERE id = ${b.product_id} AND is_active = true LIMIT 1`;
    const product = productRows[0];
    if (!product)
      return Response.json({ error: "Product not found" }, { status: 404 });

    if (orderType === "internal_cod") {
      if (!user.vip_status)
        return Response.json(
          { error: "Internal COD hanya untuk VIP Member" },
          { status: 403 },
        );
    } else if (orderType === "external_aggregator") {
      // External: must NOT be VIP-only product unless user is VIP
      if (product.is_vip_only && !user.vip_status) {
        return Response.json({ error: "Produk VIP only" }, { status: 403 });
      }
    }

    let variantPrice = null;
    let weight = product.weight || 1000;
    if (b.variant_id) {
      const vr =
        await sql`SELECT * FROM product_variants WHERE id = ${b.variant_id} AND product_id = ${b.product_id} LIMIT 1`;
      if (vr[0]) {
        variantPrice = Number(vr[0].price);
        weight = vr[0].weight || weight;
      }
    }
    const productPrice = variantPrice ?? Number(product.supplier_price);
    const sellPrice = Number(b.sell_price || 0);
    const shipping = Number(b.shipping_cost || 0);
    const qty = Number(b.quantity || 1);

    let codFee = 0;
    let totalCod = 0;
    let memberProfit = 0;
    let adminRevenue = productPrice * qty + packingFee;
    let holdAmount = 0;

    if (orderType === "internal_cod") {
      totalCod = sellPrice * qty;
      codFee = Math.round((totalCod * codFeePercent) / 100);
      memberProfit =
        totalCod - shipping - codFee - packingFee - productPrice * qty;
      // HOLD: produk price + ongkir + packing fee
      holdAmount = productPrice * qty + shipping + packingFee;
    } else {
      // External aggregator: bayar pakai saldo (produk + ongkir + packing)
      totalCod = productPrice * qty + shipping + packingFee;
      memberProfit = 0;
      holdAmount = totalCod;
    }

    // Check saldo for external (must pay from balance)
    if (orderType === "external_aggregator") {
      if (Number(user.balance) < holdAmount) {
        return Response.json(
          {
            error: "Saldo tidak cukup. Mohon topup terlebih dahulu.",
            needed: holdAmount,
            balance: user.balance,
          },
          { status: 400 },
        );
      }
    } else {
      // internal COD: hold from balance
      if (Number(user.balance) < holdAmount) {
        return Response.json(
          {
            error: "Saldo tidak cukup untuk HOLD. Mohon topup terlebih dahulu.",
            needed: holdAmount,
            balance: user.balance,
          },
          { status: 400 },
        );
      }
    }

    const orderNumber = generateOrderNumber(
      orderType === "internal_cod" ? "HDI" : "HDE",
    );

    const created = await sql`
      INSERT INTO orders (
        order_number, user_id, order_type, product_id, variant_id, quantity,
        warehouse_id, aggregator_id, expedition_id,
        recipient_name, recipient_phone, recipient_email, recipient_address,
        recipient_district, recipient_city, recipient_province, recipient_postal_code,
        product_price, sell_price, shipping_cost, cod_fee, packing_fee, total_cod,
        member_profit, admin_revenue, tracking_number, resi_pdf_url, payment_method,
        status, payment_status, notes
      ) VALUES (
        ${orderNumber}, ${user.id}, ${orderType}, ${b.product_id}, ${b.variant_id || null}, ${qty},
        ${product.warehouse_id || null}, ${product.aggregator_id || null}, ${b.expedition_id || null},
        ${b.recipient_name || null}, ${b.recipient_phone || null}, ${b.recipient_email || null}, ${b.recipient_address || null},
        ${b.recipient_district || null}, ${b.recipient_city || null}, ${b.recipient_province || null}, ${b.recipient_postal_code || null},
        ${productPrice}, ${sellPrice}, ${shipping}, ${codFee}, ${packingFee}, ${totalCod},
        ${memberProfit}, ${adminRevenue}, ${b.tracking_number || null}, ${b.resi_pdf_url || null}, ${b.payment_method || (orderType === "external_aggregator" ? "balance" : "cod")},
        'hold', ${orderType === "external_aggregator" ? "paid" : "pending"}, ${b.notes || null}
      ) RETURNING *
    `;
    const order = created[0];

    // Apply HOLD - move balance to balance_hold
    const balBefore = Number(user.balance);
    const balAfter = balBefore - holdAmount;
    await sql`
      UPDATE user_profiles SET balance = balance - ${holdAmount}, balance_hold = balance_hold + ${holdAmount}, updated_at = NOW()
      WHERE user_id = ${user.id}
    `;
    await sql`
      INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description)
      VALUES (${user.id}, 'hold', ${-holdAmount}, ${balBefore}, ${balAfter}, 'order', ${order.id}, ${`HOLD untuk order ${orderNumber}`})
    `;

    await logActivity(
      user.id,
      "create_order",
      `Create ${orderType} order ${orderNumber}`,
      { order_id: order.id },
    );
    await notifyMember(
      user.id,
      "Order Dibuat",
      `Order ${orderNumber} berhasil dibuat. Saldo Rp ${holdAmount.toLocaleString("id-ID")} di-HOLD.`,
      "success",
      `/dashboard/internal-cod`,
      true,
      { order: orderNumber, amount: holdAmount.toLocaleString("id-ID") },
      "template_hold",
    );

    return Response.json({ order, hold_amount: holdAmount });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message || "Internal" }, { status: 500 });
  }
}
