import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { HelpCircle, Save, Plus, Loader2 } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/tooltip" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [list, setList] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newContent, setNewContent] = useState("");
  const load = () =>
    fetch("/api/admin/tooltips")
      .then((r) => r.json())
      .then((d) => setList(d.tooltips || []));
  useEffect(() => {
    load();
  }, []);
  const save = async (key, content, is_active = true) => {
    await fetch("/api/admin/tooltips", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tooltip_key: key, content, is_active }),
    });
    load();
  };
  const add = async () => {
    if (!newKey || !newContent) return;
    await save(newKey, newContent);
    setNewKey("");
    setNewContent("");
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-blue-500" /> Tooltip Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola tooltip helper di seluruh aplikasi.
        </p>
      </div>
      <div className="bg-white rounded-2xl border p-4 space-y-2 max-w-2xl">
        <h3 className="font-bold text-sm">Tambah Tooltip</h3>
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="key (e.g. dashboard.saldo)"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Isi tooltip..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <button
          onClick={add}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>
      <div className="bg-white rounded-2xl border divide-y">
        {list.map((t) => (
          <TooltipRow key={t.id} t={t} onSave={save} />
        ))}
        {list.length === 0 && (
          <p className="text-center py-10 text-slate-400 text-sm">
            Belum ada tooltip
          </p>
        )}
      </div>
    </div>
  );
}

function TooltipRow({ t, onSave }) {
  const [content, setContent] = useState(t.content);
  const [saving, setSaving] = useState(false);
  return (
    <div className="p-4 flex gap-3 items-center">
      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded shrink-0 max-w-[200px] truncate">
        {t.tooltip_key}
      </code>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
      />
      <button
        onClick={async () => {
          setSaving(true);
          await onSave(t.tooltip_key, content, t.is_active);
          setSaving(false);
        }}
        disabled={saving}
        className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
      >
        {saving ? "..." : "Simpan"}
      </button>
    </div>
  );
}

export default Page;
