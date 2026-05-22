import { useState, useEffect } from "react";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer({ settings: serverSettings = null }) {
  const [settings, setSettings] = useState(serverSettings || {});

  useEffect(() => {
    if (!serverSettings) {
      fetch("/api/settings/public")
        .then((r) => r.json())
        .then((d) => setSettings(d.settings || {}))
        .catch(() => {});
    }
  }, [serverSettings]);

  const copyright =
    settings.copyright_text ||
    "© PT. Digitalindo Nusa Trivela — Hak Cipta Dilindungi — Developer By Atedy";

  return (
    <footer className="bg-[#0F0B2E] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(167,139,250,0.5) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="HyperDrop"
                  className="h-10"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/40">
                    H
                  </div>
                  <span className="text-2xl font-bold tracking-tight">
                    HyperDrop
                  </span>
                </>
              )}
            </div>
            <p className="text-violet-200/70 text-sm leading-relaxed mb-4">
              {settings.site_tagline || "Naikkan Order Tanpa Gudang"}. Platform
              dropship enterprise modern Indonesia.
            </p>
            <div className="flex gap-3">
              {settings.company_instagram && (
                <a
                  href={settings.company_instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-violet-500 transition-colors flex items-center justify-center"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.company_facebook && (
                <a
                  href={settings.company_facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-violet-500 transition-colors flex items-center justify-center"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">
              Perusahaan
            </h4>
            <ul className="space-y-3 text-sm text-violet-200/70">
              <li>
                <a href="/" className="hover:text-violet-300 transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="/#benefit"
                  className="hover:text-violet-300 transition-colors"
                >
                  Benefit
                </a>
              </li>
              <li>
                <a
                  href="/#vip"
                  className="hover:text-violet-300 transition-colors"
                >
                  VIP Member
                </a>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="hover:text-violet-300 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Akun</h4>
            <ul className="space-y-3 text-sm text-violet-200/70">
              <li>
                <a
                  href="/account/signin"
                  className="hover:text-violet-300 transition-colors"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/account/signup"
                  className="hover:text-violet-300 transition-colors"
                >
                  Daftar
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-violet-300 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/tutorial"
                  className="hover:text-violet-300 transition-colors"
                >
                  Tutorial
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Kontak</h4>
            <ul className="space-y-3 text-sm text-violet-200/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <span>
                  {settings.company_address ||
                    "Kramatmulya, Kabupaten Kuningan, Jawa Barat"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-violet-400 shrink-0" />
                <span>{settings.company_phone || "+62 812-3456-7890"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                <span>{settings.company_email || "support@hyperdrop.id"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-violet-300/60">
          <p>{copyright}</p>
          <p>{settings.company_name || "PT. Digitalindo Nusa Trivela"}</p>
        </div>
      </div>
    </footer>
  );
}
