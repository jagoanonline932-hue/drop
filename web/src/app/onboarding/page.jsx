import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  Crown,
  Wallet,
  Network,
} from "lucide-react";

function OnboardingPage() {
  const { data: user, loading: authLoading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (typeof window !== "undefined")
        window.location.href = "/account/signin";
      return;
    }
    const finalize = async () => {
      try {
        const pendingName =
          typeof window !== "undefined"
            ? localStorage.getItem("pendingName")
            : null;
        const pendingPhone =
          typeof window !== "undefined"
            ? localStorage.getItem("pendingPhone")
            : null;
        const pendingRef =
          typeof window !== "undefined"
            ? localStorage.getItem("pendingRefCode")
            : null;

        setSubmitting(true);
        await fetch("/api/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: pendingName || "",
            phone: pendingPhone || "",
            whatsapp: pendingPhone || "",
          }),
        });

        if (pendingRef) {
          await fetch("/api/referrals/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: pendingRef }),
          });
        }

        // Trigger Welcome WhatsApp / in-app notification (once)
        await fetch("/api/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "welcome" }),
        }).catch(() => {});

        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingName");
          localStorage.removeItem("pendingPhone");
          localStorage.removeItem("pendingRefCode");
        }
        setDone(true);
        setTimeout(() => {
          if (typeof window !== "undefined")
            window.location.href = "/dashboard";
        }, 1500);
      } catch (e) {
        console.error(e);
        if (typeof window !== "undefined") window.location.href = "/dashboard";
      } finally {
        setSubmitting(false);
      }
    };
    finalize();
  }, [user, authLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1FB] p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-violet-100 p-10 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Selamat Datang di HyperDrop! 🎉
        </h1>
        <p className="text-slate-500 text-lg mb-8">
          Akun Anda berhasil dibuat. Kami sedang menyiapkan dashboard premium
          untuk Anda...
        </p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <FeatureBox icon={Wallet} title="Saldo Realtime" />
          <FeatureBox icon={Network} title="External Aggregator" />
          <FeatureBox icon={Crown} title="Upgrade VIP" />
        </div>
        <div className="flex items-center justify-center gap-2 text-violet-600">
          {submitting && !done && (
            <>
              <Loader2
                className="w-5 h-5"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span className="font-medium">Memuat dashboard...</span>
            </>
          )}
          {done && (
            <>
              <ArrowRight className="w-5 h-5" />
              <span className="font-medium">Mengarahkan ke dashboard...</span>
            </>
          )}
        </div>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function FeatureBox({ icon: Icon, title }) {
  return (
    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
      <Icon className="w-6 h-6 text-violet-600 mx-auto mb-2" />
      <p className="text-xs font-semibold text-slate-700">{title}</p>
    </div>
  );
}

export default OnboardingPage;
