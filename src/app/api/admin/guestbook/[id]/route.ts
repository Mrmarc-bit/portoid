import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/admin/guestbook/[id] - Delete a comment
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Check Authentication
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // 2. Perform Delete
    const success = await db.deleteGuestbookEntry(id);
    if (!success) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan atau gagal dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/guestbook/[id] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/guestbook/[id] - Edit a comment
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Check Authentication
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const { name, message } = await req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
    }

    // 2. Perform Update
    const updated = await db.updateGuestbookEntry(id, name.trim(), message.trim());
    if (!updated) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan atau gagal diperbarui" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch (error) {
    console.error("PUT /api/admin/guestbook/[id] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
