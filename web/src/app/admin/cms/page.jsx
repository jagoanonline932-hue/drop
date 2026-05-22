import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Save, Loader2, Plus, Trash2 } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/cms" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [cms, setCms] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms")
      .then((r) => r.json())
      .then((d) => setCms(d.cms || {}));
  }, []);

  const update = (section, content) =>
    setCms((c) => ({ ...c, [section]: content }));

  const saveSection = async (section) => {
    setSaving(true);
    await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, content: cms[section] }),
    });
    setSaving(false);
  };

  const hero = cms.hero || {};
  const how = cms.how_it_works || { steps: [] };
  const vip = cms.vip_benefits || { items: [] };
  const ctaFinal = cms.cta_final || {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-500" /> Homepage CMS
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola konten homepage secara langsung. Perubahan tersinkron dengan
          tampilan.
        </p>
      </div>

      {/* Hero */}
      <Card title="Hero Section">
        <Inp
          label="Headline"
          value={hero.headline}
          onChange={(v) => update("hero", { ...hero, headline: v })}
        />
        <Inp
          label="Subheadline"
          value={hero.subheadline}
          onChange={(v) => update("hero", { ...hero, subheadline: v })}
          textarea
        />
        <div className="grid grid-cols-3 gap-2">
          <Inp
            label="CTA Primary"
            value={hero.cta_primary}
            onChange={(v) => update("hero", { ...hero, cta_primary: v })}
          />
          <Inp
            label="CTA Secondary"
            value={hero.cta_secondary}
            onChange={(v) => update("hero", { ...hero, cta_secondary: v })}
          />
          <Inp
            label="CTA Tertiary"
            value={hero.cta_tertiary}
            onChange={(v) => update("hero", { ...hero, cta_tertiary: v })}
          />
        </div>
        <SaveBtn onClick={() => saveSection("hero")} saving={saving} />
      </Card>

      {/* How it works */}
      <Card title="Cara Kerja (3 Langkah)">
        {(how.steps || []).map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-2 mb-2 p-3 bg-slate-50 rounded-xl"
          >
            <Inp
              label={`Step ${i + 1} - Judul`}
              value={s.title}
              onChange={(v) => {
                const arr = [...how.steps];
                arr[i] = { ...arr[i], title: v };
                update("how_it_works", { ...how, steps: arr });
              }}
            />
            <Inp
              label="Deskripsi"
              value={s.description}
              onChange={(v) => {
                const arr = [...how.steps];
                arr[i] = { ...arr[i], description: v };
                update("how_it_works", { ...how, steps: arr });
              }}
            />
            <button
              onClick={() =>
                update("how_it_works", {
                  ...how,
                  steps: how.steps.filter((_, idx) => idx !== i),
                })
              }
              className="text-xs text-rose-600 col-span-2 text-left inline-flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            update("how_it_works", {
              ...how,
              steps: [...(how.steps || []), { title: "", description: "" }],
            })
          }
          className="text-xs bg-slate-100 px-3 py-1.5 rounded-md inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Tambah Step
        </button>
        <SaveBtn onClick={() => saveSection("how_it_works")} saving={saving} />
      </Card>

      {/* VIP Benefits */}
      <Card title="VIP Benefits (List)">
        {(vip.items || []).map((it, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={it}
              onChange={(e) => {
                const arr = [...vip.items];
                arr[i] = e.target.value;
                update("vip_benefits", { items: arr });
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
            <button
              onClick={() =>
                update("vip_benefits", {
                  items: vip.items.filter((_, idx) => idx !== i),
                })
              }
              className="p-2 bg-rose-50 text-rose-600 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            update("vip_benefits", { items: [...(vip.items || []), ""] })
          }
          className="text-xs bg-slate-100 px-3 py-1.5 rounded-md inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Tambah
        </button>
        <SaveBtn onClick={() => saveSection("vip_benefits")} saving={saving} />
      </Card>

      {/* CTA Final */}
      <Card title="CTA Final">
        <Inp
          label="Headline"
          value={ctaFinal.headline}
          onChange={(v) => update("cta_final", { ...ctaFinal, headline: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Inp
            label="CTA Primary"
            value={ctaFinal.cta_primary}
            onChange={(v) =>
              update("cta_final", { ...ctaFinal, cta_primary: v })
            }
          />
          <Inp
            label="CTA Secondary"
            value={ctaFinal.cta_secondary}
            onChange={(v) =>
              update("cta_final", { ...ctaFinal, cta_secondary: v })
            }
          />
        </div>
        <SaveBtn onClick={() => saveSection("cta_final")} saving={saving} />
      </Card>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <h3 className="font-bold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
function Inp({ label, value, onChange, textarea = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
      )}
    </div>
  );
}
function SaveBtn({ onClick, saving }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
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
          <Save className="w-4 h-4" /> Simpan Section
        </>
      )}
    </button>
  );
}

export default Page;
