import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  KeyRound,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCcw,
  Send,
  Ban,
  Unlock,
  AlertOctagon,
  MessageSquare,
} from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/otp" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [data, setData] = useState({
    otps: [],
    summary: {},
    series: [],
    success_rate_7d: 0,
    suspicious: [],
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", q: "" });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [acting, setActing] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set("status", filter.status);
      if (filter.q) params.set("q", filter.q);
      const r = await fetch(`/api/admin/otp?${params}`);
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
    fetchData(); // eslint-disable-next-line
  }, [filter.status]);
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [autoRefresh, filter]);

  const act = async (action, id, user_id) => {
    setActing(`${action}-${id || user_id}`);
    try {
      await fetch("/api/admin/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, user_id }),
      });
      await fetchData();
    } finally {
      setActing(null);
    }
  };

  const s = data.summary || {};
  const maxBar = useMemo(() => {
    return Math.max(1, ...data.series.map((d) => Number(d.total || 0)));
  }, [data.series]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-7 h-7 text-amber-500" /> OTP Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            Pantau semua OTP withdraw realtime + deteksi aktivitas mencurigakan
            {lastUpdated && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                {lastUpdated.toLocaleTimeString("id-ID")}
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
              className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 live-dot" : "bg-slate-400"}`}
            />
            {autoRefresh ? "LIVE" : "Paused"}
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-2 rounded-xl bg-amber-100 text-amber-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat
          icon={MessageSquare}
          color="amber"
          label="OTP Today"
          value={Number(s.today || 0)}
        />
        <Stat
          icon={CheckCircle2}
          color="emerald"
          label="Verified Today"
          value={Number(s.verified_today || 0)}
        />
        <Stat
          icon={XCircle}
          color="rose"
          label="Failed Today"
          value={Number(s.failed_today || 0)}
        />
        <Stat
          icon={Send}
          color="blue"
          label="Delivered Today"
          value={Number(s.delivered_today || 0)}
        />
        <Stat
          icon={ShieldAlert}
          color="violet"
          label="Success 7d"
          value={`${data.success_rate_7d}%`}
        />
      </div>

      {data.suspicious.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
          <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" /> Suspicious Activity (
            {data.suspicious.filter((x) => !x.resolved).length} aktif)
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {data.suspicious.slice(0, 20).map((x) => (
              <div
                key={x.id}
                className={`text-xs flex items-center justify-between gap-2 p-2 rounded-lg ${x.resolved ? "bg-white/40 opacity-60" : "bg-white"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-rose-900 truncate">
                    {x.activity_type}{" "}
                    <span
                      className={`text-[9px] uppercase ml-1 px-1.5 py-0.5 rounded ${x.severity === "critical" ? "bg-rose-600 text-white" : x.severity === "high" ? "bg-rose-200 text-rose-800" : "bg-amber-100 text-amber-700"}`}
                    >
                      {x.severity}
                    </span>
                  </p>
                  <p className="text-slate-500 truncate">
                    user#{x.user_id || "—"} • {x.ip_address || "-"} •{" "}
                    {new Date(x.created_at).toLocaleString("id-ID")}
                  </p>
                  {x.description && (
                    <p className="text-slate-600 truncate">{x.description}</p>
                  )}
                </div>
                {!x.resolved && (
                  <div className="flex gap-1 shrink-0">
                    {x.user_id && (
                      <button
                        onClick={() => act("unblock_user", null, x.user_id)}
                        className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-semibold"
                      >
                        Unblock
                      </button>
                    )}
                    <button
                      onClick={() => act("resolve_suspicious", x.id)}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">OTP 7 Hari Terakhir</h3>
        <div className="h-28 flex items-end gap-1">
          {data.series.length === 0 ? (
            <p className="text-sm text-slate-400 m-auto">Belum ada data</p>
          ) : (
            data.series.map((d, i) => {
              const h = Math.max(4, (Number(d.total) / maxBar) * 100);
              const okH = (Number(d.verified) / maxBar) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col-reverse items-center gap-0.5"
                >
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-emerald-500 to-emerald-400"
                    style={{ height: `${okH}%`, minHeight: "2px" }}
                  />
                  <div
                    className="w-full rounded-md bg-rose-200"
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
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              placeholder="Cari email / nama / nomor WA…"
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
            <option value="sent">Sent</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
            <option value="invalidated">Invalidated</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Delivery</th>
                <th className="text-center px-4 py-3">Attempts</th>
                <th className="text-left px-4 py-3">IP</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <Loader2 className="w-5 h-5 mx-auto text-amber-400 animate-spin-slow" />
                  </td>
                </tr>
              ) : data.otps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    Belum ada OTP
                  </td>
                </tr>
              ) : (
                data.otps.map((o) => {
                  const active = !o.used && new Date(o.expires_at) > new Date();
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">#{o.id}</td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold">{o.user_name || "-"}</p>
                        <p className="text-slate-500">{o.user_email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">{o.phone}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold">
                        Rp {Number(o.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge s={o.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DeliveryBadge s={o.delivery_status} />
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        <span
                          className={
                            o.attempts >= 3 ? "text-rose-600 font-bold" : ""
                          }
                        >
                          {o.attempts || 0}/5
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">
                        {o.ip_address || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(o.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          {active && (
                            <>
                              <button
                                onClick={() => act("resend", o.id)}
                                disabled={acting === `resend-${o.id}`}
                                className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-1 rounded font-semibold inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                {acting === `resend-${o.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin-slow" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                Resend
                              </button>
                              <button
                                onClick={() => act("invalidate", o.id)}
                                className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded font-semibold"
                              >
                                Invalidate
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => act("block_user", null, o.user_id)}
                            className="text-[10px] bg-rose-100 text-rose-700 hover:bg-rose-200 px-2 py-1 rounded font-semibold inline-flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" /> Block
                          </button>
                          <button
                            onClick={() => act("unblock_user", null, o.user_id)}
                            className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded font-semibold inline-flex items-center gap-1"
                          >
                            <Unlock className="w-3 h-3" /> Unblock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
      verified: "bg-emerald-100 text-emerald-700",
      sent: "bg-blue-100 text-blue-700",
      pending: "bg-amber-100 text-amber-700",
      failed: "bg-rose-100 text-rose-700",
      blocked: "bg-rose-600 text-white",
      invalidated: "bg-slate-200 text-slate-700",
    }[s] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${cls}`}
    >
      {s || "-"}
    </span>
  );
}
function DeliveryBadge({ s }) {
  const cls =
    {
      delivered: "bg-emerald-50 text-emerald-700",
      sending: "bg-blue-50 text-blue-700",
      failed: "bg-rose-50 text-rose-700",
      pending: "bg-amber-50 text-amber-700",
    }[s] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${cls}`}
    >
      {s || "-"}
    </span>
  );
}

export default Page;
