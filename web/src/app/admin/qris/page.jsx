import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { QrCode, Save, Loader2 } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/qris" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [form, setForm] = useState({
    name: "QRIS",
    qris_image: "",
    logo: "",
    is_maintenance: false,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/qris")
      .then((r) => r.json())
      .then((d) => {
        if (d.qris) setForm(d.qris);
      });
  }, []);

  const upload = async (file, key) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: reader.result, file_name: file.name }),
      });
      const d = await r.json();
      if (r.ok) setForm((f) => ({ ...f, [key]: d.url }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/qris", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (typeof window !== "undefined") window.alert("Tersimpan");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <QrCode className="w-7 h-7 text-purple-500" /> QRIS Manual
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Setup QRIS manual untuk pembayaran.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-2xl space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-1">
            Nama (mis. "QRIS Resmi")
          </label>
          <input
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Gambar QRIS
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && upload(e.target.files[0], "qris_image")
            }
            className="w-full text-xs file:py-2 file:px-3 file:bg-emerald-50 file:text-emerald-700 file:rounded-lg file:border-0"
          />
          {form.qris_image && (
            <img
              src={form.qris_image}
              alt=""
              className="mt-2 max-w-xs rounded-lg border"
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Logo QRIS (opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && upload(e.target.files[0], "logo")
            }
            className="w-full text-xs file:py-2 file:px-3 file:bg-emerald-50 file:text-emerald-700 file:rounded-lg file:border-0"
          />
          {form.logo && (
            <img
              src={form.logo}
              alt=""
              className="mt-2 h-12 rounded-lg border"
            />
          )}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.is_maintenance}
            onChange={(e) =>
              setForm({ ...form, is_maintenance: e.target.checked })
            }
            className="w-4 h-4"
          />{" "}
          Mode Maintenance
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4"
          />{" "}
          Aktif
        </label>
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
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default Page;
