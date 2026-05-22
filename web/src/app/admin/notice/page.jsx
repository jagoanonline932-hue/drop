import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Bell } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/notice" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/notices"
          listKey="notices"
          itemKey="notice"
          title="Notice"
          icon={Bell}
          columns={[
            { key: "title", label: "Judul" },
            { key: "notice_type", label: "Tipe" },
            { key: "target_role", label: "Target" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
            { key: "created_at", label: "Dibuat", type: "date" },
          ]}
          fields={[
            { name: "title", label: "Judul", required: true },
            {
              name: "content",
              label: "Isi Notice",
              type: "textarea",
              required: true,
            },
            {
              name: "notice_type",
              label: "Tipe",
              type: "select",
              options: [
                { value: "info", label: "Info" },
                { value: "success", label: "Success" },
                { value: "warning", label: "Warning" },
                { value: "error", label: "Error" },
              ],
              default: "info",
            },
            {
              name: "target_role",
              label: "Target",
              type: "select",
              options: [
                { value: "all", label: "Semua" },
                { value: "member", label: "Member Saja" },
                { value: "vip", label: "VIP Member" },
                { value: "non_vip", label: "Non VIP" },
                { value: "admin", label: "Admin Saja" },
              ],
              default: "all",
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
