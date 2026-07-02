import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";
import fs from "fs";
import path from "path";

// Helper to write settings changes back to the static content.tsx file in development mode
function updateStaticSettingsFile(settings: any) {
  try {
    const filePath = path.join(process.cwd(), "src", "resources", "content.tsx");
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf-8");
      
      const replaceField = (field: string, value: string) => {
        const regex = new RegExp(`(\\s*)${field}:\\s*[^\\n]*,`);
        if (regex.test(content)) {
          content = content.replace(regex, `$1${field}: ${JSON.stringify(value)},`);
        } else {
          // If the field doesn't exist, insert it before the closing brace of person: Person
          content = content.replace(/(const person:\s*Person\s*=\s*\{[\s\S]*?)(\s*\};)/, `$1  ${field}: ${JSON.stringify(value)},\n$2`);
        }
      };
      
      replaceField("appName", settings.appName || "");
      replaceField("appIcon", settings.appIcon || "");
      replaceField("appDescription", settings.appDescription || "");
      replaceField("xUrl", settings.xUrl || "");
      replaceField("instagramUrl", settings.instagramUrl || "");
      replaceField("linkedinUrl", settings.linkedinUrl || "");
      replaceField("githubUrl", settings.githubUrl || "");
      replaceField("calendarUrl", settings.calendarUrl || "https://cal.com");
      
      fs.writeFileSync(filePath, content, "utf-8");
      console.log("Successfully sync'd settings data to content.tsx");
    }
  } catch (error) {
    console.error("Failed to update static content.tsx settings file:", error);
  }
}

// GET /api/admin/settings - Retrieve app settings
export async function GET(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }
    const settings = await db.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("GET /api/admin/settings failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update app settings
export async function POST(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const { appName, appIcon, appDescription, xUrl, instagramUrl, linkedinUrl, githubUrl, calendarUrl } = body;

    const updated = await db.updateSettings({
      appName: appName ? appName.trim() : "",
      appIcon: appIcon ? appIcon.trim() : "",
      appDescription: appDescription ? appDescription.trim() : "",
      xUrl: xUrl ? xUrl.trim() : "",
      instagramUrl: instagramUrl ? instagramUrl.trim() : "",
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "",
      githubUrl: githubUrl ? githubUrl.trim() : "",
      calendarUrl: calendarUrl ? calendarUrl.trim() : "https://cal.com"
    });

    updateStaticSettingsFile(updated);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("POST /api/admin/settings failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
