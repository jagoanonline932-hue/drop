import crypto from "node:crypto";
import sql from "@/app/api/utils/sql";
import { notifyMember, logActivity } from "@/app/api/utils/helpers";

// ========================================
// PARSE REQUEST BODY
// Duitku callback bisa form-urlencoded / json
// ========================================
async function parseBody(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // JSON
    if (contentType.includes("application/json")) {
      return await request.json();
    }

    // FORM URL ENCODED
    const text = await request.text();

    const params = new URLSearchParams(text);

    const body = {};

    for (const [key, value] of params.entries()) {
      body[key] = value;
    }

    return body;
  } catch (err) {
    console.error("Parse Body Error:", err);
    return {};
  }
}

// ========================================
// POST CALLBACK
// ========================================
export async function POST(request) {
  try {
    // ========================================
    // GET BODY
    // ========================================
    const body = await parseBody(request);

    console.log("DUITKU CALLBACK:", body);

    const {
      merchantCode,
      amount,
      merchantOrderId,
      signature,
      resultCode,
      reference,
      paymentCode,
    } = body;

    // ========================================
    // VALIDATION
    // ========================================
    if (!merchantOrderId) {
      return Response.json(
        { error: "merchantOrderId required" },
        { status: 400 }
      );
    }

    if (!signature) {
      return Response.json({ error: "signature required" }, { status: 400 });
    }

    // ========================================
    // GET SETTINGS
    // ========================================
    const settings = await sql`
      SELECT *
      FROM duitku_settings
      WHERE id = 1
      LIMIT 1
    `;

    const cfg = settings[0];

    if (!cfg) {
      return Response.json({ error: "Duitku not configured" }, { status: 400 });
    }

    // ========================================
    // VERIFY MERCHANT CODE
    // ========================================
    if (String(merchantCode) !== String(cfg.merchant_code)) {
      console.error("Merchant code mismatch");

      return Response.json({ error: "Invalid merchant code" }, { status: 401 });
    }

    // ========================================
    // VERIFY SIGNATURE
    // MD5(merchantCode + amount + merchantOrderId + apiKey)
    // ========================================
    const expectedSignature = crypto
      .createHash("md5")
      .update(`${cfg.merchant_code}${amount}${merchantOrderId}${cfg.api_key}`)
      .digest("hex");

    if (
      String(expectedSignature).toLowerCase() !==
      String(signature).toLowerCase()
    ) {
      console.error("INVALID SIGNATURE", {
        expected: expectedSignature,
        received: signature,
      });

      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ========================================
    // FIND TOPUP
    // ========================================
    const topupResult = await sql`
      SELECT *
      FROM topups
      WHERE duitku_merchant_order_id = ${merchantOrderId}
      LIMIT 1
    `;

    const topup = topupResult[0];

    if (!topup) {
      return Response.json({ error: "Topup not found" }, { status: 404 });
    }

    // ========================================
    // PREVENT DOUBLE CALLBACK
    // ========================================
    if (topup.status === "approved") {
      console.log("Duplicate callback ignored:", merchantOrderId);

      return new Response("OK", {
        status: 200,
      });
    }

    // ========================================
    // PAYMENT SUCCESS
    // resultCode 00 = success
    // ========================================
    if (String(resultCode) === "00") {
      const numAmount = Number(amount || topup.amount || 0);

      // ========================================
      // GET CURRENT BALANCE
      // ========================================
      const profileResult = await sql`
        SELECT *
        FROM user_profiles
        WHERE user_id = ${topup.user_id}
        LIMIT 1
      `;

      const profile = profileResult[0];

      if (!profile) {
        return Response.json(
          { error: "User profile not found" },
          { status: 404 }
        );
      }

      const balanceBefore = Number(profile.balance || 0);

      const balanceAfter = balanceBefore + numAmount;

      // ========================================
      // TRANSACTION
      // ========================================
      await sql.transaction([
        // UPDATE TOPUP
        sql`
          UPDATE topups
          SET
            status = 'approved',
            approved_at = NOW(),
            duitku_reference = ${reference || null},
            duitku_payment_method = ${paymentCode || null},
            duitku_response = ${JSON.stringify(body)},
            updated_at = NOW()
          WHERE id = ${topup.id}
        `,

        // UPDATE BALANCE
        sql`
          UPDATE user_profiles
          SET
            balance = balance + ${numAmount},
            updated_at = NOW()
          WHERE user_id = ${topup.user_id}
        `,

        // BALANCE HISTORY
        sql`
          INSERT INTO balance_transactions (
            user_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            reference_type,
            reference_id,
            description,
            created_at
          )
          VALUES (
            ${topup.user_id},
            'topup',
            ${numAmount},
            ${balanceBefore},
            ${balanceAfter},
            'topup',
            ${topup.id},
            ${`Topup ${topup.topup_number} via Duitku`},
            NOW()
          )
        `,
      ]);

      // ========================================
      // LOG
      // ========================================
      await logActivity(
        topup.user_id,
        "topup_duitku_success",
        `Topup ${topup.topup_number} berhasil Rp ${numAmount}`
      );

      // ========================================
      // NOTIFICATION
      // ========================================
      await notifyMember(
        topup.user_id,
        "Topup Berhasil",
        `Topup ${topup.topup_number} sebesar Rp ${numAmount.toLocaleString(
          "id-ID"
        )} berhasil. Saldo sudah masuk.`,
        "success",
        "/dashboard/saldo",
        true,
        {
          amount: numAmount.toLocaleString("id-ID"),
          order: topup.topup_number,
        },
        "template_topup_success"
      );

      console.log("TOPUP SUCCESS:", merchantOrderId);
    } else {
      // ========================================
      // PAYMENT FAILED
      // ========================================
      await sql`
        UPDATE topups
        SET
          status = 'rejected',
          duitku_response = ${JSON.stringify(body)},
          updated_at = NOW()
        WHERE id = ${topup.id}
      `;

      console.log("TOPUP FAILED:", merchantOrderId);
    }

    // ========================================
    // RESPONSE OK
    // Duitku wajib HTTP 200
    // ========================================
    return new Response("OK", {
      status: 200,
    });
  } catch (e) {
    console.error("DUITKU CALLBACK ERROR:", e);

    return Response.json(
      {
        error: "Internal Server Error",
        message: e.message,
      },
      { status: 500 }
    );
  }
}

// ========================================
// TEST CALLBACK
// ========================================
export async function GET() {
  return Response.json({
    success: true,
    message: "Duitku Callback Active",
    timestamp: new Date().toISOString(),
  });
}