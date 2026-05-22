import { upload } from "@/app/api/utils/upload";
import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    if (!body.base64 && !body.url)
      return Response.json(
        { error: "base64 or url required" },
        { status: 400 },
      );
    const { url, mimeType, error } = await upload(
      body.base64 ? { base64: body.base64 } : { url: body.url },
    );
    if (error) return Response.json({ error }, { status: 500 });
    await sql`INSERT INTO media_library (url, file_name, file_type, uploaded_by) VALUES (${url}, ${body.file_name || null}, ${mimeType || null}, ${session.user.id})`;
    return Response.json({ url, mimeType });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal" }, { status: 500 });
  }
}
