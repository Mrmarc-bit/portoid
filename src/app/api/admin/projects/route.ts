import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";

// POST /api/admin/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const { slug, title, summary, content, images, tag, link } = body;

    if (!slug || !title || !summary || !content) {
      return NextResponse.json(
        { error: "Slug, Title, Summary, dan Content wajib diisi." },
        { status: 400 }
      );
    }

    const created = await db.addProject({
      slug: slug.trim(),
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      images: Array.isArray(images) ? images : [],
      publishedAt: new Date().toISOString(),
      tag: Array.isArray(tag) ? tag : [],
      link: link ? link.trim() : ""
    });

    return NextResponse.json({ success: true, project: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/projects failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
