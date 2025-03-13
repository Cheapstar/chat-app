"use client";
import { ListOfContacts } from "./ListOfContacts";
import { Convo } from "./Convo";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  conversationsAtom,
  LoadConvoAtom,
  messagesAtom,
  MessageType,
  socketAtom,
} from "../store/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNewMessage } from "../actions/getNewMessage";
import axios from "axios";

export function ChatApp() {
  const [loadConvo] = useAtom(LoadConvoAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [selectedConversation, setSelectedConversation] =
    useAtom(conversationIdAtom);
  const [socket] = useAtom(socketAtom);

  // State to hold incoming message data
  const [incomingMessage, setIncomingMessage] = useState(null);

  const currentConvoId = useRef(selectedConversation);

  const handleNewMessage = useCallback(() => {
    if (!incomingMessage) return;
    const { conversationId, messageId, senderId } = incomingMessage;

    getNewMessage(messageId, senderId)
      .then((response) => {
        // Update current messages if the incoming message belongs to the selected conversation
        console.log(
          "Adding message to current conversation view",
          currentConvoId
        );

        // if currently opened conversation has id = covnversationID, this updates the ui
        if (conversationId === currentConvoId.current) {
          setMessages((prev) => [
            ...prev,
            {
              ...response.data.message,
              sender: false,
            } as unknown as MessageType,
          ]);

          // updating the status to Read
          axios
            .post("http://localhost:3000/api/update-message-status", {
              conversationId,
            })
            .then((response) => {
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
        }

        // Update conversations list
        // This is on the client side , updating the ui
        setConversations((prev) => {
          const updated = prev.map((convo) => {
            if (convo.id === conversationId) {
              convo._count.messages += 1;

              if (convo.messages[0]) {
                convo.messages[0].content = response.data.message
                  ?.content as string;
                convo.messages[0].createdAt = response.data.message
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
    handleNewMessage();
  }, [incomingMessage]);

  return (
    <div className="bg-white h-[100%] shadow-2xs border-1 border-gray-200 rounded-sm flex rounded-r-md">
      <div className="flex flex-col gap-2 pr-2 border-r-1 border-gray-200 min-w-[30%] z-20">
        <div className="bg-white text-4xl px-6 py-4 text-sky-700">Chats</div>
        <ListOfContacts />
      </div>
      {loadConvo && <Convo />}
    </div>
  );
}
