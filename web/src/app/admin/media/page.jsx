import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Database, Upload, Loader2, Copy } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/media" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = () =>
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => setMedia(d.media || []));
  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: reader.result, file_name: f.name }),
        });
        load();
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  const copy = (url) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Database className="w-7 h-7 text-purple-500" /> Media Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola file & gambar yang diupload.
          </p>
        </div>
        <label className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer">
          {uploading ? (
            <Loader2
              className="w-4 h-4"
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Upload className="w-4 h-4" />
          )}{" "}
          Upload Media
          <input
            type="file"
            onChange={handleFile}
            className="hidden"
            accept="image/*,application/pdf"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {media.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {m.file_type?.startsWith("image") ? (
              <img src={m.url} alt="" className="aspect-square object-cover" />
            ) : (
              <div className="aspect-square bg-slate-100 flex items-center justify-center text-xs text-slate-500 p-2 text-center break-all">
                {m.file_name}
              </div>
            )}
            <button
              onClick={() => copy(m.url)}
              className="w-full p-2 text-xs font-semibold bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 inline-flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" />{" "}
              {copied === m.url ? "Tersalin!" : "Salin URL"}
            </button>
          </div>
        ))}
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default Page;
