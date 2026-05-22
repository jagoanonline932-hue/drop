import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { Sparkles, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/varian" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [productFilter, setProductFilter] = useState("");

  const load = () => {
    const p = new URLSearchParams();
    if (productFilter) p.set("product_id", productFilter);
    fetch(`/api/admin/variants?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setVariants(d.variants || []));
  };
  useEffect(() => {
    load();
  }, [productFilter]);
  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  const del = async (v) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Hapus varian ${v.name}?`)
    )
      return;
    await fetch(`/api/admin/variants?id=${v.id}`, { method: "DELETE" });
    load();
  };

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-500" /> Varian Produk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola varian (warna, ukuran, dll) per produk.
          </p>
        </div>
        <button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Varian
        </button>
      </div>

      <select
        value={productFilter}
        onChange={(e) => setProductFilter(e.target.value)}
        className="max-w-md px-3 py-2 rounded-xl border border-slate-200 text-sm"
      >
        <option value="">Semua Produk</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Produk</th>
                <th className="text-left px-4 py-3">Nama Varian</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-right px-4 py-3">Harga</th>
                <th className="text-center px-4 py-3">Stok</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs">{v.product_name}</td>
                  <td className="px-4 py-3 font-semibold">{v.name}</td>
                  <td className="px-4 py-3 text-xs font-mono">
                    {v.sku || "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmt(v.price)}
                  </td>
                  <td className="px-4 py-3 text-center">{v.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => {
                          setEdit(v);
                          setOpen(true);
                        }}
                        className="p-1.5 rounded-md bg-blue-50 text-blue-600"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => del(v)}
                        className="p-1.5 rounded-md bg-rose-50 text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Edit Varian" : "Tambah Varian"}
      >
        <VariantForm
          products={products}
          variant={edit}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function VariantForm({ products, variant, onSaved }) {
  const [form, setForm] = useState({
    product_id: variant?.product_id || "",
    name: variant?.name || "",
    sku: variant?.sku || "",
    price: variant?.price || 0,
    recommended_price: variant?.recommended_price || 0,
    weight: variant?.weight || 1000,
    stock: variant?.stock || 0,
    is_active: variant?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = variant ? { ...form, id: variant.id } : form;
      await fetch("/api/admin/variants", {
        method: variant ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold mb-1">Produk *</label>
        <select
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        >
          <option value="">— Pilih —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <Inp
        label="Nama Varian *"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
      />
      <Inp
        label="SKU"
        value={form.sku}
        onChange={(v) => setForm({ ...form, sku: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Inp
          label="Harga Varian"
          type="number"
          value={form.price}
          onChange={(v) => setForm({ ...form, price: Number(v) })}
        />
        <Inp
          label="Harga Rekomendasi"
          type="number"
          value={form.recommended_price}
          onChange={(v) => setForm({ ...form, recommended_price: Number(v) })}
        />
        <Inp
          label="Berat (gram)"
          type="number"
          value={form.weight}
          onChange={(v) => setForm({ ...form, weight: Number(v) })}
        />
        <Inp
          label="Stok"
          type="number"
          value={form.stock}
          onChange={(v) => setForm({ ...form, stock: Number(v) })}
        />
      </div>
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
        className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
      />
    </div>
  );
}

export default Page;
