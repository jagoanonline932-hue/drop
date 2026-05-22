import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowUpFromLine,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  RefreshCcw,
  KeyRound,
  Smartphone,
  ArrowLeft,
} from "lucide-react";

function WithdrawPage() {
  return (
    <DashboardLayout currentPath="/dashboard/withdraw">
      {({ profile, settings }) => (
        <Inner profile={profile} settings={settings} />
      )}
    </DashboardLayout>
  );
}

function Inner({ profile, settings }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [step, setStep] = useState(1); // 1: form, 2: otp, 3: success
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInfo, setOtpInfo] = useState(null); // {masked_phone, expires_at}
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetch("/api/withdraw")
      .then((r) => r.json())
      .then((d) => setWithdrawals(d.withdrawals || []));
  }, [success]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const fee = Number(settings.withdraw_fee || 2500);
  const min = Number(settings.min_withdraw || 50000);
  const net = Math.max(0, Number(amount || 0) - fee);
  const profileIncomplete =
    !profile.bank_name ||
    !profile.bank_account_number ||
    !profile.bank_account_holder;
  const phone = profile.whatsapp || profile.phone;
  const noPhone = !phone;

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const requestOtp = async () => {
    setError(null);
    if (profileIncomplete) {
      setError("Lengkapi data rekening di Pengaturan terlebih dahulu");
      return;
    }
    if (noPhone) {
      setError("Nomor WhatsApp belum diisi di Pengaturan");
      return;
    }
    if (Number(amount) < min) {
      setError(`Minimal withdraw ${fmt(min)}`);
      return;
    }
    if (Number(amount) > Number(profile.balance)) {
      setError("Saldo tidak cukup");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/withdraw/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal kirim OTP");
      setOtpInfo(d);
      setStep(2);
      setResendTimer(60);
      setOtp("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (!otp || otp.length < 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/withdraw/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), otp }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Verifikasi gagal");
      setSuccess(d.withdraw);
      setStep(3);
      setAmount("");
      setOtp("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowUpFromLine className="w-7 h-7 text-rose-500" /> Withdraw Saldo
        </h1>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Aman — diverifikasi OTP WhatsApp otomatis via Fonnte.
        </p>
      </div>

      {profileIncomplete && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              Data Rekening Belum Lengkap
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Mohon lengkapi data rekening bank di menu{" "}
              <a href="/dashboard/pengaturan" className="underline font-bold">
                Pengaturan
              </a>{" "}
              untuk dapat melakukan withdraw.
            </p>
          </div>
        </div>
      )}

      {noPhone && !profileIncomplete && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <Smartphone className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">
              No WhatsApp Belum Diisi
            </p>
            <p className="text-sm text-rose-700 mt-0.5">
              Kode OTP withdraw dikirim via WhatsApp. Isi nomor WhatsApp di{" "}
              <a href="/dashboard/pengaturan" className="underline font-bold">
                Pengaturan
              </a>{" "}
              dulu.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          {step === 1 && (
            <>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-rose-500" />
                Ajukan Withdraw
              </h3>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl p-4 mb-4 shadow-lg shadow-emerald-500/20">
                <p className="text-xs text-emerald-100">Saldo Aktif</p>
                <p className="text-3xl font-bold tracking-tight">
                  {fmt(profile.balance)}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nominal Withdraw
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={min.toString()}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg font-bold focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimal: {fmt(min)} • Fee: {fmt(fee)}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[100000, 250000, 500000, 1000000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v)}
                        type="button"
                        className="text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg transition"
                      >
                        {fmt(v)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Withdraw</span>
                    <span className="font-semibold">{fmt(amount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Fee Admin</span>
                    <span className="font-semibold">- {fmt(fee)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1 border-slate-200">
                    <span className="font-bold">Diterima</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      {fmt(net)}
                    </span>
                  </div>
                </div>
                {!profileIncomplete && (
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800 border border-blue-100">
                    <p className="font-semibold mb-1">Tujuan Rekening</p>
                    <p>
                      {profile.bank_name} • {profile.bank_account_number}
                    </p>
                    <p>a/n {profile.bank_account_holder}</p>
                  </div>
                )}
                {!noPhone && (
                  <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800 border border-emerald-200 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Kode OTP ke WhatsApp</p>
                      <p>
                        Kode 6 digit akan dikirim ke <strong>{phone}</strong>{" "}
                        untuk verifikasi keamanan.
                      </p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm animate-shake">
                    {error}
                  </div>
                )}
                <button
                  onClick={requestOtp}
                  disabled={loading || profileIncomplete || noPhone}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2 transition shadow-lg shadow-rose-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="w-4 h-4"
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Mengirim OTP...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Kirim Kode OTP
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <button
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse-soft">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mt-3 text-lg">
                  Verifikasi WhatsApp
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Kode OTP terkirim ke{" "}
                  <span className="font-mono font-bold text-emerald-700">
                    {otpInfo?.masked_phone || phone}
                  </span>
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs text-center">
                <p className="text-slate-500">Nominal Withdraw</p>
                <p className="font-bold text-lg text-slate-900">
                  {fmt(amount)}
                </p>
              </div>
              <label className="block text-sm font-semibold mb-2 text-center">
                Masukkan 6 Digit Kode OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 text-center text-3xl font-bold tracking-[0.5em] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition tabular-nums"
                autoFocus
              />
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Tidak menerima kode?</span>
                <button
                  onClick={requestOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-emerald-600 font-bold inline-flex items-center gap-1 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <RefreshCcw className="w-3 h-3" />
                  {resendTimer > 0
                    ? `Kirim ulang (${resendTimer}s)`
                    : "Kirim ulang"}
                </button>
              </div>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm mt-3 animate-shake">
                  {error}
                </div>
              )}
              <button
                onClick={verifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/30"
              >
                {loading ? (
                  <>
                    <Loader2
                      className="w-4 h-4"
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Verifikasi & Ajukan
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold">Riwayat Withdraw</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              {withdrawals.length} total
            </span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <ArrowUpFromLine className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Belum ada withdraw</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-mono text-xs text-slate-500">
                        {w.withdraw_number}
                      </p>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-md ${
                          w.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : w.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold">{fmt(w.amount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(w.created_at).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {w.bank_name} • {w.bank_account_number}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSuccess(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <p className="font-bold text-xl mb-1">Withdraw Berhasil Diajukan</p>
            <p className="text-sm text-slate-500 mb-3">
              {success.withdraw_number}
            </p>
            <p className="text-3xl font-bold text-emerald-600 mb-4">
              {fmt(success.amount)}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Menunggu approval admin. Notifikasi akan dikirim ke WhatsApp Anda
              setelah dana ditransfer.
            </p>
            <button
              onClick={() => {
                setSuccess(null);
                setStep(1);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        @keyframes pulse-soft { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .animate-fade-in { animation: fadeIn .25s ease }
        .animate-slide-up { animation: slideUp .3s cubic-bezier(.16,.84,.44,1) }
        .animate-shake { animation: shake .4s ease }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite }
      `}</style>
    </div>
  );
}

export default WithdrawPage;
