import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { Mail, Lock, Eye, EyeOff, Loader2, Cpu } from "lucide-react";

function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [settings, setSettings] = useState({});
  const { signInWithCredentials } = useAuth();

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {});
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hd_email");
      if (saved) setEmail(saved);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError("Mohon isi email dan password");
      setLoading(false);
      return;
    }
    if (remember && typeof window !== "undefined")
      localStorage.setItem("hd_email", email);
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const map = {
        CredentialsSignin: "Email atau password salah. Silakan coba lagi.",
        AccessDenied: "Akses ditolak.",
        Configuration: "Sistem login belum siap. Coba beberapa saat lagi.",
      };
      setError(map[err.message] || "Terjadi kesalahan. Mohon coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F5FC]">
      <div className="hidden lg:flex flex-col w-1/2 bg-[#0F0B2E] text-white p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(167,139,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3">
            {settings.site_logo ? (
              <img src={settings.site_logo} alt="HyperDrop" className="h-10" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-violet-500/40">
                H
              </div>
            )}
            <span className="text-2xl font-bold">HyperDrop</span>
          </a>
        </div>
        <div className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI-Powered Dashboard</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Selamat Datang Kembali
          </h2>
          <p className="text-violet-200/80 text-lg leading-relaxed mb-8 max-w-md">
            Naikkan order Anda tanpa gudang. Masuk ke dashboard premium
            HyperDrop dan kelola bisnis dropship dengan automation enterprise.
          </p>
          <div className="space-y-3 max-w-md">
            <FeatureRow text="Dashboard Realtime Premium" />
            <FeatureRow text="Internal COD VIP & External Aggregator" />
            <FeatureRow text="Smart HOLD Balance + Auto Refund" />
          </div>
        </div>
        <p className="relative z-10 text-xs text-violet-300/60">
          {settings.copyright_text ||
            "© PT. Digitalindo Nusa Trivela — Hak Cipta Dilindungi — Developer By Atedy"}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-2xl font-bold text-slate-900">HyperDrop</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Masuk ke Akun
          </h1>
          <p className="text-slate-500 mb-8">
            Belum punya akun?{" "}
            <a
              href="/account/signup"
              className="text-violet-600 font-semibold hover:text-violet-700"
            >
              Daftar gratis
            </a>
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@anda.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-700"
                >
                  {showPwd ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600"
                />
                <span className="text-slate-600">Ingat saya</span>
              </label>
              <a
                href="/account/forgot-password"
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Lupa password?
              </a>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-violet-500/40 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
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
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function FeatureRow({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-400/40 flex items-center justify-center shrink-0">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-violet-100">{text}</span>
    </div>
  );
}

export default SignInPage;
