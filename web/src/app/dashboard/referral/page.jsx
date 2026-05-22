import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Copy,
  CheckCircle2,
  Share2,
  Gift,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/components/StatCard";

function ReferralPage() {
  return (
    <DashboardLayout currentPath="/dashboard/referral">
      {({ profile, settings }) => (
        <Inner profile={profile} settings={settings} />
      )}
    </DashboardLayout>
  );
}

function Inner({ profile, settings }) {
  const [analytics, setAnalytics] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/member/analytics")
      .then((r) => r.json())
      .then(setAnalytics);
  }, []);

  const refLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/account/signup?ref=${profile.referral_code}`
      : "";
  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const commission = Number(settings.referral_commission || 50000);

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const share = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "HyperDrop",
        text: "Daftar HyperDrop pakai referral saya!",
        url: refLink,
      });
    } else {
      copy();
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-500" /> Referral Program
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ajak teman upgrade VIP, dapatkan komisi {fmt(commission)} per
          referral!
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative">
          <Gift className="w-12 h-12 mb-3 text-amber-300" />
          <h2 className="text-xl lg:text-2xl font-bold mb-2">
            Kode Referral Anda
          </h2>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-4">
            <p className="text-xs text-purple-100 mb-1">Kode</p>
            <p className="text-2xl lg:text-3xl font-bold font-mono tracking-wider">
              {profile.referral_code}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-4">
            <p className="text-xs text-purple-100 mb-1">Link Referral</p>
            <p className="text-sm font-mono break-all">{refLink}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="flex-1 bg-white text-purple-700 px-4 py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Salin Link
                </>
              )}
            </button>
            <button
              onClick={share}
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Bagikan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Referral"
          value={analytics?.referral?.total_ref || 0}
          icon={Users}
          accent="purple"
        />
        <StatCard
          label="Referral VIP"
          value={analytics?.referral?.paid_count || 0}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Total Komisi"
          value={fmt(analytics?.referral?.total_comm)}
          icon={TrendingUp}
          accent="amber"
        />
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
        <h3 className="font-bold text-emerald-900 mb-2 inline-flex items-center gap-2">
          <Gift className="w-5 h-5" /> Cara Kerja Referral
        </h3>
        <ol className="text-sm text-emerald-800 space-y-1 list-decimal ml-5">
          <li>Bagikan link referral Anda ke teman/komunitas</li>
          <li>Teman daftar pakai link referral Anda</li>
          <li>
            Teman <strong>upgrade VIP</strong> di HyperDrop
          </li>
          <li>Komisi {fmt(commission)} langsung masuk ke saldo Anda!</li>
        </ol>
      </div>
    </div>
  );
}

export default ReferralPage;
