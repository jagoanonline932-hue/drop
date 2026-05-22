import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { BarChart3, Users, Crown, ShoppingBag, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function Page() {
  return (
    <DashboardLayout currentPath="/admin/analytics" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);
  const s = data?.summary || {};
  const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-500" /> Analytics Lengkap
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Statistik komprehensif HyperDrop.
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
        <Chart title="Trend Order 30 Hari">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.ordersDaily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).getDate()}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Area
                dataKey="count"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                dataKey="total"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Distribusi Status Order">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.statusBreakdown || []}
                dataKey="count"
                nameKey="status"
                innerRadius={50}
                outerRadius={100}
              >
                {(data?.statusBreakdown || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Pertumbuhan Member">
          <ResponsiveContainer width="100%" height={260}>
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
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Top Ekspedisi">
          <ResponsiveContainer width="100%" height={260}>
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
        <Chart title="Payment Method">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.paymentBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="method" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Balance Flow">
          <ResponsiveContainer width="100%" height={260}>
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
                dataKey="inflow"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
              />
              <Area
                dataKey="outflow"
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
      <h3 className="font-bold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default Page;
