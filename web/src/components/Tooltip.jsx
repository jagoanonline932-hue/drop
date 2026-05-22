import { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function Tooltip({
  content,
  children,
  side = "top",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      {children ?? (
        <HelpCircle className="w-4 h-4 text-slate-400 hover:text-emerald-500 cursor-help" />
      )}
      {open && content && (
        <span
          className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-xl whitespace-pre-wrap min-w-[140px] max-w-[260px] ${positions[side]} animate-tt-fade`}
        >
          {content}
          <style jsx>{`
            @keyframes ttFade { from { opacity: 0; transform: translate(-50%, 4px) } to { opacity: 1 } }
            .animate-tt-fade { animation: ttFade .15s ease }
          `}</style>
        </span>
      )}
    </span>
  );
}
