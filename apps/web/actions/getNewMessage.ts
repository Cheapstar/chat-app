"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "@repo/database";

export async function getNewMessage(messageId: string, senderId: string) {
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
        senderId: senderId,
      },
    });

    return {
      success: true,
      data: {
        message,
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
