import { NextResponse } from "next/server";
import { db } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [profile, settings] = await Promise.all([
      db.getProfile(),
      db.getSettings()
    ]);
    return NextResponse.json({
      success: true,
      profile,
      settings
    });
  } catch (error) {
    console.error("Public GET /api/settings failed:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengaturan" },
      { status: 500 }
    );
  }
}
