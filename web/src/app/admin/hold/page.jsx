import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Clock } from "lucide-react";

function AdminHold() {
  return (
    <DashboardLayout currentPath="/admin/hold" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/orders?scope=all&status=hold")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);
  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Clock className="w-7 h-7 text-amber-500" /> HOLD Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Order yang sedang HOLD (saldo member ditahan).
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
                <th className="text-right px-4 py-3">HOLD</th>
                <th className="text-left px-4 py-3">Tipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const hold =
                    Number(o.product_price) * Number(o.quantity) +
                    Number(o.shipping_cost) +
                    Number(o.packing_fee);
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
                      <td className="px-4 py-3 text-right font-bold text-amber-600 tabular-nums">
                        {fmt(hold)}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase">
                        {o.order_type}
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

export default AdminHold;
