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
} from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/duitku" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [form, setForm] = useState({
    mode: "sandbox",
    merchant_code: "",
    api_key: "",
    callback_url: "",
    return_url: "",
    is_active: true,
    is_maintenance: false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetch("/api/admin/duitku")
      .then((r) => r.json())
      .then((d) => {
        if (d.duitku) setForm((f) => ({ ...f, ...d.duitku }));
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setTestResult(null);
    try {
      const r = await fetch("/api/admin/duitku", {
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

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch("/api/admin/duitku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const d = await r.json();
      setTestResult({ ok: r.ok && d.ok, message: d.message || d.error });
    } catch (e) {
      setTestResult({ ok: false, message: "Network error: " + e.message });
    } finally {
      setTesting(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const autoCallback = `${baseUrl}/api/duitku/callback`;
  const autoReturn = `${baseUrl}/dashboard/topup?duitku=success`;

  const copy = (text, key) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-violet-600" /> Duitku Payment
          Gateway
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pembayaran otomatis topup member. Cukup pasang Merchant Code + API
          Key, sistem akan handle inquiry, callback signature, dan saldo masuk
          otomatis.
        </p>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 text-sm text-violet-800">
        <p className="font-semibold mb-1 inline-flex items-center gap-2">
          <Info className="w-4 h-4" /> Cara Setup (3 langkah)
        </p>
        <ol className="list-decimal list-inside text-xs space-y-1 text-violet-700">
          <li>
            Daftar / login di{" "}
            <a
              href="https://duitku.com"
              target="_blank"
              rel="noreferrer"
              className="underline font-semibold"
            >
              duitku.com
            </a>{" "}
            dan ambil <strong>Merchant Code</strong> &amp;{" "}
            <strong>API Key</strong>
          </li>
          <li>
            Daftarkan <strong>Callback URL</strong> di dashboard Duitku (lihat
            URL di bawah, sudah otomatis)
          </li>
          <li>Klik "Test Koneksi" untuk verifikasi, lalu Simpan</li>
        </ol>
      </div>

      {/* AUTO URLS — always shown so admin can copy & paste to Duitku */}
      <div className="bg-white rounded-2xl border-2 border-violet-200 p-5 max-w-2xl">
        <h3 className="font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-600" /> URL Callback Otomatis
          Proyek Ini
        </h3>
        <UrlBox
          label="Callback URL (Webhook Duitku)"
          value={autoCallback}
          k="cb-auto"
          copied={copied}
          onCopy={copy}
        />
        <div className="mt-3">
          <UrlBox
            label="Return URL (Setelah bayar)"
            value={autoReturn}
            k="ret-auto"
            copied={copied}
            onCopy={copy}
          />
        </div>
        <p className="text-xs text-violet-600 mt-3 bg-violet-50 px-3 py-2 rounded-lg">
          📌 Copy URL Callback di atas dan paste ke pengaturan{" "}
          <strong>Callback URL</strong> di dashboard merchant Duitku Anda.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-violet-100 p-10 text-center">
          <Loader2
            className="w-6 h-6 mx-auto text-violet-400"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-violet-100 p-5 max-w-2xl space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {["sandbox", "production"].map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize ${form.mode === m ? (m === "production" ? "border-violet-600 bg-violet-50 text-violet-700" : "border-amber-500 bg-amber-50 text-amber-700") : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  {m === "sandbox"
                    ? "🧪 Sandbox (Testing)"
                    : "🚀 Production (Live)"}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Endpoint:{" "}
              <span className="font-mono text-violet-700">
                {form.mode === "production"
                  ? "passport.duitku.com"
                  : "sandbox.duitku.com"}
              </span>
            </p>
          </div>

          <Inp
            label="Merchant Code"
            value={form.merchant_code}
            onChange={(v) => setForm({ ...form, merchant_code: v })}
            placeholder="DXXXX"
          />
          <Inp
            label="API Key"
            value={form.api_key}
            onChange={(v) => setForm({ ...form, api_key: v })}
            type="password"
            placeholder="API Key dari dashboard Duitku"
          />

          <div>
            <label className="block text-xs font-semibold mb-1">
              Callback URL (Opsional - Override)
            </label>
            <div className="flex gap-2">
              <input
                value={form.callback_url || ""}
                onChange={(e) =>
                  setForm({ ...form, callback_url: e.target.value })
                }
                placeholder={autoCallback}
                className="flex-1 px-3 py-2 rounded-xl border border-violet-100 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => copy(autoCallback, "cb")}
                className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-xs font-semibold inline-flex items-center gap-1 text-violet-700"
              >
                {copied === "cb" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Kosongkan untuk pakai default (recommended).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Return URL (Opsional - Override)
            </label>
            <div className="flex gap-2">
              <input
                value={form.return_url || ""}
                onChange={(e) =>
                  setForm({ ...form, return_url: e.target.value })
                }
                placeholder={autoReturn}
                className="flex-1 px-3 py-2 rounded-xl border border-violet-100 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => copy(autoReturn, "ret")}
                className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-xs font-semibold inline-flex items-center gap-1 text-violet-700"
              >
                {copied === "ret" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold pt-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            Aktifkan Duitku
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.is_maintenance || false}
              onChange={(e) =>
                setForm({ ...form, is_maintenance: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-amber-700">
              Mode Maintenance (sembunyikan dari member)
            </span>
          </label>

          {success && (
            <p className="text-violet-600 text-sm font-semibold inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Tersimpan
            </p>
          )}

          {testResult && (
            <div
              className={`rounded-xl p-3 text-sm flex items-start gap-2 ${testResult.ok ? "bg-violet-50 border border-violet-200 text-violet-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.ok ? "✓ Koneksi Berhasil" : "✗ Koneksi Gagal"}
                </p>
                <p className="text-xs mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
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
                  <Save className="w-4 h-4" /> Simpan
                </>
              )}
            </button>
            <button
              onClick={testConnection}
              disabled={testing || !form.merchant_code || !form.api_key}
              className="bg-white border-2 border-violet-300 hover:bg-violet-50 text-violet-700 px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2
                    className="w-4 h-4"
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Menguji...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Test Koneksi
                </>
              )}
            </button>
          </div>
        </div>
      )}
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

function UrlBox({ label, value, k, copied, onCopy }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      <div className="flex gap-2">
        <code className="flex-1 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 text-xs font-mono break-all">
          {value}
        </code>
        <button
          type="button"
          onClick={() => onCopy(value, k)}
          className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0"
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
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-violet-100 text-sm"
      />
    </div>
  );
}

export default Page;
