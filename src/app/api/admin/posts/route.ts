import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";

// POST /api/admin/posts - Create a new post
export async function POST(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const { slug, title, summary, content, image, tag } = body;

    if (!slug || !title || !summary || !content) {
      return NextResponse.json(
        { error: "Slug, Title, Summary, dan Content wajib diisi." },
        { status: 400 }
      );
    }

    const created = await db.addPost({
      slug: slug.trim(),
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      image: image ? image.trim() : "",
      publishedAt: new Date().toISOString(),
      tag: Array.isArray(tag) ? tag : []
    });

    return NextResponse.json({ success: true, post: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/posts failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
