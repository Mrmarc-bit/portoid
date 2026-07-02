import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { db } from "@/utils/db";
import { checkAdminAuth } from "@/utils/auth";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:example@gmail.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication
    const session = checkAdminAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login." }, { status: 401 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "Kunci VAPID belum dikonfigurasi. Gagal mengirim push notification." },
        { status: 500 }
      );
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Pesan siaran wajib diisi" }, { status: 400 });
    }

    // 2. Fetch all subscriptions from database
    const subs = await db.getSubscriptions();
    if (subs.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada pelanggan notifikasi terdaftar di database." },
        { status: 404 }
      );
    }

    // Fetch live settings and profile to get custom App Name and App Icon
    type DynData = Record<string, string | string[] | undefined>;
    const [profile, settings] = (await Promise.all([
      db.getProfile().catch(() => ({})),
      db.getSettings().catch(() => ({}))
    ])) as [DynData, DynData];

    const appName = settings?.appName || profile?.appName || "Portoid";
    const appIcon = settings?.appIcon || profile?.appIcon || "/uploads/1782947031367-h25xie8.jpg";

    const payload = JSON.stringify({
      title: `Siaran dari ${appName}`,
      body: message.trim(),
      icon: appIcon,
      badge: appIcon,
      url: "/guestbook",
    });

    let successCount = 0;
    let failureCount = 0;

    const sendPromises = subs.map(async (sub) => {
      const webPushSub = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keys_auth,
          p256dh: sub.keys_p256dh,
        },
      };

      try {
        await webpush.sendNotification(webPushSub, payload);
        successCount++;
      } catch (err) {
        console.error(`Failed pushing to endpoint in broadcast: ${sub.endpoint}`, err);
        failureCount++;
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({
      success: true,
      message: `Siaran terkirim ke ${successCount} dari ${subs.length} penerima.`,
      stats: {
        total: subs.length,
        success: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/broadcast failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
