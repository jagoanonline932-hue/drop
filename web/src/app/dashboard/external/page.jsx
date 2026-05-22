import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  Network,
  Package,
  User,
  Truck,
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Calculator,
  Lock,
  Info,
  Sparkles,
  ExternalLink,
  MapPin,
  Copy,
  Crown,
  ShieldCheck,
} from "lucide-react";

function ExternalPage() {
  return (
    <DashboardLayout currentPath="/dashboard/external">
      {({ profile }) => <Inner profile={profile} />}
    </DashboardLayout>
  );
}

function Inner({ profile }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState(false);
  const [settings, setSettings] = useState({});
  const [expeditions, setExpeditions] = useState([]);
  const [allExpeditions, setAllExpeditions] = useState([]);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?order_type=external").then((r) => r.json()),
      fetch("/api/orders?type=external_aggregator").then((r) => r.json()),
      fetch("/api/settings/public").then((r) => r.json()),
      fetch("/api/homepage").then((r) => r.json()),
    ])
      .then(([p, o, s, h]) => {
        setProducts(p.products || []);
        setOrders(o.orders || []);
        setSettings(s.settings || {});
        setAllExpeditions(h.expeditions || []);
        // for VIP show all, non-VIP filter VIP-only
        setExpeditions(
          (h.expeditions || []).filter(
            (e) => profile.vip_status || !e.is_vip_only,
          ),
        );
      })
      .finally(() => setLoading(false));
  }, [profile.vip_status]);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold mb-2">
              <Network className="w-3.5 h-3.5" /> External Aggregator
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Order via Partner Aggregator
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              Pembayaran via Saldo HyperDrop — diproses pihak aggregator
              terpercaya.
            </p>
          </div>
          <button
            onClick={() => setOpenOrder(true)}
            className="bg-white text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Buat Order External
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-0.5">Pembayaran via Saldo HyperDrop</p>
          <p>
            Pembelian produk + ongkir akan dipotong langsung dari saldo Anda.
            Pastikan saldo cukup sebelum order.{" "}
            <a href="/dashboard/topup" className="font-bold underline">
              Topup Saldo →
            </a>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Riwayat Order External</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {orders.length} order
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">No. Order</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Produk</th>
                <th className="text-left px-4 py-3">Penerima</th>
                <th className="text-left px-4 py-3">Ekspedisi</th>
                <th className="text-left px-4 py-3">Resi</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Network className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Belum ada order external
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {o.order_number}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(o.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{o.product_name}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs">
                        {o.recipient_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.recipient_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {o.expedition_logo ? (
                        <img
                          src={o.expedition_logo}
                          alt=""
                          className="h-5 max-w-[60px] object-contain"
                        />
                      ) : (
                        <span className="text-xs">
                          {o.expedition_name || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.tracking_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      Rp {Number(o.total_cod).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={openOrder}
        onClose={() => setOpenOrder(false)}
        title="Buat Order External Aggregator"
        size="xl"
      >
        <ExternalForm
          products={products.filter(
            (p) => !p.is_vip_only || profile.vip_status,
          )}
          expeditions={expeditions}
          settings={settings}
          profile={profile}
          onSuccess={(o) => {
            setSuccessOrder(o);
            setOpenOrder(false);
            fetch("/api/orders?type=external_aggregator")
              .then((r) => r.json())
              .then((d) => setOrders(d.orders || []));
          }}
        />
      </Modal>

      <Modal
        open={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        title="Order External Berhasil!"
      >
        {successOrder && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Order Berhasil Dibuat
            </h3>
            <p className="text-slate-600 mb-4">
              No. Order:{" "}
              <span className="font-mono font-bold">
                {successOrder.order_number}
              </span>
            </p>
            <p className="text-2xl font-bold text-blue-600 mb-2">
              Rp {Number(successOrder.total_cod).toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Saldo telah dipotong & order masuk antrean processing aggregator.
            </p>
            <button
              onClick={() => setSuccessOrder(null)}
              className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold"
            >
              OK
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ExternalForm({ products, expeditions, settings, profile, onSuccess }) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [productDetail, setProductDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [shippingCost, setShippingCost] = useState("");
  const [expeditionId, setExpeditionId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [resiPdf, setResiPdf] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Profile data - READ ONLY (auto-filled)
  const profileIncomplete =
    !profile.full_name || !profile.phone || !profile.address || !profile.city;

  const packingFee = Number(settings.packing_fee || 2500);

  useEffect(() => {
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then((r) => r.json())
        .then((d) => setProductDetail(d));
    } else setProductDetail(null);
  }, [productId]);

  const product = productDetail?.product;
  const variants = productDetail?.variants || [];
  const variant = variants.find((v) => v.id === Number(variantId));
  const productPrice = variant
    ? Number(variant.price)
    : Number(product?.supplier_price || 0);
  const totalWeight =
    (variant?.weight || product?.weight || 0) * (Number(quantity) || 1);
  const qty = Number(quantity) || 1;
  const ship = Number(shippingCost) || 0;
  const total = productPrice * qty + ship + packingFee;
  const insufficient = Number(profile.balance) < total;

  const selectedExpedition = expeditions.find(
    (e) => e.id === Number(expeditionId),
  );
  const isSpxVip =
    profile.vip_status &&
    selectedExpedition &&
    /spx/i.test(selectedExpedition.name || "");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, file_name: file.name }),
        });
        const d = await r.json();
        if (r.ok) setResiPdf(d.url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (profileIncomplete) {
      setError(
        "Profil belum lengkap. Lengkapi nama, no HP, dan alamat di Pengaturan.",
      );
      return;
    }
    if (!productId) {
      setError("Pilih produk terlebih dahulu");
      return;
    }
    if (insufficient) {
      setError("Saldo tidak cukup. Mohon topup terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: "external_aggregator",
          product_id: Number(productId),
          variant_id: variantId ? Number(variantId) : null,
          quantity: qty,
          shipping_cost: ship,
          expedition_id: expeditionId ? Number(expeditionId) : null,
          // ALL recipient data from profile - auto
          recipient_name: profile.full_name,
          recipient_phone: profile.phone,
          recipient_email: profile.email,
          recipient_address: profile.address,
          recipient_district: profile.district,
          recipient_city: profile.city,
          recipient_province: profile.province,
          recipient_postal_code: profile.postal_code,
          tracking_number: trackingNumber || null,
          resi_pdf_url: resiPdf || null,
          notes: notes || null,
          payment_method: "balance",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Gagal");
      onSuccess(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Section title="Pilih Produk" icon={Package}>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="">— Pilih Produk —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {variants.length > 0 && (
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mt-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">— Pilih Varian —</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} • Rp {Number(v.price).toLocaleString("id-ID")} (Stok:{" "}
                  {v.stock})
                </option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              label="Quantity"
              type="number"
              value={quantity}
              onChange={setQuantity}
              min={1}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ongkir (Rp)
              </label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          {/* NOTICE CEK ONGKIR */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 text-xs text-amber-800 flex gap-2 items-start">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Cek Ongkir Real-time</p>
              <p>
                Gunakan tool resmi SPX untuk cek ongkir akurat:{" "}
                <a
                  href="https://spx.co.id/spx-esf-tool"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline inline-flex items-center gap-1"
                >
                  spx.co.id/spx-esf-tool <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ekspedisi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {expeditions.map((e) => {
                const active = Number(expeditionId) === e.id;
                const isVipSpx = profile.vip_status && /spx/i.test(e.name);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setExpeditionId(e.id)}
                    className={`relative border-2 rounded-xl p-3 text-left transition ${active ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                  >
                    {isVipSpx && (
                      <span className="absolute -top-2 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> FREE RTS
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {e.logo ? (
                        <img
                          src={e.logo}
                          alt={e.name}
                          className="h-7 max-w-[80px] object-contain"
                        />
                      ) : (
                        <Truck className="w-5 h-5 text-slate-500" />
                      )}
                      <span className="text-xs font-bold text-slate-900">
                        {e.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {isSpxVip && (
              <div className="mt-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl p-3 text-xs animate-pulse-soft shadow-lg shadow-amber-500/30">
                <p className="font-bold inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Bonus Eksklusif VIP — SPX
                  Gratis Return!
                </p>
                <p className="mt-0.5 opacity-90">
                  Paket gagal kirim? Tenang, return bolak-balik gratis tanpa
                  potongan saldo. Khusus member VIP HyperDrop. 🎁
                </p>
              </div>
            )}
          </div>
        </Section>

        <Section title="Data Penerima (Profil Anda)" icon={User} lock>
          {profileIncomplete && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 mb-2 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Profil belum lengkap</p>
                <p>
                  Lengkapi profil di{" "}
                  <a
                    href="/dashboard/pengaturan"
                    className="underline font-bold"
                  >
                    Pengaturan →
                  </a>
                </p>
              </div>
            </div>
          )}
          <ReadOnlyField label="Nama" value={profile.full_name} />
          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField label="No HP" value={profile.phone} />
            <ReadOnlyField label="Email" value={profile.email} />
          </div>
          <ReadOnlyField label="Alamat" value={profile.address} textarea />
          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField label="Kecamatan" value={profile.district} />
            <ReadOnlyField label="Kota/Kab" value={profile.city} />
            <ReadOnlyField label="Provinsi" value={profile.province} />
            <ReadOnlyField label="Kode Pos" value={profile.postal_code} />
          </div>
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-1 flex items-start gap-1.5">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Data penerima otomatis dari profil dan tidak bisa diedit di sini.
            Untuk mengubah, buka{" "}
            <a
              href="/dashboard/pengaturan"
              className="font-bold underline ml-1"
            >
              Pengaturan
            </a>
            .
          </p>
        </Section>

        <Section title="Catatan & Resi (Opsional)" icon={Truck}>
          <Input
            label="No Resi (opsional)"
            value={trackingNumber}
            onChange={setTrackingNumber}
            placeholder="JNE12345678"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pengiriman
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="mis. Titip di pos satpam, jangan dilipat..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Bukti Resi (opsional)
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFile}
              className="w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
            />
            {uploading && (
              <p className="text-xs text-blue-500 mt-1">Mengupload...</p>
            )}
            {resiPdf && (
              <p className="text-xs text-emerald-600 mt-1 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> File uploaded
              </p>
            )}
          </div>
        </Section>
      </div>

      <div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-5 sticky top-4 shadow-2xl shadow-blue-500/20">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" /> Rincian Pembayaran
          </h3>
          <div className="space-y-2 text-sm">
            <Row
              label="Harga Produk"
              value={`Rp ${(productPrice * qty).toLocaleString("id-ID")}`}
            />
            <Row label="Ongkir" value={`Rp ${ship.toLocaleString("id-ID")}`} />
            <Row
              label="Packing Fee"
              value={`Rp ${packingFee.toLocaleString("id-ID")}`}
            />
            <Row
              label="Total Berat"
              value={`${totalWeight.toLocaleString("id-ID")} g`}
            />
            <div className="border-t border-white/20 my-3" />
            <div className="flex items-center justify-between">
              <span className="text-blue-100">Total Dibayar</span>
              <span className="font-bold text-lg">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mt-2">
              <p className="text-xs text-blue-100 mb-1">Metode Pembayaran</p>
              <div className="inline-flex items-center gap-2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                <Wallet className="w-3.5 h-3.5" /> Saldo HyperDrop
              </div>
              <p className="text-[10px] mt-2 opacity-90">
                Saldo Anda: Rp {Number(profile.balance).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          {insufficient && (
            <div className="mt-3 bg-rose-500/20 border border-rose-300 rounded-lg p-2 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Saldo tidak cukup.{" "}
                <a href="/dashboard/topup" className="underline font-bold">
                  Topup dulu
                </a>
              </span>
            </div>
          )}
          {error && (
            <div className="mt-3 bg-rose-500 text-white rounded-lg p-2 text-xs">
              {error}
            </div>
          )}
          <button
            onClick={submit}
            disabled={loading || insufficient || profileIncomplete}
            className="w-full mt-4 bg-white text-blue-700 py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 transition shadow-lg"
          >
            {loading ? (
              <>
                <Loader2
                  className="w-4 h-4"
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Memproses...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Buat Order External
              </>
            )}
          </button>
          <style jsx global>{`
            @keyframes spin { to { transform: rotate(360deg) } }
            @keyframes pulse-soft { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
            .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite }
          `}</style>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, lock }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
      <h4 className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5 mb-1">
        <Icon className="w-4 h-4 text-blue-500" /> {title}
        {lock && <Lock className="w-3 h-3 text-slate-400" />}
      </h4>
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
  ...rest
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          rows={2}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          {...rest}
        />
      )}
    </div>
  );
}

function ReadOnlyField({ label, value, textarea }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 inline-flex items-center gap-1">
        {label} <Lock className="w-3 h-3" />
      </label>
      {textarea ? (
        <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-700 min-h-[48px] whitespace-pre-wrap">
          {value || <span className="text-slate-400">—</span>}
        </div>
      ) : (
        <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-700 truncate">
          {value || <span className="text-slate-400">—</span>}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-blue-100">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-slate-100 text-slate-600",
    hold: "bg-amber-100 text-amber-700",
    shipping: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    returned: "bg-rose-100 text-rose-700",
    refund: "bg-purple-100 text-purple-700",
    cancelled: "bg-slate-200 text-slate-500",
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}

export default ExternalPage;
