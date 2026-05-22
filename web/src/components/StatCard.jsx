export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "violet",
  trend = null,
  prefix = "",
  suffix = "",
  tooltip = null,
}) {
  // Solid color accents (NO gradients). Format: "iconBg text bg"
  const accents = {
    violet: "bg-violet-600 text-violet-700 bg-violet-50",
    emerald: "bg-violet-600 text-violet-700 bg-violet-50", // alias -> violet
    blue: "bg-indigo-600 text-indigo-700 bg-indigo-50",
    amber: "bg-amber-500 text-amber-700 bg-amber-50",
    rose: "bg-rose-500 text-rose-700 bg-rose-50",
    slate: "bg-slate-700 text-slate-700 bg-slate-50",
    purple: "bg-fuchsia-600 text-fuchsia-700 bg-fuchsia-50",
  };
  const [iconBg, color, softBg] = (accents[accent] || accents.violet).split(
    " ",
  );
  const display =
    typeof value === "number" ? value.toLocaleString("id-ID") : value;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-violet-100 shadow-sm hover:shadow-lg transition-all p-5 group">
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${softBg} opacity-60 group-hover:scale-110 transition-transform duration-500`}
      />
      <div className="relative flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-md`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <p className="relative text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
        {prefix}
        {display}
        {suffix}
      </p>
      {trend !== null && trend !== undefined && (
        <p
          className={`relative mt-1 text-xs font-semibold ${trend >= 0 ? "text-violet-600" : "text-rose-600"}`}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs periode sebelumnya
        </p>
      )}
      {tooltip && (
        <p className="relative mt-2 text-[11px] text-slate-400">{tooltip}</p>
      )}
    </div>
  );
}
