import { SubmitHandler, useForm } from "react-hook-form";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  messagesAtom,
  previewAtom,
  socketAtom,
  conversationsAtom,
  selectedConversationAtom,
} from "../../store/store";
import { getSession } from "next-auth/react";

import axios, { AxiosResponse } from "axios";
import { SendMessageResponse } from "../../app/api/send-message/route";
import { ConversationType, MessageType } from "../../types/types";
import { playSound } from "./sound";

interface SendMessageRequest {
  genMessageId: string;
  userId: string;
  recipientId: string;
  content: string;
  type: string;
  conversationId: string;
  attachmentUrl?: string;
}

export interface SendMessage {
  message: MessageType;
}

export function useChatForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    resetField,
    formState: { isDirty },
  } = useForm<{ message: string; image: FileList | null }>({
    defaultValues: { message: "", image: null },
  });

  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [socket] = useAtom(socketAtom);
  const [showPreview, setShowPreview] = useAtom(previewAtom);

  const [selectedConversation, setSelectedConversation] = useAtom(
    selectedConversationAtom
  );

  async function sendMessageHandler(data: {
    message: string;
    image: FileList;
  }) {
    try {
      const session = await getSession();
      const generatedId = crypto.randomUUID();

      const recipient = selectedConversation?.participants[0]?.user;

      // Request to backend for updating the DB
      const request: SendMessageRequest = {
        genMessageId: generatedId,
        userId: session?.user.userId as string,
        recipientId: recipient?.id as string,
        content: data.message,
        conversationId,
        type: "compose",
      };

      // If message includes the image
      if (data.image && data.image.length > 0) {
        // required file

        // console.log("File is ", data.image[0]);
        const file = data.image[0] as File;
        const formData = new FormData();
        formData.append("file", file);
        // console.log("Form Data", [...formData.entries()]);

        // Since file ko ham serialize nahi kar sakte toh alag se bhejni padegi then update karni padegi
        // This will save the image in the store and returns the publicId
        // which will be stored in the DB
        axios
          .post("http://localhost:3000/api/upload-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((resolve) => {
            // console.log("Public Id is ", resolve);
            const public_Id = resolve.data.public_Id;
            request.attachmentUrl = public_Id;

            // Send Message with publicId

            axios
              .post("http://localhost:3000/api/send-message", request)
              .then((resolve: AxiosResponse<any, SendMessageResponse>) => {
                // console.log("Message is Successfully Sent", resolve);
                // Notify the recipient about the new Message
                const sentMessage: MessageType = resolve.data.data.message;

                console.log("Send Message is", resolve);

                console.log("Message is Successfully Sent", sentMessage);
                socket?.send("send-message", {
                  message: sentMessage,
                } as SendMessage);

                // If this the new Conversation and then hume client side ui bhi update karna Padega
                // This path will not be taken in the group chat's case
                if (!conversationId) {
                  const newConversation: ConversationType = {
                    id: sentMessage.conversationId,
                    isGroup: false,
                    participants: [
                      {
                        id: session?.user.userId as string,
                        user: {
                          id: recipient?.id as string,
                          profilePicture: recipient?.profilePicture as string,
                          username: recipient?.username as string,
                        },
                      },
                    ],
                    messages: [
                      {
                        content: sentMessage.content,
                        createdAt: new Date(),
                        messageType: "compose",
                      },
                    ],
                    _count: { messages: 0 },
                  };

                  setConversations((prevState) => {
                    return [...prevState, newConversation].sort((a, b) => {
                      const dateA = a.messages[0]?.createdAt
                        ? new Date(a.messages[0].createdAt).getTime()
                        : 0;
                      const dateB = b.messages[0]?.createdAt
                        ? new Date(b.messages[0].createdAt).getTime()
                        : 0;
                      return dateB - dateA;
                    });
                  });

                  setConversationId(sentMessage.conversationId);
                }

                setTimeout(() => {
                  setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map((m) => {
                      // console.log(
                      //   "Changing the respective message",
                      //   m,
                      //   sentMessage
                      // );
                      if (m.id === sentMessage.id) {
                        return sentMessage;
                      }
                      return m;
                    });

                    return updatedMessages;
                  });
                }, 300);
              })
              .catch((reject) => {
                console.log("An Error Occured While Sending the Message");
              });
          })
          .catch((reject) => {
            console.log("An Error Occured While Uploading the Image");
          });
      } else {
        // Simple Text Message
        axios
          .post("http://localhost:3000/api/send-message", request)
          .then((resolve) => {
            const sentMessage: MessageType = resolve.data.data.message;

            console.log("Message is Successfully Sent", sentMessage);
            socket?.send("send-message", {
              message: sentMessage,
            } as SendMessage);

            // If this the new Conversation and then hume client side ui bhi update karna Padega
            // For Group ignore
            if (!conversationId) {
              console.log("User Does not Exists so sending");
              const newConversation: ConversationType = {
                id: sentMessage.conversationId,
                isGroup: false,
                participants: [
                  {
                    id: session?.user.userId as string,
                    user: {
                      id: recipient?.id as string,
                      profilePicture: recipient?.profilePicture as string,
                      username: recipient?.username as string,
                    },
                  },
                ],
                messages: [
                  {
                    content: sentMessage.content,
                    createdAt: new Date(),
                    messageType: "compose",
                  },
                ],
                _count: { messages: 0 },
              };

              setConversations((prevState) => {
                return [...prevState, newConversation].sort((a, b) => {
                  const dateA = a.messages[0]?.createdAt
                    ? new Date(a.messages[0].createdAt).getTime()
                    : 0;
                  const dateB = b.messages[0]?.createdAt
                    ? new Date(b.messages[0].createdAt).getTime()
                    : 0;
                  return dateB - dateA;
                });
              });

              setConversationId(sentMessage.conversationId);
            }

            setTimeout(() => {
              setMessages((prevMessages) => {
                const updatedMessages = prevMessages.map((m) => {
                  // console.log(
                  //   "Changing the respective message",
                  //   m,
                  //   sentMessage
                  // );
                  if (m.id === sentMessage.id) {
                    return sentMessage;
                  }
                  return m;
                });

                return updatedMessages;
              });
              playSound("message-sent");
            }, 300);
          })
          .catch((reject) => {
            console.log("An Error Occured While Sending the Message");
          });
      }

      if (conversationId) {
        setMessages([
          ...messages,
          {
            id: generatedId,
            isSender: true,
            content: data.message,
            createdAt: new Date(),
            statusUpdates: [
              {
                userId: recipient?.id || "",
                status: "sent",
              },
            ],
            messageType: "compose",
            attachmentUrl: showPreview,
            sender: { username: recipient?.username as string },
            conversationId: conversationId,
          },
        ]);
      }

      // Update last message in conversations
      // client Side

      let updatedConversations = [...conversations];

      if (conversationId) {
        updatedConversations = conversations.map((convo: ConversationType) =>
          convo.id === conversationId
            ? {
                ...convo,
                messages: [
                  {
                    ...convo.messages[0],
                    content: data.message,
                    createdAt: new Date().toISOString(),
                    messageType: "compose",
                  },
                ],
              }
            : convo
        ) as ConversationType[];
      }

      const sortedConversations = [...updatedConversations].sort((a, b) => {
        const dateA = a.messages[0]?.createdAt
          ? new Date(a.messages[0].createdAt).getTime()
          : 0;
        const dateB = b.messages[0]?.createdAt
          ? new Date(b.messages[0].createdAt).getTime()
          : 0;
        return dateB - dateA;
      });

      setConversations(sortedConversations as ConversationType[]);
      setValue("image", null, { shouldDirty: true });
      setShowPreview("");

      reset();
    } catch (error) {
      console.error("Error while sending message", error);
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(
      sendMessageHandler as SubmitHandler<{
        message: string;
        image: FileList | null;
      }>
    ),
    watch,
    isDirty,
    setValue,
    showPreview,
    setShowPreview,
    resetField,
  };
}
