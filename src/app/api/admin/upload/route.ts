import { NextResponse, type NextRequest } from "next/server";
import { checkAdminAuth } from "@/utils/auth";
import fs from "node:fs";
import path from "node:path";

// POST /api/admin/upload - Handle file upload and store in public/uploads/
export async function POST(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap gunakan gambar (JPG, PNG, WEBP, GIF, SVG)." },
        { status: 400 }
      );
    }

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate safe filename
    const fileExtension = file.name.split(".").pop();
    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = path.join(uploadsDir, safeFilename);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const webPath = `/uploads/${safeFilename}`;
    return NextResponse.json({ success: true, url: webPath });
  } catch (error) {
    console.error("POST /api/admin/upload failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat mengunggah file." },
      { status: 500 }
    );
  }
}
