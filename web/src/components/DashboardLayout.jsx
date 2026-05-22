import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ToastProvider } from "@/components/Toast";
import useUser from "@/utils/useUser";

export default function DashboardLayout({
  children,
  currentPath = "",
  role: forcedRole = null,
}) {
  const { data: authUser, loading: authLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  const refetch = async () => {
    try {
      const r = await fetch("/api/me");
      if (r.ok) {
        const d = await r.json();
        if (d?.user) setProfile(d.user);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      if (typeof window !== "undefined")
        window.location.href = "/account/signin";
      return;
    }
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/settings/public").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([me, set]) => {
        if (me?.user) setProfile(me.user);
        if (set?.settings) setSettings(set.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authUser, authLoading]);

  if (authLoading || loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1FB]">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-3"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p className="text-sm text-slate-500">Memuat HyperDrop...</p>
          <style
            jsx
            global
          >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  const adminRoles = [
    "super_admin",
    "staff_admin",
    "finance_admin",
    "cs_admin",
  ];
  const isAdmin = adminRoles.includes(profile.role);
  const role = forcedRole || (isAdmin ? profile.role : "member");

  // Access guard
  if (forcedRole === "admin" && !isAdmin) {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F7F5FC]">
        <Sidebar
          user={profile}
          role={role}
          currentPath={currentPath}
          logo={settings.site_logo || ""}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            user={profile}
            role={role === "member" ? "member" : "admin"}
          />
          <main className="flex-1 p-4 lg:p-6">
            {typeof children === "function"
              ? children({ profile, settings, refetch })
              : children}
          </main>
          <footer className="px-6 py-4 border-t border-violet-100 bg-white text-center text-xs text-slate-400">
            {settings.copyright_text ||
              "© PT. Digitalindo Nusa Trivela — Hak Cipta Dilindungi — Developer By Atedy"}
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
