import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { GraduationCap } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/tutorial" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/tutorials"
          listKey="tutorials"
          itemKey="tutorial"
          title="Tutorial"
          icon={GraduationCap}
          columns={[
            { key: "thumbnail", label: "Thumb", type: "image" },
            { key: "title", label: "Judul" },
            { key: "category", label: "Kategori" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "title", label: "Judul", required: true },
            {
              name: "category",
              label: "Kategori",
              placeholder: "Cara Order, Dasar, dst",
            },
            { name: "content", label: "Isi Tutorial", type: "textarea" },
            { name: "youtube_url", label: "YouTube URL (Opsional)" },
            { name: "thumbnail", label: "Thumbnail", type: "image" },
            {
              name: "order_position",
              label: "Urutan",
              type: "number",
              default: 0,
            },
            {
              name: "is_active",
              label: "Aktif",
              type: "boolean",
              default: true,
            },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
export default Page;
