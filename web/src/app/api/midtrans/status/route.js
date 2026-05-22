// Poll Midtrans transaction status (used for realtime UX while webhook is in-flight)
import sql from "@/app/api/utils/sql";
import { getSessionUser } from "@/app/api/utils/helpers";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { order_id } = await request.json().catch(() => ({}));
    if (!order_id)
      return Response.json({ error: "order_id required" }, { status: 400 });

    // 1) Find topup (must belong to user)
    const topups = await sql`
      SELECT * FROM topups
      WHERE midtrans_order_id = ${order_id} AND user_id = ${user.id}
      LIMIT 1
    `;
    if (!topups[0])
      return Response.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 },
      );
    const topup = topups[0];

    // 2) If still pending — query Midtrans
    if (topup.status === "pending") {
      const s =
        await sql`SELECT mode, server_key FROM midtrans_settings WHERE id = 1 LIMIT 1`;
      if (s[0]?.server_key) {
        const baseUrl =
          s[0].mode === "production"
            ? "https://api.midtrans.com/v2"
            : "https://api.sandbox.midtrans.com/v2";
        const auth =
          "Basic " + Buffer.from(s[0].server_key + ":").toString("base64");
        try {
          const resp = await fetch(
            `${baseUrl}/${encodeURIComponent(order_id)}/status`,
            {
              method: "GET",
              headers: { Accept: "application/json", Authorization: auth },
            },
          );
          const data = await resp.json().catch(() => ({}));
          if (resp.ok && data.transaction_status) {
            return Response.json({
              status: topup.status,
              midtrans_status: data.transaction_status,
              fraud_status: data.fraud_status,
              raw: data,
            });
          }
        } catch (e) {
          console.error("Midtrans status query failed:", e);
        }
      }
    }

    return Response.json({
      status: topup.status,
      topup,
    });
  } catch (e) {
    console.error("Midtrans status error:", e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
