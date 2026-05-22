import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  Package,
  Wallet,
  Clock,
  TrendingUp,
  Users,
  ShoppingBag,
  Crown,
  ArrowRight,
  AlertCircle,
  MessageCircle,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Network,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#7c3aed",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#d946ef",
];

function DashboardHome() {
  return (
    <DashboardLayout currentPath="/dashboard">
      {({ profile, settings }) => (
        <Inner profile={profile} settings={settings} />
      )}
    </DashboardLayout>
  );
}

function Inner({ profile, settings }) {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/member/analytics").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/orders?scope=me&limit=5").then((r) =>
        r.ok ? r.json() : { orders: [] },
      ),
      fetch("/api/notices").then((r) => (r.ok ? r.json() : { notices: [] })),
    ])
      .then(([a, o, n]) => {
        setAnalytics(a);
        setOrders(o?.orders?.slice(0, 5) || []);
        setNotices(n?.notices || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const profileIncomplete =
    !profile.full_name || !profile.phone || !profile.bank_account_number;

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <p className="text-sm text-violet-600 font-semibold mb-1">
            Halo, {profile.full_name || profile.name || "Member"} 👋
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Dashboard HyperDrop
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau bisnis dropship Anda secara realtime.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/dashboard/produk"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/30"
          >
            <Package className="w-4 h-4" /> Lihat Produk
          </a>
          {!profile.vip_status && (
            <a
              href="/dashboard/upgrade-vip"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/30"
            >
              <Crown className="w-4 h-4" /> Upgrade VIP
            </a>
          )}
        </div>
      </div>

      {/* Notices */}
      {profileIncomplete && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Lengkapi Profil Anda</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Mohon lengkapi data profil dan rekening bank di menu Pengaturan
              untuk dapat melakukan withdraw.
            </p>
          </div>
          <a
            href="/dashboard/pengaturan"
            className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Lengkapi <ArrowRight className="inline w-3 h-3" />
          </a>
        </div>
      )}
      {notices.map((n) => (
        <div
          key={n.id}
          className={`rounded-2xl border-2 p-4 flex items-start gap-3 ${
            n.notice_type === "warning"
              ? "bg-amber-50 border-amber-200"
              : n.notice_type === "error"
                ? "bg-rose-50 border-rose-200"
                : n.notice_type === "success"
                  ? "bg-violet-50 border-violet-200"
                  : "bg-indigo-50 border-indigo-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm mt-0.5">{n.content}</p>
          </div>
        </div>
      ))}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Saldo Aktif"
          value={fmt(profile.balance)}
          icon={Wallet}
          accent="violet"
          tooltip="Saldo siap pakai untuk order/withdraw"
        />
        <StatCard
          label="Saldo HOLD"
          value={fmt(profile.balance_hold)}
          icon={Clock}
          accent="amber"
          tooltip="Saldo yang sedang ditahan untuk order berjalan"
        />
        <StatCard
          label="Total Order"
          value={analytics?.summary?.total_orders || 0}
          icon={ShoppingBag}
          accent="blue"
        />
        <StatCard
          label="Total Profit"
          value={fmt(analytics?.summary?.total_profit)}
          icon={TrendingUp}
          accent="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard
          title="Grafik Penjualan 30 Hari"
          subtitle="Total transaksi & nilai penjualan harian"
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics?.salesDaily || []}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).getDate()}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#7c3aed"
                fill="url(#g1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Profit Member"
          subtitle="Profit harian dari order Anda"
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.profitDaily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).getDate()}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pergerakan Saldo"
          subtitle="Saldo masuk & keluar 30 hari"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.balanceDaily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).getDate()}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Order" subtitle="Distribusi status order Anda">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics?.statusBreakdown || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
              >
                {(analytics?.statusBreakdown || []).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick actions + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-violet-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Order Terbaru</h3>
            <a
              href="/dashboard/tracking"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              Lihat semua →
            </a>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada order</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <a
                  key={o.id}
                  href={`/dashboard/tracking?id=${o.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-violet-50/50 border border-violet-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {o.product_image ? (
                      <img
                        src={o.product_image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-violet-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {o.product_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.order_number} •{" "}
                        {new Date(o.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-violet-100 p-5">
          <h3 className="font-bold text-slate-900 mb-4">Aksi Cepat</h3>
          <div className="space-y-2">
            <QuickAction
              href="/dashboard/internal-cod"
              icon={ShieldCheck}
              label="Buat Order COD"
              desc="Internal COD VIP"
            />
            <QuickAction
              href="/dashboard/external"
              icon={Network}
              label="Order External"
              desc="Aggregator pihak ketiga"
            />
            <QuickAction
              href="/dashboard/topup"
              icon={Wallet}
              label="Topup Saldo"
              desc="Tambah saldo"
            />
            <QuickAction
              href="/dashboard/referral"
              icon={Users}
              label="Referral"
              desc="Ajak teman, dapat bonus"
            />
            <QuickAction
              href="/dashboard/ecourse"
              icon={GraduationCap}
              label="E-Course"
              desc="Belajar dropship"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-violet-100 p-5">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 group transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-violet-300 group-hover:text-violet-600" />
    </a>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-slate-100 text-slate-600",
    hold: "bg-amber-100 text-amber-700",
    shipping: "bg-indigo-100 text-indigo-700",
    delivered: "bg-violet-100 text-violet-700",
    completed: "bg-violet-100 text-violet-700",
    returned: "bg-rose-100 text-rose-700",
    refund: "bg-fuchsia-100 text-fuchsia-700",
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

export default DashboardHome;
