import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  ListOrdered,
  Search,
  Eye,
  FileText,
  Download,
  Loader2,
  X,
} from "lucide-react";

const STATUSES = [
  "pending",
  "hold",
  "menunggu_pembayaran",
  "diproses",
  "shipping",
  "delivered",
  "completed",
  "returned",
  "refund",
  "cancelled",
];

function AdminOrders() {
  return (
    <DashboardLayout currentPath="/admin/orders" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams({ scope: "all" });
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    if (typeFilter) p.set("type", typeFilter);
    if (dateFrom) p.set("from", dateFrom);
    if (dateTo) p.set("to", dateTo);
    fetch(`/api/orders?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, typeFilter, dateFrom, dateTo]);

  const exportCSV = () => {
    const headers = [
      "No Order",
      "Tanggal",
      "Tipe",
      "Member",
      "Email",
      "Produk",
      "Penerima",
      "HP",
      "Alamat",
      "Resi",
      "Ekspedisi",
      "Total",
      "Profit",
      "Status",
    ];
    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleString("id-ID"),
      o.order_type,
      o.member_name,
      o.member_email,
      o.product_name,
      o.recipient_name,
      o.recipient_phone,
      o.recipient_address,
      o.tracking_number || "",
      o.expedition_name || "",
      o.total_cod,
      o.member_profit,
      o.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-7 h-7 text-blue-500" /> Manajemen Order
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh order Internal COD & External Aggregator.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-6 gap-2">
        <div className="col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari resi, nama, HP..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        >
          <option value="">Semua Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        >
          <option value="">Semua Tipe</option>
          <option value="internal_cod">Internal COD</option>
          <option value="external_aggregator">External</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No Order</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Tipe</th>
                <th className="text-left px-4 py-3">Produk</th>
                <th className="text-left px-4 py-3">Penerima</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    Tidak ada order
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {o.order_number}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(o.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{o.member_name}</p>
                      <p className="text-slate-500">{o.member_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`uppercase font-semibold ${o.order_type === "internal_cod" ? "text-amber-600" : "text-blue-600"}`}
                      >
                        {o.order_type === "internal_cod" ? "COD" : "Ext"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate">
                      {o.product_name}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p>{o.recipient_name}</p>
                      <p className="text-slate-400">{o.recipient_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      Rp {Number(o.total_cod).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setActive(o)}
                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={`Order ${active?.order_number || ""}`}
        size="xl"
      >
        {active && (
          <OrderDetail
            order={active}
            onUpdate={() => {
              load();
              setActive(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function OrderDetail({ order, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number || "");
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_number: tracking,
          admin_notes: adminNotes,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Gagal");
      }
      onUpdate();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Section title="Info Order">
          <Row
            k="Tipe"
            v={
              order.order_type === "internal_cod"
                ? "Internal COD VIP"
                : "External Aggregator"
            }
          />
          <Row
            k="Tanggal"
            v={new Date(order.created_at).toLocaleString("id-ID")}
          />
          <Row k="Member" v={`${order.member_name} (${order.member_email})`} />
          {order.member_phone && <Row k="HP Member" v={order.member_phone} />}
        </Section>
        <Section title="Penerima">
          <Row k="Nama" v={order.recipient_name} />
          <Row k="HP" v={order.recipient_phone} />
          <Row k="Email" v={order.recipient_email || "—"} />
          <Row k="Alamat" v={order.recipient_address} />
          <Row
            k="Kec/Kota/Prov"
            v={`${order.recipient_district || "—"} / ${order.recipient_city || "—"} / ${order.recipient_province || "—"}`}
          />
          <Row k="Kode Pos" v={order.recipient_postal_code || "—"} />
        </Section>
        <Section title="Pengiriman">
          <Row k="Ekspedisi" v={order.expedition_name || "—"} />
          <Row k="Aggregator" v={order.aggregator_name || "—"} />
          <Row k="Gudang" v={order.warehouse_name || "—"} />
          <Row k="No Resi" v={order.tracking_number || "—"} />
          {order.resi_pdf_url && (
            <p className="text-xs">
              <a
                href={order.resi_pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-semibold"
              >
                <FileText className="inline w-3 h-3" /> Preview/Download PDF
                Resi
              </a>
            </p>
          )}
        </Section>
      </div>

      <div className="space-y-3">
        <Section title="Rincian Keuangan">
          <Row k="Produk" v={order.product_name} />
          <Row k="Qty" v={order.quantity} />
          <Row k="Harga Produk (per pc)" v={fmt(order.product_price)} />
          <Row k="Harga Jual (Sell)" v={fmt(order.sell_price)} />
          <Row k="Ongkir" v={fmt(order.shipping_cost)} />
          <Row k="COD Fee" v={fmt(order.cod_fee)} />
          <Row k="Packing Fee" v={fmt(order.packing_fee)} />
          <Row k="Total COD" v={<strong>{fmt(order.total_cod)}</strong>} />
          <Row
            k="Profit Member"
            v={
              <strong className="text-emerald-600">
                {fmt(order.member_profit)}
              </strong>
            }
          />
          <Row
            k="Revenue Admin"
            v={
              <strong className="text-blue-600">
                {fmt(order.admin_revenue)}
              </strong>
            }
          />
        </Section>

        <Section title="Update Order">
          <label className="block text-xs font-semibold mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="block text-xs font-semibold mb-1 mt-2">
            No Resi
          </label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
          <label className="block text-xs font-semibold mb-1 mt-2">
            Catatan Admin
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="w-full mt-2 bg-emerald-500 text-white py-2.5 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2
                  className="w-4 h-4"
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Menyimpan
              </>
            ) : (
              "Update Order"
            )}
          </button>
        </Section>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-1">
      <p className="text-xs font-bold text-slate-500 uppercase mb-2">{title}</p>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-2 py-1 text-sm border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{k}</span>
      <span className="font-semibold text-right">{v}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-slate-100 text-slate-600",
    hold: "bg-amber-100 text-amber-700",
    shipping: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    returned: "bg-rose-100 text-rose-700",
    refund: "bg-purple-100 text-purple-700",
    cancelled: "bg-slate-200 text-slate-500",
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}

export default AdminOrders;
