import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { HandCoins, Check, X, Crown } from "lucide-react";

function AdminReferral() {
  return (
    <DashboardLayout currentPath="/admin/referral" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () =>
    fetch("/api/admin/referrals")
      .then((r) => r.json())
      .then((d) => setList(d.referrals || []))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const pay = async (id) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Bayarkan komisi referral?")
    )
      return;
    await fetch("/api/admin/referrals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid" }),
    });
    load();
  };
  const reject = async (id) => {
    const notes =
      typeof window !== "undefined" ? prompt("Alasan reject?") : null;
    if (!notes) return;
    await fetch("/api/admin/referrals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "rejected", notes }),
    });
    load();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <HandCoins className="w-7 h-7 text-purple-500" /> Referral Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola komisi referral. Auto-paid saat referral upgrade VIP.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Referrer</th>
                <th className="text-left px-4 py-3">Referred</th>
                <th className="text-center px-4 py-3">VIP?</th>
                <th className="text-right px-4 py-3">Komisi</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs">
                      {new Date(r.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{r.referrer_name}</p>
                      <p className="text-slate-500">{r.referrer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">{r.referred_name}</p>
                      <p className="text-slate-500">{r.referred_email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.referred_vip ? (
                        <Crown className="w-4 h-4 text-amber-500 mx-auto" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      Rp {Number(r.commission || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${r.status === "paid" ? "bg-emerald-100 text-emerald-700" : r.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === "pending" && (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => pay(r.id)}
                            className="p-1.5 rounded-md bg-emerald-50 text-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reject(r.id)}
                            className="p-1.5 rounded-md bg-rose-50 text-rose-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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

export default AdminReferral;
