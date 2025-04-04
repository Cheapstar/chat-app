"use client";
import { ListOfContacts } from "./ListOfContacts";
import { Convo } from "./Convo";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  conversationsAtom,
  ConversationType,
  LoadConvoAtom,
  messagesAtom,
  MessageType,
  recipientAtom,
  socketAtom,
} from "../store/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNewMessage } from "../actions/getNewMessage";
import axios from "axios";
import { resolve } from "dns";
import { getUserWithId } from "../actions/getUserWithId";

export function ChatApp() {
  const [loadConvo] = useAtom(LoadConvoAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [selectedConversation, setSelectedConversation] =
    useAtom(conversationIdAtom);
  const [socket] = useAtom(socketAtom);
  const [recipient, setRecipient] = useAtom(recipientAtom);

  // State to hold incoming message data
  const [incomingMessage, setIncomingMessage] = useState(null);

  const currentConvoId = useRef(selectedConversation);

  const handleNewMessage = useCallback(() => {
    if (!incomingMessage) return;
    const { conversationId, messageId, senderId } = incomingMessage;

    getNewMessage(messageId, senderId)
      .then((newMessage) => {
        // Update current messages if the incoming message belongs to the selected conversation
        console.log(
          "Adding message to current conversation view",
          currentConvoId
        );

        // if currently opened conversation has id = covnversationID, this updates the ui
        if (conversationId === selectedConversation) {
          // update the ui
          setMessages((prev) => [
            ...prev,
            {
              ...newMessage.data.message,
              sender: false,
            } as unknown as MessageType,
          ]);

          // updating the status to Read
          axios
            .post("http://localhost:3000/api/update-message-status", {
              conversationId,
            })
            .then((newMessage) => {
              if (socket)
                socket.send("message-status-updated", {
                  conversationId,
                  recipientId: senderId,
                  messageId,
                });
            })
            .catch((reject) => {
              console.log("Could not update the Message Status");
            });

          setConversations((prev) => {
            const updated = prev.map((convo) => {
              if (convo.id === conversationId) {
                convo._count.messages = 0;
              }
              return convo;
            });

            return [...updated].sort((a, b) => {
              const dateA = a.messages[0]?.createdAt
                ? new Date(a.messages[0].createdAt).getTime()
                : 0;
              const dateB = b.messages[0]?.createdAt
                ? new Date(b.messages[0].createdAt).getTime()
                : 0;
              return dateB - dateA;
            });
          });
        } else {
          // check if this conversation exists if not make it
          let convoExists = false;

          console.log("Received Conversation Id", conversationId);
          console.log("Conversations", conversations);
          for (let i = 0; i < conversations.length - 1; i++) {
            if (
              conversations[i]?.id === newMessage.data.message?.conversationId
            ) {
              convoExists = true;
              break;
            }
          }

          if (convoExists) {
            // Update conversations list
            // This is on the client side , updating the ui
            // Existing User
            setConversations((prev) => {
              const updated = prev.map((convo) => {
                if (convo.id === conversationId) {
                  convo._count.messages += 1;

                  if (convo.messages[0]) {
                    convo.messages[0].content = newMessage.data.message
                      ?.content as string;
                    convo.messages[0].createdAt = newMessage.data.message
                      ?.createdAt as Date;
                    convo.messages[0].messageType = "compose";
                  }
                }
                return convo;
              });

              return [...updated].sort((a, b) => {
                const dateA = a.messages[0]?.createdAt
                  ? new Date(a.messages[0].createdAt).getTime()
                  : 0;
                const dateB = b.messages[0]?.createdAt
                  ? new Date(b.messages[0].createdAt).getTime()
                  : 0;
                return dateB - dateA;
              });
            });
          } else {
            // This is for New user
            getUserWithId(senderId)
              .then((userResponse) => {
                console.log("User Does not Exists so sending");
                const newConversation: ConversationType = {
                  id: newMessage.data.message?.conversationId as string,
                  isGroup: false,
                  participants: [
                    {
                      id: "",
                      user: {
                        id: userResponse.data.message?.id as string,
                        profilePicture: userResponse.data.message
                          ?.profilePicture as string,
                        username: userResponse.data.message?.username as string,
                      },
                    },
                  ],
                  messages: [
                    {
                      content: newMessage.data.message?.content as string,
                      createdAt: new Date(),
                      messageType: "compose",
                    },
                  ],
                  _count: { messages: 1 },
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
              })
              .catch((reject) => {
                console.log("An Error occured While GetUserWithId");
              });
          }
        }

        // Clear incoming message state
        setIncomingMessage(null);
      })
      .catch((error) => {
        console.error("Error fetching new message:", error);
        setIncomingMessage(null);
      });
  }, [incomingMessage]);

  const updateMessageStatus = useCallback((payload: any) => {
    const { conversationId, recipientId, messageId } = payload;

    if (conversationId === currentConvoId.current) {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];

        for (let i = newMessages.length - 1; i >= 0; i--) {
          if (newMessages[i]?.status === "read") break;
          (newMessages[i] as MessageType).status = "read";
        }
        return newMessages;
      });
    }
  }, []);

  // Socket event handler
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload: any) => {
      console.log("New message received:", payload);
      setIncomingMessage({ ...payload });
    };

    socket.on("new-message", onNewMessage);
    socket.on("update-message-status", updateMessageStatus);

    return () => {
      socket.off("new-message", onNewMessage);
      socket.off("update-message-status", updateMessageStatus);
    };
  }, [socket]);

  useEffect(() => {
    currentConvoId.current = selectedConversation;
  }, [selectedConversation]);

  // Process incoming message when it changes
  useEffect(() => {
    if (!incomingMessage) return;

    console.log("This is Running Twice");
    handleNewMessage();
  }, [incomingMessage]);

  return (
    <div className="bg-white h-[100%] shadow-2xs border-1 border-gray-200 rounded-sm flex rounded-r-md">
      <div className="flex flex-col  min-w-[30%]">
        <div className="bg-white text-4xl px-6 py-4 text-sky-700 sticky top-0 z-30">
          Chats
        </div>
        <div className="flex flex-col pr-2 border-r-1 border-gray-200z-20 overflow-auto">
          <ListOfContacts />
        </div>
      </div>
      {loadConvo && <Convo />}
    </div>
  );
}
