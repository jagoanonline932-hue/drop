import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <a
          href="/account/signin"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke login
        </a>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Lupa Password
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Masukkan email Anda dan kami akan menghubungi Anda via WhatsApp.
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            Permintaan reset password berhasil dikirim. Silakan hubungi admin
            via WhatsApp untuk mendapatkan password baru.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@anda.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30"
            >
              Kirim Permintaan
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
