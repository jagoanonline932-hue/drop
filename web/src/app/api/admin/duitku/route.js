import crypto from "node:crypto";
import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows = await sql`SELECT * FROM duitku_settings WHERE id = 1 LIMIT 1`;
  return Response.json({ duitku: rows[0] || null });
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    const exists =
      await sql`SELECT id FROM duitku_settings WHERE id = 1 LIMIT 1`;
    if (!exists[0]) {
      await sql`INSERT INTO duitku_settings (id, mode, merchant_code, api_key, callback_url, return_url, is_active, is_maintenance) VALUES (1, ${b.mode || "sandbox"}, ${b.merchant_code || null}, ${b.api_key || null}, ${b.callback_url || null}, ${b.return_url || null}, ${b.is_active !== false}, ${b.is_maintenance === true})`;
    } else {
      const allowed = [
        "mode",
        "merchant_code",
        "api_key",
        "callback_url",
        "return_url",
        "is_active",
        "is_maintenance",
      ];
      const sets = [];
      const vals = [];
      for (const k of allowed) {
        if (b[k] !== undefined) {
          sets.push(`${k} = $${vals.length + 1}`);
          vals.push(b[k]);
        }
      }
      if (sets.length > 0) {
        sets.push("updated_at = NOW()");
        const q = `UPDATE duitku_settings SET ${sets.join(", ")} WHERE id = 1`;
        await sql(q, vals);
      }
    }
    const rows = await sql`SELECT * FROM duitku_settings WHERE id = 1 LIMIT 1`;
    return Response.json({ duitku: rows[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

// Test connection: do a small sandbox-style inquiry without saving anything
export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action !== "test") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }
    const cfg = (
      await sql`SELECT * FROM duitku_settings WHERE id = 1 LIMIT 1`
    )[0];
    if (!cfg || !cfg.merchant_code || !cfg.api_key) {
      return Response.json(
        { ok: false, error: "Mohon simpan Merchant Code & API Key dulu" },
        { status: 400 },
      );
    }
    const apiHost =
      cfg.mode === "production"
        ? "https://passport.duitku.com"
        : "https://sandbox.duitku.com";
    const merchantOrderId = "TEST" + Date.now();
    const amount = 10000;
    const signature = crypto
      .createHash("md5")
      .update(`${cfg.merchant_code}${merchantOrderId}${amount}${cfg.api_key}`)
      .digest("hex");
    const baseUrl =
      process.env.NEXT_PUBLIC_CREATE_APP_URL ||
      (request.headers.get("origin") ?? "");
    const payload = {
      merchantCode: cfg.merchant_code,
      paymentAmount: amount,
      merchantOrderId,
      productDetails: "Test koneksi HyperDrop",
      email: "test@hyperdrop.id",
      customerVaName: "Test",
      callbackUrl: cfg.callback_url || `${baseUrl}/api/duitku/callback`,
      returnUrl: cfg.return_url || `${baseUrl}/dashboard/topup?duitku=success`,
      signature,
      expiryPeriod: 60,
    };
    try {
      const r2 = await fetch(`${apiHost}/webapi/api/merchant/v2/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r2.json().catch(() => ({}));
      if (data.statusCode === "00" || data.paymentUrl) {
        return Response.json({
          ok: true,
          message: `Berhasil terhubung ke Duitku (${cfg.mode}). Reference: ${data.reference || "-"}.`,
        });
      }
      return Response.json({
        ok: false,
        message:
          data.statusMessage ||
          data.Message ||
          "Duitku menolak inquiry — periksa Merchant Code & API Key.",
      });
    } catch (e) {
      return Response.json({
        ok: false,
        message: "Tidak dapat terhubung ke Duitku: " + e.message,
      });
    }
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
