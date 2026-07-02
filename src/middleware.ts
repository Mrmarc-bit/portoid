import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect the admin panel UI page
  if (pathname === "/admin") {
    const sessionCookie = req.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Decode JWT payload to check expiration at the Edge
    try {
      const parts = sessionCookie.split(".");
      if (parts.length !== 3) {
        const res = NextResponse.redirect(new URL("/admin/login", req.url));
        res.cookies.delete("admin_session");
        return res;
      }

      // Decode base64url payload
      const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayloadStr = atob(base64Payload);
      const payload = JSON.parse(decodedPayloadStr);

      if (Date.now() > payload.exp) {
        // Session expired
        const res = NextResponse.redirect(new URL("/admin/login", req.url));
        res.cookies.delete("admin_session");
        return res;
      }
    } catch (error) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.delete("admin_session");
      return res;
    }
  }

  // Protect administrative API endpoints
  if (
    pathname.startsWith("/api/admin") &&
    pathname !== "/api/admin/login" &&
    pathname !== "/api/admin/logout"
  ) {
    const sessionCookie = req.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Akses ditolak. Sesi tidak ditemukan." },
        { status: 401 }
      );
    }

    try {
      const parts = sessionCookie.split(".");
      if (parts.length !== 3) {
        return NextResponse.json(
          { error: "Akses ditolak. Token tidak valid." },
          { status: 401 }
        );
      }

      // Decode base64url payload
      const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayloadStr = atob(base64Payload);
      const payload = JSON.parse(decodedPayloadStr);

      if (Date.now() > payload.exp) {
        return NextResponse.json(
          { error: "Sesi telah kedaluwarsa. Silakan login kembali." },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Akses ditolak. Token tidak valid." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ["/admin", "/api/admin/:path*"],
};
