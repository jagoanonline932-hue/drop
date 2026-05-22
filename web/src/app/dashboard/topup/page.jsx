import { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  ArrowDownToLine,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
  Wrench,
  Sparkles,
  Clock,
} from "lucide-react";

function TopupPage() {
  return (
    <DashboardLayout currentPath="/dashboard/topup">
      {({ profile, settings }) => (
        <Inner profile={profile} settings={settings} />
      )}
    </DashboardLayout>
  );
}

function Inner({ profile, settings }) {
  const [topups, setTopups] = useState([]);
  const [banks, setBanks] = useState([]);
  const [qris, setQris] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    duitku: { active: false, maintenance: false },
    midtrans: { active: false, maintenance: false },
  });
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [duitkuPay, setDuitkuPay] = useState(null);
  const [midtransPay, setMidtransPay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(
    () =>
      fetch("/api/topup")
        .then((r) => r.json())
        .then((d) => setTopups(d.topups || [])),
    [],
  );

  const refreshPaymentStatus = useCallback(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((s) => {
        if (s.payment_methods) setPaymentStatus(s.payment_methods);
      });
  }, []);

  const checkDuitkuStatus = async (merchantOrderId) => {
    setChecking(true);
    try {
      const r = await fetch("/api/duitku/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantOrderId }),
      });
      const d = await r.json();
      if (d.status === "approved") {
        if (typeof window !== "undefined")
          localStorage.removeItem("hd_pending_duitku");
        await refresh();
        setSuccess({
          topup_number: d.topup?.topup_number,
          amount: d.topup?.amount,
          auto: true,
        });
      }
      return d.status;
    } finally {
      setChecking(false);
    }
  };

  // Poll Midtrans status while modal is open
  const midtransIntervalRef = useRef(null);
  useEffect(() => {
    if (!midtransPay) {
      if (midtransIntervalRef.current)
        clearInterval(midtransIntervalRef.current);
      return;
    }
    const poll = async () => {
      try {
        const r = await fetch("/api/midtrans/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: midtransPay.order_id }),
        });
        const d = await r.json();
        if (d.status === "approved") {
          await refresh();
          setMidtransPay(null);
          setSuccess({
            topup_number: midtransPay.topup_number,
            amount: midtransPay.amount,
            auto: true,
          });
        } else if (["rejected", "failed", "expired"].includes(d.status)) {
          setMidtransPay(null);
        }
      } catch {}
    };
    midtransIntervalRef.current = setInterval(poll, 4000);
    return () => clearInterval(midtransIntervalRef.current);
    // eslint-disable-next-line
  }, [midtransPay?.order_id]);

  // Realtime maintenance sync (poll every 10s)
  useEffect(() => {
    refreshPaymentStatus();
    const t = setInterval(refreshPaymentStatus, 10000);
    return () => clearInterval(t);
  }, [refreshPaymentStatus]);

  useEffect(() => {
    Promise.all([
      fetch("/api/topup").then((r) => r.json()),
      fetch("/api/banks").then((r) => r.json()),
      fetch("/api/qris").then((r) => r.json()),
    ])
      .then(([t, b, q]) => {
        setTopups(t.topups || []);
        setBanks(b.banks || []);
        setQris(q.qris || null);
      })
      .finally(() => setLoading(false));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("duitku") === "success") {
        const pending = localStorage.getItem("hd_pending_duitku");
        if (pending) {
          let attempts = 0;
          const poll = async () => {
            attempts++;
            const status = await checkDuitkuStatus(pending);
            if (status !== "approved" && attempts < 6) {
              setTimeout(poll, 2000);
            }
          };
          poll();
        }
      }
    }
    // eslint-disable-next-line
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const midtransOn =
    paymentStatus?.midtrans?.active && !paymentStatus?.midtrans?.maintenance;
  const midtransInMaintenance = paymentStatus?.midtrans?.maintenance;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownToLine className="w-7 h-7 text-violet-600" /> Topup Saldo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah saldo HyperDrop. Otomatis masuk via Midtrans / Duitku ⚡
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 inline-flex items-center gap-2"
        >
          <ArrowDownToLine className="w-4 h-4" /> Topup Baru
        </button>
      </div>

      {midtransInMaintenance && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 maintenance-pulse">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900">
              {paymentStatus.midtrans.maintenance_title ||
                "Payment system sedang maintenance"}
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {paymentStatus.midtrans.maintenance_description ||
                "Silakan coba kembali beberapa saat lagi."}
            </p>
            {paymentStatus.midtrans.maintenance_until && (
              <p className="text-xs text-amber-600 mt-1 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Estimasi sampai:{" "}
                {new Date(
                  paymentStatus.midtrans.maintenance_until,
                ).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>
      )}

      {checking && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-sm text-violet-700 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 spin" /> Mengecek status pembayaran...
        </div>
      )}

      <div className="bg-white rounded-2xl border border-violet-100 overflow-hidden">
        <div className="p-4 border-b border-violet-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Riwayat Topup</h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />{" "}
            Realtime
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">No. Topup</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-left px-4 py-3">Metode</th>
                <th className="text-right px-4 py-3">Nominal</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {topups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada topup
                  </td>
                </tr>
              ) : (
                topups.map((t) => (
                  <tr key={t.id} className="hover:bg-violet-50/40">
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.topup_number}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase">
                      {t.payment_method}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge s={t.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.payment_method === "duitku" &&
                      t.status === "pending" &&
                      t.duitku_payment_url ? (
                        <div className="flex gap-1 justify-center">
                          <a
                            href={t.duitku_payment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] bg-violet-600 hover:bg-violet-700 text-white px-2 py-1 rounded-md inline-flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" /> Bayar
                          </a>
                          <button
                            onClick={() =>
                              checkDuitkuStatus(t.duitku_merchant_order_id)
                            }
                            className="text-[10px] bg-violet-100 text-violet-700 hover:bg-violet-200 px-2 py-1 rounded-md font-semibold"
                          >
                            Cek
                          </button>
                        </div>
                      ) : t.payment_method === "midtrans" &&
                        t.status === "pending" &&
                        t.midtrans_redirect_url ? (
                        <a
                          href={t.midtrans_redirect_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md inline-flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> Lanjut Bayar
                        </a>
                      ) : null}
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
        title="Topup Saldo"
        size="lg"
      >
        <TopupForm
          banks={banks}
          qris={qris}
          settings={settings}
          paymentStatus={paymentStatus}
          onSuccess={(t) => {
            setSuccess(t);
            setOpen(false);
            refresh();
          }}
          onDuitku={(d) => {
            setDuitkuPay(d);
            setOpen(false);
            refresh();
          }}
          onMidtrans={(d) => {
            setMidtransPay(d);
            setOpen(false);
            refresh();
          }}
        />
      </Modal>

      {/* Duitku popup (unchanged) */}
      <Modal
        open={!!duitkuPay}
        onClose={() => setDuitkuPay(null)}
        title="Lanjutkan Pembayaran Duitku"
      >
        {duitkuPay && (
          <div className="text-center py-2 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-600 flex items-center justify-center">
              <CreditCard className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-xl font-bold">Bayar via Duitku</h3>
            <p className="text-sm text-slate-500">
              No:{" "}
              <span className="font-mono font-bold">
                {duitkuPay.topup_number}
              </span>
            </p>
            <p className="text-2xl font-bold text-violet-600">
              {fmt(duitkuPay.amount)}
            </p>
            <div className="flex gap-2">
              <a
                href={duitkuPay.paymentUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (typeof window !== "undefined")
                    localStorage.setItem(
                      "hd_pending_duitku",
                      duitkuPay.merchantOrderId,
                    );
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Buka Halaman Bayar
              </a>
              <button
                onClick={() => {
                  checkDuitkuStatus(duitkuPay.merchantOrderId);
                  setDuitkuPay(null);
                }}
                className="px-4 py-3 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-xl font-bold text-sm"
              >
                Cek Status
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Midtrans Snap popup with realtime status */}
      <Modal
        open={!!midtransPay}
        onClose={() => setMidtransPay(null)}
        title="Pembayaran Midtrans"
      >
        {midtransPay && <MidtransPayBlock payInfo={midtransPay} fmt={fmt} />}
      </Modal>

      <Modal
        open={!!success}
        onClose={() => setSuccess(null)}
        title="Topup Berhasil"
      >
        {success && (
          <div className="text-center py-4 success-pop">
            <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto mb-3 flex items-center justify-center success-ring">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-1">
              {success.auto ? "Pembayaran Diterima!" : "Topup Diajukan"}
            </h3>
            <p className="text-sm text-slate-500">
              No:{" "}
              <span className="font-mono font-bold">
                {success.topup_number}
              </span>
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {fmt(success.amount)}
            </p>
            <p className="text-sm text-slate-500 mt-3">
              {success.auto
                ? "Saldo sudah otomatis masuk ke akun Anda."
                : "Mohon tunggu admin memverifikasi pembayaran Anda."}
            </p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold"
            >
              OK
            </button>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .spin { animation: spin 1s linear infinite }
        @keyframes liveDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.7) }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0) }
        }
        .live-dot { animation: liveDot 1.4s ease-in-out infinite }
        @keyframes maintenancePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,.4) }
          50% { box-shadow: 0 0 0 10px rgba(245,158,11,0) }
        }
        .maintenance-pulse { animation: maintenancePulse 2s ease-in-out infinite }
        @keyframes successPop {
          from { transform: scale(.7); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        .success-pop { animation: successPop .35s cubic-bezier(.34,1.56,.64,1) }
        @keyframes successRing {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,.6) }
          100% { box-shadow: 0 0 0 20px rgba(16,185,129,0) }
        }
        .success-ring { animation: successRing 1.2s ease-out }
      `}</style>
    </div>
  );
}

function MidtransPayBlock({ payInfo, fmt }) {
  const [status, setStatus] = useState("pending");
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!payInfo.expires_at) return null;
    return Math.max(
      0,
      Math.floor((new Date(payInfo.expires_at) - new Date()) / 1000),
    );
  });

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/midtrans/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: payInfo.order_id }),
        });
        const d = await r.json();
        if (d.status) setStatus(d.status);
      } catch {}
    }, 4000);
    const cd = setInterval(
      () => setSecondsLeft((v) => (v != null ? Math.max(0, v - 1) : v)),
      1000,
    );
    return () => {
      clearInterval(t);
      clearInterval(cd);
    };
  }, [payInfo.order_id]);

  const mmss = (s) => {
    if (s == null) return "-";
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <div className="text-center py-2 space-y-3">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
        <Sparkles className="w-9 h-9 text-white" />
      </div>
      <h3 className="text-xl font-bold">Bayar via Midtrans</h3>
      <p className="text-sm text-slate-500">
        No: <span className="font-mono font-bold">{payInfo.topup_number}</span>
      </p>
      <p className="text-3xl font-bold text-blue-600">{fmt(payInfo.amount)}</p>

      <div className="flex justify-center gap-2 items-center text-xs">
        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Realtime
          monitoring
        </span>
        {secondsLeft != null && (
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {mmss(secondsLeft)}
          </span>
        )}
      </div>

      <div className="rounded-xl border-2 border-dashed p-3 text-sm">
        <p className="text-slate-500 text-xs">Status</p>
        <p
          className={`font-bold uppercase ${status === "approved" ? "text-emerald-600" : status === "pending" ? "text-amber-600" : "text-rose-600"}`}
        >
          {status}
        </p>
      </div>

      <a
        href={payInfo.redirect_url}
        target="_blank"
        rel="noreferrer"
        className="block bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
      >
        <ExternalLink className="w-4 h-4 inline mr-1" /> Buka Halaman Pembayaran
      </a>
      <p className="text-xs text-slate-400">
        Saldo otomatis masuk setelah pembayaran selesai. Notifikasi WhatsApp
        dikirim.
      </p>
    </div>
  );
}

function StatusBadge({ s }) {
  const map = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700",
    failed: "bg-rose-100 text-rose-700",
    expired: "bg-slate-200 text-slate-700",
    waiting_verification: "bg-blue-100 text-blue-700",
  };
  const cls = map[s] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${cls}`}
    >
      {s}
    </span>
  );
}

function TopupForm({
  banks,
  qris,
  settings,
  paymentStatus,
  onSuccess,
  onDuitku,
  onMidtrans,
}) {
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");
  const [proof, setProof] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: reader.result, file_name: file.name }),
        });
        const d = await r.json();
        if (r.ok) setProof(d.url);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setError(null);
    if (!method) {
      setError("Pilih metode pembayaran");
      return;
    }
    const minMidtrans = Number(paymentStatus?.midtrans?.min_topup || 10000);
    const minFloor = method === "midtrans" ? minMidtrans : 10000;
    if (!amount || Number(amount) < minFloor) {
      setError(`Minimal topup Rp ${minFloor.toLocaleString("id-ID")}`);
      return;
    }
    if ((method === "transfer" || method === "qris") && !proof) {
      setError("Upload bukti pembayaran terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      if (method === "midtrans") {
        const r = await fetch("/api/midtrans/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Gagal create Midtrans");
        onMidtrans(d);
        return;
      }
      if (method === "duitku") {
        const r = await fetch("/api/duitku/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Gagal");
        onDuitku(d);
        return;
      }
      const r = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          payment_method: method,
          bank_account_id: bankId ? Number(bankId) : null,
          proof_url: proof || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal");
      onSuccess(d.topup);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const transferMaintenance = banks.length === 0;
  const qrisMaintenance = qris?.is_maintenance || !qris?.qris_image;
  const duitkuMaintenance =
    paymentStatus?.duitku?.maintenance || !paymentStatus?.duitku?.active;
  const midtransMaintenance =
    paymentStatus?.midtrans?.maintenance || !paymentStatus?.midtrans?.active;

  const methods = [
    {
      v: "transfer",
      l: "Transfer Bank",
      i: Banknote,
      maintenance: transferMaintenance,
    },
    { v: "qris", l: "QRIS", i: QrCode, maintenance: qrisMaintenance },
    {
      v: "duitku",
      l: "Duitku",
      i: CreditCard,
      badge: "Otomatis",
      maintenance: duitkuMaintenance,
    },
    {
      v: "midtrans",
      l: "Midtrans",
      i: Sparkles,
      badge: "Snap",
      maintenance: midtransMaintenance,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">
          Nominal Topup
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50000"
          className="w-full px-4 py-3 rounded-xl border border-violet-200 text-lg font-bold focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {[50000, 100000, 250000, 500000, 1000000].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="flex-1 min-w-[80px] text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg"
            >
              Rp {v.toLocaleString("id-ID")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {methods.map((m) => {
            const Icon = m.i;
            const disabled = m.maintenance;
            const selected = method === m.v;
            return (
              <button
                key={m.v}
                onClick={() => !disabled && setMethod(m.v)}
                disabled={disabled}
                className={`p-3 rounded-xl border-2 text-center relative ${
                  disabled
                    ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                    : selected
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {m.badge && !disabled && (
                  <span className="absolute -top-2 -right-1 bg-violet-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    {m.badge}
                  </span>
                )}
                {disabled && (
                  <span className="absolute -top-2 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    MAINTENANCE
                  </span>
                )}
                <Icon
                  className={`w-6 h-6 mx-auto mb-1 ${selected ? "text-violet-600" : "text-slate-500"}`}
                />
                <p className="text-xs font-semibold">{m.l}</p>
              </button>
            );
          })}
        </div>
      </div>

      {method === "transfer" && (
        <div className="bg-violet-50/50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold">Pilih Rekening Tujuan</p>
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-violet-200 bg-white"
          >
            <option value="">— Pilih Bank —</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bank_name} • {b.account_number} • {b.account_holder}
              </option>
            ))}
          </select>
          {bankId &&
            (() => {
              const b = banks.find((x) => x.id === Number(bankId));
              return (
                b && (
                  <div className="bg-white border border-violet-200 rounded-xl p-3 text-sm">
                    <p className="font-bold text-slate-900">{b.bank_name}</p>
                    <p className="font-mono text-lg font-bold text-violet-600">
                      {b.account_number}
                    </p>
                    <p className="text-xs text-slate-500">
                      a/n {b.account_holder}
                    </p>
                  </div>
                )
              );
            })()}
          <FileUploader
            uploading={uploading}
            proof={proof}
            onChange={handleFile}
          />
        </div>
      )}

      {method === "qris" && (
        <div className="bg-violet-50/50 rounded-xl p-4 space-y-3">
          {qris?.is_maintenance ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <AlertCircle className="inline w-4 h-4 mr-1" /> QRIS sedang
              maintenance.
            </div>
          ) : qris?.qris_image ? (
            <>
              <p className="text-sm font-semibold text-center">
                Scan QRIS untuk Bayar
              </p>
              <img
                src={qris.qris_image}
                alt="QRIS"
                className="max-w-xs mx-auto rounded-lg"
              />
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center">
              QRIS belum disediakan oleh admin.
            </p>
          )}
          <FileUploader
            uploading={uploading}
            proof={proof}
            onChange={handleFile}
          />
        </div>
      )}

      {method === "duitku" && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm text-violet-800">
          <p className="font-semibold mb-1 inline-flex items-center gap-1">
            <Zap className="w-4 h-4" /> Pembayaran Otomatis via Duitku
          </p>
          <p className="text-xs">
            VA, e-wallet, QRIS. Saldo otomatis masuk setelah pembayaran.
          </p>
        </div>
      )}

      {method === "midtrans" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1 inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Midtrans Snap — All-in-One
          </p>
          <p className="text-xs">
            QRIS, Virtual Account, GoPay, ShopeePay, Dana
            {paymentStatus?.midtrans?.enable_cc ? ", Credit Card" : ""}. Status
            realtime.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 spin" /> Memproses...
          </>
        ) : (
          "Topup Sekarang"
        )}
      </button>
      <style
        jsx
        global
      >{`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
    </div>
  );
}

function FileUploader({ uploading, proof, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">
        Upload Bukti Pembayaran *
      </label>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={onChange}
        className="w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-700 file:font-semibold"
      />
      {uploading && (
        <p className="text-xs text-violet-500 mt-1 inline-flex items-center gap-1">
          <Loader2 className="w-3 h-3 spin" /> Uploading...
        </p>
      )}
      {proof && (
        <p className="text-xs text-violet-600 mt-1 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Bukti uploaded
        </p>
      )}
    </div>
  );
}

export default TopupPage;
