import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileText, Search } from "lucide-react";

function UploadResiPage() {
  return (
    <DashboardLayout currentPath="/dashboard/upload-resi">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      fetch(`/api/orders?${p.toString()}`)
        .then((r) => r.json())
        .then((d) =>
          setOrders(
            (d.orders || []).filter((o) =>
              ["hold", "pending", "shipping"].includes(o.status),
            ),
          ),
        )
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-7 h-7 text-emerald-500" /> Upload Resi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload resi pengiriman untuk order Anda.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari order..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {orders.length === 0 ? (
          <p className="col-span-full text-center py-10 text-slate-400">
            Tidak ada order yang perlu upload resi
          </p>
        ) : (
          orders.map((o) => (
            <a
              key={o.id}
              href={`/dashboard/tracking?id=${o.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-mono text-xs">{o.order_number}</p>
                <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                  {o.status}
                </span>
              </div>
              <p className="text-sm font-semibold mb-1 line-clamp-1">
                {o.product_name}
              </p>
              <p className="text-xs text-slate-500 mb-2">
                {o.recipient_name} • {o.recipient_phone}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(o.created_at).toLocaleString("id-ID")}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                {o.tracking_number ? (
                  <>
                    <FileText className="w-3 h-3" /> {o.tracking_number}
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" /> Klik untuk upload
                  </>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

export default UploadResiPage;
