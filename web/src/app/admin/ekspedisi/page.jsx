import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Truck } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/ekspedisi" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/expeditions"
          listKey="expeditions"
          itemKey="expedition"
          title="Ekspedisi"
          icon={Truck}
          columns={[
            { key: "logo", label: "Logo", type: "image" },
            { key: "name", label: "Nama" },
            { key: "code", label: "Kode" },
            {
              key: "is_vip_only",
              label: "VIP Only",
              type: "boolean",
              align: "center",
            },
            {
              key: "show_on_homepage",
              label: "Homepage",
              type: "boolean",
              align: "center",
            },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "name", label: "Nama Ekspedisi", required: true },
            { name: "code", label: "Kode", placeholder: "JNE, SPX, dst" },
            { name: "logo", label: "Logo", type: "image" },
            {
              name: "is_vip_only",
              label: "Khusus VIP (mis. SPX Free RTS)",
              type: "boolean",
              default: false,
            },
            {
              name: "order_position",
              label: "Urutan",
              type: "number",
              default: 0,
            },
            {
              name: "show_on_homepage",
              label: "Tampilkan di Homepage",
              type: "boolean",
              default: true,
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
