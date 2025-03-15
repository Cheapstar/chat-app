"use server";

import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export async function getUserWithId(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.userId) {
    return {
      success: false,
      data: {
        error: "Invalid Request",
      },
    };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
      },
    });

    return {
      success: false,
      data: {
        message: user,
      },
    };
  } catch (error) {
    console.log("An Error Occured while fetching the user Details");
    return {
      success: false,
      data: {
        error: "Couldn't fetch the user Details",
      },
    };
  }
}
