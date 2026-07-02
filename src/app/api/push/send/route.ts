import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/utils/db";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:example@gmail.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// POST /api/push/send
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, subscription } = body;

    // Fetch live settings and profile to get custom App Name and App Icon
    const [profile, settings] = (await Promise.all([
      db.getProfile().catch(() => ({})),
      db.getSettings().catch(() => ({}))
    ])) as [any, any];

    const appName = settings?.appName || profile?.appName || "Portoid";
    const appIcon = settings?.appIcon || profile?.appIcon || "/uploads/1782947031367-h25xie8.jpg";

    const payload = JSON.stringify({
      title: `${appName} Update`,
      body: message || `Halo! Ini adalah notifikasi uji coba dari ${appName} Anda.`,
      icon: appIcon,
      badge: appIcon,
      url: "/guestbook",
    });

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "VAPID keys are not configured. Cannot send push notification." },
        { status: 500 }
      );
    }

    // 1. If a specific subscription is passed, send to it directly (useful for instant client-side test)
    if (subscription && subscription.endpoint) {
      try {
        await webpush.sendNotification(subscription, payload);
        return NextResponse.json({ success: true, count: 1, mode: "direct" });
      } catch (err: any) {
        console.error("Direct push notification failed:", err);
        return NextResponse.json(
          { error: `Gagal mengirim push notification: ${err.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Otherwise, fetch all subscriptions from database and broadcast
    const subs = await db.getSubscriptions();

    if (subs.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada subscribers terdaftar di database." },
        { status: 404 }
      );
    }

    let successCount = 0;
    const errors: any[] = [];

    const sendPromises = subs.map(async (sub) => {
      // Re-construct the subscription object for web-push
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
      } catch (err: any) {
        console.error(`Failed pushing to endpoint: ${sub.endpoint}`, err);
        // Note: active push servers return 410 Gone if client has unsubscribed, meaning we should delete it
        if (err.statusCode === 410 || err.statusCode === 404) {
          // If we want to clean up expired subscriptions, we could implement a deleteSubscription method
          console.log(`Endpoint ${sub.endpoint} has expired (410/404).`);
        }
        errors.push({ endpoint: sub.endpoint, status: err.statusCode, message: err.message });
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({
      success: true,
      count: successCount,
      total: subs.length,
      errors: errors.length > 0 ? errors : undefined,
      mode: "broadcast",
    });
  } catch (error: any) {
    console.error("POST /api/push/send failed:", error);
    return NextResponse.json(
      { error: "Gagal mengirim push notifications" },
      { status: 500 }
    );
  }
}
