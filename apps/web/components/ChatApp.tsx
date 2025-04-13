"use client";
import { ListOfContacts } from "./ListOfContacts";
import { Convo } from "./Convo";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  conversationsAtom,
  LoadConvoAtom,
  messagesAtom,
  showCreateGroupModal,
  socketAtom,
} from "../store/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNewMessage } from "../actions/getNewMessage";
import axios from "axios";
import { resolve } from "dns";
import { getUserWithId } from "../actions/getUserWithId";
import { ConversationType, MessageType } from "../types/types";
import { playSound } from "./hooks/sound";
import { FaPlus } from "react-icons/fa";

interface SocketNewMessage {
  senderId: string;
  messages: MessageType[];
}

export function ChatApp() {
  const [loadConvo] = useAtom(LoadConvoAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [selectedConversation, setSelectedConversation] =
    useAtom(conversationIdAtom);
  const [socket] = useAtom(socketAtom);
  const [showGroupModal, setShowGroupModal] = useAtom(showCreateGroupModal);

  // State to hold incoming message data
  const [incomingMessage, setIncomingMessage] = useState(null);

  const currentConvoId = useRef(selectedConversation);

  const handleNewMessage = useCallback(() => {
    if (!incomingMessage) return;
    const { messages: newMessages, senderId } =
      incomingMessage as SocketNewMessage;

    console.log("Incoming Message", incomingMessage);
    // console.log("Socket conversation Id is", newMessage);
    // From Socket we will get the senderId and messageId
    // Fetch the newMessage and then update the ui

    // Update current messages if the incoming message belongs to the selected conversation
    // console.log("Adding message to current conversation view", currentConvoId);

    // if currently opened conversation has id = covnversationID, this updates the ui
    if (
      (newMessages[0] as MessageType).conversationId === selectedConversation
    ) {
      // update the ui
      setMessages((prev) => [
        ...prev,
        ...newMessages.map((newMessage) => {
          return {
            ...newMessage,
            isSender: false,
          } as MessageType;
        }),
      ]);

      // updating the status to Read
      axios
        .post("http://localhost:3000/api/update-message-status", {
          conversationId: (newMessages[0] as MessageType).conversationId,
        })
        .then((response) => {
          // Notify the sender to update the message status
          console.log("Response of update status", response);
          if (socket) {
            socket.send("message-status-updated", {
              conversationId: (newMessages[0] as MessageType).conversationId,
            });
          }
        })
        .catch((reject) => {
          console.log("Could not update the Message Status");
        });

      // Update the ui
      setConversations((prev) => {
        const updated = prev.map((convo: ConversationType) => {
          if (convo.id === (newMessages[0] as MessageType).conversationId) {
            convo._count.messages = 0;

            convo.messages[0] = {
              ...newMessages[newMessages.length - 1],
              isSender: false,
            } as MessageType;
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

      playSound("message-received");
    } else {
      // check if this conversation exists if not make it
      let convoExists = false;

      console.log(
        "Received Conversation Id",
        (newMessages[0] as MessageType).conversationId
      );
      console.log("Conversations", conversations);
      for (let i = 0; i < conversations.length; i++) {
        if (
          conversations[i]?.id ===
          (newMessages[0] as MessageType).conversationId
        ) {
          convoExists = true;
          break;
        }
      }

      // console.log("Does convo exists", convoExists);
      if (convoExists) {
        // Update conversations list
        // This is on the client side , updating the ui
        // Existing User
        setConversations((prev) => {
          const updated = prev.map((convo) => {
            if (convo.id === (newMessages[0] as MessageType).conversationId) {
              convo._count.messages += 1;

              convo.messages[0] = {
                ...newMessages[newMessages.length - 1],
                isSender: false,
              } as MessageType;
            }
            return convo;
          });

          // Updating the ui
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
        playSound("message-convo-not-opened");
      } else {
        // This is for New user
        // Iss user se ye pehla message aaya hai
        getUserWithId(senderId)
          .then((userResponse) => {
            console.log("User Does not Exists so sending");
            // Make new Conversation for client sides updates
            const newConversation: ConversationType = {
              id: (newMessages[0] as MessageType).conversationId as string,
              isGroup: false,
              participants: [
                {
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
                  ...newMessages[newMessages.length - 1],
                  isSender: false,
                } as MessageType,
              ],
              _count: { messages: newMessages.length },
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

            playSound("message-new-convo");
          })
          .catch((reject) => {
            console.log("An Error occured While GetUserWithId");
          });
      }
    }

    // Clear incoming message state
    setIncomingMessage(null);
  }, [incomingMessage]);

  const updateMessageStatus = useCallback((payload: any) => {
    console.log("Received the update status request");
    const {
      conversationId: recvConversationId,
      userId: oneWhoUpdatedTheStatus,
    } = payload;

    if (recvConversationId === currentConvoId.current) {
      setTimeout(() => {
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            const updatedStatusUpdates = message.statusUpdates.map(
              (statusUpdate) => {
                if (
                  statusUpdate.userId === oneWhoUpdatedTheStatus &&
                  statusUpdate.status !== "read"
                ) {
                  return {
                    ...statusUpdate,
                    status: "read",
                  };
                }
                return statusUpdate;
              }
            );

            return {
              ...message,
              statusUpdates: updatedStatusUpdates,
            };
          });
        });
      }, 500);
    }

    setTimeout(() => {
      setConversations((prevState) => {
        const updatedConversations = prevState.map((convo: ConversationType) =>
          convo.id === recvConversationId
            ? {
                ...convo,
                messages: [
                  {
                    ...convo.messages[0],
                    statusUpdates: convo.messages[0]?.statusUpdates.map(
                      (value) => {
                        if (value.userId === oneWhoUpdatedTheStatus) {
                          return {
                            ...value,
                            status: "read",
                          };
                        }
                        return value;
                      }
                    ),
                  },
                ],
              }
            : convo
        ) as ConversationType[];

        return updatedConversations;
      });
    }, 1000);
  }, []);

  const addedToGroup = useCallback((payload: any) => {
    setConversations((prevState) => [payload.conversation, ...prevState]);
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
    socket.on("added-to-group", addedToGroup);

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

    // console.log("This is Running Twice");
    handleNewMessage();
  }, [incomingMessage]);

  return (
    <div className="bg-white h-[100%] shadow-2xs border-1 border-gray-200 rounded-sm flex rounded-r-md ">
      <div className="flex flex-col  min-w-[30%]">
        <div className="bg-white text-4xl px-6 py-4 text-sky-700 sticky top-0 ">
          Chats
        </div>
        <div className="flex flex-col  border-r border-gray-200 relative h-full overflow-auto">
          <div className="flex-1 h-full">
            <ListOfContacts />
          </div>
          <button
            className="absolute bottom-4 border-gray-200  w-max rounded-full
           right-5 p-4 bg-[#60B5FF] hover:bg-[#1B56FD] transition-all active:scale-95"
            onClick={() => {
              setShowGroupModal(true);
            }}
          >
            <FaPlus className="text-2xl rounded-full text-white" />
          </button>
        </div>
      </div>
      {loadConvo && <Convo />}
    </div>
  );
}
