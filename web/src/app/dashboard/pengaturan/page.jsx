import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  User,
  MapPin,
  CreditCard,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Camera,
  Upload,
  X,
} from "lucide-react";

function PengaturanPage() {
  return (
    <DashboardLayout currentPath="/dashboard/pengaturan">
      {({ profile, refetch }) => <Inner profile={profile} refetch={refetch} />}
    </DashboardLayout>
  );
}

function Inner({ profile, refetch }) {
  const [form, setForm] = useState({
    full_name: profile.full_name || profile.name || "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp || "",
    province: profile.province || "",
    city: profile.city || "",
    district: profile.district || "",
    postal_code: profile.postal_code || "",
    address: profile.address || "",
    bank_name: profile.bank_name || "",
    bank_account_number: profile.bank_account_number || "",
    bank_account_holder: profile.bank_account_holder || "",
    avatar: profile.avatar || profile.image || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const profileIncomplete =
    !form.full_name || !form.phone || !form.bank_account_number;

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const r = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("Gagal menyimpan");
      setSuccess(true);
      if (refetch) refetch();
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: reader.result, file_name: file.name }),
        });
        const d = await r.json();
        if (r.ok) {
          setForm((f) => ({ ...f, avatar: d.url }));
          // Auto save avatar immediately
          await fetch("/api/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar: d.url }),
          });
          if (refetch) refetch();
        } else {
          setError(d.error || "Upload gagal");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      setError(err.message);
    }
  };

  const removeAvatar = async () => {
    setForm((f) => ({ ...f, avatar: "" }));
    await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: "" }),
    });
    if (refetch) refetch();
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const initial = (form.full_name || profile.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-700" /> Pengaturan Akun
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola profil, foto, alamat, dan data rekening Anda.
        </p>
      </div>

      {profileIncomplete && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Lengkapi Profil Anda</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Data lengkap dibutuhkan untuk withdraw &amp; order external.
            </p>
          </div>
        </div>
      )}

      {/* AVATAR SECTION */}
      <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex items-center gap-5 flex-wrap">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center shadow-2xl">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">{initial}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-white text-violet-700 w-9 h-9 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition">
              {uploading ? (
                <Loader2
                  className="w-4 h-4"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold truncate">
              {form.full_name || profile.email}
            </p>
            <p className="text-violet-200 text-sm">{profile.email}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <label className="bg-white text-violet-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 hover:bg-violet-50 transition">
                <Upload className="w-3.5 h-3.5" /> Ubah Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {form.avatar && (
                <button
                  onClick={removeAvatar}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <X className="w-3.5 h-3.5" /> Hapus
                </button>
              )}
            </div>
            <p className="text-[10px] text-violet-200 mt-2">
              Format: JPG, PNG. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Section title="Profil Akun" icon={User}>
          <Input
            label="Nama Lengkap"
            value={form.full_name}
            onChange={(v) => update("full_name", v)}
          />
          <Input
            label="No HP"
            value={form.phone}
            onChange={(v) => update("phone", v)}
          />
          <Input
            label="No WhatsApp"
            value={form.whatsapp}
            onChange={(v) => update("whatsapp", v)}
            hint="Untuk OTP withdraw & notifikasi"
          />
          <Input label="Email" value={profile.email} disabled />
        </Section>

        <Section title="Alamat" icon={MapPin}>
          <Input
            label="Provinsi"
            value={form.province}
            onChange={(v) => update("province", v)}
          />
          <Input
            label="Kota/Kab"
            value={form.city}
            onChange={(v) => update("city", v)}
          />
          <Input
            label="Kecamatan"
            value={form.district}
            onChange={(v) => update("district", v)}
          />
          <Input
            label="Kode Pos"
            value={form.postal_code}
            onChange={(v) => update("postal_code", v)}
          />
          <Input
            label="Alamat Lengkap"
            value={form.address}
            onChange={(v) => update("address", v)}
            textarea
          />
        </Section>

        <Section title="Rekening Bank (Untuk Withdraw)" icon={CreditCard}>
          <Input
            label="Nama Bank"
            value={form.bank_name}
            onChange={(v) => update("bank_name", v)}
            placeholder="BCA, Mandiri, BRI..."
          />
          <Input
            label="Nomor Rekening"
            value={form.bank_account_number}
            onChange={(v) => update("bank_account_number", v)}
          />
          <Input
            label="Nama Pemilik"
            value={form.bank_account_holder}
            onChange={(v) => update("bank_account_holder", v)}
          />
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-2">
            ℹ️ Data ini akan otomatis dipakai saat withdraw saldo.
          </p>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && <span className="text-sm text-rose-600">{error}</span>}
        {success && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Tersimpan
          </span>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition"
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
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </>
          )}
        </button>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          .animate-fade-in { animation: fadeIn .25s ease }
        `}</style>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
      <h3 className="font-bold text-slate-900 inline-flex items-center gap-2">
        <Icon className="w-5 h-5 text-violet-500" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  hint,
  ...rest
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
          {...rest}
        />
      )}
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default PengaturanPage;
