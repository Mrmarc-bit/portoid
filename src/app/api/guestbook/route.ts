import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";

// GET /api/guestbook
export async function GET() {
  try {
    const entries = await db.getGuestbookEntries();
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error("GET /api/guestbook failed:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data guestbook" },
      { status: 500 }
    );
  }
}

// POST /api/guestbook
export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
    }

    const entry = await db.addGuestbookEntry(name.trim(), message.trim());
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/guestbook failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pesan guestbook" },
      { status: 500 }
    );
  }
}
