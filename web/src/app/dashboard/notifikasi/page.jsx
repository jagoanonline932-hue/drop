import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, Check, CheckCheck } from "lucide-react";

function NotifPage() {
  return (
    <DashboardLayout currentPath="/dashboard/notifikasi">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [list, setList] = useState([]);
  const load = () =>
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setList(d.notifications || []));
  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  };
  const markOne = async (id) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-amber-500" /> Notifikasi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Notifikasi sistem terbaru untuk Anda.
          </p>
        </div>
        <button
          onClick={markAll}
          className="text-sm text-emerald-600 font-semibold inline-flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" /> Tandai semua dibaca
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {list.length === 0 ? (
          <p className="text-center py-12 text-slate-400">
            Belum ada notifikasi
          </p>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 ${!n.is_read ? "bg-emerald-50/40" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                  n.notification_type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : n.notification_type === "warning"
                      ? "bg-amber-100 text-amber-600"
                      : n.notification_type === "error"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-blue-100 text-blue-600"
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">
                    {new Date(n.created_at).toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-2">
                    {n.link && (
                      <a
                        href={n.link}
                        className="text-xs font-semibold text-emerald-600"
                      >
                        Buka →
                      </a>
                    )}
                    {!n.is_read && (
                      <button
                        onClick={() => markOne(n.id)}
                        className="text-xs text-slate-500 inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Tandai dibaca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotifPage;
