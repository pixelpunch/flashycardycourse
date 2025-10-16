#!/usr/bin/env node

/**
 * Script to manually sync existing Clerk users to the Neon database
 * 
 * Usage:
 * 1. Make sure you have CLERK_SECRET_KEY in your .env.local
 * 2. Run: npx tsx src/scripts/sync-clerk-users.ts
 * 
 * This script will:
 * - Fetch all users from Clerk
 * - Check which users exist in the database
 * - Create missing users in the database
 */

// Environment variables are loaded by dotenv-cli in package.json script
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function syncClerkUsers() {
  console.log("🔄 Starting Clerk user sync...\n");

  try {
    // Fetch all users from Clerk
    console.log("📥 Fetching users from Clerk...");
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 100 });
    
    console.log(`✅ Found ${clerkUsers.data.length} users in Clerk\n`);

    if (clerkUsers.data.length === 0) {
      console.log("ℹ️  No users found in Clerk. Nothing to sync.");
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each Clerk user
    for (const clerkUser of clerkUsers.data) {
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      );

      if (!primaryEmail) {
        console.log(`⚠️  Skipping user ${clerkUser.id} - no primary email`);
        skippedCount++;
        continue;
      }

      try {
        // Check if user already exists in database
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUser.id));

        if (existingUser.length > 0) {
          console.log(
            `⏭️  User already exists: ${primaryEmail.emailAddress} (${clerkUser.id})`
          );
          skippedCount++;
          continue;
        }

        // Create user in database
        await db
          .insert(users)
          .values({
            clerkId: clerkUser.id,
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
          })
          .returning();

        console.log(
          `✅ Created user: ${primaryEmail.emailAddress} (${clerkUser.id})`
        );
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Error processing user ${primaryEmail.emailAddress}:`,
          error
        );
        errorCount++;
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Sync Summary:");
    console.log(`   Total Clerk users: ${clerkUsers.data.length}`);
    console.log(`   ✅ Created: ${createdCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log("=".repeat(50) + "\n");

    if (createdCount > 0) {
      console.log("🎉 User sync completed successfully!");
    } else {
      console.log("ℹ️  No new users were created.");
    }
  } catch (error) {
    console.error("\n❌ Fatal error during sync:", error);
    process.exit(1);
  }
}

// Run the sync
syncClerkUsers()
  .then(() => {
    console.log("\n✨ Sync process finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Sync process failed:", error);
    process.exit(1);
  });

