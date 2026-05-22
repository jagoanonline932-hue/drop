import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Rocket,
  Github,
  ExternalLink,
  Copy,
  CheckCircle2,
  Globe,
  Terminal,
  Key,
  Database,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Shield,
} from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/vercel" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [copied, setCopied] = useState("");
  const [openStep, setOpenStep] = useState(0);

  const copy = (txt, key) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    }
  };

  const steps = [
    {
      icon: Github,
      title: "1. Siapkan Repository GitHub",
      content: (
        <div className="space-y-3 text-sm">
          <p>Login GitHub & buat repository baru (public/private bebas).</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>
              Buka{" "}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 font-semibold underline"
              >
                github.com/new
              </a>
            </li>
            <li>
              Beri nama repo (mis.{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded">
                hyperdrop
              </code>
              ) lalu klik <strong>Create repository</strong>
            </li>
            <li>
              Push source code aplikasi Anda ke repo (atau gunakan fitur export
              dari editor)
            </li>
          </ol>
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs">
            <p className="text-slate-400 mb-1"># Push pertama kali</p>
            <p>git init</p>
            <p>git add .</p>
            <p>git commit -m "first commit"</p>
            <p>git branch -M main</p>
            <p>git remote add origin https://github.com/USERNAME/REPO.git</p>
            <p>git push -u origin main</p>
          </div>
        </div>
      ),
    },
    {
      icon: Rocket,
      title: "2. Import Project ke Vercel",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            Vercel adalah platform deploy gratis terbaik untuk Next.js / React.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>
              Buka{" "}
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 font-semibold underline inline-flex items-center gap-1"
              >
                vercel.com/new <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Login pakai akun GitHub (otorisasi Vercel)</li>
            <li>
              Klik <strong>Import Project</strong>, pilih repo GitHub Anda
            </li>
            <li>Pada Framework Preset, biarkan default (Vercel auto-detect)</li>
            <li>
              <strong>Jangan klik Deploy dulu</strong> — lanjut ke Environment
              Variables di langkah 3
            </li>
          </ol>
        </div>
      ),
    },
    {
      icon: Key,
      title: "3. Isi Environment Variables",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            Sebelum deploy, klik <strong>Environment Variables</strong> dan isi:
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Semua key di bawah <strong>WAJIB DIISI</strong> agar aplikasi
              jalan. Ambil dari Project Settings &gt; Secrets di editor Anda.
            </span>
          </div>
          <div className="space-y-2">
            {[
              {
                k: "DATABASE_URL",
                d: "Connection string PostgreSQL (Neon / Supabase). Format: postgresql://user:pass@host/db?sslmode=require",
              },
              {
                k: "AUTH_SECRET",
                d: "Random string min 32 karakter. Generate via: openssl rand -base64 32",
              },
              {
                k: "AUTH_URL",
                d: "URL produksi Anda. mis. https://hyperdrop.vercel.app",
              },
              {
                k: "BETTER_AUTH_SECRET",
                d: "Sama dengan AUTH_SECRET (boleh berbeda)",
              },
              {
                k: "BETTER_AUTH_URL",
                d: "Sama dengan AUTH_URL",
              },
              {
                k: "NEXT_PUBLIC_CREATE_APP_URL",
                d: "URL produksi (sama dengan AUTH_URL)",
              },
            ].map((env) => (
              <div
                key={env.k}
                className="bg-white border border-slate-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="font-mono text-xs font-bold text-violet-700">
                    {env.k}
                  </code>
                  <button
                    onClick={() => copy(env.k, env.k)}
                    className="text-xs text-slate-500 hover:text-violet-600 inline-flex items-center gap-1"
                  >
                    {copied === env.k ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">{env.d}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
            💡 <strong>Tip:</strong> Centang ketiga environment (Production,
            Preview, Development) untuk setiap variable.
          </div>
        </div>
      ),
    },
    {
      icon: Database,
      title: "4. Setup Database (Neon PostgreSQL Gratis)",
      content: (
        <div className="space-y-3 text-sm">
          <p>Database WAJIB ada sebelum deploy.</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>
              Buka{" "}
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 font-semibold underline inline-flex items-center gap-1"
              >
                neon.tech <ExternalLink className="w-3 h-3" />
              </a>{" "}
              dan signup (gratis selamanya)
            </li>
            <li>
              Buat <strong>Project baru</strong>, region pilih Singapore (paling
              dekat ke Indonesia)
            </li>
            <li>
              Copy <strong>Connection String</strong> di dashboard Neon
            </li>
            <li>
              Paste ke{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded">
                DATABASE_URL
              </code>{" "}
              di Vercel Environment Variables
            </li>
            <li>Schema tabel akan dibuat otomatis saat first request</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            🔒 <strong>Penting:</strong> Pakai connection string yang
            sslmode=require (untuk security)
          </div>
        </div>
      ),
    },
    {
      icon: PlayCircle,
      title: "5. Deploy & Set Domain",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            Setelah env vars terisi semua, klik <strong>Deploy</strong>.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Vercel akan build &amp; deploy otomatis (sekitar 2-5 menit)</li>
            <li>
              Setelah selesai, aplikasi live di URL{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded">
                xxx.vercel.app
              </code>
            </li>
            <li>
              Untuk custom domain:{" "}
              <strong>Settings → Domains → Add Domain</strong>
            </li>
            <li>
              Hubungkan domain Anda (mis. hyperdrop.id) dengan ikuti instruksi
              DNS dari Vercel
            </li>
            <li>SSL otomatis aktif dalam 1-2 menit</li>
          </ol>
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
            ⚡ <strong>Auto-Deploy:</strong> Setiap kali push ke GitHub, Vercel
            otomatis redeploy.
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "6. Update Callback URL Duitku/Midtrans",
      content: (
        <div className="space-y-3 text-sm">
          <p>
            Setelah dapat URL produksi Vercel, update callback di payment
            gateway:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>
              Buka{" "}
              <a
                href="/admin/duitku"
                className="text-violet-600 font-semibold underline"
              >
                /admin/duitku
              </a>{" "}
              — copy Callback URL otomatis
            </li>
            <li>
              Login{" "}
              <a
                href="https://duitku.com"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 font-semibold underline"
              >
                dashboard Duitku
              </a>
              , paste ke Callback URL settings
            </li>
            <li>
              Untuk Midtrans:{" "}
              <a
                href="/admin/midtrans"
                className="text-violet-600 font-semibold underline"
              >
                /admin/midtrans
              </a>{" "}
              — copy Notification URL ke{" "}
              <a
                href="https://dashboard.midtrans.com"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 font-semibold underline"
              >
                dashboard Midtrans
              </a>
            </li>
            <li>
              Login Fonnte di{" "}
              <a
                href="/admin/fonnte"
                className="text-violet-600 font-semibold underline"
              >
                /admin/fonnte
              </a>{" "}
              — token Fonnte sudah jalan otomatis tanpa setup tambahan
            </li>
          </ol>
        </div>
      ),
    },
    {
      icon: Zap,
      title: "7. Verifikasi & Test",
      content: (
        <div className="space-y-3 text-sm">
          <p>Test fitur penting setelah deploy:</p>
          <div className="space-y-2">
            {[
              "✅ Signup member baru di /account/signup",
              "✅ Login admin & buka /admin",
              "✅ Topup via Duitku — saldo masuk otomatis",
              "✅ Order Internal COD / External Aggregator",
              "✅ Withdraw — terima OTP WhatsApp dari Fonnte",
              "✅ Upload bukti & resi via upload.io",
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-800"
              >
                {t}
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            🐛 <strong>Troubleshooting:</strong> Jika error 500, cek log di
            Vercel Dashboard → Project → Deployments → klik deployment terbaru →
            Functions
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Rocket className="w-3.5 h-3.5" /> Production Deployment
          </div>
          <h1 className="text-3xl font-bold mb-2">Deploy ke Vercel</h1>
          <p className="text-violet-200 max-w-2xl">
            Panduan lengkap step-by-step untuk publish aplikasi HyperDrop ke
            produksi via Vercel. Gratis, otomatis, dengan SSL & custom domain.
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-violet-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-50 transition shadow-lg"
            >
              <Rocket className="w-4 h-4" /> Mulai Deploy
            </a>
            <a
              href="https://vercel.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition"
            >
              <ExternalLink className="w-4 h-4" /> Vercel Docs
            </a>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            i: Globe,
            t: "100% Gratis",
            d: "Hobby tier Vercel cukup untuk produksi",
          },
          {
            i: Zap,
            t: "Auto Deploy",
            d: "Push ke GitHub = otomatis re-deploy",
          },
          { i: Shield, t: "SSL Otomatis", d: "HTTPS terpasang gratis" },
        ].map((b, i) => {
          const Icon = b.i;
          return (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-2">
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900">{b.t}</p>
              <p className="text-xs text-slate-500 mt-0.5">{b.d}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const open = openStep === i;
          return (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => setOpenStep(open ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${open ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-600"}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">{s.title}</h3>
                </div>
                {open ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              {open && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 animate-fade-in">
                  {s.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-2xl p-6">
        <Terminal className="w-8 h-8 mb-3 opacity-80" />
        <h3 className="text-xl font-bold mb-2">Butuh Bantuan?</h3>
        <p className="text-violet-100 text-sm mb-4">
          Hubungi tim support HyperDrop untuk bantuan deployment custom atau
          troubleshooting.
        </p>
        <a
          href="https://vercel.com/help"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-white text-violet-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-violet-50"
        >
          Vercel Help Center <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fadeIn .25s ease }
      `}</style>
    </div>
  );
}

export default Page;
