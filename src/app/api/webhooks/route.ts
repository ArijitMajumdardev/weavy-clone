import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );

    // Handle user creation
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

      // Get primary email address
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === evt.data.primary_email_address_id
      )?.email_address || email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        console.error("No email address found for user");
        return new Response("No email address found", { status: 400 });
      }

      // Create user in database
      await prisma.user.create({
        data: {
          id: id as string,
          email: primaryEmail,
          firstName: first_name as string || null,
          lastName: last_name as string || null,
          username: username as string || null,
          imageUrl: image_url as string || null,
        },
      });

      console.log(`User created in database: ${id}`);
    }

    // Handle user updates
    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === evt.data.primary_email_address_id
      )?.email_address || email_addresses?.[0]?.email_address;

      if (primaryEmail) {
        await prisma.user.update({
          where: { id: id as string },
          data: {
            email: primaryEmail,
            firstName: first_name as string || null,
            lastName: last_name as string || null,
            username: username as string || null,
            imageUrl: image_url as string || null,
          },
        });

        console.log(`User updated in database: ${id}`);
      }
    }

    // Handle user deletion
    if (evt.type === "user.deleted") {
      await prisma.user.delete({
        where: { id: id as string },
      });

      console.log(`User deleted from database: ${id}`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Error processing webhook", { status: 400 });
  }
}
