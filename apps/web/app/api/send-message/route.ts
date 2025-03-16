import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.userId) {
      return NextResponse.json(
        {
          error: "Invalid User/Bad request",
        },
        {
          status: 404,
        }
      );
    }

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

async function sendMessage({
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

      return {
        messageId: message.id,
        conversationId: conversationId,
      };
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

      return {
        messageId: message.id,
        conversationId: conversation.id,
      };
    }
  } catch (error) {
    console.log("Error while Submitting the Message from database", error);
    return "failed";
  }
}
