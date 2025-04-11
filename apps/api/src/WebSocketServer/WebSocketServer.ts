import WebSocket, { WebSocketServer } from "ws";
import { Server as HTTPServer } from "http";
import {
  ConversationType,
  MessageType,
  SendMessagePayload,
  UpdateMessageStatusPayload,
} from "../types.js";
import { prisma } from "@repo/database";

// Each Request must come with the userId of the client
// structure of the request {
//  type:"",
//  payload:{}
// }

// Major change needed
export class WebSocketClient {
  private wss: WebSocketServer;
  private CLIENTS: Map<string, WebSocket> = new Map<string, WebSocket>(); // userId --- WS
  handlers: Map<string, Map<string, handlerFn[]>> = new Map(); // userId --- (type --- handler)

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });

    this.connect();
  }

  connect = () => {
    this.wss.on("connection", (ws, req) => {
      console.log("New Connection Established");

      const userId = req.url?.split("=")[1] as string;
      console.log("userId", userId);
      this.registerUser(userId, ws);

      this.initWs(userId);

      ws.on("message", (rawData) => {
        const parsedData = JSON.parse(rawData.toString());
        const payload = parsedData.payload;
        const type = parsedData.type;
        console.log(parsedData);

        console.log("Sender UserId is:", userId);

        // execute the appropriate event handlers
        const userHandlers = this.handlers.get(userId as string)?.get(type);
        userHandlers?.forEach((handler) => handler({ userId, payload }));
      });

      ws.on("close", () => {
        console.log("Client has terminated the connection");
        // Remove the user from CLIENTS and handlers maps
        if (userId) {
          this.CLIENTS.delete(userId);
          this.handlers.delete(userId);
        }
      });
    });
  };

  // registering the handlers
  on = (type: string, handler: handlerFn, userId: string) => {
    const userHandlers = this.handlers.get(userId);
    if (!userHandlers?.has(type)) {
      userHandlers?.set(type, [] as handlerFn[]);
    }

    userHandlers?.get(type)?.push(handler);
  };

  // removing the handlers
  off = (type: string, handler: handlerFn, userId: string) => {
    const userHandlers = this.handlers.get(userId);
    if (!userHandlers?.has(type)) return;
    const handlers = userHandlers?.get(type);
    const index = handlers?.indexOf(handler);
    if (index !== -1) {
      handlers?.splice(index as number, 1);
    }
  };

  // to send the message
  send = (userId: string, type: string, payload: any) => {
    const ws = this.CLIENTS.get(userId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
      };

      ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connnected");
    }
  };

  registerUser = (userId: string, ws: WebSocket) => {
    // storing the user
    this.CLIENTS.set(userId, ws as WebSocket);

    if (!this.handlers.has(userId)) {
      this.handlers.set(userId, new Map());
    }

    console.log("User has been Registered Congo");

    this.send(userId, "userRegisterd", {
      message: "User has Been Registered Thank You",
    });
  };

  // Helper method to get all connected client IDs
  public getClientIds = (): string[] => {
    return Array.from(this.CLIENTS.keys());
  };

  initWs = (userId: string) => {
    this.on("send-messages", this.sendMessageHandler, userId);
    this.on("message-status-updated", this.updateMessageStatusHandler, userId);
    this.on("new-group-created", this.groupCreationHandler, userId);
  };

  sendMessageHandler = ({ userId: senderId, payload }: Args) => {
    const { messages }: SendMessagePayload = payload;

    /* Fetch the recipients of the conversation and then 
        if online => notify the client,
        else move on 
    */

    console.log("Messages are ", messages);

    prisma.conversation
      .findFirst({
        where: {
          id: (messages[0] as MessageType).conversationId,
        },
        select: {
          participants: {
            where: {
              userId: { not: senderId },
            },
            select: {
              userId: true,
            },
          },
        },
      })
      .then((resolve) => {
        if (!resolve) throw new Error("Couldn't fetch the participants");
        const recipients = resolve.participants;

        console.log(
          "Trying to send to recipients:",
          recipients.map((r) => r.userId)
        );
        console.log("Currently connected clients:", this.getClientIds());

        for (const recipient of recipients) {
          this.send(recipient.userId, "new-message", {
            messages,
            senderId,
          });
        }
      });
  };

  updateMessageStatusHandler = ({ userId: senderId, payload }: Args) => {
    const { conversationId }: UpdateMessageStatusPayload = payload;
    prisma.conversation
      .findFirst({
        where: {
          id: conversationId,
        },
        select: {
          participants: {
            where: {
              userId: { not: senderId },
            },
            select: {
              userId: true,
            },
          },
        },
      })
      .then((resolve) => {
        if (!resolve) throw new Error("Couldn't fetch the participants");
        const recipients = resolve.participants;

        for (const recipient of recipients) {
          this.send(recipient.userId, "update-message-status", {
            conversationId,
            userId: senderId,
          });
        }
      });
  };

  groupCreationHandler = ({ userId: adminId, payload }: Args) => {
    const { conversation, admin }: GroupCreationPayload = payload;

    // send the conversation to the member apart from the admin
    // we also need to update the conversation object , remove the recipient Participant and adding the admin
    // fetch the admin details from database or get the details fromm the admin itself in payload

    prisma.conversation
      .findFirst({
        where: {
          id: conversation.id,
        },
        select: {
          participants: {
            where: {
              userId: { not: adminId },
            },
            select: {
              userId: true,
            },
          },
        },
      })
      .then((resolve) => {
        if (!resolve) throw new Error("Couldn't fetch the participants");
        const recipients = resolve.participants;

        for (const recipient of recipients) {
          const updatedConversation: ConversationType = {
            ...conversation,
            participants: [
              ...conversation.participants.filter((participant) => {
                return recipient.userId != participant.user.id;
              }),
              {
                id: `${conversation.id}`, // or a UUID if you're using those
                user: {
                  id: admin.id,
                  username: admin.username,
                  profilePicture: admin.profilePicture,
                },
              },
            ],
          };

          this.send(recipient.userId, "added-to-group", {
            conversation: updatedConversation,
          });
        }
      });
  };
}

type Args = {
  userId: string;
  payload?: any;
};

interface GroupCreationPayload {
  conversation: ConversationType;
  admin: {
    id: string;
    profilePicture: string;
    username: string;
  };
}

interface handlerFn {
  ({
    userId,
    payload,
  }: {
    userId: string;
    payload?: any;
  }): Promise<void> | void;
}
