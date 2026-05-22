import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { UserCog, Search, Crown, Edit, Wallet, Loader2 } from "lucide-react";

function AdminMembers() {
  return (
    <DashboardLayout currentPath="/admin/members" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleF, setRoleF] = useState("");
  const [vipF, setVipF] = useState("");
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (roleF) p.set("role", roleF);
    if (vipF) p.set("vip", vipF);
    fetch(`/api/admin/members?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, roleF, vipF]);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-7 h-7 text-blue-500" /> Member Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola seluruh member HyperDrop.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, HP..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200"
          />
        </div>
        <select
          value={roleF}
          onChange={(e) => setRoleF(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        >
          <option value="">Semua Role</option>
          <option value="member">Member</option>
          <option value="super_admin">Super Admin</option>
          <option value="staff_admin">Staff Admin</option>
          <option value="finance_admin">Finance Admin</option>
          <option value="cs_admin">CS Admin</option>
        </select>
        <select
          value={vipF}
          onChange={(e) => setVipF(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200"
        >
          <option value="">VIP Status</option>
          <option value="true">VIP</option>
          <option value="false">Non VIP</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Nama / Email</th>
                <th className="text-left px-4 py-3">HP</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Saldo</th>
                <th className="text-right px-4 py-3">HOLD</th>
                <th className="text-left px-4 py-3">Daftar</th>
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
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{m.name || "—"}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{m.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        {(m.role || "member").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.vip_status ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                          <Crown className="w-3 h-3" /> VIP
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500">
                          Member
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {fmt(m.balance)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {fmt(m.balance_hold)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleDateString("id-ID")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEdit(m)}
                        className="p-1.5 rounded-md bg-blue-50 text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
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
        open={!!edit}
        onClose={() => setEdit(null)}
        title={`Edit Member: ${edit?.email || ""}`}
      >
        {edit && (
          <MemberEdit
            member={edit}
            onSaved={() => {
              load();
              setEdit(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function MemberEdit({ member, onSaved }) {
  const [role, setRole] = useState(member.role || "member");
  const [vip, setVip] = useState(member.vip_status || false);
  const [vipExp, setVipExp] = useState(
    member.vip_expired_at ? member.vip_expired_at.slice(0, 10) : "",
  );
  const [active, setActive] = useState(member.is_active);
  const [phone, setPhone] = useState(member.phone || "");
  const [whatsapp, setWhatsapp] = useState(member.whatsapp || "");
  const [saving, setSaving] = useState(false);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjDesc, setAdjDesc] = useState("");

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: member.id,
          role,
          vip_status: vip,
          vip_expired_at: vipExp || null,
          is_active: active,
          phone,
          whatsapp,
        }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const adjust = async () => {
    if (!adjAmount || !adjDesc) {
      alert("Isi nominal & keterangan");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/admin/balance-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: member.id,
          amount: Number(adjAmount),
          description: adjDesc,
        }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            <option value="member">Member</option>
            <option value="super_admin">Super Admin</option>
            <option value="staff_admin">Staff Admin</option>
            <option value="finance_admin">Finance Admin</option>
            <option value="cs_admin">CS Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">No HP</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">No WhatsApp</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={vip}
          onChange={(e) => setVip(e.target.checked)}
          className="w-4 h-4"
        />{" "}
        VIP Member
      </label>
      {vip && (
        <div>
          <label className="block text-xs font-semibold mb-1">
            VIP Expired Date
          </label>
          <input
            type="date"
            value={vipExp}
            onChange={(e) => setVipExp(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
      )}
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4"
        />{" "}
        Akun Aktif
      </label>
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>

      <div className="border-t border-slate-200 pt-3 mt-3">
        <p className="text-sm font-bold mb-2 inline-flex items-center gap-2">
          <Wallet className="w-4 h-4 text-amber-500" /> Adjustment Saldo
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number"
            placeholder="Nominal (+ untuk tambah, - kurangi)"
            value={adjAmount}
            onChange={(e) => setAdjAmount(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <textarea
          value={adjDesc}
          onChange={(e) => setAdjDesc(e.target.value)}
          rows={2}
          placeholder="Keterangan (wajib, contoh: selisih ongkir return)"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mb-2"
        />
        <button
          onClick={adjust}
          disabled={saving}
          className="w-full bg-amber-500 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50"
        >
          Adjust Saldo
        </button>
      </div>
    </div>
  );
}

export default AdminMembers;
