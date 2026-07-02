import { NextResponse } from "next/server";
import { db } from "@/utils/db";

export async function GET() {
  try {
    const projects = await db.getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects failed:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar proyek" },
      { status: 500 }
    );
  }
}
