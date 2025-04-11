"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "@repo/database";
import { ConversationType, ServerActionResponseType } from "../types/types";

interface ServerActionConversations extends ServerActionResponseType {
  data: {
    conversations?: ConversationType[];
    error?: string;
  };
}

export async function getConversations(): Promise<ServerActionConversations> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId; // Ensure userId exists

  if (!userId)
    return {
      success: false,
      data: {
        error: "Invalid User / Unauthenticated Request",
      },
    };

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId, // Ensure the logged-in user is a participant
          },
        },
      },
      select: {
        id: true,
        groupName: true,
        isGroup: true,
        participants: {
          where: {
            userId: { not: userId }, // Exclude the logged-in user
          },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            content: true,
            createdAt: true,
            messageType: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                statusUpdates: {
                  some: {
                    status: "unread",
                    userId: session.user.userId,
                  },
                },
              },
            },
          },
        },
      },
    });

    conversations.sort((a, b) => {
      const dateA = a.messages[0]?.createdAt
        ? new Date(a.messages[0].createdAt).getTime()
        : 0;
      const dateB = b.messages[0]?.createdAt
        ? new Date(b.messages[0].createdAt).getTime()
        : 0;
      return dateB - dateA;
    });

    return {
      success: true,
      data: {
        conversations,
      },
    };
  } catch (err) {
    console.log("Error fetching conversations:", err);
    return {
      success: false,
      data: {
        error: "Couldn't fetch the conversations",
      },
    };
  }
}
