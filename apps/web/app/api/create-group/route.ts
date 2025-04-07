import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/database";

interface CreateGroupRequest {
  groupName: string;
  selectedMembers: string[];
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.userId) {
      return NextResponse.json(
        { error: "Invalid User/Bad request" },
        { status: 401 }
      );
    }

    const { groupName, selectedMembers }: CreateGroupRequest =
      await request.json();

    if (!groupName || selectedMembers.length === 0) {
      return NextResponse.json(
        { error: "Group name and members are required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        groupName: groupName,
        participants: {
          createMany: {
            data: [
              ...selectedMembers.map((userId) => ({
                userId,
              })),
              {
                userId: session.user.userId,
                role: "admin",
              },
            ],
          },
        },
      },
      select: {
        id: true,
        groupName: true,
        isGroup: true,
        participants: {
          where: {
            userId: { not: session.user.userId }, // Exclude the logged-in user
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
                senderId: { not: session.user.userId },
                statusUpdates: {
                  some: {
                    status: "unread",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new Error("Group Couldn't be created , maybe DB is down");
    }

    return NextResponse.json(
      {
        message: "Group created successfully",
        conversation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json(
      { error: "Failed to create the group" },
      { status: 503 }
    );
  }
}
