import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Building2 } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/gudang" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/warehouses"
          listKey="warehouses"
          itemKey="warehouse"
          title="Gudang"
          icon={Building2}
          columns={[
            { key: "logo", label: "Logo", type: "image" },
            { key: "name", label: "Nama" },
            { key: "city", label: "Kota" },
            { key: "pickup_time", label: "Pickup" },
            { key: "phone", label: "Telp" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "name", label: "Nama Gudang", required: true },
            { name: "logo", label: "Logo Gudang", type: "image" },
            { name: "photo", label: "Foto Gudang", type: "image" },
            {
              name: "pickup_time",
              label: "Pickup Time",
              placeholder: "Setiap hari 16:00 WIB",
            },
            { name: "phone", label: "No Telp" },
            { name: "address", label: "Alamat Lengkap", type: "textarea" },
            { name: "city", label: "Kota" },
            { name: "province", label: "Provinsi" },
            { name: "postal_code", label: "Kode Pos" },
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
