import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  Package,
  Search,
  Crown,
  MapPin,
  Clock,
  Truck,
  X,
  Sparkles,
  Copy,
  CheckCircle2,
  Info,
  Zap,
  TrendingUp,
  ShoppingBag,
  Star,
  Filter,
  AlertCircle,
  Building2,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

function ProductsPage() {
  return (
    <DashboardLayout currentPath="/dashboard/produk">
      {({ profile }) => <Inner profile={profile} />}
    </DashboardLayout>
  );
}

function Inner({ profile }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVip, setFilterVip] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailFull, setDetailFull] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadProducts = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openDetail = async (p) => {
    setDetail(p);
    setDetailFull(null);
    try {
      const r = await fetch(`/api/products/${p.id}`);
      const d = await r.json();
      if (r.ok) setDetailFull(d);
    } catch (e) {}
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const filtered = products.filter((p) => {
    if (filterVip === "vip" && !p.is_vip_only) return false;
    if (filterVip === "normal" && p.is_vip_only) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* HERO */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(167,139,250,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.4) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Premium Catalog
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
            Katalog Produk Member
          </h1>
          <p className="text-violet-200 max-w-2xl">
            Pilih produk terkurasi dengan margin terbaik. Semua produk tersedia
            stok &amp; siap kirim dari gudang resmi HyperDrop.
          </p>
          {!profile.vip_status && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-2 rounded-lg text-xs font-semibold">
              <Crown className="w-3.5 h-3.5" />
              Upgrade VIP untuk akses produk premium &amp; profit tinggi
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        {profile.vip_status && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {[
              { v: "", l: "Semua" },
              { v: "vip", l: "VIP Only" },
              { v: "normal", l: "Reguler" },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilterVip(f.v)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition ${filterVip === f.v ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {f.l}
              </button>
            ))}
          </div>
        )}
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          <span className="font-semibold text-slate-700">
            {filtered.length}
          </span>{" "}
          produk
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => openDetail(p)}
              isVip={profile.vip_status}
              fmt={fmt}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name}
        size="xl"
      >
        {detail && (
          <ProductDetail
            product={detail}
            full={detailFull}
            fmt={fmt}
            profile={profile}
            isVip={profile.vip_status}
            onToast={showToast}
          />
        )}
      </Modal>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-toast-in px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.msg}
        </div>
      )}

      <style jsx global>{`
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 20px) } to { opacity: 1; transform: translate(-50%, 0) } }
        .animate-toast-in { animation: toast-in .3s cubic-bezier(.16,.84,.44,1) }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.5) } 50% { box-shadow: 0 0 0 8px rgba(245,158,11,0) } }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite }
      `}</style>
    </div>
  );
}

function ProductCard({ product, onClick, isVip, fmt }) {
  const margin =
    Number(product.recommended_price) - Number(product.supplier_price);
  const marginPct =
    product.supplier_price > 0
      ? Math.round((margin / product.supplier_price) * 100)
      : 0;
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:border-violet-300 transition-all cursor-pointer flex flex-col"
    >
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        {product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
        )}
        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_vip_only && (
            <span className="text-[10px] inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold px-2 py-0.5 rounded-md shadow-md animate-pulse-glow">
              <Crown className="w-3 h-3" /> VIP
            </span>
          )}
          {product.is_premium && (
            <span className="text-[10px] inline-flex items-center gap-0.5 bg-purple-500 text-white font-bold px-2 py-0.5 rounded-md shadow">
              <Sparkles className="w-3 h-3" /> Premium
            </span>
          )}
          {marginPct >= 50 && (
            <span className="text-[10px] inline-flex items-center gap-0.5 bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-md shadow">
              <TrendingUp className="w-3 h-3" /> HOT
            </span>
          )}
        </div>
        {/* Stock badge */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm">
          Stok: {product.stock}
        </div>
        {/* Quick action overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/95 backdrop-blur text-violet-700 text-[11px] font-bold py-1.5 rounded-lg text-center inline-flex items-center justify-center gap-1 w-full">
            <ShoppingBag className="w-3 h-3" /> Lihat Detail
          </div>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-violet-600 font-semibold mb-1 uppercase tracking-wide">
          {product.category_name || "Produk"}
        </p>
        <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 mb-2 min-h-[40px] leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto">
          {product.supplier_price_strike && (
            <p className="text-[10px] line-through text-slate-400">
              {fmt(product.supplier_price_strike)}
            </p>
          )}
          <p className="text-base font-bold text-slate-900">
            {fmt(product.supplier_price)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
            Rekomendasi: {fmt(product.recommended_price)}
          </p>
          {margin > 0 && (
            <div className="mt-1.5 inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700">
                {fmt(margin)} ({marginPct}%)
              </span>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0 text-violet-400" />{" "}
              {product.warehouse_name || "—"}
            </span>
            {product.aggregator_logo ? (
              <img
                src={product.aggregator_logo}
                alt=""
                className="h-4 max-w-[40px] object-contain"
              />
            ) : (
              product.aggregator_name && (
                <span className="text-violet-600 font-semibold truncate">
                  {product.aggregator_name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product, full, fmt, profile, isVip, onToast }) {
  const [activeImg, setActiveImg] = useState(0);
  const [copying, setCopying] = useState("");
  const images = [product.main_image, ...(product.images || [])].filter(
    Boolean,
  );
  const variants = full?.variants || [];
  const expeditions = full?.expeditions || [];
  const warehouse = full?.product;
  const margin =
    Number(product.recommended_price) - Number(product.supplier_price);

  // ALAMAT untuk Aggregator: data warehouse (gudang resmi)
  const warehouseAddress = [
    full?.product?.warehouse_name,
    full?.product?.warehouse_address,
  ]
    .filter(Boolean)
    .join("\n");

  const copyAddress = (text, key) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopying(key);
      onToast?.("Alamat berhasil disalin! Tempelkan di form aggregator.");
      setTimeout(() => setCopying(""), 1500);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden mb-3 relative group">
          {images[activeImg] ? (
            <img
              src={images[activeImg]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-slate-300" />
            </div>
          )}
          {product.is_vip_only && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
              <Crown className="w-3 h-3" /> VIP EXCLUSIVE
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition ${activeImg === i ? "border-violet-500 ring-2 ring-violet-100" : "border-transparent hover:border-slate-200"}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-wide">
            {product.category_name || "Produk"}
          </p>
          <div className="flex gap-1">
            {product.is_vip_only && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                <Crown className="w-3 h-3" /> VIP
              </span>
            )}
            {product.is_premium && (
              <span className="inline-flex items-center gap-1 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                <Sparkles className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 leading-tight">
          {product.name}
        </h2>

        <div className="bg-gradient-to-br from-emerald-50 to-violet-50 border border-emerald-200 rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Modal (Supplier)</p>
              {product.supplier_price_strike && (
                <p className="text-xs line-through text-slate-400">
                  {fmt(product.supplier_price_strike)}
                </p>
              )}
              <p className="text-lg font-bold text-slate-900">
                {fmt(product.supplier_price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-700">Rekomendasi Jual</p>
              <p className="text-lg font-bold text-emerald-700">
                {fmt(product.recommended_price)}
              </p>
            </div>
          </div>
          {margin > 0 && (
            <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Margin
                Profit
              </span>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {fmt(margin)}
              </span>
            </div>
          )}
        </div>

        {/* COPY ALAMAT for External Aggregator */}
        {full?.product?.warehouse_name && (
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-sm">
                  Alamat Gudang (untuk Aggregator External)
                </h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  Copy &amp; tempelkan alamat ini di form pickup aggregator
                  external (mis. Shopee, Tokopedia, Lazada COD).
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-200 mb-2 space-y-1">
              <p className="text-xs font-semibold text-slate-500">
                {full.product.warehouse_name}
              </p>
              {full.product.warehouse_address && (
                <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {full.product.warehouse_address}
                </p>
              )}
              {full.product.warehouse_pickup && (
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pickup:{" "}
                  {full.product.warehouse_pickup}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  copyAddress(
                    `${full.product.warehouse_name}\n${full.product.warehouse_address || ""}`,
                    "addr",
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition shadow"
              >
                {copying === "addr" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Alamat
                  </>
                )}
              </button>
              <button
                onClick={() => copyAddress(product.name, "name")}
                className="bg-white border-2 border-blue-300 hover:bg-blue-50 text-blue-700 px-3 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
              >
                {copying === "name" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Nama Produk
                  </>
                )}
              </button>
            </div>
            <div className="mt-2 bg-blue-100 rounded-lg p-2 text-[11px] text-blue-800 flex gap-1.5 items-start">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Gunakan alamat ini hanya untuk pickup
                dari aggregator external resmi. Jangan share ke pihak lain.
              </span>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {product.description || "—"}
        </p>

        <div className="space-y-2 text-sm mb-4">
          <Row label="Gudang">
            <span>{product.warehouse_name || "—"}</span>
          </Row>
          <Row label="Pickup Time">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{" "}
              {full?.product?.warehouse_pickup || "—"}
            </span>
          </Row>
          <Row label="Aggregator">
            {product.aggregator_logo ? (
              <img src={product.aggregator_logo} alt="" className="h-5" />
            ) : (
              <span>{product.aggregator_name || "—"}</span>
            )}
          </Row>
          <Row label="Stok">
            <span className="font-bold">{product.stock}</span>
          </Row>
          <Row label="Berat">
            <span>{product.weight}g</span>
          </Row>
        </div>

        {variants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2 inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Varian Tersedia
            </p>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="border border-slate-200 rounded-lg p-2 text-xs hover:border-violet-300 transition"
                >
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-emerald-600 font-bold">{fmt(v.price)}</p>
                  <p className="text-slate-400">Stok: {v.stock}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {expeditions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Ekspedisi Tersedia
            </p>
            <div className="flex flex-wrap gap-2">
              {expeditions.map((e) => (
                <div
                  key={e.id}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 text-xs"
                >
                  {e.logo ? (
                    <img
                      src={e.logo}
                      alt=""
                      className="h-4 max-w-[40px] object-contain"
                    />
                  ) : (
                    <Truck className="w-3 h-3" />
                  )}
                  <span className="font-semibold">{e.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(product.marketing_kit_url || product.landing_page_url) && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {product.marketing_kit_url && (
              <a
                href={product.marketing_kit_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-2 rounded-lg text-center transition inline-flex items-center justify-center gap-1"
              >
                📦 Marketing Kit
              </a>
            )}
            {product.landing_page_url && (
              <a
                href={product.landing_page_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-3 py-2 rounded-lg text-center transition inline-flex items-center justify-center gap-1"
              >
                🌐 Landing Page
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {product.is_vip_only && isVip && (
            <a
              href={`/dashboard/internal-cod?product_id=${product.id}`}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-bold text-sm text-center hover:-translate-y-0.5 transition shadow-lg inline-flex items-center justify-center gap-1"
            >
              <Crown className="w-4 h-4" /> Internal COD
            </a>
          )}
          {!product.is_vip_only && (
            <a
              href={`/dashboard/external?product_id=${product.id}`}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold text-sm text-center hover:-translate-y-0.5 transition shadow-lg inline-flex items-center justify-center gap-1"
            >
              <ShoppingBag className="w-4 h-4" /> Order External
            </a>
          )}
          {isVip && !product.is_vip_only && (
            <a
              href={`/dashboard/internal-cod?product_id=${product.id}`}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-sm text-center hover:-translate-y-0.5 transition shadow-lg inline-flex items-center justify-center gap-1"
            >
              <Zap className="w-4 h-4" /> Internal COD
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="font-semibold text-slate-900 text-xs">{children}</span>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="bg-slate-100 rounded-2xl aspect-[3/4]"
            style={{ animation: "pulse 1.5s infinite" }}
          />
        ))}
      <style
        jsx
        global
      >{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
      <p className="font-semibold text-slate-700 mb-1">Belum ada produk</p>
      <p className="text-sm text-slate-500">
        Hubungi admin untuk menambahkan produk ke katalog.
      </p>
    </div>
  );
}

export default ProductsPage;
