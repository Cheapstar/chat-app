import { SubmitHandler, useForm } from "react-hook-form";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  messagesAtom,
  previewAtom,
  socketAtom,
  conversationsAtom,
  recipientAtom,
} from "../../store/store";
import { getSession } from "next-auth/react";
import { ConversationType } from "../../store/store";
import { read } from "fs";

import axios from "axios";

interface SendMessageRequest {
  userId: string;
  recipientId: string;
  content: string;
  type: string;
  conversationId: string;
  attachmentUrl?: string;
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
  const [recipient, setRecipient] = useAtom(recipientAtom);

  async function sendMessageHandler(data: {
    message: string;
    image: FileList;
  }) {
    try {
      const session = await getSession();
      const request: SendMessageRequest = {
        userId: session?.user.userId as string,
        recipientId: recipient?.id as string,
        content: data.message,
        conversationId,
        type: "compose",
      };

      if (data.image && data.image.length > 0) {
        // required file

        console.log("File is ", data.image[0]);
        const file = data.image[0] as File;
        const formData = new FormData();
        formData.append("file", file);
        console.log("Form Data", [...formData.entries()]);
        axios
          .post("http://localhost:3000/api/upload-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((resolve) => {
            console.log("Public Id is ", resolve);
            const public_Id = resolve.data.public_Id;
            request.attachmentUrl = public_Id;

            axios
              .post("http://localhost:3000/api/send-message", request)
              .then((resolve) => {
                console.log("Message is Successfully Sent", resolve);
                socket?.send("send-message", {
                  recipientId: recipient?.id,
                  conversationId: resolve.data.message.conversationId,
                  messageId: resolve.data.message.messageId,
                });

                if (!conversationId) {
                  const newConversation: ConversationType = {
                    id: resolve.data.message.conversationId,
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
                        content: data.message,
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

                  setConversationId(resolve.data.message.conversationId);
                }
              })
              .catch((reject) => {
                console.log("An Error Occured While Sending the Message");
              });
          })
          .catch((reject) => {
            console.log("An Error Occured While Uploading the Image");
          });
      } else {
        axios
          .post("http://localhost:3000/api/send-message", request)
          .then((resolve) => {
            console.log("Message is Successfully Sent", resolve);
            socket?.send("send-message", {
              recipientId: recipient?.id,
              conversationId: resolve.data.message.conversationId,
              messageId: resolve.data.message.messageId,
            });

            if (!conversationId) {
              console.log("User Does not Exists so sending");
              const newConversation: ConversationType = {
                id: resolve.data.message.conversationId,
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
                    content: data.message,
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

              setConversationId(resolve.data.message.conversationId);
            }
          })
          .catch((reject) => {
            console.log("An Error Occured While Sending the Message");
          });
      }

      setMessages([
        ...messages,
        {
          id: crypto.randomUUID(),
          sender: true,
          content: data.message,
          createdAt: new Date(),
          status: "",
          messageType: "compose",
          attachmentUrl: showPreview,
        },
      ]);

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
