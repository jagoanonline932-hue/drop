import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Banknote } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/bank" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/banks"
          listKey="banks"
          itemKey="bank"
          title="Rekening Bank"
          icon={Banknote}
          columns={[
            { key: "logo", label: "Logo", type: "image" },
            { key: "bank_name", label: "Bank" },
            { key: "account_number", label: "No Rekening" },
            { key: "account_holder", label: "Nama Pemilik" },
            {
              key: "is_maintenance",
              label: "Maintenance",
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
            { name: "bank_name", label: "Nama Bank", required: true },
            { name: "account_number", label: "Nomor Rekening", required: true },
            { name: "account_holder", label: "Nama Pemilik", required: true },
            { name: "logo", label: "Logo Bank", type: "image" },
            {
              name: "order_position",
              label: "Urutan",
              type: "number",
              default: 0,
            },
            {
              name: "is_maintenance",
              label: "Mode Maintenance",
              type: "boolean",
              default: false,
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
