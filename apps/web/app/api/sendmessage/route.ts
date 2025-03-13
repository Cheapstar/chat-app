import { prisma } from "@repo/database";
import { uploadImage, uploadImageToCloudinary } from "@repo/cloudinary";
import { NextResponse } from "next/server";

interface SendMessageRequest {
  userId: string;
  recipientId: string;
  content: string;
  type: string;
  conversationId: string;
  attachmentUrl: string;
}

export async function POST(request: Request) {
  try {
    const body: SendMessageRequest = await request.json();
    console.log("Request Body", body);
    const result = await sendMessage({ ...body });

    if (result === "failed") {
      throw new Error("Failed to send the Message");
    }

    return NextResponse.json({ message: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed" }, { status: 503 });
  }
}

export async function sendMessage({
  userId,
  content,
  conversationId,
  recipientId,
  type,
  attachmentUrl,
}: SendMessageRequest) {
  try {
    // Exisiting Conversation or New Conversation
    if (conversationId) {
      const message = await prisma.message.create({
        data: {
          content,
          senderId: userId || "",
          conversationId: conversationId,
          messageType: type,
          attachmentUrl,
          statusUpdates: {
            create: {
              userId: recipientId, // Recipient should get unread status
              status: "UNREAD",
            },
          },
        },
      });

      return message.id;
    } else {
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { user: { connect: { id: userId } } },
              { user: { connect: { id: recipientId } } },
            ],
          },
        },
      });

      const message = await prisma.message.create({
        data: {
          content,
          senderId: userId || "",
          conversationId: conversation.id,
          messageType: type,
          attachmentUrl,
          statusUpdates: {
            create: {
              userId: recipientId, // Recipient should get unread status
              status: "UNREAD",
            },
          },
        },
      });

      return message.id;
    }
  } catch (error) {
    console.log("Error while Submitting the Message from database", error);
    return "failed";
  }
}
