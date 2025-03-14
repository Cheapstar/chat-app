"use server";

import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export async function getUsers() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;

  if (!userId) return [];

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if there is a conversation with the logged-in user
    const usersWithConvo = await Promise.all(
      users.map(async (user) => {
        const conversation = await prisma.conversation.findFirst({
          where: {
            AND: [
              { participants: { some: { userId: userId } } }, // Logged-in user is a participant
              { participants: { some: { userId: user.id } } }, // The other user is a participant
            ],
            isGroup: false, // Ensuring it's a DM and not a group chat
          },
          select: {
            id: true,
          },
        });

        return {
          ...user,
          conversationId: conversation ? conversation.id : null,
        };
      })
    );

    return usersWithConvo;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}
