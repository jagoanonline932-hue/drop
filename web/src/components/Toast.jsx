import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (opts) => {
      const id = Date.now() + Math.random();
      const t = { id, type: "info", duration: 4000, ...opts };
      setToasts((prev) => [...prev, t]);
      setTimeout(() => remove(id), t.duration);
    },
    [remove],
  );

  const api = {
    show,
    success: (msg, opts = {}) =>
      show({ ...opts, message: msg, type: "success" }),
    error: (msg, opts = {}) => show({ ...opts, message: msg, type: "error" }),
    warning: (msg, opts = {}) =>
      show({ ...opts, message: msg, type: "warning" }),
    info: (msg, opts = {}) => show({ ...opts, message: msg, type: "info" }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const tm = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tm);
  }, []);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-violet-600" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />,
  };
  const borders = {
    success: "border-violet-200 bg-violet-50",
    error: "border-red-200 bg-red-50",
    warning: "border-amber-200 bg-amber-50",
    info: "border-indigo-200 bg-indigo-50",
  };

  return (
    <div
      className={`pointer-events-auto rounded-xl border-2 ${borders[toast.type]} shadow-xl px-4 py-3 flex items-start gap-3 transition-all duration-300 ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        )}
        <p className="text-sm text-slate-700">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: () => {},
      success: (m) => typeof window !== "undefined" && console.log("✓", m),
      error: (m) => typeof window !== "undefined" && console.log("✗", m),
      warning: (m) => typeof window !== "undefined" && console.log("⚠", m),
      info: (m) => typeof window !== "undefined" && console.log("ⓘ", m),
    };
  }
  return ctx;
}
