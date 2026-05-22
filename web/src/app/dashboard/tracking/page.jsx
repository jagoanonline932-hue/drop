import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MapPin,
  Search,
  Package,
  Truck,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import Modal from "@/components/Modal";

function TrackingPage() {
  return (
    <DashboardLayout currentPath="/dashboard/tracking">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openResi, setOpenResi] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
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
  }, [search, status, dateFrom, dateTo]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-7 h-7 text-blue-500" /> Tracking Order
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau semua pengiriman Anda secara realtime.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="col-span-2 md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari resi, no order, nama, HP..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-emerald-400"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        >
          <option value="">Semua Status</option>
          <option value="hold">HOLD</option>
          <option value="shipping">Shipping</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Selesai</option>
          <option value="returned">Return</option>
          <option value="refund">Refund</option>
          <option value="cancelled">Dibatalkan</option>
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
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No. Order</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Tipe</th>
                <th className="text-left px-4 py-3">Produk</th>
                <th className="text-left px-4 py-3">Penerima</th>
                <th className="text-left px-4 py-3">Resi</th>
                <th className="text-left px-4 py-3">Ekspedisi</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
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
                    <td className="px-4 py-3 text-xs font-mono">
                      {o.tracking_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.expedition_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setOpenResi(o)}
                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-semibold inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Resi
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
        open={!!openResi}
        onClose={() => setOpenResi(null)}
        title="Update Resi"
        size="md"
      >
        {openResi && (
          <ResiUpdate
            order={openResi}
            onUpdate={() => {
              load();
              setOpenResi(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function ResiUpdate({ order, onUpdate }) {
  const [tracking, setTracking] = useState(order.tracking_number || "");
  const [pdfUrl, setPdfUrl] = useState(order.resi_pdf_url || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: reader.result, file_name: f.name }),
        });
        const d = await r.json();
        if (r.ok) setPdfUrl(d.url);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  const save = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: tracking,
          resi_pdf_url: pdfUrl,
        }),
      });
      if (r.ok) onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold mb-1">No Resi</label>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">
          Upload PDF Resi
        </label>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFile}
          className="w-full text-xs file:py-2 file:px-3 file:bg-emerald-50 file:text-emerald-700 file:rounded-lg file:border-0"
        />
        {uploading && (
          <p className="text-xs text-blue-500 mt-1">Mengupload...</p>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-600 mt-1 inline-block"
          >
            ✓ <FileText className="inline w-3 h-3" /> Lihat file
          </a>
        )}
      </div>
      <button
        onClick={save}
        disabled={loading}
        className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
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

export default TrackingPage;
