import { NextResponse } from "next/server";
import { adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { token, title, body, data } = await req.json();

    if (!token || !title || !body) {
      return NextResponse.json(
        { error: "Missing required fields: token, title, body" },
        { status: 400 }
      );
    }

    if (!adminMessaging) {
      return NextResponse.json(
        { error: "Firebase Admin Messaging not initialized. Check server configuration." },
        { status: 500 }
      );
    }

    const messageResponse = await adminMessaging.send({
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
    });

    return NextResponse.json({ success: true, messageId: messageResponse });
  } catch (error: any) {
    console.error("FCM push error:", error);
    return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 });
  }
}
