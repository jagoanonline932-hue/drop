import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  Gift,
  Cpu,
} from "lucide-react";

function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [settings, setSettings] = useState({});
  const { signUpWithCredentials } = useAuth();

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {});
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setRefCode(ref);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Mohon lengkapi semua data wajib");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (!agree) {
      setError("Mohon setujui syarat & ketentuan");
      return;
    }
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("pendingName", name);
      localStorage.setItem("pendingPhone", phone || "");
      if (refCode) localStorage.setItem("pendingRefCode", refCode);
    }
    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      const map = {
        CredentialsSignin: "Email sudah terdaftar atau tidak valid.",
        OAuthAccountNotLinked: "Akun terhubung dengan metode login lain.",
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
            <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-violet-500/40">
              H
            </div>
            <span className="text-2xl font-bold">HyperDrop</span>
          </a>
        </div>
        <div className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI-Powered Dropship Platform</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Mulai Bisnis Tanpa Modal Stok
          </h2>
          <p className="text-violet-200/80 text-lg leading-relaxed mb-8 max-w-md">
            Gabung 12.500+ dropshipper sukses. Dashboard premium, automation
            lengkap, dan support 24/7.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <Card label="Member Aktif" value="12.5K+" />
            <Card label="Total Order" value="2.1M+" />
            <Card label="Pengiriman" value="1.25M+" />
            <Card label="Transaksi" value="850K+" />
          </div>
        </div>
        <p className="relative z-10 text-xs text-violet-300/60">
          {settings.copyright_text ||
            "© PT. Digitalindo Nusa Trivela — Hak Cipta Dilindungi — Developer By Atedy"}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-2xl font-bold text-slate-900">HyperDrop</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Daftar Akun
          </h1>
          <p className="text-slate-500 mb-8">
            Sudah punya akun?{" "}
            <a
              href="/account/signin"
              className="text-violet-600 font-semibold hover:text-violet-700"
            >
              Masuk di sini
            </a>
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nama Lengkap" icon={User}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              />
            </Field>
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@anda.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              />
            </Field>
            <Field label="No WhatsApp" icon={Phone}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              />
            </Field>
            <Field label="Password" icon={Lock}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 karakter"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-3 text-violet-400 hover:text-violet-700"
              >
                {showPwd ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </Field>
            <Field label="Kode Referral (Opsional)" icon={Gift}>
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                placeholder="Kode referral"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              />
            </Field>

            <label className="flex items-start gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-1 rounded text-violet-600"
              />
              <span className="text-slate-600">
                Saya menyetujui Syarat & Ketentuan dan Kebijakan Privasi
                HyperDrop
              </span>
            </label>

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
                "Daftar Sekarang"
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

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
        {children}
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white/5 border border-violet-400/20 rounded-xl px-4 py-3">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-violet-200/80 mt-1">{label}</p>
    </div>
  );
}

export default SignUpPage;
