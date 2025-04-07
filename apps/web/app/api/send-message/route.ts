import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../../lib/auth";
import {
  API_RESPONSE_TYPE,
  MessageType,
  ServerActionResponseType,
} from "../../../types/types";

interface SendMessageRequest {
  genMessageId: string;
  userId: string;
  recipientId: string;
  content: string;
  type: string;
  conversationId: string;
  attachmentUrl: string;
  session: Session;
}

export interface SendMessageResponse extends ServerActionResponseType {
  data: {
    message?: MessageType;
    error?: string;
  };
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
    const result = await sendMessage({ ...body, session });

    if (!result.success) {
      throw new Error("Failed to send the Message");
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed" }, { status: 503 });
  }
}

async function sendMessage({
  genMessageId,
  userId: senderId,
  content,
  conversationId,
  recipientId,
  type,
  attachmentUrl,
  session,
}: SendMessageRequest): Promise<SendMessageResponse> {
  try {
    if (!senderId) {
      throw new Error("Sender does not exists || Invalid Sender Id");
    }

    // Exisiting Conversation or New Conversation
    // Validate the conversation
    // We will use this value if necessary else we will discard it
    let finalRecipients = [{ userId: recipientId }];

    // If conversation Id exists matlab conversation already exists else it does not exists
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
        select: {
          participants: {
            select: { userId: true },
          },
        },
      });

      // If Given Conversation Does not exists , ye just a a security check
      if (!conversation) {
        throw new Error("Conversation Not Found");
      }

      // Get The Recipients, this is updated for groupChats
      // All the recipients will get the one messageStatus Entries Kyunki status of the messages depend on the recipient
      finalRecipients = conversation.participants.filter(
        (recv) => recv.userId != senderId
      );

      let messageId;

      await prisma.$transaction(async (txn) => {
        // Ek message create hoga but multiple messageStatus entries hongi
        const response = await txn.message.create({
          data: {
            id: genMessageId,
            content,
            senderId: senderId,
            conversationId: conversationId,
            messageType: type,
            attachmentUrl,
          },
        });

        // Creating the message Status Entry for everyone except the sender
        // This also takes care of the group
        // This is faster than normal loop as it handles the writes concurrently , INTERESTING PATTERN
        await Promise.all(
          finalRecipients.map(({ userId: recpId }) =>
            txn.messageStatus.create({
              data: {
                messageId: response.id,
                userId: recpId,
                status: "unread",
              },
            })
          )
        );

        messageId = response.id;
      });

      if (!messageId) {
        throw new Error("Couldn't send the message some Error Occured");
      }

      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
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
        throw new Error("Some Error Occured While Sending the Message");
      }

      return {
        success: true,
        data: {
          message: {
            ...message,
            isSender: message.senderId === session.user.userId,
          },
        },
      };
    } else {
      /* 
        Ye case hoga sirf only for the one to one conversation , since for the group chat 
        pehle group creation hoga then only message bhej sakenge , so that takes care of that
      */
      if (!recipientId) {
        throw new Error("Recipient Id is invalid");
      }

      let messageId;
      let convesationId;
      await prisma.$transaction(async (txn) => {
        const conversation = await txn.conversation.create({
          data: {
            participants: {
              create: [
                { user: { connect: { id: senderId } } },
                { user: { connect: { id: recipientId } } },
              ],
            },
          },
        });

        const message = await txn.message.create({
          data: {
            id: genMessageId,
            content,
            senderId: senderId,
            conversationId: conversation.id,
            messageType: type,
            attachmentUrl,
            statusUpdates: {
              create: {
                userId: recipientId, // Recipient should get unread status
                status: "unread",
              },
            },
          },
        });

        convesationId = conversation.id;
        messageId = message.id;
      });

      if (!messageId && !convesationId) {
        throw new Error("Couldn't send the message some Error Occured");
      }

      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
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
        throw new Error("Some Error Occured While Sending the");
      }

      return {
        success: true,
        data: {
          message: {
            ...message,
            isSender: message.senderId === session.user.userId,
          },
        },
      };
    }
  } catch (err) {
    console.log("Error while Submitting the Message to database", err);
    return {
      success: false,
      data: {
        error:
          err instanceof Error
            ? err.message
            : "Error Occured While Sending the Message",
      },
    };
  }
}
