import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/admin/projects/[id] - Update project
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { slug, title, summary, content, images, tag, link } = body;

    if (!slug || !title || !summary || !content) {
      return NextResponse.json(
        { error: "Slug, Title, Summary, dan Content wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await db.updateProject(id, {
      slug: slug.trim(),
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      images: Array.isArray(images) ? images : [],
      publishedAt: new Date().toISOString(), // keep or update date
      tag: Array.isArray(tag) ? tag : [],
      link: link ? link.trim() : ""
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan atau gagal diperbarui" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("PUT /api/admin/projects/[id] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const { id } = await params;
    const success = await db.deleteProject(id);

    if (!success) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan atau gagal dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Proyek berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/projects/[id] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
