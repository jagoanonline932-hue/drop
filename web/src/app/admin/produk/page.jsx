import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  Crown,
  Loader2,
  Image as ImageIcon,
  X,
  Sparkles,
} from "lucide-react";

function AdminProducts() {
  return (
    <DashboardLayout currentPath="/admin/produk" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [refs, setRefs] = useState({
    warehouses: [],
    aggregators: [],
    expeditions: [],
    categories: [],
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/products?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/warehouses").then((r) => r.json()),
      fetch("/api/admin/aggregators").then((r) => r.json()),
      fetch("/api/admin/expeditions").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) =>
        r.ok ? r.json() : { categories: [] },
      ),
    ]).then(([w, a, e, c]) =>
      setRefs({
        warehouses: w.warehouses || [],
        aggregators: a.aggregators || [],
        expeditions: e.expeditions || [],
        categories: c.categories || [],
      }),
    );
  }, []);

  const del = async (p) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Hapus produk ${p.name}?`)
    )
      return;
    await fetch(`/api/admin/products?id=${p.id}`, { method: "DELETE" });
    load();
  };

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-500" /> Produk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola katalog produk dropship.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Gambar</th>
                <th className="text-left px-4 py-3">Nama</th>
                <th className="text-left px-4 py-3">Kategori</th>
                <th className="text-right px-4 py-3">Hrg Supplier</th>
                <th className="text-right px-4 py-3">Rekomendasi</th>
                <th className="text-right px-4 py-3">Margin</th>
                <th className="text-center px-4 py-3">Stok</th>
                <th className="text-center px-4 py-3">VIP</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    Memuat...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const margin =
                    Number(p.recommended_price) - Number(p.supplier_price);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {p.main_image ? (
                          <img
                            src={p.main_image}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[260px]">
                        <p className="font-semibold line-clamp-2">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.warehouse_name} • {p.aggregator_name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.category_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmt(p.supplier_price)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-semibold">
                        {fmt(p.recommended_price)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-bold">
                        {fmt(margin)}
                      </td>
                      <td className="px-4 py-3 text-center">{p.stock}</td>
                      <td className="px-4 py-3 text-center">
                        {p.is_vip_only ? (
                          <Crown className="w-4 h-4 text-amber-500 mx-auto" />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => {
                              setEditing(p);
                              setOpen(true);
                            }}
                            className="p-1.5 rounded-md bg-blue-50 text-blue-600"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => del(p)}
                            className="p-1.5 rounded-md bg-rose-50 text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Produk" : "Tambah Produk"}
        size="xl"
      >
        <ProductForm
          refs={refs}
          product={editing}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function ProductForm({ refs, product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    warehouse_id: product?.warehouse_id || "",
    aggregator_id: product?.aggregator_id || "",
    supplier_price: product?.supplier_price || 0,
    supplier_price_strike: product?.supplier_price_strike || "",
    recommended_price: product?.recommended_price || 0,
    stock: product?.stock || 0,
    weight: product?.weight || 1000,
    is_vip_only: product?.is_vip_only || false,
    is_premium: product?.is_premium || false,
    is_active: product?.is_active !== false,
    marketing_kit_url: product?.marketing_kit_url || "",
    landing_page_url: product?.landing_page_url || "",
    main_image: product?.main_image || "",
    images: product?.images || [],
    expedition_ids: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleExp = (id) => {
    const cur = new Set(form.expedition_ids || []);
    cur.has(id) ? cur.delete(id) : cur.add(id);
    update("expedition_ids", Array.from(cur));
  };

  const handleFile = async (e, isMain = false) => {
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
        if (r.ok) {
          if (isMain) update("main_image", d.url);
          else update("images", [...(form.images || []), d.url]);
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = product ? { ...form, id: product.id } : form;
      const r = await fetch("/api/admin/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal");
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const margin =
    Number(form.recommended_price || 0) - Number(form.supplier_price || 0);
  const marginPct =
    form.supplier_price > 0
      ? Math.round((margin / form.supplier_price) * 100)
      : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Input
          label="Nama Produk *"
          value={form.name}
          onChange={(v) => update("name", v)}
        />
        <Input
          label="Deskripsi"
          value={form.description}
          onChange={(v) => update("description", v)}
          textarea
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Kategori"
            value={form.category_id}
            onChange={(v) => update("category_id", v)}
            options={refs.categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
          <Select
            label="Gudang"
            value={form.warehouse_id}
            onChange={(v) => update("warehouse_id", v)}
            options={refs.warehouses.map((w) => ({
              value: w.id,
              label: w.name,
            }))}
          />
        </div>
        <Select
          label="Aggregator"
          value={form.aggregator_id}
          onChange={(v) => update("aggregator_id", v)}
          options={refs.aggregators.map((a) => ({
            value: a.id,
            label: a.name,
          }))}
        />
        <div>
          <label className="block text-xs font-semibold mb-1">
            Ekspedisi Tersedia
          </label>
          <div className="flex flex-wrap gap-2">
            {refs.expeditions.map((e) => (
              <label
                key={e.id}
                className={`px-3 py-1.5 rounded-lg border cursor-pointer text-xs ${(form.expedition_ids || []).includes(e.id) ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold" : "border-slate-200"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={(form.expedition_ids || []).includes(e.id)}
                  onChange={() => toggleExp(e.id)}
                />
                {e.name}
                {e.is_vip_only ? " 👑" : ""}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Harga Supplier *"
              type="number"
              value={form.supplier_price}
              onChange={(v) => update("supplier_price", v)}
            />
            <Input
              label="Harga Coret (Opsional)"
              type="number"
              value={form.supplier_price_strike}
              onChange={(v) => update("supplier_price_strike", v)}
            />
          </div>
          <Input
            label="Rekomendasi Harga Jual Member *"
            type="number"
            value={form.recommended_price}
            onChange={(v) => update("recommended_price", v)}
          />
          {margin > 0 && (
            <div className="mt-2 bg-white rounded-lg p-2 text-xs flex justify-between">
              <span className="text-slate-600">Margin Member:</span>
              <span className="font-bold text-emerald-600">
                Rp {margin.toLocaleString("id-ID")} ({marginPct}%)
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Stok"
            type="number"
            value={form.stock}
            onChange={(v) => update("stock", v)}
          />
          <Input
            label="Berat (gram)"
            type="number"
            value={form.weight}
            onChange={(v) => update("weight", v)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Gambar Utama
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e, true)}
              className="flex-1 text-xs file:py-1.5 file:px-2 file:bg-emerald-50 file:text-emerald-700 file:rounded-md file:border-0"
            />
          </div>
          {form.main_image && (
            <img
              src={form.main_image}
              alt=""
              className="mt-2 h-20 rounded-lg"
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Gambar Tambahan
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e, false)}
            className="w-full text-xs file:py-1.5 file:px-2 file:bg-emerald-50 file:text-emerald-700 file:rounded-md file:border-0"
          />
          {(form.images || []).length > 0 && (
            <div className="grid grid-cols-4 gap-1 mt-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    alt=""
                    className="aspect-square rounded-lg object-cover"
                  />
                  <button
                    onClick={() =>
                      update(
                        "images",
                        form.images.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Input
          label="Marketing Kit URL (opsional)"
          value={form.marketing_kit_url}
          onChange={(v) => update("marketing_kit_url", v)}
        />
        <Input
          label="Landing Page URL (opsional)"
          value={form.landing_page_url}
          onChange={(v) => update("landing_page_url", v)}
        />

        <div className="space-y-2 bg-slate-50 rounded-xl p-3">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_vip_only}
              onChange={(e) => update("is_vip_only", e.target.checked)}
              className="w-4 h-4 rounded"
            />{" "}
            VIP Only (hanya untuk VIP Member)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_premium}
              onChange={(e) => update("is_premium", e.target.checked)}
              className="w-4 h-4 rounded"
            />{" "}
            Produk Premium
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="w-4 h-4 rounded"
            />{" "}
            Aktif
          </label>
        </div>
      </div>

      <div className="lg:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
        {error && (
          <span className="text-sm text-rose-600 mr-auto">{error}</span>
        )}
        <button
          onClick={onClose}
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
            "Simpan Produk"
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

function Input({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
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
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) =>
            onChange(
              type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          {...rest}
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
      >
        <option value="">— Pilih —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AdminProducts;
