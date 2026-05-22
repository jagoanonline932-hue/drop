import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Image as ImageIcon,
  Upload as UploadIcon,
  Loader2,
} from "lucide-react";

/**
 * Generic CRUD table for admin pages.
 * Props:
 *  - endpoint: string (e.g. "/api/admin/warehouses")
 *  - listKey: key in response for list (e.g. "warehouses")
 *  - itemKey: key in response for single (e.g. "warehouse")
 *  - title: page title
 *  - icon: lucide icon component
 *  - columns: [{ key, label, render?(row), type? }]
 *  - fields: [{ name, label, type, required?, options?, ... }]
 */
export default function AdminCRUD({
  endpoint,
  listKey,
  itemKey,
  title,
  icon: Icon,
  columns,
  fields,
  searchFn = null,
  refSel = null,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setItems(d[listKey] || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    const empty = {};
    fields.forEach((f) => {
      empty[f.name] = f.default ?? (f.type === "boolean" ? true : "");
    });
    setForm(empty);
    setError(null);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    const filled = {};
    fields.forEach((f) => {
      filled[f.name] = row[f.name] ?? (f.type === "boolean" ? false : "");
    });
    setForm(filled);
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = editing ? { ...form, id: editing.id } : form;
      const r = await fetch(endpoint, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal menyimpan");
      setOpen(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (row) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Hapus ${row[columns[0].key] || row.id}?`)
    )
      return;
    const r = await fetch(`${endpoint}?id=${row.id}`, { method: "DELETE" });
    if (r.ok) load();
  };

  const filtered = search
    ? items.filter((r) =>
        Object.values(r).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : items;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            {Icon && <Icon className="w-7 h-7 text-emerald-500" />} {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data {title.toLowerCase()}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600 sticky top-0">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-${c.align || "left"}`}
                  >
                    {c.label}
                  </th>
                ))}
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center py-10 text-slate-400"
                  >
                    Memuat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center py-10 text-slate-400"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-3 text-${c.align || "left"}`}
                      >
                        {c.render ? (
                          c.render(row)
                        ) : c.type === "boolean" ? (
                          row[c.key] ? (
                            "✓"
                          ) : (
                            "✗"
                          )
                        ) : c.type === "image" ? (
                          row[c.key] ? (
                            <img src={row[c.key]} alt="" className="h-8" />
                          ) : (
                            "—"
                          )
                        ) : c.type === "currency" ? (
                          "Rp " +
                          Number(row[c.key] || 0).toLocaleString("id-ID")
                        ) : c.type === "date" ? (
                          new Date(row[c.key]).toLocaleString("id-ID")
                        ) : (
                          (row[c.key] ?? "—")
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => del(row)}
                          className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${title}` : `Tambah ${title}`}
        size="lg"
      >
        <div className="space-y-3">
          {fields.map((f) => (
            <Field
              key={f.name}
              field={f}
              value={form[f.name]}
              onChange={(v) => setForm({ ...form, [f.name]: v })}
              refSel={refSel}
            />
          ))}
          {error && (
            <div className="bg-rose-50 text-rose-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
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
                "Simpan"
              )}
            </button>
          </div>
          <style
            jsx
            global
          >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </Modal>
    </div>
  );
}

function Field({ field, value, onChange, refSel }) {
  const { name, label, type, options, required, hint, placeholder, accept } =
    field;
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: reader.result, file_name: f.name }),
        });
        const d = await r.json();
        if (r.ok) onChange(d.url);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  if (type === "boolean") {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded text-emerald-500"
        />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </label>
    );
  }
  if (type === "image" || type === "file") {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept={accept || "image/*"}
            onChange={handleFile}
            className="flex-1 text-xs file:py-2 file:px-3 file:bg-emerald-50 file:text-emerald-700 file:rounded-lg file:border-0"
          />
          {uploading && (
            <Loader2
              className="w-4 h-4 text-blue-500"
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}
        </div>
        {value && (
          <div className="mt-2">
            <img src={value} alt="" className="h-16 rounded-lg border" />
          </div>
        )}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="atau paste URL"
          className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
        />
      </div>
    );
  }
  if (type === "select") {
    const opts = typeof options === "function" ? options(refSel) : options;
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        >
          <option value="">— Pilih —</option>
          {opts?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      </div>
    );
  }
  if (type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type || "text"}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            type === "number"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value,
          )
        }
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
