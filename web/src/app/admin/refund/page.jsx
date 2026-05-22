import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { RefreshCcw } from "lucide-react";

function AdminRefund() {
  return (
    <DashboardLayout currentPath="/admin/refund" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/orders?scope=all")
      .then((r) => r.json())
      .then((d) =>
        setOrders(
          (d.orders || []).filter((o) =>
            ["returned", "refund"].includes(o.status),
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <RefreshCcw className="w-7 h-7 text-purple-500" /> Refund / Return
          Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Order yang return atau direfund.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No Order</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Produk</th>
                <th className="text-left px-4 py-3">Ekspedisi</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Refund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ada order return/refund
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const refund = Number(o.product_price) * Number(o.quantity);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        {o.order_number}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(o.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-xs">{o.member_name}</td>
                      <td className="px-4 py-3 text-xs">{o.product_name}</td>
                      <td className="px-4 py-3 text-xs">
                        {o.expedition_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-rose-100 text-rose-700">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-purple-600">
                        {fmt(refund)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminRefund;
