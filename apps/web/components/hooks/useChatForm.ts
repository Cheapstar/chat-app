"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  messagesAtom,
  socketAtom,
  conversationsAtom,
  selectedConversationAtom,
  recipientAtom,
} from "../../store/store";
import { getSession } from "next-auth/react";

import axios, { AxiosResponse } from "axios";
import { SendMessageResponse } from "../../app/api/send-message/route";
import { ConversationType, MessageType } from "../../types/types";
import { playSound } from "./sound";
import { useEffect, useState } from "react";

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

export interface FileRegisterType {
  type: string;
  file: File;
}

export interface ServerResponseSentMessage {
  data: {
    message: MessageType;
  };
  success: boolean;
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
  } = useForm<{ message: string; files: FileRegisterType[] | null }>({
    defaultValues: { message: "", files: [] },
  });

  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [socket] = useAtom(socketAtom);
  const [selectedRecipient] = useAtom(recipientAtom);

  const [selectedConversation, setSelectedConversation] = useAtom(
    selectedConversationAtom
  );

  const [urls, setUrls] = useState<{ type: string; url: string }[]>([]);

  async function sendMessageHandler(data: {
    message: string;
    files: FileRegisterType[];
  }) {
    try {
      console.log("return Data", data);
      console.log("URLS are", urls);
      const session = await getSession();
      const generatedIds: string[] = [];

      const recipient = selectedConversation
        ? selectedConversation?.participants[0]?.user
        : selectedRecipient;

      // We Will be sending the message as the formData
      const formData = new FormData();

      let fileUrls = [...urls];
      // If we have files to send to the user , then generate messages for them and set them
      // Collect Ids,
      for (const file of data.files) {
        formData.append("files[]", file.file);
        formData.append("types[]", file.type);

        const messageId = crypto.randomUUID();

        generatedIds.push(messageId);

        const sendMessage = {
          genMessageId: messageId,
          userId: session?.user.userId as string,
          recipientId: recipient?.id as string,
          content: "",
          conversationId,
          type: file.type,
        };

        formData.append("messages[]", JSON.stringify(sendMessage));
      }

      // Check if There Exists a Text Content

      if (data.message != "") {
        const generatedId: string = crypto.randomUUID();
        generatedIds.push(generatedId);

        // Request to backend for updating the DB
        const request: SendMessageRequest = {
          genMessageId: generatedId,
          userId: session?.user.userId as string,
          recipientId: recipient?.id as string,
          content: data.message,
          conversationId,
          type: "compose",
        };

        const requestMessage = JSON.stringify(request);

        formData.set("text-message", requestMessage);
      }

      console.log("Form Data is", formData.getAll("files").length);

      axios
        .post("http://localhost:3000/api/real-send-message", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((resolve) => {
          const response: ServerResponseSentMessage[] = resolve.data.result;

          const sentMessages = response.map(({ success, data }) => {
            return data.message;
          });

          console.log("Message", resolve);

          if (!conversationId) {
            const newConversation: ConversationType = {
              id: (sentMessages[sentMessages.length - 1] as MessageType)
                .conversationId,
              isGroup: false,
              participants: [
                {
                  user: {
                    id: recipient?.id as string,
                    profilePicture: recipient?.profilePicture as string,
                    username: recipient?.username as string,
                  },
                },
              ],
              messages: [
                {
                  ...sentMessages[sentMessages.length - 1],
                  isSender: true,
                } as MessageType,
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

            setConversationId(
              (sentMessages[sentMessages.length - 1] as MessageType)
                .conversationId
            );
          } else {
            setConversations((prevState) => {
              const updatedConversations = prevState.map(
                (convo: ConversationType) =>
                  convo.id === conversationId
                    ? {
                        ...convo,
                        messages: [sentMessages[sentMessages.length - 1]],
                      }
                    : convo
              ) as ConversationType[];
              return [...updatedConversations].sort((a, b) => {
                const dateA = a.messages[0]?.createdAt
                  ? new Date(a.messages[0].createdAt).getTime()
                  : 0;
                const dateB = b.messages[0]?.createdAt
                  ? new Date(b.messages[0].createdAt).getTime()
                  : 0;
                return dateB - dateA;
              });
            });
          }

          setTimeout(() => {
            setMessages((prevMessages) => {
              const updatedMessages = prevMessages.map((pm) => {
                const m = sentMessages.find((sm) => sm.id === pm.id);

                if (m) playSound("message-sent");

                return m ? m : pm;
              });

              return updatedMessages;
            });
          }, 300);

          setTimeout(() => {
            fileUrls.forEach((url) => URL.revokeObjectURL(url.url));
          }, 600);
        })
        .catch((reject) => {
          console.log("An Error Occured While Sending the Message");
        });

      // Here We Will setup the client side changes

      const newMessages: MessageType[] = [];
      if (conversationId) {
        // New Messages
        // Check if there exists a urls or not

        if (urls.length > 0) {
          for (let i = 0; i < urls.length; i++) {
            newMessages.push({
              id: generatedIds[i] as string,
              isSender: true,
              content: "",
              createdAt: new Date(),
              statusUpdates: [
                {
                  userId: recipient?.id || "",
                  status: "sent",
                },
              ],
              messageType: urls[i]?.type as string,
              attachmentUrl: urls[i]?.url as string,
              sender: { username: recipient?.username as string },
              conversationId: conversationId,
            });
          }
        }

        if (data.message != "") {
          // There exists text content in the message then
          if (newMessages.length > 0) {
            (newMessages[newMessages.length - 1] as MessageType).content =
              data.message;
          } else {
            newMessages.push({
              id: generatedIds[generatedIds.length - 1] as string,
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
              attachmentUrl: undefined,
              sender: { username: recipient?.username as string },
              conversationId: conversationId,
            });
          }
        }

        console.log("New Messages are", newMessages);
        setMessages([...messages, ...newMessages] as MessageType[]);
      }

      // Update last message in conversations
      // client Side

      let updatedConversations = [...conversations];

      if (conversationId) {
        updatedConversations = conversations.map((convo: ConversationType) =>
          convo.id === conversationId
            ? {
                ...convo,
                messages: [newMessages[newMessages.length - 1]],
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
      setValue("files", [], { shouldDirty: true });
      setValue("message", "", { shouldDirty: true });
      setUrls([]);
      reset();

      //   // If message includes the image
      //   if (data.image && data.image.length > 0) {
      //     // required file

      //     // console.log("File is ", data.image[0]);
      //     const file = data.image[0] as File;
      //     const formData = new FormData();
      //     formData.append("file", file);
      //     // console.log("Form Data", [...formData.entries()]);

      //     // Since file ko ham serialize nahi kar sakte toh alag se bhejni padegi then update karni padegi
      //     // This will save the image in the store and returns the publicId
      //     // which will be stored in the DB
      //     axios
      //       .post("http://localhost:3000/api/upload-image", formData, {
      //         headers: {
      //           "Content-Type": "multipart/form-data",
      //         },
      //       })
      //       .then((resolve) => {
      //         // console.log("Public Id is ", resolve);
      //         const public_Id = resolve.data.public_Id;
      //         request.attachmentUrl = public_Id;

      //         // Send Message with publicId

      //         axios
      //           .post("http://localhost:3000/api/send-message", request)
      //           .then((resolve: AxiosResponse<any, SendMessageResponse>) => {
      //             // console.log("Message is Successfully Sent", resolve);
      //             // Notify the recipient about the new Message
      //             const sentMessage: MessageType = resolve.data.data.message;

      //             console.log("Send Message is", resolve);

      //             console.log("Message is Successfully Sent", sentMessage);
      //             socket?.send("send-message", {
      //               message: sentMessage,
      //             } as SendMessage);

      //             // If this the new Conversation and then hume client side ui bhi update karna Padega
      //             // This path will not be taken in the group chat's case
      //             if (!conversationId) {
      //               const newConversation: ConversationType = {
      //                 id: sentMessage.conversationId,
      //                 isGroup: false,
      //                 participants: [
      //                   {
      //                     id: session?.user.userId as string,
      //                     user: {
      //                       id: recipient?.id as string,
      //                       profilePicture: recipient?.profilePicture as string,
      //                       username: recipient?.username as string,
      //                     },
      //                   },
      //                 ],
      //                 messages: [
      //                   {
      //                     content: sentMessage.content,
      //                     createdAt: new Date(),
      //                     messageType: "compose",
      //                   },
      //                 ],
      //                 _count: { messages: 0 },
      //               };

      //               setConversations((prevState) => {
      //                 return [...prevState, newConversation].sort((a, b) => {
      //                   const dateA = a.messages[0]?.createdAt
      //                     ? new Date(a.messages[0].createdAt).getTime()
      //                     : 0;
      //                   const dateB = b.messages[0]?.createdAt
      //                     ? new Date(b.messages[0].createdAt).getTime()
      //                     : 0;
      //                   return dateB - dateA;
      //                 });
      //               });

      //               setConversationId(sentMessage.conversationId);
      //             }

      //             setTimeout(() => {
      //               setMessages((prevMessages) => {
      //                 const updatedMessages = prevMessages.map((m) => {
      //                   // console.log(
      //                   //   "Changing the respective message",
      //                   //   m,
      //                   //   sentMessage
      //                   // );
      //                   if (m.id === sentMessage.id) {
      //                     return sentMessage;
      //                   }
      //                   return m;
      //                 });

      //                 return updatedMessages;
      //               });
      //             }, 300);
      //           })
      //           .catch((reject) => {
      //             console.log("An Error Occured While Sending the Message");
      //           });
      //       })
      //       .catch((reject) => {
      //         console.log("An Error Occured While Uploading the Image");
      //       });
      //   } else {
      //     // Simple Text Message
      //     axios
      //       .post("http://localhost:3000/api/send-message", request)
      //       .then((resolve) => {
      //         const sentMessage: MessageType = resolve.data.data.message;

      //         console.log("Message is Successfully Sent", sentMessage);
      //         socket?.send("send-message", {
      //           message: sentMessage,
      //         } as SendMessage);

      //         // If this the new Conversation and then hume client side ui bhi update karna Padega
      //         // For Group ignore
      //         if (!conversationId) {
      //           console.log("User Does not Exists so sending");
      //           const newConversation: ConversationType = {
      //             id: sentMessage.conversationId,
      //             isGroup: false,
      //             participants: [
      //               {
      //                 id: session?.user.userId as string,
      //                 user: {
      //                   id: recipient?.id as string,
      //                   profilePicture: recipient?.profilePicture as string,
      //                   username: recipient?.username as string,
      //                 },
      //               },
      //             ],
      //             messages: [
      //               {
      //                 content: sentMessage.content,
      //                 createdAt: new Date(),
      //                 messageType: "compose",
      //               },
      //             ],
      //             _count: { messages: 0 },
      //           };

      //           setConversations((prevState) => {
      //             return [...prevState, newConversation].sort((a, b) => {
      //               const dateA = a.messages[0]?.createdAt
      //                 ? new Date(a.messages[0].createdAt).getTime()
      //                 : 0;
      //               const dateB = b.messages[0]?.createdAt
      //                 ? new Date(b.messages[0].createdAt).getTime()
      //                 : 0;
      //               return dateB - dateA;
      //             });
      //           });

      //           setConversationId(sentMessage.conversationId);
      //         }

      //         setTimeout(() => {
      //           setMessages((prevMessages) => {
      //             const updatedMessages = prevMessages.map((m) => {
      //               // console.log(
      //               //   "Changing the respective message",
      //               //   m,
      //               //   sentMessage
      //               // );
      //               if (m.id === sentMessage.id) {
      //                 return sentMessage;
      //               }
      //               return m;
      //             });

      //             return updatedMessages;
      //           });
      //           playSound("message-sent");
      //         }, 300);
      //       })
      //       .catch((reject) => {
      //         console.log("An Error Occured While Sending the Message");
      //       });
      //   }

      //   if (conversationId) {
      //     setMessages([
      //       ...messages,
      //       {
      //         id: generatedId,
      //         isSender: true,
      //         content: data.message,
      //         createdAt: new Date(),
      //         statusUpdates: [
      //           {
      //             userId: recipient?.id || "",
      //             status: "sent",
      //           },
      //         ],
      //         messageType: "compose",
      //         attachmentUrl: showPreview,
      //         sender: { username: recipient?.username as string },
      //         conversationId: conversationId,
      //       },
      //     ]);
      //   }

      //   // Update last message in conversations
      //   // client Side

      //   let updatedConversations = [...conversations];

      //   if (conversationId) {
      //     updatedConversations = conversations.map((convo: ConversationType) =>
      //       convo.id === conversationId
      //         ? {
      //             ...convo,
      //             messages: [
      //               {
      //                 ...convo.messages[0],
      //                 content: data.message,
      //                 createdAt: new Date().toISOString(),
      //                 messageType: "compose",
      //               },
      //             ],
      //           }
      //         : convo
      //     ) as ConversationType[];
      //   }

      //   const sortedConversations = [...updatedConversations].sort((a, b) => {
      //     const dateA = a.messages[0]?.createdAt
      //       ? new Date(a.messages[0].createdAt).getTime()
      //       : 0;
      //     const dateB = b.messages[0]?.createdAt
      //       ? new Date(b.messages[0].createdAt).getTime()
      //       : 0;
      //     return dateB - dateA;
      //   });

      //   setConversations(sortedConversations as ConversationType[]);
      //   setValue("image", null, { shouldDirty: true });
      //   setShowPreview("");

      //   reset();
    } catch (error) {
      console.error("Error while sending message", error);
    }
  }

  useEffect(() => {
    reset();
  }, [conversationId]);

  return {
    register,
    handleSubmit: handleSubmit(
      sendMessageHandler as SubmitHandler<{
        message: string;
        files: FileRegisterType[] | null;
      }>
    ),
    watch,
    isDirty,
    setValue,
    resetField,
    urls,
    setUrls,
  };
}
