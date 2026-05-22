import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Save, Loader2 } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/stats" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [stats, setStats] = useState([]);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats || []));
  }, []);

  const save = async (s) => {
    setSaving(s.id);
    await fetch("/api/admin/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stat_key: s.stat_key,
        stat_value: Number(s.stat_value),
        label: s.label,
      }),
    });
    setSaving(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-emerald-500" /> Trusted Stats
          Homepage
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update angka statistik yang ditampilkan di homepage.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((s, idx) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5"
          >
            <p className="text-xs text-slate-500 mb-2">{s.stat_key}</p>
            <input
              type="number"
              value={s.stat_value}
              onChange={(e) => {
                const arr = [...stats];
                arr[idx] = { ...s, stat_value: e.target.value };
                setStats(arr);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-lg font-bold mb-2"
            />
            <input
              value={s.label || ""}
              onChange={(e) => {
                const arr = [...stats];
                arr[idx] = { ...s, label: e.target.value };
                setStats(arr);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mb-2"
              placeholder="Label"
            />
            <button
              onClick={() => save(s)}
              disabled={saving === s.id}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
            >
              {saving === s.id ? (
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
        ))}
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default Page;
