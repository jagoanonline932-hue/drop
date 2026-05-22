import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Truck,
  Upload,
  MapPin,
  Wallet,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  ShieldCheck,
  Crown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Image as ImageIcon,
  FileText,
  Bell,
  MessageSquare,
  BarChart3,
  Building2,
  Network,
  CreditCard,
  QrCode,
  Banknote,
  RefreshCcw,
  UserCog,
  HandCoins,
  ListOrdered,
  Sparkles,
  X,
  Menu,
  Database,
  HelpCircle,
  Rocket,
  Activity,
  KeyRound,
} from "lucide-react";

export default function Sidebar({
  user,
  role = "member",
  currentPath = "",
  logo = "",
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hd_sidebar_collapsed");
      if (saved === "1") setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const toggleCollapse = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("hd_sidebar_collapsed", newVal ? "1" : "0");
    }
  };

  const memberMenu = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Katalog Produk", icon: Package, href: "/dashboard/produk" },
    {
      label: "Internal COD VIP",
      icon: ShieldCheck,
      href: "/dashboard/internal-cod",
      vipLock: true,
    },
    {
      label: "External Aggregator",
      icon: Network,
      href: "/dashboard/external",
    },
    { label: "Upload Resi", icon: Upload, href: "/dashboard/upload-resi" },
    { label: "Tracking", icon: MapPin, href: "/dashboard/tracking" },
    { label: "Saldo", icon: Wallet, href: "/dashboard/saldo" },
    { label: "Saldo HOLD", icon: Clock, href: "/dashboard/saldo-hold" },
    { label: "Topup", icon: ArrowDownToLine, href: "/dashboard/topup" },
    { label: "Withdraw", icon: ArrowUpFromLine, href: "/dashboard/withdraw" },
    { label: "Referral", icon: Users, href: "/dashboard/referral" },
    { label: "E-Course", icon: GraduationCap, href: "/dashboard/ecourse" },
    { label: "Tutorial", icon: BookOpen, href: "/dashboard/tutorial" },
    {
      label: "Upgrade VIP",
      icon: Crown,
      href: "/dashboard/upgrade-vip",
      highlight: true,
    },
    { label: "Pengaturan", icon: Settings, href: "/dashboard/pengaturan" },
  ];

  const adminMenu = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    {
      label: "Payment Management",
      icon: Activity,
      href: "/admin/payment",
      highlight: true,
    },
    {
      label: "OTP Management",
      icon: KeyRound,
      href: "/admin/otp",
      highlight: true,
    },
    { label: "Manajemen Order", icon: ListOrdered, href: "/admin/orders" },
    { label: "Member", icon: UserCog, href: "/admin/members" },
    { label: "VIP Management", icon: Crown, href: "/admin/vip" },
    { label: "Produk", icon: Package, href: "/admin/produk" },
    { label: "Varian", icon: Sparkles, href: "/admin/varian" },
    { label: "Gudang", icon: Building2, href: "/admin/gudang" },
    { label: "Agregator", icon: Network, href: "/admin/agregator" },
    { label: "Ekspedisi", icon: Truck, href: "/admin/ekspedisi" },
    { label: "Duitku", icon: CreditCard, href: "/admin/duitku" },
    { label: "Midtrans", icon: CreditCard, href: "/admin/midtrans" },
    { label: "QRIS Manual", icon: QrCode, href: "/admin/qris" },
    { label: "Transfer Bank", icon: Banknote, href: "/admin/bank" },
    { label: "HOLD Management", icon: Clock, href: "/admin/hold" },
    { label: "Refund Management", icon: RefreshCcw, href: "/admin/refund" },
    { label: "Topup Approval", icon: ArrowDownToLine, href: "/admin/topup" },
    {
      label: "Withdraw Approval",
      icon: ArrowUpFromLine,
      href: "/admin/withdraw",
    },
    { label: "Referral Management", icon: HandCoins, href: "/admin/referral" },
    { label: "Balance Adjustment", icon: Wallet, href: "/admin/balance" },
    { label: "Slider Homepage", icon: ImageIcon, href: "/admin/slider" },
    { label: "Homepage CMS", icon: FileText, href: "/admin/cms" },
    { label: "Trusted Stats", icon: BarChart3, href: "/admin/stats" },
    { label: "Benefit", icon: Sparkles, href: "/admin/benefit" },
    { label: "Testimonial", icon: MessageSquare, href: "/admin/testimonial" },
    { label: "FAQ", icon: BookOpen, href: "/admin/faq" },
    { label: "Tutorial", icon: GraduationCap, href: "/admin/tutorial" },
    { label: "E-Course", icon: BookOpen, href: "/admin/ecourse" },
    { label: "Notice", icon: Bell, href: "/admin/notice" },
    { label: "Tooltip", icon: HelpCircle, href: "/admin/tooltip" },
    { label: "Fonnte WA", icon: MessageSquare, href: "/admin/fonnte" },
    { label: "Media Library", icon: Database, href: "/admin/media" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Pengaturan Site", icon: Settings, href: "/admin/settings" },
    {
      label: "Deploy ke Vercel",
      icon: Rocket,
      href: "/admin/vercel",
      highlight: true,
    },
  ];

  const items = role === "member" ? memberMenu : adminMenu;
  const isVip = user?.vip_status;

  const SidebarBody = (
    <>
      <div
        className={`flex items-center justify-between p-4 border-b border-white/10 ${collapsed ? "px-3" : ""}`}
      >
        <a
          href={role === "member" ? "/dashboard" : "/admin"}
          className="flex items-center gap-2 min-w-0"
        >
          {logo ? (
            <img src={logo} alt="HyperDrop" className="h-8 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-violet-500/40">
              H
            </div>
          )}
          {!collapsed && (
            <span className="text-white font-bold text-lg truncate tracking-tight">
              HyperDrop
            </span>
          )}
        </a>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-violet-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user.avatar || user.image ? (
              <img
                src={user.avatar || user.image}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-violet-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold shrink-0">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user.name || user.email}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {role === "member" ? (
                  isVip ? (
                    <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                      <Crown className="w-3 h-3" /> VIP
                    </span>
                  ) : (
                    <span className="text-[10px] bg-white/10 text-violet-200 px-2 py-0.5 rounded-full font-medium">
                      Member
                    </span>
                  )
                ) : (
                  <span className="text-[10px] bg-violet-500/30 text-violet-200 px-2 py-0.5 rounded-full font-semibold capitalize">
                    {role.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            currentPath === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              currentPath.startsWith(item.href));
          const locked = item.vipLock && !isVip;
          return (
            <a
              key={item.href}
              href={locked ? "/dashboard/upgrade-vip" : item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                active
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/40"
                  : item.highlight
                    ? "text-amber-300 hover:bg-white/5"
                    : "text-violet-200 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : ""}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${item.highlight && !active ? "text-amber-400" : ""}`}
              />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {locked && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </>
              )}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex w-full items-center gap-2 px-3 py-2 rounded-xl text-violet-200 hover:bg-white/5 hover:text-white text-sm ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Sembunyikan</span>
            </>
          )}
        </button>
        <a
          href="/account/logout"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 text-sm ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </a>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 w-10 h-10 rounded-xl bg-white shadow-lg border border-violet-200 flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-violet-700" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`lg:sticky lg:top-0 lg:h-screen flex flex-col bg-[#1A1340] transition-all duration-300 z-50 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "fixed inset-y-0 left-0 w-72" : "hidden lg:flex"}`}
      >
        {SidebarBody}
      </aside>
    </>
  );
}
