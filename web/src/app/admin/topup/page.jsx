import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { ArrowDownToLine, Eye, Check, X, Loader2 } from "lucide-react";

function AdminTopup() {
  return (
    <DashboardLayout currentPath="/admin/topup" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [topups, setTopups] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (search) p.set("search", search);
    fetch(`/api/admin/topups?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setTopups(d.topups || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [status, search]);

  const action = async (id, status, notes = "") => {
    await fetch("/api/admin/topups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, admin_notes: notes }),
    });
    load();
    setActive(null);
  };

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowDownToLine className="w-7 h-7 text-emerald-500" /> Topup
          Approval
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Verifikasi & approve topup member.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari..."
          className="flex-1 max-w-xs px-3 py-2 text-sm rounded-xl border border-slate-200"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="waiting_verification">Menunggu Verifikasi</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Metode</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-center px-4 py-3">Bukti</th>
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
              ) : (
                topups.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.topup_number}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{t.user_name}</p>
                      <p className="text-slate-500">{t.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase">
                      {t.payment_method}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.proof_url ? (
                        <a
                          href={t.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-600 font-semibold"
                        >
                          Lihat
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setActive(t)}
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
        title={`Topup ${active?.topup_number || ""}`}
      >
        {active && (
          <div className="space-y-3">
            <Row k="Member" v={`${active.user_name} (${active.user_email})`} />
            <Row k="HP" v={active.phone || "—"} />
            <Row k="Nominal" v={<strong>{fmt(active.amount)}</strong>} />
            <Row k="Metode" v={active.payment_method} />
            <Row
              k="Tanggal"
              v={new Date(active.created_at).toLocaleString("id-ID")}
            />
            {active.sel_bank_name && (
              <Row
                k="Bank Tujuan"
                v={`${active.sel_bank_name} ${active.sel_account_number}`}
              />
            )}
            {active.proof_url && (
              <div>
                <p className="text-xs font-semibold mb-1">Bukti Pembayaran</p>
                <a href={active.proof_url} target="_blank" rel="noreferrer">
                  <img
                    src={active.proof_url}
                    alt=""
                    className="max-w-full rounded-lg border"
                  />
                </a>
              </div>
            )}
            {active.status !== "approved" && active.status !== "rejected" && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => action(active.id, "approved")}
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    const notes = prompt("Alasan reject?");
                    if (notes) action(active.id, "rejected", notes);
                  }}
                  className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
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
    waiting_verification: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
export default AdminTopup;
