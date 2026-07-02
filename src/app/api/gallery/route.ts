import { NextResponse } from "next/server";
import { db } from "@/utils/db";

export async function GET() {
  try {
    const images = await db.getGalleryImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET /api/gallery failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat gambar galeri" },
      { status: 500 }
    );
  }
}
