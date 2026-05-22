import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  CreditCard,
  Save,
  Loader2,
  Info,
  Copy,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Settings as SettingsIcon,
  Power,
  Wrench,
} from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/midtrans" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [form, setForm] = useState({
    mode: "production",
    merchant_id: "",
    client_key: "",
    server_key: "",
    is_active: true,
    is_maintenance: false,
    min_topup: 10000,
    max_topup: 50000000,
    expiry_minutes: 60,
    enable_qris: true,
    enable_va: true,
    enable_ewallet: true,
    enable_cc: false,
    maintenance_title: "",
    maintenance_description: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  const load = () =>
    fetch("/api/admin/midtrans")
      .then((r) => r.json())
      .then((d) => {
        if (d.midtrans) setForm((f) => ({ ...f, ...d.midtrans }));
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/midtrans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  // Realtime maintenance toggle (saves immediately)
  const toggleMaintenance = async (v) => {
    setForm({ ...form, is_maintenance: v });
    await fetch("/api/admin/midtrans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_maintenance: v }),
    });
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const notificationUrl = `${baseUrl}/api/midtrans/notification`;
  const finishUrl = `${baseUrl}/dashboard/topup?midtrans=success`;

  const copy = (text, key) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-blue-400 spin" />
        <style
          jsx
          global
        >{`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-blue-600" /> Midtrans Payment
          Gateway
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enterprise payment system — Midtrans Snap dengan QRIS, VA, E-Wallet,
          Credit Card.
        </p>
      </div>

      {/* Maintenance Big Toggle */}
      <div
        className={`rounded-2xl border-2 p-5 transition-all ${form.is_maintenance ? "bg-amber-50 border-amber-300" : "bg-emerald-50 border-emerald-300"}`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${form.is_maintenance ? "bg-amber-500 shadow-amber-500/30" : "bg-emerald-500 shadow-emerald-500/30"}`}
            >
              {form.is_maintenance ? (
                <Wrench className="w-6 h-6 text-white" />
              ) : (
                <Power className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-lg">
                {form.is_maintenance
                  ? "🔧 Maintenance Mode AKTIF"
                  : "✅ Payment System Online"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {form.is_maintenance
                  ? "Topup Midtrans dinonaktifkan untuk semua member. Member tidak bisa create payment."
                  : "Semua member dapat melakukan topup via Midtrans secara normal."}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.is_maintenance || false}
              onChange={(e) => toggleMaintenance(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-slate-300 peer-checked:bg-amber-500 rounded-full transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
          </label>
        </div>

        {form.is_maintenance && (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Title Maintenance
              </label>
              <input
                type="text"
                value={form.maintenance_title || ""}
                onChange={(e) =>
                  setForm({ ...form, maintenance_title: e.target.value })
                }
                placeholder="Payment system sedang maintenance"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Estimated Until
              </label>
              <input
                type="datetime-local"
                value={
                  form.maintenance_until
                    ? new Date(form.maintenance_until)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    maintenance_until: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Description
              </label>
              <textarea
                value={form.maintenance_description || ""}
                onChange={(e) =>
                  setForm({ ...form, maintenance_description: e.target.value })
                }
                placeholder="Silakan coba kembali beberapa saat lagi."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm resize-none"
              />
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="md:col-span-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold disabled:opacity-50"
            >
              Simpan Teks Maintenance
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1 inline-flex items-center gap-2">
          <Info className="w-4 h-4" /> Setup Webhook URL di Midtrans Dashboard
        </p>
        <p className="text-xs text-blue-700 mb-3">
          Settings → Configuration → Payment Notification URL
        </p>
        <UrlBox
          label="Notification URL (Webhook)"
          value={notificationUrl}
          k="notif"
          copied={copied}
          onCopy={copy}
        />
        <div className="mt-2">
          <UrlBox
            label="Finish URL"
            value={finishUrl}
            k="finish"
            copied={copied}
            onCopy={copy}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Credentials */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-blue-600" /> Credentials
          </h3>
          <div>
            <label className="block text-xs font-semibold mb-1">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {["sandbox", "production"].map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize ${form.mode === m ? (m === "production" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-amber-500 bg-amber-50 text-amber-700") : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  {m === "sandbox" ? "🧪 Sandbox" : "🚀 Production"}
                </button>
              ))}
            </div>
          </div>
          <Inp
            label="Merchant ID"
            value={form.merchant_id}
            onChange={(v) => setForm({ ...form, merchant_id: v })}
            placeholder="GXXXXXXXX"
          />
          <Inp
            label="Client Key"
            value={form.client_key}
            onChange={(v) => setForm({ ...form, client_key: v })}
            placeholder="Mid-client-XXXXXXXXX"
          />
          <Inp
            label="Server Key"
            value={form.server_key}
            onChange={(v) => setForm({ ...form, server_key: v })}
            type="password"
            placeholder="Mid-server-XXXXXXXXX"
          />

          <label className="flex items-center gap-2 text-sm font-semibold pt-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            Aktifkan Midtrans
          </label>
        </div>

        {/* Limits & Methods */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" /> Limits & Payment Methods
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Inp
              label="Min Topup (Rp)"
              type="number"
              value={form.min_topup}
              onChange={(v) => setForm({ ...form, min_topup: Number(v) })}
            />
            <Inp
              label="Max Topup (Rp)"
              type="number"
              value={form.max_topup}
              onChange={(v) => setForm({ ...form, max_topup: Number(v) })}
            />
          </div>
          <Inp
            label="Expiry (menit)"
            type="number"
            value={form.expiry_minutes}
            onChange={(v) => setForm({ ...form, expiry_minutes: Number(v) })}
          />

          <p className="text-xs font-semibold uppercase text-slate-500 mt-2">
            Enable Payment Methods
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["enable_qris", "QRIS"],
              ["enable_va", "Virtual Account (BCA/BNI/BRI/Permata)"],
              ["enable_ewallet", "E-Wallet (GoPay/ShopeePay/Dana)"],
              ["enable_cc", "Credit Card"],
            ].map(([k, l]) => (
              <label
                key={k}
                className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-lg border-2 cursor-pointer ${form[k] ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}
              >
                <input
                  type="checkbox"
                  checked={!!form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.checked })}
                  className="w-4 h-4"
                />
                {l}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {success && (
          <p className="text-emerald-600 text-sm font-semibold inline-flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Tersimpan
          </p>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Simpan Semua Pengaturan
            </>
          )}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex gap-2 items-start max-w-2xl">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Penting</p>
          <p>
            Untuk production, pastikan Server Key &amp; Client Key tidak
            tertukar antara Sandbox &amp; Production. Cek di Midtrans Dashboard
            → Settings → Access Keys.
          </p>
        </div>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
    </div>
  );
}

function UrlBox({ label, value, k, copied, onCopy }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      <div className="flex gap-2">
        <code className="flex-1 px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-mono break-all">
          {value}
        </code>
        <button
          type="button"
          onClick={() => onCopy(value, k)}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0"
        >
          {copied === k ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          Copy
        </button>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-blue-100 text-sm"
      />
    </div>
  );
}

export default Page;
