import { NextResponse } from "next/server";

import { uploadFileToCloudinary } from "@repo/cloudinary";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { MessageType, ServerActionResponseType } from "../../../types/types";
import { prisma } from "@repo/database";
import axios from "axios";

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

    const body: FormData = await req.formData();
    const files = body.getAll("files[]") as File[];
    const messages = body.getAll("messages[]");
    const types = body.getAll("types[]") as string[];

    const textMessage = body.get("text-message") as string;
    const message = textMessage ? await JSON.parse(textMessage) : null;

    if (!files || files.length < 1) {
      // This is the simple case, when only text message is sent
      const result = await sendMessage({ ...message, session });

      axios.post("http://localhost:8080/api/message", {
        type: "send-messages",
        payload: {
          messages: [(result as SendMessageResponse).data.message],
          userId: session.user.userId,
        },
        userId: session.user.userId,
      });

      return NextResponse.json({ result: [result] }, { status: 200 });
    }

    const response: SendMessageResponse[] = [];

    // Store conversation ID to reuse for multiple files to the same new user
    let createdConversationId: string | null = null;

    // When Files are present
    console.log("FILES LENGTH IS", files.length);

    for (let i = 0; i < files.length; i++) {
      const buffer = Buffer.from(await (files[i] as File).arrayBuffer());
      const upload = await uploadFileToCloudinary(
        buffer,
        (files[i] as File).name,
        {
          apiKey: process.env.CLOUDINARY_API_KEY!,
          apiSecret: process.env.CLOUDINARY_API_SECRET!,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
        }
      );

      // More explicit version of your current logic
      const content =
        i === files.length - 1 && message && message.content
          ? message.content
          : "";
      console.log("Sending the Content in Content", content);

      const messageDetails = await JSON.parse(messages[i] as string);

      // If a conversation was already created in this batch, use it
      if (createdConversationId) {
        messageDetails.conversationId = createdConversationId;
      }

      const result = await sendMessage({
        ...messageDetails,
        type: types[i],
        content: content,
        attachmentUrl: upload,
        session,
      });

      // Save the conversation ID if one was created
      if (
        !messageDetails.conversationId &&
        result.success &&
        result.data.message
      ) {
        createdConversationId = result.data.message.conversationId;
      }

      response.push(result);
    }

    axios.post("http://localhost:8080/api/message", {
      type: "send-messages",
      payload: {
        messages: [
          ...(response as SendMessageResponse[]).map(({ success, data }) => {
            return data.message;
          }),
        ],
        userId: session.user.userId,
      },
      userId: session.user.userId,
    });

    return NextResponse.json({ result: [...response] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to Send The Message", error: error },
      { status: 503 }
    );
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

    // Existing Conversation or New Conversation
    // Validate the conversation
    // We will use this value if necessary else we will discard it
    let finalRecipients = [{ userId: recipientId }];

    // If conversation Id exists, conversation already exists, else it does not
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

      // Security check for conversation existence
      if (!conversation) {
        throw new Error("Conversation Not Found");
      }

      // Get recipients (updated for groupChats)
      finalRecipients = conversation.participants.filter(
        (recv) => recv.userId != senderId
      );

      const { messageId } = await prisma.$transaction(async (txn) => {
        // Create message with multiple message status entries
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

        // Creating message status entries for all recipients
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

        return { messageId: response.id };
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
      // For one-to-one conversations only
      if (!recipientId) {
        throw new Error("Recipient Id is invalid");
      }

      // First check if a conversation already exists between these users
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: senderId } } },
            { participants: { some: { userId: recipientId } } },
            { isGroup: false },
          ],
        },
      });

      if (existingConversation) {
        // Use the existing conversation - recursive call with the found conversation ID
        return sendMessage({
          genMessageId,
          userId: senderId,
          recipientId,
          content,
          type,
          conversationId: existingConversation.id,
          attachmentUrl,
          session,
        });
      }

      // Create new conversation and message
      const { messageId, conversationId } = await prisma.$transaction(
        async (txn) => {
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
                  userId: recipientId, // Recipient gets unread status
                  status: "unread",
                },
              },
            },
          });
          return {
            messageId: message.id,
            conversationId: conversation.id,
          };
        }
      );

      if (!messageId && !conversationId) {
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
