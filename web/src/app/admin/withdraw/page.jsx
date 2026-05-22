import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import StatCard from "@/components/StatCard";
import {
  ArrowUpFromLine,
  Eye,
  Check,
  X,
  Wallet,
  Clock,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";

function AdminWithdraw() {
  return (
    <DashboardLayout currentPath="/admin/withdraw" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    fetch(`/api/admin/withdrawals?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setList(d.withdrawals || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [status]);

  const action = async (id, status, notes = "") => {
    await fetch("/api/admin/withdrawals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, admin_notes: notes }),
    });
    load();
    setActive(null);
  };
  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  // Filter by date range
  const filtered = useMemo(() => {
    let out = list;
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      out = out.filter((w) => new Date(w.created_at).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000;
      out = out.filter((w) => new Date(w.created_at).getTime() <= to);
    }
    return out;
  }, [list, dateFrom, dateTo]);

  // Aggregate stats
  const stats = useMemo(() => {
    const all = filtered;
    const totalAll = all.reduce((s, w) => s + Number(w.amount || 0), 0);
    const totalApproved = all
      .filter((w) => w.status === "approved")
      .reduce((s, w) => s + Number(w.amount || 0), 0);
    const totalPending = all
      .filter((w) => w.status === "pending")
      .reduce((s, w) => s + Number(w.amount || 0), 0);
    const totalRejected = all
      .filter((w) => w.status === "rejected")
      .reduce((s, w) => s + Number(w.amount || 0), 0);
    const countPending = all.filter((w) => w.status === "pending").length;
    const countApproved = all.filter((w) => w.status === "approved").length;
    // Rate today vs yesterday (approved amount)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayApproved = all
      .filter(
        (w) =>
          w.status === "approved" &&
          new Date(w.created_at).getTime() >= today.getTime(),
      )
      .reduce((s, w) => s + Number(w.amount || 0), 0);
    const yesterdayApproved = all
      .filter((w) => {
        const t = new Date(w.created_at).getTime();
        return (
          w.status === "approved" &&
          t >= yesterday.getTime() &&
          t < today.getTime()
        );
      })
      .reduce((s, w) => s + Number(w.amount || 0), 0);
    const rate =
      yesterdayApproved === 0
        ? todayApproved > 0
          ? 100
          : 0
        : ((todayApproved - yesterdayApproved) / yesterdayApproved) * 100;
    // 7-day rolling avg
    const now = Date.now();
    const last7 = all.filter(
      (w) =>
        w.status === "approved" &&
        now - new Date(w.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000,
    );
    const avg7 = last7.length
      ? last7.reduce((s, w) => s + Number(w.amount || 0), 0) / 7
      : 0;
    return {
      totalAll,
      totalApproved,
      totalPending,
      totalRejected,
      countPending,
      countApproved,
      todayApproved,
      yesterdayApproved,
      rate,
      avg7,
    };
  }, [filtered]);

  const setPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <ArrowUpFromLine className="w-7 h-7 text-rose-500" /> Withdraw
          Approval
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Proses withdraw saldo member dan pantau total penarikan.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Penarikan Saldo"
          value={fmt(stats.totalApproved)}
          icon={Wallet}
          accent="emerald"
          tooltip={`${stats.countApproved} transaksi disetujui`}
        />
        <StatCard
          label="Withdraw Pending"
          value={fmt(stats.totalPending)}
          icon={Clock}
          accent="amber"
          tooltip={`${stats.countPending} menunggu approval`}
        />
        <StatCard
          label="Rate vs Kemarin"
          value={`${stats.rate >= 0 ? "+" : ""}${stats.rate.toFixed(1)}%`}
          icon={TrendingUp}
          accent={stats.rate >= 0 ? "emerald" : "rose"}
          tooltip={`Hari ini ${fmt(stats.todayApproved)}`}
        />
        <StatCard
          label="Rata-rata 7 Hari"
          value={fmt(stats.avg7)}
          icon={Calendar}
          accent="blue"
          tooltip="Approved per hari"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4" /> Filter
        </div>
        <div className="grid md:grid-cols-5 gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200"
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-1">
            {[
              { l: "Hari Ini", d: 0 },
              { l: "7 Hari", d: 7 },
              { l: "30 Hari", d: 30 },
              { l: "90 Hari", d: 90 },
            ].map((p) => (
              <button
                key={p.l}
                onClick={() => setPreset(p.d)}
                className="text-[10px] font-semibold bg-slate-100 hover:bg-emerald-100 px-2.5 py-1 rounded-md"
              >
                {p.l}
              </button>
            ))}
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="text-[10px] font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 px-2.5 py-1 rounded-md"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">
            Daftar Withdraw{" "}
            <span className="text-xs font-medium text-slate-500">
              ({filtered.length} record)
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Total: <strong>{fmt(stats.totalAll)}</strong>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Rekening</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-right px-4 py-3">Net</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Tidak ada data withdraw
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {w.withdraw_number}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(w.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{w.user_name}</p>
                      <p className="text-slate-500">{w.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p>
                        {w.bank_name} {w.bank_account_number}
                      </p>
                      <p className="text-slate-500">
                        a/n {w.bank_account_holder}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {fmt(w.amount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-bold">
                      {fmt(w.net_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setActive(w)}
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
        title={`Withdraw ${active?.withdraw_number || ""}`}
      >
        {active && (
          <div className="space-y-3">
            <Row k="Member" v={`${active.user_name} (${active.user_email})`} />
            <Row k="HP / WA" v={active.whatsapp || active.phone || "—"} />
            <Row
              k="Bank"
              v={`${active.bank_name} • ${active.bank_account_number}`}
            />
            <Row k="Pemilik" v={active.bank_account_holder} />
            <Row k="Nominal" v={fmt(active.amount)} />
            <Row k="Fee" v={fmt(active.fee)} />
            <Row
              k="Net"
              v={
                <strong className="text-emerald-600">
                  {fmt(active.net_amount)}
                </strong>
              }
            />
            {active.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => action(active.id, "approved")}
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve & Sudah Transfer
                </button>
                <button
                  onClick={() => {
                    const notes = prompt("Alasan reject?");
                    if (notes) action(active.id, "rejected", notes);
                  }}
                  className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject (Refund Saldo)
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-2 py-1.5 text-sm border-b border-slate-100">
      <span className="text-slate-500">{k}</span>
      <span className="font-semibold text-right">{v}</span>
    </div>
  );
}
function StatusBadge({ status }) {
  const map = {
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}

export default AdminWithdraw;
