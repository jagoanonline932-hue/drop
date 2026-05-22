import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/notifikasi" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [list, setList] = useState([]);
  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setList(d.notifications || []));
  }, []);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
        <Bell className="w-7 h-7" /> Notifikasi Admin
      </h1>
      <div className="bg-white rounded-2xl border divide-y">
        {list.length === 0 ? (
          <p className="text-center py-12 text-slate-400">
            Belum ada notifikasi
          </p>
        ) : (
          list.map((n) => (
            <div key={n.id} className="p-4">
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-slate-600">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(n.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default Page;
