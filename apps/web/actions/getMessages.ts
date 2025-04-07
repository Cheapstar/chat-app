"use server";
import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { MessageType, ServerActionResponseType } from "../types/types";

interface ServerActionMessages extends ServerActionResponseType {
  data: {
    messages?: MessageType[];
    error?: string;
  };
}

export async function getMessages({
  conversationId,
  lastFetchedDate,
}: {
  conversationId: string;
  lastFetchedDate: Date;
}): Promise<ServerActionMessages> {
  console.log("Fetching the messages");
  const session = await getServerSession(authOptions);

  try {
    const response = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
      select: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          where: {
            createdAt: {
              lt: lastFetchedDate,
            },
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
          take: 25,
        },
      },
    });

    if (!response) {
      throw new Error("Could not fetch the messages , Please Try Again");
    }

    const result = response.messages.map((message) => ({
      ...message,
      isSender: session?.user.userId === message.senderId,
    }));

    return {
      success: true,
      data: {
        messages: result,
      },
    };
  } catch (err) {
    console.log("Error While fetching the Messages");
    return {
      success: false,
      data: {
        error: "Error while fetching the messages",
      },
    };
  }
}
