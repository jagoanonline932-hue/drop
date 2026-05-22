import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  ShieldCheck,
  Crown,
  Calculator,
  Package,
  User,
  ShoppingBag,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Truck,
  Info,
  ExternalLink,
  Weight,
  FileText,
  Sparkles,
  Lock,
} from "lucide-react";

function InternalCODPage() {
  return (
    <DashboardLayout currentPath="/dashboard/internal-cod">
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
  const [allExpeditions, setAllExpeditions] = useState([]);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders?type=internal_cod").then((r) => r.json()),
      fetch("/api/settings/public").then((r) => r.json()),
      fetch("/api/homepage").then((r) => r.json()),
    ])
      .then(([p, o, s, h]) => {
        setProducts(p.products || []);
        setOrders(o.orders || []);
        setSettings(s.settings || {});
        setAllExpeditions(h.expeditions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!profile.vip_status) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-3xl p-10 text-center max-w-2xl mx-auto">
        <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce-soft" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Internal COD VIP Eksklusif
        </h2>
        <p className="text-slate-600 mb-6">
          Fitur Internal COD hanya untuk VIP Member. Upgrade akun Anda untuk
          akses produk premium dan profit lebih besar.
        </p>
        <a
          href="/dashboard/upgrade-vip"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-amber-500/30 hover:-translate-y-0.5 transition"
        >
          <Crown className="w-4 h-4" /> Upgrade VIP Sekarang
        </a>
        <style jsx global>{`
          @keyframes bounce-soft { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          .animate-bounce-soft { animation: bounce-soft 2.5s ease-in-out infinite }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 rounded-2xl p-6 text-white relative overflow-hidden">
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
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5" /> VIP EXCLUSIVE
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7" /> Internal COD VIP
            </h1>
            <p className="text-sm text-emerald-100 mt-1">
              Order COD eksklusif dengan profit margin tinggi dan sistem HOLD
              otomatis.
            </p>
          </div>
          <button
            onClick={() => setOpenOrder(true)}
            className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Buat Order COD
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">
            Riwayat Order Internal COD
          </h3>
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
                <th className="text-right px-4 py-3">Total COD</th>
                <th className="text-right px-4 py-3">Profit</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Belum ada order COD
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
                      <p className="font-semibold">{o.recipient_name}</p>
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
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      Rp {Number(o.total_cod).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 tabular-nums">
                      Rp {Number(o.member_profit).toLocaleString("id-ID")}
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
        title="Buat Order Internal COD"
        size="xl"
      >
        <OrderForm
          products={products.filter((p) => p.is_active)}
          settings={settings}
          allExpeditions={allExpeditions}
          profile={profile}
          onClose={() => setOpenOrder(false)}
          onSuccess={(o) => {
            setSuccessOrder(o);
            setOpenOrder(false);
            fetch("/api/orders?type=internal_cod")
              .then((r) => r.json())
              .then((d) => setOrders(d.orders || []));
          }}
        />
      </Modal>

      <Modal
        open={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        title="Order Berhasil!"
      >
        {successOrder && (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Order COD Berhasil Dibuat
            </h3>
            <p className="text-slate-600 mb-4">
              No. Order:{" "}
              <span className="font-mono font-bold">
                {successOrder.order_number}
              </span>
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left text-sm space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Total COD</span>
                <span className="font-bold">
                  Rp {Number(successOrder.total_cod).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Profit Anda</span>
                <span className="font-bold">
                  Rp{" "}
                  {Number(successOrder.member_profit).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold"
            >
              OK
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function OrderForm({
  products,
  settings,
  allExpeditions,
  profile,
  onClose,
  onSuccess,
}) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [productDetail, setProductDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientDistrict, setRecipientDistrict] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientProvince, setRecipientProvince] = useState("");
  const [recipientPostal, setRecipientPostal] = useState("");
  const [expeditionId, setExpeditionId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const codFeePercent = Number(settings.cod_fee_percent || 3);
  const packingFee = Number(settings.packing_fee || 2500);

  useEffect(() => {
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then((r) => r.json())
        .then((d) => {
          setProductDetail(d);
          if (!d?.product) return;
          setSellPrice(d.product.recommended_price || "");
        });
    } else {
      setProductDetail(null);
    }
  }, [productId]);

  const product = productDetail?.product;
  const variants = productDetail?.variants || [];
  // Expedition list: product's specific, fallback to all VIP-allowed expeditions
  const productExpeditions = productDetail?.expeditions || [];
  const expeditionList = productExpeditions.length
    ? productExpeditions
    : allExpeditions;

  const variant = variants.find((v) => v.id === Number(variantId));
  const productPrice = variant
    ? Number(variant.price)
    : Number(product?.supplier_price || 0);
  const unitWeight = variant?.weight || product?.weight || 0;
  const sell = Number(sellPrice) || 0;
  const ship = Number(shippingCost) || 0;
  const qty = Number(quantity) || 1;
  const totalWeight = unitWeight * qty;
  const totalCod = sell * qty;
  const codFee = Math.round((totalCod * codFeePercent) / 100);
  const profit = totalCod - ship - codFee - packingFee - productPrice * qty;
  const holdAmount = productPrice * qty + ship + packingFee;
  const insufficient = Number(profile.balance) < holdAmount;

  const selectedExpedition = expeditionList.find(
    (e) => e.id === Number(expeditionId),
  );
  const isSpxVip =
    profile.vip_status &&
    selectedExpedition &&
    /spx/i.test(selectedExpedition.name || "");

  const submit = async () => {
    setError(null);
    if (!productId || !recipientName || !recipientPhone || !recipientAddress) {
      setError("Mohon lengkapi semua data wajib");
      return;
    }
    if (insufficient) {
      setError(
        `Saldo tidak cukup untuk HOLD. Butuh Rp ${holdAmount.toLocaleString("id-ID")}, saldo Anda Rp ${Number(profile.balance).toLocaleString("id-ID")}.`,
      );
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: "internal_cod",
          product_id: Number(productId),
          variant_id: variantId ? Number(variantId) : null,
          quantity: qty,
          sell_price: sell,
          shipping_cost: ship,
          expedition_id: expeditionId ? Number(expeditionId) : null,
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          recipient_email: profile.email,
          recipient_address: recipientAddress,
          recipient_district: recipientDistrict,
          recipient_city: recipientCity,
          recipient_province: recipientProvince,
          recipient_postal_code: recipientPostal,
          notes: notes || null,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Gagal membuat order");
      onSuccess(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Section title="Pilih Produk" icon={Package}>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="">— Pilih Produk —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_vip_only ? " [VIP]" : ""}
                </option>
              ))}
            </select>
            {variants.length > 0 && (
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mt-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="">— Pilih Varian —</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} • Rp {Number(v.price).toLocaleString("id-ID")}{" "}
                    (Stok: {v.stock})
                  </option>
                ))}
              </select>
            )}

            {product && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-xs mt-2 flex items-center justify-between">
                <span className="text-slate-600">Harga Produk (Modal)</span>
                <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                  Rp {(productPrice * qty).toLocaleString("id-ID")}
                  <Lock className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                label="Quantity"
                type="number"
                value={quantity}
                onChange={setQuantity}
                min={1}
              />
              <Input
                label="Harga Jual (per pc) *"
                type="number"
                value={sellPrice}
                onChange={setSellPrice}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Ongkir (Rp)"
                type="number"
                value={shippingCost}
                onChange={setShippingCost}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 inline-flex items-center gap-1">
                  <Weight className="w-3 h-3" /> Total Berat
                </label>
                <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm tabular-nums">
                  {totalWeight.toLocaleString("id-ID")} g
                </div>
              </div>
            </div>

            {/* NOTICE CEK ONGKIR */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 flex gap-2 items-start">
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
                {expeditionList.map((e) => {
                  const active = Number(expeditionId) === e.id;
                  const isVipSpx = profile.vip_status && /spx/i.test(e.name);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setExpeditionId(e.id)}
                      className={`relative border-2 rounded-xl p-3 text-left transition ${active ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
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
                    <Sparkles className="w-3.5 h-3.5" /> Bonus Eksklusif VIP —
                    SPX Gratis Return!
                  </p>
                  <p className="mt-0.5 opacity-90">
                    Paket gagal kirim? Tenang, return bolak-balik gratis tanpa
                    potongan saldo. Khusus member VIP HyperDrop. 🎁
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Data Penerima" icon={User}>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Nama Penerima *"
                value={recipientName}
                onChange={setRecipientName}
              />
              <Input
                label="No HP *"
                value={recipientPhone}
                onChange={setRecipientPhone}
              />
            </div>
            <Input
              label="Alamat Lengkap *"
              value={recipientAddress}
              onChange={setRecipientAddress}
              textarea
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Kecamatan"
                value={recipientDistrict}
                onChange={setRecipientDistrict}
              />
              <Input
                label="Kota/Kab"
                value={recipientCity}
                onChange={setRecipientCity}
              />
              <Input
                label="Provinsi"
                value={recipientProvince}
                onChange={setRecipientProvince}
              />
              <Input
                label="Kode Pos"
                value={recipientPostal}
                onChange={setRecipientPostal}
              />
            </div>
          </Section>

          <Section title="Catatan Pengiriman" icon={FileText}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="mis. Hati-hati barang pecah belah. Hubungi sebelum kurir datang..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </Section>
        </div>

        <div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-5 sticky top-4 shadow-2xl shadow-emerald-500/20">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Rincian Order
            </h3>
            <div className="space-y-2 text-sm">
              <Row
                label="Harga Produk"
                value={`Rp ${(productPrice * qty).toLocaleString("id-ID")}`}
                lock
              />
              <Row
                label="Harga Jual"
                value={`Rp ${totalCod.toLocaleString("id-ID")}`}
              />
              <Row
                label="Ongkir"
                value={`Rp ${ship.toLocaleString("id-ID")}`}
              />
              <Row
                label={`COD Fee (${codFeePercent}%)`}
                value={`Rp ${codFee.toLocaleString("id-ID")}`}
              />
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
                <span className="text-emerald-100 font-semibold">
                  Total COD
                </span>
                <span className="font-bold text-2xl">
                  Rp {totalCod.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mt-2">
                <p className="text-xs text-emerald-100 mb-1">
                  💰 Profit Bersih Anda
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  Rp {profit.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-amber-400 text-slate-900 rounded-xl p-3 mt-2">
                <p className="text-xs font-semibold">🔒 HOLD Saldo</p>
                <p className="text-lg font-bold tabular-nums">
                  Rp {holdAmount.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] mt-1">
                  Saldo Anda: Rp{" "}
                  {Number(profile.balance).toLocaleString("id-ID")}
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
              disabled={loading || insufficient}
              className="w-full mt-4 bg-white text-emerald-700 py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 transition shadow-lg"
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
                  <ShoppingBag className="w-4 h-4" /> Buat Order COD
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
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
      <h4 className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5 mb-1">
        <Icon className="w-4 h-4 text-emerald-500" /> {title}
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
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          rows={2}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          {...rest}
        />
      )}
    </div>
  );
}

function Row({ label, value, lock }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-emerald-100 inline-flex items-center gap-1">
        {label} {lock && <Lock className="w-3 h-3 opacity-60" />}
      </span>
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

export default InternalCODPage;
