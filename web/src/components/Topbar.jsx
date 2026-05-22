import { useState, useEffect } from "react";
import { Bell, Search, Crown, Wallet, Clock } from "lucide-react";
import Tooltip from "@/components/Tooltip";

export default function Topbar({ user, role = "member" }) {
  const [time, setTime] = useState("");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTime(d.toLocaleString("id-ID", opts));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    fetch("/api/notifications?unread=1")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setNotifCount(d.count || 0))
      .catch(() => {});
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-violet-100">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3">
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input
              type="search"
              placeholder="Cari resi, member, produk..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-violet-100 bg-violet-50/50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-1 md:hidden ml-12" />
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
          <span
            className="w-2 h-2 rounded-full bg-violet-500"
            style={{ animation: "pulse 2s infinite" }}
          />
          <span className="font-medium tabular-nums">{time}</span>
        </div>

        {role === "member" && user && (
          <div className="hidden md:flex items-center gap-2">
            <Tooltip
              content="Saldo aktif yang bisa digunakan/withdraw"
              side="bottom"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100 cursor-pointer">
                <Wallet className="w-4 h-4 text-violet-600" />
                <div>
                  <p className="text-[10px] text-violet-600 leading-none">
                    Saldo
                  </p>
                  <p className="text-xs font-bold text-violet-800 leading-none mt-0.5 tabular-nums">
                    {fmt(user.balance)}
                  </p>
                </div>
              </div>
            </Tooltip>
            <Tooltip
              content="Saldo yang sedang di-HOLD untuk order berjalan"
              side="bottom"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 cursor-pointer">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-[10px] text-amber-600 leading-none">
                    HOLD
                  </p>
                  <p className="text-xs font-bold text-amber-700 leading-none mt-0.5 tabular-nums">
                    {fmt(user.balance_hold)}
                  </p>
                </div>
              </div>
            </Tooltip>
            {user.vip_status && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold shadow-md shadow-amber-200">
                <Crown className="w-4 h-4" /> VIP
              </div>
            )}
          </div>
        )}

        <a
          href={
            role === "member" ? "/dashboard/notifikasi" : "/admin/notifikasi"
          }
          className="relative p-2 rounded-xl hover:bg-violet-50"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </a>

        <a
          href={role === "member" ? "/dashboard/pengaturan" : "/admin/settings"}
          className="flex items-center gap-2 ml-1 hover:opacity-80 transition"
          title="Pengaturan profil"
        >
          {user?.avatar || user?.image ? (
            <img
              src={user.avatar || user.image}
              alt=""
              className="w-9 h-9 rounded-full object-cover border-2 border-violet-300 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </a>
      </div>
      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </header>
  );
}
