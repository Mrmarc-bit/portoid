import { NextResponse } from "next/server";
import { db } from "@/utils/db";

export async function GET() {
  try {
    const posts = await db.getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts failed:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar artikel blog" },
      { status: 500 }
    );
  }
}
