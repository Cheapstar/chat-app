import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { ServerActionResponseType } from "../../../types/types";

interface UpdateMessageStatusResponse extends ServerActionResponseType {
  data: {
    message: string;
  };
}

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
      userId: session.user.userId,
    });

    if (!result.success) {
      return NextResponse.json(result, {
        status: 400,
      });
    }

    return NextResponse.json(result, {
      status: 200,
    });
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
  userId,
}: {
  conversationId: string;
  userId: string;
}): Promise<UpdateMessageStatusResponse> {
  try {
    /*
     Update the status of the message for the corresponding user
     We Also need to see it from the group chat's perspective
     Given Conversation k jitne bhi messages ka status corresponding to the given user 
     Sender k corresponding message status nahi honge

     This will update messageStatus of messages corresponding to given user
     */
    const updateStatus = await prisma.messageStatus.updateMany({
      where: {
        message: {
          conversationId: conversationId,
          senderId: { not: userId },
        },
        userId: userId,
        status: "unread",
      },
      data: {
        status: "read",
      },
    });

    return {
      success: true,
      data: {
        message: "Message status has been successfully updated",
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        message:
          error instanceof Error
            ? error.message
            : "An Error Occured While performing the update message status Action",
      },
    };
  }
}
