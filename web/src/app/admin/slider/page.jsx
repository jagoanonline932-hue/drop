import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { Image as ImageIcon } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/slider" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/sliders"
          listKey="sliders"
          itemKey="slider"
          title="Slider Homepage"
          icon={ImageIcon}
          columns={[
            { key: "image_url", label: "Gambar", type: "image" },
            { key: "title", label: "Judul" },
            { key: "subtitle", label: "Subtitle" },
            { key: "button_text", label: "Button" },
            { key: "order_position", label: "Urutan", align: "center" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            { name: "title", label: "Judul" },
            { name: "subtitle", label: "Subtitle", type: "textarea" },
            {
              name: "image_url",
              label: "Gambar Slider",
              type: "image",
              required: true,
            },
            { name: "button_text", label: "Button Text" },
            { name: "button_url", label: "Button Link" },
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
