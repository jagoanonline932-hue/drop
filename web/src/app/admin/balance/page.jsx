import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Wallet } from "lucide-react";

function AdminBalance() {
  return (
    <DashboardLayout currentPath="/admin/balance" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/balance-adjust")
      .then((r) => r.json())
      .then((d) => setList(d.adjustments || []))
      .finally(() => setLoading(false));
  }, []);
  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-amber-500" /> Balance Adjustment Log
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Riwayat penyesuaian saldo member (untuk selisih ongkir, koreksi, dll).
          Lakukan adjustment dari menu Member.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Tipe</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-left px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : (
                list.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs">
                      {new Date(a.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p>{a.user_name}</p>
                      <p className="text-slate-500">{a.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase">
                      {a.adjustment_type}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums font-bold ${Number(a.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {Number(a.amount) >= 0 ? "+" : ""}
                      {fmt(a.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs">{a.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminBalance;
