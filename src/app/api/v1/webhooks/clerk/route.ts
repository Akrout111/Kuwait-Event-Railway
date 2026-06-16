import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { errorResponse } from "@/lib/api-response";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit check
  const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 100, windowSeconds: 60 });
  if (!rateLimitResult.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return Response.json(
      { success: false, error: { code: "INVALID_BODY", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("clerk-webhook", "Missing CLERK_WEBHOOK_SECRET env var");
    return new Response("Server configuration error", { status: 500 });
  }

  const wh = new Webhook(webhookSecret);
  let evt: Record<string, unknown>;
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as Record<string, unknown>;
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  const { type, data } = evt as {
    type: string;
    data: Record<string, unknown>;
  };

  switch (type) {
    case "user.created": {
      const emailAddresses = data.email_addresses as Array<{
        email_address: string;
      }>;
      const email = emailAddresses?.[0]?.email_address ?? "";
      const firstName = (data.first_name as string) ?? "";
      const lastName = (data.last_name as string) ?? "";
      const name = `${firstName} ${lastName}`.trim() || "مستخدم";
      const imageUrl = (data.image_url as string) ?? null;

      await db.user.create({
        data: {
          clerkId: data.id as string,
          email,
          name,
          avatarUrl: imageUrl,
          role: "ATTENDEE",
        },
      });
      break;
    }
    case "user.updated": {
      const emailAddresses = data.email_addresses as Array<{
        email_address: string;
      }>;
      const email = emailAddresses?.[0]?.email_address ?? "";
      const firstName = (data.first_name as string) ?? "";
      const lastName = (data.last_name as string) ?? "";
      const name = `${firstName} ${lastName}`.trim() || "مستخدم";
      const imageUrl = (data.image_url as string) ?? null;

      await db.user.update({
        where: { clerkId: data.id as string },
        data: {
          email,
          name,
          avatarUrl: imageUrl,
        },
      });
      break;
    }
    case "user.deleted": {
      await db.user.update({
        where: { clerkId: data.id as string },
        data: { isActive: false, deletedAt: new Date() },
      });
      break;
    }
  }

  return Response.json({ success: true });
}
