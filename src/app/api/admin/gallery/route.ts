import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";

// POST /api/admin/gallery - Add image to gallery
export async function POST(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const { src, alt, orientation } = body;

    if (!src || !alt || !orientation) {
      return NextResponse.json(
        { error: "Src, Alt, dan Orientation ('horizontal' atau 'vertical') wajib diisi." },
        { status: 400 }
      );
    }

    const created = await db.addGalleryImage({
      src: src.trim(),
      alt: alt.trim(),
      orientation: orientation === "vertical" ? "vertical" : "horizontal"
    });

    return NextResponse.json({ success: true, image: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/gallery failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gallery - Delete gallery image (id passed in searchParams or JSON body)
export async function DELETE(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gambar wajib disertakan." }, { status: 400 });
    }

    const success = await db.deleteGalleryImage(id);
    if (!success) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan atau gagal dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Gambar berhasil dihapus dari galeri" });
  } catch (error) {
    console.error("DELETE /api/admin/gallery failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
