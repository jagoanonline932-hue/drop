import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

const GROUPS = {
  Branding: [
    "site_name",
    "site_tagline",
    "site_logo",
    "site_logo_dark",
    "site_favicon",
    "copyright_text",
  ],
  Perusahaan: [
    "company_name",
    "company_address",
    "company_phone",
    "company_email",
    "company_whatsapp",
    "company_instagram",
    "company_facebook",
    "company_tiktok",
  ],
  "Sistem Order": [
    "cod_fee_percent",
    "packing_fee",
    "referral_commission",
    "vip_price",
  ],
  Keuangan: ["min_topup", "min_withdraw", "withdraw_fee"],
};

const IMAGE_KEYS = ["site_logo", "site_logo_dark", "site_favicon"];

function AdminSettings() {
  return (
    <DashboardLayout currentPath="/admin/settings" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const update = (k, v) => setSettings({ ...settings, [k]: v });

  const handleFile = async (key, file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: reader.result, file_name: file.name }),
      });
      const d = await r.json();
      if (r.ok) update(key, d.url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Settings className="w-7 h-7 text-slate-700" /> Pengaturan Site
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengaturan global website, fee, dan branding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <span className="text-sm text-emerald-600 font-semibold inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Tersimpan
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 disabled:opacity-50"
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
        </div>
      </div>

      {Object.entries(GROUPS).map(([group, keys]) => (
        <div
          key={group}
          className="bg-white rounded-2xl border border-slate-200 p-5"
        >
          <h3 className="font-bold text-slate-900 mb-3">{group}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {keys.map((k) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {labelFor(k)}
                </label>
                {IMAGE_KEYS.includes(k) ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFile(k, e.target.files[0])
                      }
                      className="w-full text-xs file:py-2 file:px-3 file:bg-emerald-50 file:text-emerald-700 file:rounded-lg file:border-0 file:font-semibold"
                    />
                    {settings[k] && (
                      <img
                        src={settings[k]}
                        alt=""
                        className="h-12 mt-2 rounded-lg border"
                      />
                    )}
                    <input
                      type="text"
                      value={settings[k] || ""}
                      onChange={(e) => update(k, e.target.value)}
                      placeholder="atau paste URL"
                      className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                ) : (
                  <input
                    type={isNumeric(k) ? "number" : "text"}
                    value={settings[k] || ""}
                    onChange={(e) => update(k, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function labelFor(key) {
  const map = {
    site_name: "Nama Site",
    site_tagline: "Tagline",
    site_logo: "Logo Site",
    site_logo_dark: "Logo Dark",
    site_favicon: "Favicon",
    copyright_text: "Copyright Footer",
    company_name: "Nama Perusahaan",
    company_address: "Alamat Kantor",
    company_phone: "Telepon",
    company_email: "Email",
    company_whatsapp: "WhatsApp",
    company_instagram: "Instagram URL",
    company_facebook: "Facebook URL",
    company_tiktok: "TikTok URL",
    cod_fee_percent: "COD Fee (%)",
    packing_fee: "Packing Fee (Rp)",
    referral_commission: "Komisi Referral (Rp)",
    vip_price: "Harga Default VIP",
    min_topup: "Min Topup",
    min_withdraw: "Min Withdraw",
    withdraw_fee: "Fee Withdraw",
  };
  return map[key] || key;
}
function isNumeric(key) {
  return [
    "cod_fee_percent",
    "packing_fee",
    "referral_commission",
    "vip_price",
    "min_topup",
    "min_withdraw",
    "withdraw_fee",
  ].includes(key);
}

export default AdminSettings;
