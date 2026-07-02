import { NextResponse, type NextRequest } from "next/server";
import { db, type ProfileEntry } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";
import fs from "node:fs";
import path from "node:path";

// Helper to write profile changes back to the static content.tsx file in development mode
function updateStaticProfileFile(profile: Partial<ProfileEntry>) {
  try {
    const filePath = path.join(process.cwd(), "src", "resources", "content.tsx");
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf-8");
      
      const replaceField = (field: string, value: string | string[] | undefined) => {
        const regex = new RegExp(String.raw`(\s*)${field}:\s*[^\n]*,`);
        if (regex.test(content)) {
          content = content.replace(regex, `$1${field}: ${JSON.stringify(value)},`);
        } else {
          // If the field doesn't exist, insert it before the closing brace of person: Person
          content = content.replace(/(const person:\s*Person\s*=\s*\{[\s\S]*?)(\s*\};)/, `$1  ${field}: ${JSON.stringify(value)},\n$2`);
        }
      };
      
      replaceField("firstName", profile.firstName);
      replaceField("lastName", profile.lastName);
      replaceField("name", profile.name);
      replaceField("role", profile.role);
      replaceField("avatar", profile.avatar);
      replaceField("email", profile.email);
      replaceField("location", profile.location);
      replaceField("languages", profile.languages);
      replaceField("locale", profile.locale || "en");
      
      fs.writeFileSync(filePath, content, "utf-8");
      console.log("Successfully sync'd profile data to content.tsx");
    }
  } catch (error) {
    console.error("Failed to update static content.tsx profile file:", error);
  }
}

// GET /api/admin/profile - Retrieve profile settings
export async function GET(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }
    const profile = await db.getProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("GET /api/admin/profile failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// POST /api/admin/profile - Update profile settings
export async function POST(req: NextRequest) {
  try {
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      name, 
      role, 
      avatar, 
      email, 
      location, 
      languages, 
      locale
    } = body;

    if (!firstName || !lastName || !name || !role || !email || !location) {
      return NextResponse.json(
        { error: "Nama, peran, email, dan lokasi wajib diisi." },
        { status: 400 }
      );
    }

    // Keep existing appSettings/social fields from db when updating personal profile fields
    const currentProfile = await db.getProfile();

    const updated = await db.updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: name.trim(),
      role: role.trim(),
      avatar: avatar ? avatar.trim() : "/uploads/1782947031367-h25xie8.jpg",
      email: email.trim(),
      location: location.trim(),
      languages: Array.isArray(languages) ? languages : [],
      locale: locale ? locale.trim() : "en",
      appName: currentProfile.appName || "",
      appIcon: currentProfile.appIcon || "",
      appDescription: currentProfile.appDescription || "",
      xUrl: currentProfile.xUrl || "",
      instagramUrl: currentProfile.instagramUrl || "",
      linkedinUrl: currentProfile.linkedinUrl || "",
      githubUrl: currentProfile.githubUrl || ""
    });

    updateStaticProfileFile(updated);

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("POST /api/admin/profile failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
