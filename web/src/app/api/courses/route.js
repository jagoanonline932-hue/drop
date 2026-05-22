import sql from "@/app/api/utils/sql";
export async function GET() {
  const rows =
    await sql`SELECT c.*, (SELECT COUNT(*)::int FROM lessons WHERE course_id = c.id AND is_active = true) AS lesson_count FROM courses c WHERE c.is_active = true ORDER BY c.order_position ASC, c.id ASC`;
  return Response.json({ courses: rows });
}
