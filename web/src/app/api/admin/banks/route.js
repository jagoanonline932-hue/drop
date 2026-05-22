import sql from "@/app/api/utils/sql";
import { requireAdmin } from "@/app/api/utils/helpers";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  const rows =
    await sql`SELECT * FROM bank_accounts ORDER BY order_position ASC, id ASC`;
  return Response.json({ banks: rows });
}

export async function POST(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.bank_name || !b.account_number || !b.account_holder)
      return Response.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    const result = await sql`
      INSERT INTO bank_accounts (bank_name, account_number, account_holder, logo, is_maintenance, is_active, order_position)
      VALUES (${b.bank_name}, ${b.account_number}, ${b.account_holder}, ${b.logo || null}, ${b.is_maintenance === true}, ${b.is_active !== false}, ${b.order_position || 0})
      RETURNING *
    `;
    return Response.json({ bank: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function PUT(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const b = await request.json();
    if (!b.id) return Response.json({ error: "id required" }, { status: 400 });
    const allowed = [
      "bank_name",
      "account_number",
      "account_holder",
      "logo",
      "is_maintenance",
      "is_active",
      "order_position",
    ];
    const sets = [],
      vals = [];
    for (const k of allowed)
      if (b[k] !== undefined) {
        sets.push(`${k} = $${vals.length + 1}`);
        vals.push(b[k]);
      }
    if (sets.length === 0)
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    vals.push(b.id);
    const q = `UPDATE bank_accounts SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;
    const result = await sql(q, vals);
    return Response.json({ bank: result[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const r = await requireAdmin();
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    await sql`DELETE FROM bank_accounts WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
