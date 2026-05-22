import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Network } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/agregator" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/aggregators"
          listKey="aggregators"
          itemKey="aggregator"
          title="Aggregator"
          icon={Network}
          columns={[
            { key: "logo", label: "Logo", type: "image" },
            { key: "name", label: "Nama" },
            { key: "website", label: "Website" },
            {
              key: "show_on_homepage",
              label: "Tampil Homepage",
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
            { name: "name", label: "Nama Aggregator", required: true },
            { name: "logo", label: "Logo", type: "image" },
            { name: "description", label: "Deskripsi", type: "textarea" },
            { name: "website", label: "Website URL" },
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
