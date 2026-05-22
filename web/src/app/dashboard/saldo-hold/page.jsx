import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Clock, AlertCircle } from "lucide-react";

function SaldoHoldPage() {
  return (
    <DashboardLayout currentPath="/dashboard/saldo-hold">
      {({ profile }) => <Inner profile={profile} />}
    </DashboardLayout>
  );
}

function Inner({ profile }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/orders?status=hold")
      .then((r) => r.json())
      .then((d) =>
        setOrders(
          (d.orders || []).filter(
            (o) =>
              o.status === "hold" ||
              o.status === "shipping" ||
              o.status === "pending",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-7 h-7 text-amber-500" /> Saldo HOLD
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Saldo yang ditahan untuk order yang sedang berjalan.
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-6">
        <p className="text-sm text-amber-700 font-semibold">Total HOLD</p>
        <p className="text-3xl font-bold text-amber-900 mt-1 tabular-nums">
          {fmt(profile.balance_hold)}
        </p>
        <div className="flex items-start gap-2 mt-3 text-xs text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Saldo HOLD akan dipotong jika delivery, atau direfund jika return
            (kecuali packing fee).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Order yang Sedang HOLD</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">No. Order</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Produk</th>
                <th className="text-left px-4 py-3">Penerima</th>
                <th className="text-right px-4 py-3">HOLD</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada saldo HOLD
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
                      <td className="px-4 py-3">{o.product_name}</td>
                      <td className="px-4 py-3 text-xs">
                        {o.recipient_name} • {o.recipient_phone}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600 tabular-nums">
                        Rp {hold.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                          {o.status}
                        </span>
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

export default SaldoHoldPage;
