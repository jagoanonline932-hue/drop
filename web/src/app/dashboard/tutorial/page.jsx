import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Play, ChevronRight } from "lucide-react";
import Modal from "@/components/Modal";

function TutorialPage() {
  return (
    <DashboardLayout currentPath="/dashboard/tutorial">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [tutorials, setTutorials] = useState([]);
  const [active, setActive] = useState(null);
  useEffect(() => {
    fetch("/api/tutorials")
      .then((r) => r.json())
      .then((d) => setTutorials(d.tutorials || []));
  }, []);

  const categories = [...new Set(tutorials.map((t) => t.category || "Umum"))];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-500" /> Tutorial Lengkap
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Panduan langkah demi langkah menggunakan HyperDrop.
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-lg font-bold mb-3 capitalize">{cat}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tutorials
              .filter((t) => (t.category || "Umum") === cat)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  className="text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                    {t.thumbnail ? (
                      <img
                        src={t.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : t.youtube_url ? (
                      <Play className="w-12 h-12" />
                    ) : (
                      <BookOpen className="w-12 h-12" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold mb-1">{t.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {t.content}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold mt-2 inline-flex items-center gap-1">
                      Buka <ChevronRight className="w-3 h-3" />
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      {tutorials.length === 0 && (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            Belum ada tutorial. Admin sedang menyiapkan.
          </p>
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title}
        size="lg"
      >
        {active && (
          <div className="space-y-4">
            {active.youtube_url && (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <iframe
                  src={ytEmbed(active.youtube_url)}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
              {active.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ytEmbed(url) {
  const m = url?.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]+)/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export default TutorialPage;
