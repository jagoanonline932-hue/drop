import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { MessageSquare } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/testimonial" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/testimonials"
          listKey="testimonials"
          itemKey="testimonial"
          title="Testimonial"
          icon={MessageSquare}
          columns={[
            { key: "avatar", label: "Avatar", type: "image" },
            { key: "name", label: "Nama" },
            { key: "role", label: "Role" },
            { key: "content", label: "Konten" },
            { key: "rating", label: "Rating", align: "center" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "name", label: "Nama", required: true },
            { name: "role", label: "Role (mis. VIP Member - Bandung)" },
            { name: "avatar", label: "Foto", type: "image" },
            {
              name: "content",
              label: "Isi Testimonial",
              type: "textarea",
              required: true,
            },
            {
              name: "rating",
              label: "Rating (1-5)",
              type: "number",
              default: 5,
            },
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
