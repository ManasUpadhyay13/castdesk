import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-dodo-signature") || req.headers.get("webhook-signature") || "";

    // Verify webhook signature
    const secret = process.env.DODO_WEBHOOK_SECRET;
    if (secret) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Webhook signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    // Handle payment success
    if (event.type === "payment.succeeded" || event.status === "succeeded") {
      const metadata = event.metadata || event.data?.metadata || {};
      const userId = metadata.userId;
      const credits = parseInt(metadata.credits || "0", 10);
      const packId = metadata.packId || "unknown";

      if (!userId || !credits) {
        console.error("Webhook missing userId or credits:", metadata);
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      // Add credits to user
      await db.user.update({
        where: { id: userId },
        data: { creditsBalance: { increment: credits } },
      });

      // Log the transaction
      await db.creditTransaction.create({
        data: {
          userId,
          actionType: `PURCHASE_${packId.toUpperCase()}`,
          creditsUsed: -credits, // negative = credit added
        },
      });

      console.log(`Credits added: ${credits} to user ${userId} (pack: ${packId})`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
