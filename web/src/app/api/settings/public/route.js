import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const [settingRows, duitku, midtrans, qris] = await Promise.all([
      sql`SELECT setting_key, setting_value FROM site_settings`,
      sql`SELECT is_active, is_maintenance FROM duitku_settings WHERE id = 1 LIMIT 1`,
      sql`SELECT is_active, is_maintenance, min_topup, max_topup,
                 enable_qris, enable_va, enable_ewallet, enable_cc,
                 maintenance_title, maintenance_description, maintenance_until,
                 client_key, mode
          FROM midtrans_settings WHERE id = 1 LIMIT 1`,
      sql`SELECT is_active, is_maintenance FROM qris_settings WHERE id = 1 LIMIT 1`,
    ]);
    const settings = settingRows.reduce((acc, r) => {
      acc[r.setting_key] = r.setting_value;
      return acc;
    }, {});
    const m = midtrans[0] || {};
    const payment_methods = {
      duitku: {
        active: !!duitku[0]?.is_active,
        maintenance: !!duitku[0]?.is_maintenance,
      },
      midtrans: {
        active: !!m.is_active,
        maintenance: !!m.is_maintenance,
        min_topup: Number(m.min_topup || 10000),
        max_topup: Number(m.max_topup || 50000000),
        enable_qris: !!m.enable_qris,
        enable_va: !!m.enable_va,
        enable_ewallet: !!m.enable_ewallet,
        enable_cc: !!m.enable_cc,
        maintenance_title: m.maintenance_title || null,
        maintenance_description: m.maintenance_description || null,
        maintenance_until: m.maintenance_until || null,
        client_key: m.client_key || null,
        mode: m.mode || "production",
      },
      qris: {
        active: !!qris[0]?.is_active,
        maintenance: !!qris[0]?.is_maintenance,
      },
    };
    return Response.json({ settings, payment_methods });
  } catch (e) {
    console.error("GET /api/settings/public", e);
    return Response.json({ settings: {}, payment_methods: {} });
  }
}
