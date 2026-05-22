import { useState } from "react";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handlePromote = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/make-me-admin", { method: "POST" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Gagal promote");
      }
      setSuccess(true);
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.href = "/admin";
      }, 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Setup Super Admin
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Halaman ini akan menjadikan akun Anda sebagai{" "}
          <strong>Super Admin</strong>. Pastikan Anda sudah login dengan email
          admin utama. Setelah selesai, anda bisa hapus file{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
            /apps/web/src/app/setup-admin/page.jsx
          </code>{" "}
          dan{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
            /apps/web/src/app/api/admin/make-me-admin/route.js
          </code>
          .
        </p>
        {success ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              Berhasil! Mengarahkan ke /admin...
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={handlePromote}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-4 h-4"
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Memproses...
                </>
              ) : (
                "Jadikan Saya Super Admin"
              )}
            </button>
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <p className="mt-4 text-xs text-slate-400">
              Belum login?{" "}
              <a
                href="/account/signin?callbackUrl=/setup-admin"
                className="text-emerald-600 underline"
              >
                Login dulu di sini
              </a>
            </p>
          </>
        )}
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default SetupAdminPage;
