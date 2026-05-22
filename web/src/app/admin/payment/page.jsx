import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Activity,
  CreditCard,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Download,
  RefreshCcw,
} from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/payment" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [data, setData] = useState({
    topups: [],
    summary: {},
    series: [],
    success_rate_7d: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", method: "", q: "" });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set("status", filter.status);
      if (filter.method) params.set("method", filter.method);
      if (filter.q) params.set("q", filter.q);
      const r = await fetch(`/api/admin/payments?${params}`);
      const d = await r.json();
      if (r.ok) {
        setData(d);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filter.status, filter.method]);

  // realtime polling
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [autoRefresh, filter]);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const s = data.summary || {};

  const exportCsv = () => {
    const rows = [
      ["No", "Tanggal", "Member", "Email", "Metode", "Nominal", "Status"],
      ...data.topups.map((t) => [
        t.topup_number,
        new Date(t.created_at).toLocaleString("id-ID"),
        t.user_name || "-",
        t.user_email || "-",
        t.payment_method,
        t.amount,
        t.status,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    if (typeof window !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const maxBar = useMemo(() => {
    return Math.max(1, ...data.series.map((d) => Number(d.total || 0)));
  }, [data.series]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" /> Payment Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            Realtime payment monitoring — auto refresh tiap 5 detik
            {lastUpdated && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Updated {lastUpdated.toLocaleTimeString("id-ID")}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${autoRefresh ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500" : "bg-slate-400"} ${autoRefresh ? "live-dot" : ""}`}
            />
            {autoRefresh ? "LIVE" : "Paused"}
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={exportCsv}
            className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat
          icon={CheckCircle2}
          color="emerald"
          label="Approved Today"
          value={Number(s.approved_today || 0)}
        />
        <Stat
          icon={Clock}
          color="amber"
          label="Pending"
          value={Number(s.pending_total || 0)}
        />
        <Stat
          icon={AlertTriangle}
          color="rose"
          label="Failed Today"
          value={Number(s.failed_today || 0)}
        />
        <Stat
          icon={TrendingUp}
          color="violet"
          label="Revenue Today"
          value={fmt(s.revenue_today)}
        />
        <Stat
          icon={Activity}
          color="blue"
          label="Success Rate 7d"
          value={`${data.success_rate_7d}%`}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Transaksi 14 Hari
          Terakhir
        </h3>
        <div className="h-32 flex items-end gap-1">
          {data.series.length === 0 ? (
            <p className="text-sm text-slate-400 m-auto">Belum ada data</p>
          ) : (
            data.series.map((d, i) => {
              const h = Math.max(4, (Number(d.total) / maxBar) * 100);
              const okH = (Number(d.approved) / maxBar) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col-reverse items-center gap-0.5 group"
                >
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all"
                    style={{ height: `${okH}%`, minHeight: "2px" }}
                    title={`${new Date(d.d).toLocaleDateString("id-ID")} • OK ${d.approved}`}
                  />
                  <div
                    className="w-full rounded-md bg-slate-200"
                    style={{ height: `${h - okH}%` }}
                  />
                  <span className="text-[8px] text-slate-400 mt-1">
                    {new Date(d.d).getDate()}
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div className="flex gap-3 text-[10px] text-slate-500 mt-2">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded" /> Approved
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-slate-300 rounded" /> Failed/Pending
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              placeholder="Cari no topup / nama / email…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
            <option value="waiting_verification">Waiting Verif</option>
          </select>
          <select
            value={filter.method}
            onChange={(e) => setFilter({ ...filter, method: e.target.value })}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">Semua Metode</option>
            <option value="midtrans">Midtrans</option>
            <option value="duitku">Duitku</option>
            <option value="transfer">Transfer Bank</option>
            <option value="qris">QRIS</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No. Topup</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Metode</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Loader2 className="w-5 h-5 mx-auto text-blue-400 animate-spin-slow" />
                  </td>
                </tr>
              ) : data.topups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                data.topups.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.topup_number}
                      {t.midtrans_order_id && (
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {t.midtrans_order_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{t.user_name || "-"}</p>
                      <p className="text-slate-500">{t.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold">
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge s={t.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .animate-spin-slow { animation: spin 1s linear infinite }
        @keyframes liveDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.7) }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0) }
        }
        .live-dot { animation: liveDot 1.4s ease-in-out infinite }
      `}</style>
    </div>
  );
}

function Stat({ icon: Icon, color, label, value }) {
  const map = {
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-500 to-violet-600",
    blue: "from-blue-500 to-blue-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 relative overflow-hidden">
      <div
        className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-gradient-to-br ${map[color]} opacity-10`}
      />
      <div
        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${map[color]} flex items-center justify-center text-white mb-2 shadow-lg`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wide">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}

function StatusBadge({ s }) {
  const cls =
    {
      approved: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-rose-100 text-rose-700",
      failed: "bg-rose-100 text-rose-700",
      expired: "bg-slate-200 text-slate-700",
      waiting_verification: "bg-blue-100 text-blue-700",
    }[s] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${cls}`}
    >
      {s}
    </span>
  );
}

export default Page;
