import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";

// POST /api/push/subscribe
export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Push Subscription data is missing or invalid" },
        { status: 400 }
      );
    }

    // Save/Update the subscription in the database
    const savedSub = await db.addSubscription(JSON.stringify(subscription));

    return NextResponse.json(
      { message: "Subscription registered successfully", subscription: savedSub },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/push/subscribe failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan push subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/push/subscribe - Unsubscribe push endpoint
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      try {
        const body = await req.json();
        endpoint = body?.endpoint;
      } catch (e) {
        // Body might be empty or invalid, ignore if we got endpoint otherwise
      }
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint parameter is missing" },
        { status: 400 }
      );
    }

    await db.removeSubscription(endpoint);

    return NextResponse.json(
      { message: "Unsubscribed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/push/subscribe failed:", error);
    return NextResponse.json(
      { error: "Gagal menghapus push subscription" },
      { status: 500 }
    );
  }
}
