import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  Users,
  Crown,
  ShoppingBag,
  TrendingUp,
  RefreshCcw,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

function AdminHome() {
  return (
    <DashboardLayout currentPath="/admin" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const s = data?.summary || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Dashboard Admin
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau seluruh aktivitas HyperDrop secara realtime.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Member"
          value={s.total_members || 0}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="VIP Members"
          value={s.vip_members || 0}
          icon={Crown}
          accent="amber"
        />
        <StatCard
          label="Order Hari Ini"
          value={s.orders_today || 0}
          icon={ShoppingBag}
          accent="emerald"
        />
        <StatCard
          label="Total Revenue"
          value={fmt(s.total_revenue)}
          icon={TrendingUp}
          accent="purple"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Chart title="Grafik Order 30 Hari">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data?.ordersDaily || []}>
              <defs>
                <linearGradient id="ord" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
                dataKey="count"
                stroke="#10b981"
                fill="url(#ord)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Status Order">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.statusBreakdown || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
              >
                {(data?.statusBreakdown || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Ekspedisi Terpopuler">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.expeditionBreakdown || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <RTooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Pertumbuhan Member 30 Hari">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.memberGrowth || []}>
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
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Pembayaran Method">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.paymentBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="method" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Saldo Flow 30 Hari">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data?.balanceFlow || []}>
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
                dataKey="inflow"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>
      </div>
    </div>
  );
}

function Chart({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default AdminHome;
