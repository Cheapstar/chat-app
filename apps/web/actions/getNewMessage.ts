"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "@repo/database";
import { MessageType, ServerActionResponseType } from "../types/types";

interface ServerActionNewMessage extends ServerActionResponseType {
  data: {
    message?: MessageType;
    error?: string;
  };
}

export async function getNewMessage(
  messageId: string,
  conversationId: string
): Promise<ServerActionNewMessage> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.userId) {
      return {
        success: false,
        data: {
          error: "Invalid Request",
        },
      };
    }

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        createdAt: true,
        messageType: true,
        attachmentUrl: true,
        conversationId: true,
        statusUpdates: {
          select: {
            status: true,
            userId: true,
          },
        },
        sender: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!message) {
      throw new Error("Error Occured While fetching the New Message");
    }

    return {
      success: true,
      data: {
        message: {
          ...message,
          isSender: session?.user.userId === message.senderId,
        },
      },
    };
  } catch (error) {
    console.log("Some Error Occured While Fetching the Message");
    return {
      success: false,
      data: {
        error: "Sorry Couldn't fetch the message seems like database is down",
      },
    };
  }
}
