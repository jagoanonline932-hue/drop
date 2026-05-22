import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MessageSquare,
  Save,
  Send,
  Loader2,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Search,
  Megaphone,
  Users,
  Zap,
} from "lucide-react";

// Grouped templates for better UX
const TEMPLATE_GROUPS = [
  {
    group: "🔐 Onboarding & Akun",
    items: [
      {
        key: "notify_welcome",
        tpl: "template_welcome",
        label: "Welcome Member Baru (Register/Login Pertama)",
        sample:
          "Halo {name}! 🎉 Selamat bergabung di *HyperDrop*. Mulai topup saldo & order pertamamu sekarang juga di dashboard kami.",
      },
      {
        key: "notify_followup_inactive",
        tpl: "template_followup_inactive",
        label: "Followup Member Tidak Aktif",
        sample:
          "Hai {name}, kami kangen! 👋 Sudah lama tidak ada aktivitas. Yuk login dan order lagi di HyperDrop.",
      },
      {
        key: "notify_followup_no_order",
        tpl: "template_followup_no_order",
        label: "Followup Belum Pernah Order",
        sample:
          "{name}, sudah daftar tapi belum order? Yuk coba produk best seller kami! Profit menanti.",
      },
      {
        key: "notify_followup_low_balance",
        tpl: "template_followup_low_balance",
        label: "Followup Saldo Menipis",
        sample:
          "Saldo Anda menipis {name}. Topup sekarang via Duitku, otomatis masuk dalam hitungan detik!",
      },
    ],
  },
  {
    group: "💰 Topup & Pembayaran",
    items: [
      {
        key: "notify_topup_success",
        tpl: "template_topup_success",
        label: "Topup Berhasil (Saldo Masuk)",
        sample:
          "Halo {name}, topup Rp {amount} berhasil! 🎉 Order: {order}. Saldo sudah masuk ke akun Anda.",
      },
      {
        key: "notify_topup_pending",
        tpl: "template_topup_pending",
        label: "Topup Menunggu Pembayaran",
        sample:
          "Hai {name}, topup {order} sebesar Rp {amount} menunggu pembayaran. Selesaikan segera ya.",
      },
      {
        key: "notify_payment_success",
        tpl: "template_payment_success",
        label: "Pembayaran Order Berhasil",
        sample:
          "Pembayaran order {order} Rp {amount} sudah kami terima. Terima kasih {name}!",
      },
      {
        key: "notify_payment_pending",
        tpl: "template_payment_pending",
        label: "Pembayaran Pending",
        sample:
          "Halo {name}, pembayaran order {order} senilai Rp {amount} menunggu konfirmasi.",
      },
    ],
  },
  {
    group: "📦 Order & Pengiriman",
    items: [
      {
        key: "notify_order_created",
        tpl: "template_order_created",
        label: "Order Baru Dibuat",
        sample:
          "Halo {name}, order {order} berhasil dibuat. Total Rp {amount}. Pantau status order Anda di dashboard.",
      },
      {
        key: "notify_resi_upload",
        tpl: "template_resi_upload",
        label: "Resi Diupload",
        sample:
          "Resi untuk order {order} telah diupload. Cek di dashboard Anda {name}!",
      },
      {
        key: "notify_order_shipped",
        tpl: "template_order_shipped",
        label: "Order Dikirim",
        sample:
          "📦 Order {order} sudah dikirim {name}! Nomor resi tersedia di dashboard.",
      },
      {
        key: "notify_order_delivered",
        tpl: "template_order_delivered",
        label: "Order Sampai Tujuan",
        sample:
          "✅ Order {order} sudah sampai ke pelanggan! Selamat {name}, profit Rp {amount} masuk saldo.",
      },
      {
        key: "notify_order_status",
        tpl: "template_order_status",
        label: "Update Status Order Umum",
        sample:
          "Status order {order} diupdate menjadi: {status}. Cek dashboard untuk detail.",
      },
    ],
  },
  {
    group: "💸 Withdraw & Saldo",
    items: [
      {
        key: "notify_withdraw_otp",
        tpl: "template_withdraw_otp",
        label: "🔐 Kode OTP Withdraw (WAJIB AKTIF)",
        sample:
          "🔐 *KODE OTP WITHDRAW*\n\nHalo {name},\n\nKode OTP untuk withdraw Rp {amount}:\n*{otp}*\n\nBerlaku 5 menit. Jangan bagikan ke siapapun.\n\n— HyperDrop Team",
      },
      {
        key: "notify_withdraw_request",
        tpl: "template_withdraw_request",
        label: "Withdraw Diajukan",
        sample:
          "Halo {name}, permintaan withdraw Rp {amount} sudah masuk. Mohon tunggu proses admin.",
      },
      {
        key: "notify_withdraw_approved",
        tpl: "template_withdraw_approved",
        label: "Withdraw Disetujui (Cair)",
        sample:
          "✅ Withdraw Rp {amount} telah ditransfer ke rekening Anda {name}. Terima kasih!",
      },
      {
        key: "notify_withdraw_rejected",
        tpl: "template_withdraw_rejected",
        label: "Withdraw Ditolak",
        sample:
          "Mohon maaf {name}, withdraw Anda Rp {amount} ditolak. Saldo telah dikembalikan.",
      },
      {
        key: "notify_balance_adjusted",
        tpl: "template_balance_adjusted",
        label: "Penyesuaian Saldo",
        sample:
          "Saldo Anda telah disesuaikan oleh admin. Saldo terbaru tersedia di dashboard {name}.",
      },
      {
        key: "notify_hold",
        tpl: "template_hold",
        label: "Saldo HOLD",
        sample:
          "Saldo Anda sebesar Rp {amount} sedang HOLD untuk order {order}. Akan rilis setelah delivered.",
      },
      {
        key: "notify_refund",
        tpl: "template_refund",
        label: "Refund Diproses",
        sample:
          "Refund untuk order {order} sebesar Rp {amount} telah diproses {name}.",
      },
      {
        key: "notify_return",
        tpl: "template_return",
        label: "Order Return",
        sample:
          "Order {order} dikembalikan oleh pelanggan. Detail dapat dilihat di dashboard {name}.",
      },
    ],
  },
  {
    group: "👑 VIP & Referral",
    items: [
      {
        key: "notify_vip_upgrade",
        tpl: "template_vip_upgrade",
        label: "Upgrade VIP Berhasil",
        sample:
          "🎉 Selamat {name}! Akun Anda kini berstatus VIP. Nikmati akses Internal COD VIP dan benefit eksklusif.",
      },
      {
        key: "notify_vip_expired",
        tpl: "template_vip_expired",
        label: "VIP Akan/Sudah Expired",
        sample:
          "VIP Anda akan/telah berakhir {name}. Perpanjang sekarang untuk tetap menikmati benefit.",
      },
      {
        key: "notify_referral_success",
        tpl: "template_referral",
        label: "Komisi Referral Cair",
        sample:
          "💰 Anda mendapat komisi referral Rp {amount} {name}! Cek dashboard referral.",
      },
    ],
  },
];

function Page() {
  return (
    <DashboardLayout currentPath="/admin/fonnte" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [form, setForm] = useState({ custom_templates: [] });
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState("Test dari HyperDrop");
  const [testing, setTesting] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState(0);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [broadcastTplIdx, setBroadcastTplIdx] = useState(0);

  useEffect(() => {
    fetch("/api/admin/fonnte")
      .then((r) => r.json())
      .then((d) => {
        const data = d.fonnte || {};
        if (!Array.isArray(data.custom_templates)) data.custom_templates = [];
        setForm(data);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/fonnte", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        setSavedFlag(true);
        setTimeout(() => setSavedFlag(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const testSend = async () => {
    setTesting(true);
    try {
      const r = await fetch("/api/admin/fonnte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, message: testMsg }),
      });
      const d = await r.json();
      if (typeof window !== "undefined")
        window.alert(
          r.ok ? "Berhasil terkirim ✓" : "Gagal: " + (d.error || ""),
        );
    } finally {
      setTesting(false);
    }
  };

  const broadcast = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Kirim broadcast ke ${broadcastTarget === "all" ? "SEMUA member" : broadcastTarget.toUpperCase()}?`,
      )
    )
      return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const tpl = (form.custom_templates || [])[broadcastTplIdx];
      if (!tpl || !tpl.message) {
        if (typeof window !== "undefined") window.alert("Template kosong");
        return;
      }
      const r = await fetch("/api/admin/fonnte", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast",
          target: broadcastTarget,
          message: tpl.message,
          template_name: tpl.name || "Custom",
        }),
      });
      const d = await r.json();
      setBroadcastResult(d);
    } finally {
      setBroadcasting(false);
    }
  };

  const useSample = (key, sample) => {
    setForm({ ...form, [key]: sample });
  };

  const addCustomTemplate = () => {
    const custom = [
      ...(form.custom_templates || []),
      {
        id: `custom_${Date.now()}`,
        name: "Template Baru",
        message: "",
        enabled: true,
      },
    ];
    setForm({ ...form, custom_templates: custom });
  };

  const updateCustom = (idx, key, value) => {
    const arr = [...(form.custom_templates || [])];
    arr[idx] = { ...arr[idx], [key]: value };
    setForm({ ...form, custom_templates: arr });
  };

  const removeCustom = (idx) => {
    const arr = [...(form.custom_templates || [])];
    arr.splice(idx, 1);
    setForm({ ...form, custom_templates: arr });
  };

  const filteredGroup = TEMPLATE_GROUPS[activeGroup];
  const visibleItems = search
    ? filteredGroup.items.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase()),
      )
    : filteredGroup.items;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-violet-600" /> Fonnte WhatsApp
          Automation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Setup notifikasi & template followup otomatis ke member via WhatsApp —
          dari onboarding hingga order delivered.
        </p>
      </div>

      {/* Token + Activation */}
      <div className="bg-white rounded-2xl border border-violet-100 p-5 space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-1">
            API Token Fonnte
          </label>
          <input
            value={form.api_token || ""}
            onChange={(e) => setForm({ ...form, api_token: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">
            Dapat di{" "}
            <a
              href="https://fonnte.com"
              target="_blank"
              rel="noreferrer"
              className="text-violet-600 underline"
            >
              fonnte.com
            </a>
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4"
          />{" "}
          Aktifkan Notifikasi Fonnte
        </label>
      </div>

      {/* Test send */}
      <div className="bg-white rounded-2xl border border-violet-100 p-5">
        <h3 className="font-bold mb-3 inline-flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-600" /> Test Kirim WhatsApp
        </h3>
        <div className="grid md:grid-cols-3 gap-2">
          <input
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="No HP (08xx)"
            className="px-3 py-2 rounded-xl border border-violet-100 text-sm"
          />
          <input
            value={testMsg}
            onChange={(e) => setTestMsg(e.target.value)}
            placeholder="Pesan test"
            className="px-3 py-2 rounded-xl border border-violet-100 text-sm md:col-span-1"
          />
          <button
            onClick={testSend}
            disabled={testing || !testPhone}
            className="bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {testing ? (
              <Loader2
                className="w-4 h-4"
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send className="w-4 h-4" />
            )}{" "}
            Test
          </button>
        </div>
      </div>

      {/* Template Builder */}
      <div className="bg-white rounded-2xl border border-violet-100 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold">📨 Template Notifikasi Otomatis</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-violet-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari template..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-violet-100"
            />
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-violet-50 p-3 rounded-lg border border-violet-100">
          <strong>Placeholder tersedia:</strong>{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-violet-700">
            {"{name}"}
          </code>{" "}
          nama member,{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-violet-700">
            {"{order}"}
          </code>{" "}
          no order/topup,{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-violet-700">
            {"{amount}"}
          </code>{" "}
          nominal,{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-violet-700">
            {"{status}"}
          </code>{" "}
          status
        </p>

        <div className="flex flex-wrap gap-2 border-b border-violet-100 pb-3">
          {TEMPLATE_GROUPS.map((g, idx) => (
            <button
              key={g.group}
              onClick={() => setActiveGroup(idx)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${activeGroup === idx ? "bg-violet-600 text-white" : "bg-violet-50 hover:bg-violet-100 text-violet-700"}`}
            >
              {g.group}{" "}
              <span className="text-[10px] opacity-70">({g.items.length})</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {visibleItems.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4">
              Tidak ada template yang cocok dengan pencarian.
            </p>
          )}
          {visibleItems.map((n) => (
            <div
              key={n.key}
              className="border border-violet-100 rounded-xl p-3 bg-violet-50/30"
            >
              <label className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-sm">{n.label}</span>
                <input
                  type="checkbox"
                  checked={!!form[n.key]}
                  onChange={(e) =>
                    setForm({ ...form, [n.key]: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </label>
              <textarea
                value={form[n.tpl] || ""}
                onChange={(e) => setForm({ ...form, [n.tpl]: e.target.value })}
                rows={3}
                placeholder={n.sample}
                className="w-full px-3 py-2 rounded-lg border border-violet-100 text-xs bg-white"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-slate-400 italic line-clamp-1 flex-1">
                  Contoh: {n.sample}
                </p>
                <button
                  onClick={() => useSample(n.tpl, n.sample)}
                  className="text-[10px] text-violet-600 font-semibold hover:underline inline-flex items-center gap-1 ml-2"
                >
                  <Copy className="w-3 h-3" /> Gunakan contoh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CUSTOM TEMPLATES */}
      <div className="bg-white rounded-2xl border border-violet-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold inline-flex items-center gap-2">
              ✨ Template Custom (Tambah Sebanyak Mungkin)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Buat template followup tambahan tak terbatas — kampanye, promo,
              greeting hari raya, dsb. Bisa di-broadcast ke semua/VIP.
            </p>
          </div>
          <button
            onClick={addCustomTemplate}
            className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 text-xs rounded-lg font-semibold inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Template
          </button>
        </div>

        {(form.custom_templates || []).length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6 border-2 border-dashed border-violet-200 rounded-xl">
            Belum ada template custom. Klik "Tambah Template" untuk membuat.
          </p>
        ) : (
          <div className="space-y-3">
            {form.custom_templates.map((ct, idx) => (
              <div
                key={ct.id || idx}
                className="border border-violet-200 rounded-xl p-3 bg-violet-50/30"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <input
                    value={ct.name || ""}
                    onChange={(e) => updateCustom(idx, "name", e.target.value)}
                    placeholder="Nama template (cth: Promo Akhir Bulan)"
                    className="flex-1 px-2 py-1 text-sm font-semibold rounded-lg border border-violet-200 bg-white"
                  />
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={!!ct.enabled}
                      onChange={(e) =>
                        updateCustom(idx, "enabled", e.target.checked)
                      }
                      className="w-3.5 h-3.5"
                    />
                    Aktif
                  </label>
                  <button
                    onClick={() => removeCustom(idx)}
                    className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={ct.message || ""}
                  onChange={(e) => updateCustom(idx, "message", e.target.value)}
                  rows={3}
                  placeholder="Isi pesan WhatsApp. Gunakan {name}, {amount}, {order} sebagai placeholder."
                  className="w-full px-3 py-2 rounded-lg border border-violet-200 text-xs bg-white"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BROADCAST */}
      {(form.custom_templates || []).length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-violet-200 p-5 space-y-3">
          <h3 className="font-bold inline-flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-violet-600" /> Broadcast Manual
            ke Member
          </h3>
          <p className="text-xs text-slate-500">
            Pilih template custom dan target audience untuk broadcast sekarang.
          </p>
          <div className="grid md:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Template
              </label>
              <select
                value={broadcastTplIdx}
                onChange={(e) => setBroadcastTplIdx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm bg-white"
              >
                {(form.custom_templates || []).map((t, i) => (
                  <option key={t.id || i} value={i}>
                    {t.name || `Template ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Target</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm bg-white"
              >
                <option value="all">Semua Member Aktif</option>
                <option value="vip">Hanya VIP</option>
                <option value="non_vip">Hanya Non-VIP</option>
                <option value="no_order">Belum Pernah Order</option>
                <option value="low_balance">Saldo &lt; Rp 50.000</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={broadcast}
                disabled={broadcasting}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {broadcasting ? (
                  <Loader2
                    className="w-4 h-4"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                Broadcast Sekarang
              </button>
            </div>
          </div>
          {broadcastResult && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-sm text-violet-800">
              <p className="font-semibold">
                ✓ Broadcast selesai: {broadcastResult.sent || 0} sukses /{" "}
                {broadcastResult.total || 0} target
              </p>
              {broadcastResult.failed > 0 && (
                <p className="text-xs mt-0.5 text-rose-600">
                  {broadcastResult.failed} gagal kirim
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {savedFlag && (
        <p className="text-violet-600 text-sm font-semibold inline-flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> Tersimpan
        </p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2
              className="w-4 h-4"
              style={{ animation: "spin 1s linear infinite" }}
            />{" "}
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Simpan Semua Template
          </>
        )}
      </button>
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default Page;
