import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GraduationCap, Play, Crown, BookOpen } from "lucide-react";

function EcoursePage() {
  return (
    <DashboardLayout currentPath="/dashboard/ecourse">
      {({ profile }) => <Inner profile={profile} />}
    </DashboardLayout>
  );
}

function Inner({ profile }) {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState({});
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  const openCourse = async (c) => {
    setActiveCourse(c);
    if (!lessons[c.id]) {
      const r = await fetch(`/api/courses/${c.id}/lessons`);
      const d = await r.json();
      setLessons((l) => ({ ...l, [c.id]: d.lessons || [] }));
    }
  };

  const visibleCourses = courses.filter(
    (c) => !c.is_vip_only || profile.vip_status,
  );
  const lockedCourses = courses.filter(
    (c) => c.is_vip_only && !profile.vip_status,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-purple-500" /> E-Course Premium
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Belajar dropship dari praktisi langsung.
        </p>
      </div>

      {!activeCourse ? (
        <>
          <div>
            <h2 className="text-lg font-bold mb-3">Course Tersedia</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCourse(c)}
                  className="text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white relative">
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12" />
                    )}
                    {c.is_vip_only && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <Crown className="w-3 h-3" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {c.description}
                    </p>
                    <p className="text-xs text-purple-600 font-semibold mt-2">
                      {c.lesson_count || 0} lessons
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {lockedCourses.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">
                Course VIP <Crown className="inline w-4 h-4 text-amber-500" />
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedCourses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden opacity-70 relative"
                  >
                    <div className="aspect-video bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                      <Crown className="w-12 h-12" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-1">{c.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {c.description}
                      </p>
                      <a
                        href="/dashboard/upgrade-vip"
                        className="mt-2 text-xs font-bold bg-amber-500 text-white inline-block px-3 py-1 rounded-md"
                      >
                        Upgrade VIP
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <button
            onClick={() => {
              setActiveCourse(null);
              setActiveLesson(null);
            }}
            className="text-sm font-semibold text-purple-600 mb-3"
          >
            ← Kembali ke daftar course
          </button>
          <h2 className="text-2xl font-bold">{activeCourse.title}</h2>
          <p className="text-sm text-slate-500 mb-4">
            {activeCourse.description}
          </p>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {activeLesson ? (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                  <iframe
                    src={ytEmbed(activeLesson.youtube_url)}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  Pilih lesson untuk mulai belajar
                </div>
              )}
              {activeLesson && (
                <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-lg">{activeLesson.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeLesson.description}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 max-h-[600px] overflow-y-auto">
              <h4 className="font-bold mb-3">Daftar Lesson</h4>
              <div className="space-y-2">
                {(lessons[activeCourse.id] || []).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveLesson(l)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 ${activeLesson?.id === l.id ? "bg-purple-50 border border-purple-200" : "hover:bg-slate-50 border border-transparent"}`}
                  >
                    <Play
                      className={`w-4 h-4 ${activeLesson?.id === l.id ? "text-purple-500" : "text-slate-400"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">
                        {l.title}
                      </p>
                      {l.duration && (
                        <p className="text-[10px] text-slate-400">
                          {l.duration}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
                {(lessons[activeCourse.id] || []).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Belum ada lesson
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ytEmbed(url) {
  if (!url) return "";
  const m = url.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]+)/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url;
}

export default EcoursePage;
