import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    if (!primaryEmail) {
      return new Response("No primary email found", { status: 400 });
    }

    try {
      // Create user in database
      const newUser = await db
        .insert(users)
        .values({
          clerkId: id,
          email: primaryEmail.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
        })
        .returning();

      console.log("User created in database:", newUser[0]);

      return new Response("User created successfully", { status: 201 });
    } catch (error) {
      console.error("Error creating user in database:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    if (!primaryEmail) {
      return new Response("No primary email found", { status: 400 });
    }

    try {
      // Update user in database
      const updatedUser = await db
        .update(users)
        .set({
          email: primaryEmail.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id))
        .returning();

      if (updatedUser.length === 0) {
        console.log("User not found in database, creating new user");
        // If user doesn't exist, create them
        const newUser = await db
          .insert(users)
          .values({
            clerkId: id,
            email: primaryEmail.email_address,
            firstName: first_name || null,
            lastName: last_name || null,
          })
          .returning();

        console.log("User created in database:", newUser[0]);
        return new Response("User created successfully", { status: 201 });
      }

      console.log("User updated in database:", updatedUser[0]);

      return new Response("User updated successfully", { status: 200 });
    } catch (error) {
      console.error("Error updating user in database:", error);
      return new Response("Error updating user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      // Delete user from database
      const deletedUser = await db
        .delete(users)
        .where(eq(users.clerkId, id as string))
        .returning();

      console.log("User deleted from database:", deletedUser[0]);

      return new Response("User deleted successfully", { status: 200 });
    } catch (error) {
      console.error("Error deleting user from database:", error);
      return new Response("Error deleting user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}

