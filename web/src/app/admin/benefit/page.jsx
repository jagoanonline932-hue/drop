import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Sparkles } from "lucide-react";

const ICONS = [
  "ShieldCheck",
  "Network",
  "Wallet",
  "RefreshCcw",
  "MapPin",
  "GraduationCap",
  "Users",
  "LayoutDashboard",
  "Sparkles",
  "Truck",
  "Crown",
  "Rocket",
];

function Page() {
  return (
    <DashboardLayout currentPath="/admin/benefit" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/benefits"
          listKey="benefits"
          itemKey="benefit"
          title="Benefit Homepage"
          icon={Sparkles}
          columns={[
            { key: "title", label: "Judul" },
            { key: "description", label: "Deskripsi" },
            { key: "icon", label: "Icon" },
            { key: "order_position", label: "Urutan", align: "center" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "title", label: "Judul Benefit", required: true },
            { name: "description", label: "Deskripsi", type: "textarea" },
            {
              name: "icon",
              label: "Icon (Lucide)",
              type: "select",
              options: ICONS.map((i) => ({ value: i, label: i })),
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
