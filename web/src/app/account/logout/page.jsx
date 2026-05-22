import { useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { Loader2, LogOut } from "lucide-react";

function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    const id = setTimeout(() => {
      signOut({ callbackUrl: "/", redirect: true });
    }, 800);
    return () => clearTimeout(id);
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-slate-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <LogOut className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Keluar dari HyperDrop
        </h1>
        <p className="text-slate-500 mb-6">
          Sampai jumpa lagi! Sedang mengakhiri sesi Anda...
        </p>
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <Loader2
            className="w-4 h-4"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span className="text-sm font-medium">Memproses logout</span>
        </div>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default LogoutPage;
