import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Crown,
} from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/ecourse" role="admin">
      {() => <Inner />}
    </DashboardLayout>
  );
}

function Inner() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [openCourse, setOpenCourse] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [openLesson, setOpenLesson] = useState(false);
  const [editLesson, setEditLesson] = useState(null);

  const loadCourses = () =>
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []));
  const loadLessons = (cid) =>
    fetch(`/api/admin/lessons?course_id=${cid}`)
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons || []));
  useEffect(() => {
    loadCourses();
  }, []);
  useEffect(() => {
    if (active) loadLessons(active.id);
  }, [active]);

  const saveCourse = async (form) => {
    const body = editCourse ? { ...form, id: editCourse.id } : form;
    await fetch("/api/admin/courses", {
      method: editCourse ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpenCourse(false);
    loadCourses();
  };
  const delCourse = async (c) => {
    if (typeof window !== "undefined" && !window.confirm(`Hapus ${c.title}?`))
      return;
    await fetch(`/api/admin/courses?id=${c.id}`, { method: "DELETE" });
    loadCourses();
  };
  const saveLesson = async (form) => {
    const body = editLesson
      ? { ...form, id: editLesson.id }
      : { ...form, course_id: active.id };
    await fetch("/api/admin/lessons", {
      method: editLesson ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpenLesson(false);
    loadLessons(active.id);
  };
  const delLesson = async (l) => {
    if (typeof window !== "undefined" && !window.confirm(`Hapus ${l.title}?`))
      return;
    await fetch(`/api/admin/lessons?id=${l.id}`, { method: "DELETE" });
    loadLessons(active.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-purple-500" /> E-Course
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola course dan lesson untuk member.
          </p>
        </div>
        <button
          onClick={() => {
            setEditCourse(null);
            setOpenCourse(true);
          }}
          className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Tambah Course
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <h3 className="font-bold text-sm">Course</h3>
          {courses.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl border-2 p-3 cursor-pointer ${active?.id === c.id ? "border-emerald-500" : "border-slate-200"}`}
              onClick={() => setActive(c)}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{c.title}</p>
                {c.is_vip_only && <Crown className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-xs text-slate-500">{c.lesson_count} lessons</p>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditCourse(c);
                    setOpenCourse(true);
                  }}
                  className="p-1.5 rounded-md bg-blue-50 text-blue-600"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    delCourse(c);
                  }}
                  className="p-1.5 rounded-md bg-rose-50 text-rose-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {active ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Lesson: {active.title}</h3>
                <button
                  onClick={() => {
                    setEditLesson(null);
                    setOpenLesson(true);
                  }}
                  className="bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Tambah Lesson
                </button>
              </div>
              <div className="space-y-2">
                {lessons.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100"
                  >
                    <BookOpen className="w-5 h-5 text-purple-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{l.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {l.youtube_url}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditLesson(l);
                        setOpenLesson(true);
                      }}
                      className="p-1.5 rounded-md bg-blue-50 text-blue-600"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => delLesson(l)}
                      className="p-1.5 rounded-md bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {lessons.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">
                    Belum ada lesson
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Pilih course untuk kelola lesson
            </div>
          )}
        </div>
      </div>

      <Modal
        open={openCourse}
        onClose={() => setOpenCourse(false)}
        title={editCourse ? "Edit Course" : "Tambah Course"}
      >
        <CourseForm course={editCourse} onSave={saveCourse} />
      </Modal>
      <Modal
        open={openLesson}
        onClose={() => setOpenLesson(false)}
        title={editLesson ? "Edit Lesson" : "Tambah Lesson"}
      >
        <LessonForm lesson={editLesson} onSave={saveLesson} />
      </Modal>
    </div>
  );
}

function CourseForm({ course, onSave }) {
  const [f, setF] = useState({
    title: course?.title || "",
    description: course?.description || "",
    is_vip_only: course?.is_vip_only || false,
    order_position: course?.order_position || 0,
    is_active: course?.is_active !== false,
  });
  return (
    <div className="space-y-3">
      <Inp
        label="Judul"
        value={f.title}
        onChange={(v) => setF({ ...f, title: v })}
      />
      <Inp
        label="Deskripsi"
        value={f.description}
        onChange={(v) => setF({ ...f, description: v })}
        textarea
      />
      <Inp
        label="Urutan"
        type="number"
        value={f.order_position}
        onChange={(v) => setF({ ...f, order_position: Number(v) })}
      />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={f.is_vip_only}
          onChange={(e) => setF({ ...f, is_vip_only: e.target.checked })}
        />{" "}
        VIP Only
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={f.is_active}
          onChange={(e) => setF({ ...f, is_active: e.target.checked })}
        />{" "}
        Aktif
      </label>
      <button
        onClick={() => onSave(f)}
        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
      >
        Simpan
      </button>
    </div>
  );
}
function LessonForm({ lesson, onSave }) {
  const [f, setF] = useState({
    title: lesson?.title || "",
    description: lesson?.description || "",
    youtube_url: lesson?.youtube_url || "",
    duration: lesson?.duration || "",
    order_position: lesson?.order_position || 0,
    is_active: lesson?.is_active !== false,
  });
  return (
    <div className="space-y-3">
      <Inp
        label="Judul"
        value={f.title}
        onChange={(v) => setF({ ...f, title: v })}
      />
      <Inp
        label="Deskripsi"
        value={f.description}
        onChange={(v) => setF({ ...f, description: v })}
        textarea
      />
      <Inp
        label="YouTube URL"
        value={f.youtube_url}
        onChange={(v) => setF({ ...f, youtube_url: v })}
        placeholder="https://youtu.be/xxxx"
      />
      <Inp
        label="Durasi"
        value={f.duration}
        onChange={(v) => setF({ ...f, duration: v })}
        placeholder="12:30"
      />
      <Inp
        label="Urutan"
        type="number"
        value={f.order_position}
        onChange={(v) => setF({ ...f, order_position: Number(v) })}
      />
      <button
        onClick={() => onSave(f)}
        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
      >
        Simpan
      </button>
    </div>
  );
}

function Inp({ label, value, onChange, textarea = false, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          {...rest}
        />
      )}
    </div>
  );
}

export default Page;
