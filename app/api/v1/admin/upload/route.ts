import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";
import { put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function safeFolder(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return cleaned || "general";
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = safeFolder(String(formData.get("folder") || "general"));

    if (!(file instanceof File)) {
      return errorResponse("Dosya gerekli.", 400);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse("Sadece JPG, PNG, WEBP veya GIF yüklenebilir.", 400);
    }
    if (file.size > MAX_BYTES) {
      return errorResponse("Dosya boyutu en fazla 5MB olabilir.", 400);
    }

    const ext = extensionForMime(file.type);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const blobPath = `${folder}/${filename}`;

    const bytes = Buffer.from(await file.arrayBuffer());
    // Vercel ortamında kalıcı saklama için Blob; yerelde ise public/uploads'a yaz.
    if (process.env.VERCEL) {
      const result = await put(blobPath, bytes, {
        access: "public",
        contentType: file.type,
      });
      return jsonResponse({ url: result.url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);
    return jsonResponse({ url: `/uploads/${folder}/${filename}` });
  } catch (error) {
    if (error instanceof Error && /unauthorized/i.test(error.message)) {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Görsel yüklenemedi.", 500);
  }
}
