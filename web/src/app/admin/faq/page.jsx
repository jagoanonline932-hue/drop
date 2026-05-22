import DashboardLayout from "@/components/DashboardLayout";
import AdminCRUD from "@/components/AdminCRUD";
import { BookOpen } from "lucide-react";

function Page() {
  return (
    <DashboardLayout currentPath="/admin/faq" role="admin">
      {() => (
        <AdminCRUD
          endpoint="/api/admin/faqs"
          listKey="faqs"
          itemKey="faq"
          title="FAQ"
          icon={BookOpen}
          columns={[
            { key: "question", label: "Pertanyaan" },
            { key: "category", label: "Kategori" },
            { key: "order_position", label: "Urutan", align: "center" },
            {
              key: "is_active",
              label: "Aktif",
              type: "boolean",
              align: "center",
            },
          ]}
          fields={[
            {
              name: "question",
              label: "Pertanyaan",
              required: true,
              type: "textarea",
            },
            {
              name: "answer",
              label: "Jawaban",
              required: true,
              type: "textarea",
            },
            { name: "category", label: "Kategori" },
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
