import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Crown } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/vip" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/vip-packages"
          listKey="packages"
          itemKey="package"
          title="Paket VIP"
          icon={Crown}
          columns={[
            { key: "name", label: "Nama Paket" },
            { key: "price", label: "Harga", type: "currency", align: "right" },
            { key: "duration_days", label: "Durasi (hari)", align: "center" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "name", label: "Nama Paket", required: true },
            {
              name: "price",
              label: "Harga (Rp)",
              type: "number",
              required: true,
            },
            {
              name: "duration_days",
              label: "Durasi (hari)",
              type: "number",
              default: 365,
            },
            { name: "description", label: "Deskripsi", type: "textarea" },
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
