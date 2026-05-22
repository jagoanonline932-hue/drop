import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  Wallet,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

function SaldoPage() {
  return (
    <DashboardLayout currentPath="/dashboard/saldo">
      {({ profile }) => <Inner profile={profile} />}
    </DashboardLayout>
  );
}

function Inner({ profile }) {
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/balance/transactions").then((r) => r.json()),
      fetch("/api/member/analytics").then((r) => r.json()),
    ])
      .then(([t, a]) => {
        setTransactions(t.transactions || []);
        setAnalytics(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="w-7 h-7 text-emerald-500" /> Saldo
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola saldo aktif & HOLD Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-6 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-emerald-100">
                Saldo Aktif
              </span>
              <Wallet className="w-6 h-6 text-emerald-100" />
            </div>
            <p className="text-4xl font-bold mb-1 tabular-nums">
              {fmt(profile.balance)}
            </p>
            <p className="text-xs text-emerald-100">
              Siap digunakan untuk order/withdraw
            </p>
            <div className="flex gap-2 mt-4">
              <a
                href="/dashboard/topup"
                className="flex-1 bg-white text-emerald-700 text-center text-sm font-bold py-2 rounded-xl hover:bg-emerald-50"
              >
                + Topup
              </a>
              <a
                href="/dashboard/withdraw"
                className="flex-1 bg-slate-900 text-white text-center text-sm font-bold py-2 rounded-xl"
              >
                - Withdraw
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl p-6 shadow-xl shadow-amber-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-amber-100">
                Saldo HOLD
              </span>
              <Clock className="w-6 h-6 text-amber-100" />
            </div>
            <p className="text-4xl font-bold mb-1 tabular-nums">
              {fmt(profile.balance_hold)}
            </p>
            <p className="text-xs text-amber-100">
              Ditahan untuk order berjalan
            </p>
            <a
              href="/dashboard/saldo-hold"
              className="inline-block mt-4 bg-white text-amber-700 text-sm font-bold px-4 py-2 rounded-xl"
            >
              Lihat Detail HOLD
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">
          Pergerakan Saldo 30 Hari
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics?.balanceDaily || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => new Date(v).getDate()}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <RTooltip />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {(analytics?.balanceDaily || []).map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={Number(entry.amount) >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Riwayat Transaksi Saldo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Jenis</th>
                <th className="text-left px-4 py-3">Keterangan</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-right px-4 py-3">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {t.description}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold tabular-nums ${Number(t.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {Number(t.amount) >= 0 ? "+" : ""}
                      {Number(t.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums">
                      Rp {Number(t.balance_after).toLocaleString("id-ID")}
                    </td>
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

export default SaldoPage;
