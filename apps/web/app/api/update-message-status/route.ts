import { prisma } from "@repo/database";
import { error } from "console";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function POST(req: Request) {
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

    const body = await req.json();
    const result = await updateMessageStatus({
      ...body,
      senderId: session.user.userId,
    });

    if (!result) {
      return NextResponse.json(
        {
          error: "Couldn't update the status",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Status are successfully Updated",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("An Error Occured While Performing the update status Action");
    return NextResponse.json(
      {
        error: "Server Might be down , please try again / or try Again Later",
      },
      {
        status: 503,
      }
    );
  }
}

async function updateMessageStatus({
  conversationId,
  senderId,
}: {
  conversationId: string;
  senderId: string;
}) {
  try {
    const updateStatus = await prisma.messageStatus.updateMany({
      where: {
        message: {
          conversationId: conversationId,
          senderId: { not: senderId },
        },
      },
      data: {
        status: "read",
      },
    });

    return "success";
  } catch (error) {
    throw new Error(
      "An Error Occured While performing the update message status Action"
    );
  }
}
