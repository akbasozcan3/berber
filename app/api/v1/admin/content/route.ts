import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pageContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (slug) {
      const page = await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1);
      return jsonResponse(page[0] || null);
    }
    return jsonResponse(await db.select().from(pageContent));
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const body = await parseBody<{
      slug: string;
      title?: string;
      subtitle?: string;
      heroImage?: string;
      content?: string;
      sections?: unknown;
      meta?: unknown;
    }>(request);

    if (!body.slug) return errorResponse("Slug gerekli", 400);

    const existing = await db.select().from(pageContent).where(eq(pageContent.slug, body.slug)).limit(1);
    const updates = {
      title: body.title,
      subtitle: body.subtitle,
      heroImage: body.heroImage,
      content: body.content,
      sections: body.sections ? JSON.stringify(body.sections) : undefined,
      meta: body.meta ? JSON.stringify(body.meta) : undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existing[0]) {
      await db.update(pageContent).set(updates).where(eq(pageContent.slug, body.slug));
    } else {
      await db.insert(pageContent).values({
        slug: body.slug,
        title: body.title || "",
        subtitle: body.subtitle || null,
        heroImage: body.heroImage || null,
        content: body.content || "",
        sections: body.sections ? JSON.stringify(body.sections) : null,
        meta: body.meta ? JSON.stringify(body.meta) : null,
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/hakkimizda");

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}
