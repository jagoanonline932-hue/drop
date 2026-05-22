import { useEffect, useState, useRef } from "react";
import {
  ShieldCheck,
  Network,
  Wallet,
  RefreshCcw,
  MapPin,
  GraduationCap,
  Users,
  LayoutDashboard,
  Crown,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Truck,
  Building2,
  Play,
  Star,
  Menu,
  X,
  Rocket,
  Cpu,
  Zap,
} from "lucide-react";
import Footer from "@/components/Footer";

const iconMap = {
  ShieldCheck,
  Network,
  Wallet,
  RefreshCcw,
  MapPin,
  GraduationCap,
  Users,
  LayoutDashboard,
  Sparkles,
  Truck,
  Building2,
  Crown,
  Rocket,
  Cpu,
  Zap,
};

function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTesti, setActiveTesti] = useState(0);

  useEffect(() => {
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data?.sliders?.length || data.sliders.length < 2) return;
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % data.sliders.length);
    }, 6000);
    return () => clearInterval(id);
  }, [data?.sliders?.length]);

  useEffect(() => {
    if (!data?.testimonials?.length || data.testimonials.length < 2) return;
    const id = setInterval(
      () => setActiveTesti((i) => (i + 1) % data.testimonials.length),
      5000,
    );
    return () => clearInterval(id);
  }, [data?.testimonials?.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-3"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p className="text-sm text-slate-500">Memuat HyperDrop...</p>
        </div>
        <style
          jsx
          global
        >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const settings = data?.settings || {};
  const hero = data?.cms?.hero || {};
  const howItWorks = data?.cms?.how_it_works?.steps || [];
  const vipBenefits = data?.cms?.vip_benefits?.items || [];
  const ctaFinal = data?.cms?.cta_final || {};
  const sliders = data?.sliders || [];
  const benefits = data?.benefits || [];
  const testimonials = data?.testimonials || [];
  const faqs = data?.faqs || [];
  const aggregators = data?.aggregators || [];
  const expeditions = data?.expeditions || [];
  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const vipPackages = data?.vipPackages || [];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-xl border-b border-violet-100">
        <nav className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            {settings.site_logo ? (
              <img src={settings.site_logo} alt="HyperDrop" className="h-9" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/40">
                  H
                </div>
                <span className="text-xl font-bold tracking-tight">
                  HyperDrop
                </span>
              </>
            )}
          </a>
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#benefit"
              className="hover:text-violet-600 transition-colors"
            >
              Benefit
            </a>
            <a href="#how" className="hover:text-violet-600 transition-colors">
              Cara Kerja
            </a>
            <a href="#vip" className="hover:text-violet-600 transition-colors">
              VIP
            </a>
            <a
              href="#partner"
              className="hover:text-violet-600 transition-colors"
            >
              Partner
            </a>
            <a
              href="#ecourse"
              className="hover:text-violet-600 transition-colors"
            >
              E-Course
            </a>
            <a href="#faq" className="hover:text-violet-600 transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/account/signin"
              className="hidden sm:inline text-sm font-semibold text-slate-700 hover:text-violet-600"
            >
              Masuk
            </a>
            <a
              href="/account/signup"
              className="hidden sm:inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-violet-500/40 hover:-translate-y-0.5 transition-all"
            >
              Gabung <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-violet-50"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="lg:hidden border-t border-violet-100 bg-white px-6 py-4 space-y-2">
            <a
              href="#benefit"
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Benefit
            </a>
            <a
              href="#how"
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Cara Kerja
            </a>
            <a
              href="#vip"
              className="block py-2 text-sm font-medium text-slate-700"
            >
              VIP
            </a>
            <a
              href="#partner"
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Partner
            </a>
            <a
              href="#faq"
              className="block py-2 text-sm font-medium text-slate-700"
            >
              FAQ
            </a>
            <div className="flex gap-2 pt-3">
              <a
                href="/account/signin"
                className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg border border-violet-200"
              >
                Masuk
              </a>
              <a
                href="/account/signup"
                className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg bg-violet-600 text-white"
              >
                Daftar
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero - Purple Tech */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#0F0B2E] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(167,139,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(167,139,250,1) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in-up">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Cpu className="w-3.5 h-3.5" />
                <span>
                  Platform Dropship Enterprise #1 — Dipercaya 12.500+ Member
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5 text-white">
                {hero.headline ||
                  "Naikkan Order 10x Lipat Tanpa Stok, Tanpa Modal Besar."}
              </h1>
              <p className="text-violet-200/80 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl">
                {hero.subheadline ||
                  "Dropshipper sukses pakai HyperDrop. Dapatkan akses Internal COD VIP, External Aggregator resmi, Smart HOLD Balance, dan OTP WhatsApp otomatis — semua jalan profesional dalam 1 dashboard premium."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href="/account/signup"
                  className="inline-flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-xl shadow-violet-500/40 hover:-translate-y-0.5 transition-all"
                >
                  {hero.cta_primary || "Daftar Gratis — Mulai Sekarang"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/account/signup"
                  className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3.5 rounded-xl font-semibold shadow-xl shadow-amber-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <Crown className="w-4 h-4" />{" "}
                  {hero.cta_secondary || "Upgrade VIP — Profit Lebih Tinggi"}
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border-2 border-violet-400/30 text-violet-200 hover:border-violet-300 hover:bg-white/5 transition-colors"
                >
                  {hero.cta_tertiary || "Lihat Cara Kerjanya"}
                </a>
              </div>
              <div className="flex items-center gap-5 text-xs text-violet-200/70 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-[#0F0B2E] bg-violet-500"
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-white ml-1">12.500+</span>{" "}
                  Member Aktif
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white ml-1">4.9/5</span>{" "}
                  dari 2.500+ review
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gratis. Tanpa Komitmen.</span>
                </div>
              </div>
            </div>

            <div
              className="relative animate-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              {sliders.length > 0 ? (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-violet-400/20">
                    {sliders.map((s, idx) => (
                      <img
                        key={s.id}
                        src={s.image_url}
                        alt={s.title || "slider"}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === activeSlide ? "opacity-100" : "opacity-0"}`}
                      />
                    ))}
                  </div>
                  {sliders.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {sliders.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`h-1.5 rounded-full transition-all ${idx === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <HeroIllustration />
              )}

              {/* Floating tech cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Smart HOLD Balance</p>
                  <p className="text-sm font-bold text-slate-900">Active</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 animate-float-delayed">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Order Hari Ini</p>
                  <p className="text-sm font-bold text-slate-900">+2,847</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Stats */}
      <section className="py-12 bg-[#1A1340] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(167,139,250,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { k: "total_members", default: 12500, label: "Total Member" },
            {
              k: "total_transactions",
              default: 850000,
              label: "Total Transaksi",
            },
            {
              k: "total_shipments",
              default: 1250000,
              label: "Total Pengiriman",
            },
            { k: "total_orders", default: 2100000, label: "Total Order" },
          ].map((s) => (
            <CounterCard
              key={s.k}
              value={stats[s.k]?.value ?? s.default}
              label={stats[s.k]?.label || s.label}
            />
          ))}
        </div>
      </section>

      {/* Benefit */}
      <section id="benefit" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Benefit Platform"
            title="Sistem Enterprise yang Mendukung Bisnis Anda"
            subtitle="Setiap fitur HyperDrop didesain untuk skala dropship profesional Indonesia."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, idx) => {
              const Icon = iconMap[b.icon] || Sparkles;
              return (
                <div
                  key={b.id}
                  className="group bg-white border border-violet-100 rounded-2xl p-6 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 lg:py-28 bg-[#F7F5FC]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Cara Kerja"
            title="Mulai Bisnis Dropship dalam 3 Langkah"
            subtitle="Tanpa modal stok. Tanpa ribet. Tanpa risiko."
          />
          <div className="grid lg:grid-cols-3 gap-6 relative">
            <div className="hidden lg:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-violet-300" />
            {howItWorks.map((s, idx) => (
              <div
                key={idx}
                className="relative bg-white border-2 border-violet-100 rounded-2xl p-7 text-center hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/40">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Benefits */}
      <section
        id="vip"
        className="py-20 lg:py-28 bg-[#0F0B2E] text-white relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(167,139,250,1) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Crown className="w-3.5 h-3.5" /> Exclusive VIP Member
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Upgrade ke{" "}
              <span className="text-amber-400">VIP — Profit 2x Lipat</span>
            </h2>
            <p className="text-violet-200/70 max-w-2xl mx-auto">
              Buka akses Internal COD eksklusif, SPX Gratis Return Bolak-balik,
              produk premium margin tinggi, dan komisi referral besar. Investasi
              sekali, untung selamanya.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="grid sm:grid-cols-2 gap-3">
              {(vipBenefits.length
                ? vipBenefits
                : [
                    "Internal COD",
                    "SPX Free RTS",
                    "Produk Premium",
                    "Priority Support",
                    "Referral Commission",
                    "VIP E-course",
                  ]
              ).map((b, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-violet-400/20 rounded-xl p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-violet-300 shrink-0" />
                  <span className="text-sm font-semibold">{b}</span>
                </div>
              ))}
            </div>
            {vipPackages[0] && (
              <div className="bg-amber-400 rounded-3xl p-8 text-slate-900 shadow-2xl shadow-amber-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    VIP Member
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1">
                  {vipPackages[0].name}
                </h3>
                <p className="text-slate-800 text-sm mb-5">
                  {vipPackages[0].description}
                </p>
                <p className="text-5xl font-bold mb-1">
                  Rp {Number(vipPackages[0].price).toLocaleString("id-ID")}
                </p>
                <p className="text-sm font-medium text-slate-800 mb-6">
                  /{vipPackages[0].duration_days} hari
                </p>
                <a
                  href="/account/signup"
                  className="block w-full bg-[#0F0B2E] text-white py-3.5 rounded-xl font-bold text-center hover:bg-[#1A1340] transition-colors"
                >
                  Upgrade Sekarang
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Partner */}
      <section id="partner" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Partner Resmi"
            title="Aggregator & Ekspedisi Terintegrasi"
            subtitle="HyperDrop bekerja sama dengan partner terpercaya untuk skala enterprise."
          />

          <div className="mb-12">
            <p className="text-center text-xs font-semibold text-violet-500 uppercase tracking-widest mb-6">
              External Aggregator
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {aggregators.map((a) => (
                <PartnerLogo key={a.id} name={a.name} logo={a.logo} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-center text-xs font-semibold text-violet-500 uppercase tracking-widest mb-6">
              Ekspedisi Partner
            </p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
              {expeditions.map((e) => (
                <PartnerLogo key={e.id} name={e.name} logo={e.logo} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* E-Course */}
      <section id="ecourse" className="py-20 lg:py-28 bg-[#F7F5FC]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="E-Course Premium"
            title="Belajar Dropship dari Praktisi"
            subtitle="Akses modul lengkap dengan progress tracking dan video premium."
          />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-4 mb-6">
                {[
                  {
                    title: "Modul Lengkap A-Z",
                    desc: "Dari dasar dropship hingga scale enterprise",
                  },
                  {
                    title: "Video Premium",
                    desc: "Belajar dengan video kualitas tinggi",
                  },
                  {
                    title: "Progress Tracking",
                    desc: "Pantau kemajuan belajar Anda realtime",
                  },
                  {
                    title: "Sertifikat",
                    desc: "Dapatkan sertifikat resmi HyperDrop",
                  },
                ].map((it, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{it.title}</p>
                      <p className="text-sm text-slate-500">{it.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/account/signup"
                className="inline-flex items-center gap-2 bg-[#0F0B2E] hover:bg-[#1A1340] text-white px-5 py-3 rounded-xl font-semibold"
              >
                <GraduationCap className="w-4 h-4" /> Mulai Belajar
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(courses.length
                ? courses
                : Array(4).fill({ title: "Modul E-Course" })
              )
                .slice(0, 4)
                .map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-violet-100 overflow-hidden hover:shadow-lg hover:shadow-violet-500/10 transition-shadow"
                  >
                    <div className="aspect-video bg-violet-600 flex items-center justify-center text-white">
                      <Play className="w-10 h-10 opacity-80" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold text-violet-600 mb-1">
                        {c.is_vip_only ? "VIP ONLY" : "Free"}
                      </p>
                      <p className="font-bold text-slate-900 text-sm">
                        {c.title || `Modul ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Testimoni"
            title="Apa Kata Member HyperDrop"
            subtitle="Ribuan dropshipper sudah merasakan dampaknya. Saatnya giliran Anda."
          />
          {testimonials.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-violet-50 border border-violet-200 rounded-3xl p-8 lg:p-12">
                <div className="flex justify-center mb-5">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                </div>
                <blockquote className="text-center text-xl lg:text-2xl font-medium text-slate-800 mb-6 leading-relaxed">
                  "{testimonials[activeTesti].content}"
                </blockquote>
                <div className="text-center">
                  <p className="font-bold text-slate-900">
                    {testimonials[activeTesti].name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {testimonials[activeTesti].role}
                  </p>
                </div>
              </div>
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTesti(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === activeTesti ? "w-6 bg-violet-600" : "w-1.5 bg-violet-200"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 bg-[#F7F5FC]">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeader
            badge="FAQ"
            title="Pertanyaan yang Sering Diajukan"
            subtitle="Belum jelas? Cek jawabannya di sini."
          />
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div
                key={f.id}
                className="bg-white border border-violet-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-violet-50/40"
                >
                  <span className="font-semibold text-slate-900 text-sm lg:text-base">
                    {f.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-violet-500 shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-96" : "max-h-0"}`}
                >
                  <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                    {f.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-28 bg-violet-600 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            {ctaFinal.headline ||
              "Mulai Bangun Bisnis Dropship Profesional Bersama HyperDrop"}
          </h2>
          <p className="text-violet-100 text-lg mb-8 max-w-2xl mx-auto">
            Daftar gratis sekarang, mulai jualan dalam 5 menit. Tanpa modal
            stok, tanpa risiko.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="/account/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 px-7 py-3.5 rounded-xl font-bold shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              <Rocket className="w-4 h-4" />{" "}
              {ctaFinal.cta_primary || "Daftar Sekarang"}
            </a>
            <a
              href="/account/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#0F0B2E] text-amber-300 px-7 py-3.5 rounded-xl font-bold hover:-translate-y-0.5 transition-all"
            >
              <Crown className="w-4 h-4" />{" "}
              {ctaFinal.cta_secondary || "Upgrade VIP"}
            </a>
          </div>
        </div>
      </section>

      <Footer settings={settings} />

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes inUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .animate-float { animation: float 4s ease-in-out infinite }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite .5s }
        .animate-in-up { animation: inUp .8s cubic-bezier(.16,.84,.44,1) backwards }
      `}</style>
    </div>
  );
}

function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-12 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-violet-200">
        {badge}
      </div>
      <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
        {title}
      </h2>
      <p className="text-slate-500">{subtitle}</p>
    </div>
  );
}

function CounterCard({ value, label }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const duration = 1500;
        const startTs = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTs;
          if (elapsed >= duration) {
            setDisplay(value);
            return;
          }
          const progress = elapsed / duration;
          setDisplay(Math.floor(value * (1 - Math.pow(1 - progress, 3))));
          requestAnimationFrame(tick);
        };
        tick();
        obs.disconnect();
      }
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl lg:text-5xl font-bold tracking-tight tabular-nums text-white">
        {display.toLocaleString("id-ID")}+
      </p>
      <p className="text-xs lg:text-sm text-violet-200/70 mt-1">{label}</p>
    </div>
  );
}

function PartnerLogo({ name, logo }) {
  return (
    <div className="bg-white border border-violet-100 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-violet-400 hover:shadow-md transition-all aspect-[2/1]">
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="max-h-12 max-w-full object-contain"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Truck className="w-5 h-5 text-violet-500" />
        </div>
      )}
      <span className="text-xs font-semibold text-slate-700 text-center">
        {name}
      </span>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="aspect-[4/3] rounded-3xl bg-violet-50 border-2 border-violet-200 shadow-2xl flex items-center justify-center p-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #7c3aed 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative grid grid-cols-2 gap-4 w-full max-w-md">
        {[ShieldCheck, Network, Wallet, Truck].map((Icon, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-900">
                {["COD VIP", "Aggregator", "Saldo", "Ekspedisi"][i]}
              </p>
              <p className="text-slate-400">Active</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
