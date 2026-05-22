import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  Crown,
  CheckCircle2,
  Loader2,
  QrCode,
  Banknote,
  CreditCard,
  Upload,
} from "lucide-react";

function UpgradeVIPPage() {
  return (
    <DashboardLayout currentPath="/dashboard/upgrade-vip">
      {({ profile }) => <Inner profile={profile} />}
    </DashboardLayout>
  );
}

function Inner({ profile }) {
  const [packages, setPackages] = useState([]);
  const [banks, setBanks] = useState([]);
  const [qris, setQris] = useState(null);
  const [active, setActive] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/vip/purchase").then((r) => r.json()),
      fetch("/api/banks").then((r) => r.json()),
      fetch("/api/qris").then((r) => r.json()),
    ]).then(([p, b, q]) => {
      setPackages(p.packages || []);
      setBanks(b.banks || []);
      setQris(q.qris || null);
    });
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div className="text-center max-w-2xl mx-auto">
        <Crown className="w-14 h-14 text-amber-500 mx-auto mb-3" />
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
          Upgrade ke VIP Member
        </h1>
        <p className="text-slate-500">
          Akses fitur premium HyperDrop dan tingkatkan profit dropship Anda.
        </p>
      </div>

      {profile.vip_status && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 text-center max-w-xl mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-emerald-700">
            Anda Sudah VIP Member! 🎉
          </p>
          {profile.vip_expired_at && (
            <p className="text-sm text-emerald-600 mt-1">
              Aktif hingga:{" "}
              {new Date(profile.vip_expired_at).toLocaleDateString("id-ID")}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {packages.map((p) => {
          const benefits = Array.isArray(p.benefits) ? p.benefits : [];
          return (
            <div
              key={p.id}
              className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 rounded-3xl p-6 shadow-2xl shadow-amber-500/20 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="relative">
                <Crown className="w-10 h-10 mb-3" />
                <h3 className="text-2xl font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-slate-800 mb-4">{p.description}</p>
                <p className="text-4xl font-bold mb-1">{fmt(p.price)}</p>
                <p className="text-sm font-semibold mb-5">
                  /{p.duration_days} hari
                </p>
                <ul className="space-y-2 mb-6">
                  {benefits.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{" "}
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setActive(p)}
                  disabled={profile.vip_status}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {profile.vip_status ? "Sudah VIP" : "Pilih Paket"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={`Bayar ${active?.name || ""}`}
        size="lg"
      >
        {active && (
          <PaymentForm
            pkg={active}
            banks={banks}
            qris={qris}
            onSuccess={(p) => {
              setSuccess(p);
              setActive(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!success}
        onClose={() => setSuccess(null)}
        title="Berhasil!"
      >
        <div className="text-center py-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Pembelian VIP Diajukan</h3>
          <p className="text-sm text-slate-500 mt-2">
            Admin akan memverifikasi pembayaran Anda dalam 1x24 jam. Notifikasi
            akan dikirim via WhatsApp.
          </p>
          <button
            onClick={() => setSuccess(null)}
            className="mt-4 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}

function PaymentForm({ pkg, banks, qris, onSuccess }) {
  const [method, setMethod] = useState("transfer");
  const [bankId, setBankId] = useState("");
  const [proof, setProof] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        if (r.ok) setProof(d.url);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    setError(null);
    if (!proof) {
      setError("Upload bukti pembayaran");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/vip/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: pkg.id,
          payment_method: method,
          payment_proof_url: proof,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal");
      onSuccess(d.purchase);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-600">{pkg.name}</p>
        <p className="text-3xl font-bold text-amber-700">
          Rp {Number(pkg.price).toLocaleString("id-ID")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMethod("transfer")}
            className={`p-3 rounded-xl border-2 ${method === "transfer" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
          >
            <Banknote className="w-6 h-6 mx-auto mb-1" />{" "}
            <p className="text-xs font-semibold">Transfer Bank</p>
          </button>
          <button
            onClick={() => setMethod("qris")}
            className={`p-3 rounded-xl border-2 ${method === "qris" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
          >
            <QrCode className="w-6 h-6 mx-auto mb-1" />{" "}
            <p className="text-xs font-semibold">QRIS</p>
          </button>
        </div>
      </div>

      {method === "transfer" && (
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200"
          >
            <option value="">— Pilih Rekening —</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bank_name} • {b.account_number}
              </option>
            ))}
          </select>
          {bankId &&
            (() => {
              const b = banks.find((x) => x.id === Number(bankId));
              return (
                b && (
                  <div className="bg-white border border-emerald-200 rounded-xl p-3">
                    <p className="font-bold">{b.bank_name}</p>
                    <p className="font-mono text-lg">{b.account_number}</p>
                    <p className="text-xs">a/n {b.account_holder}</p>
                  </div>
                )
              );
            })()}
        </div>
      )}

      {method === "qris" && qris?.qris_image && (
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <img
            src={qris.qris_image}
            alt="QRIS"
            className="max-w-xs mx-auto rounded-lg"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">
          Upload Bukti Pembayaran *
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFile}
          className="w-full text-xs file:py-2 file:px-3 file:bg-emerald-50 file:text-emerald-700 file:rounded-lg file:border-0 file:font-semibold"
        />
        {uploading && (
          <p className="text-xs text-blue-500 mt-1">Mengupload...</p>
        )}
        {proof && (
          <p className="text-xs text-emerald-600 mt-1">✓ Bukti uploaded</p>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
            <Crown className="w-4 h-4" /> Bayar & Aktifkan VIP
          </>
        )}
      </button>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default UpgradeVIPPage;
