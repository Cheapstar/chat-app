/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  conversationsAtom,
  messagesAtom,
  recipientAtom,
  selectedConversationAtom,
  socketAtom,
  userAtom,
} from "../store/store";
import { getMessages } from "../actions/getMessages";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { MessageType } from "../types/types";
import axios from "axios";
import { RxChevronDown, RxCross1 } from "react-icons/rx";
import { isSameDay, ModifiedTimeAgoForMessages } from "../utils/date";
import React from "react";
import { ImSpinner9 } from "react-icons/im";
import { Message } from "./Message";
import { ConvoTop } from "./ConvoTop";
import { ConvoAbout } from "./ConvoAbout";

export function Convo() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [conversationId] = useAtom(conversationIdAtom);
  const [user] = useAtom(userAtom);
  const [conversations] = useAtom(conversationsAtom);

  const [selectedConversation, setSelectedConversation] = useAtom(
    selectedConversationAtom
  );
  const scrollEle = useRef<HTMLDivElement>(null);

  const [recipient, setRecipient] = useAtom(recipientAtom);

  // For Fetching messages as per request
  const lastMessageDateRef = useRef<Date>(new Date());

  // For loading messages on scroll
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const prevScrollHeight = useRef<number>(null);

  const [showSetToBottom, setShowSetToBottom] = useState<boolean>();

  // Show About Section of Conversation
  const [showAbout, setShowAbout] = useState<boolean>(false);

  const [socket] = useAtom(socketAtom);

  const scrollToBottom = useCallback(() => {
    if (!messageContainerRef.current) return;
    messageContainerRef.current.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: "instant",
    });
  }, []);

  const maintainScrollAfterLoad = useCallback(() => {
    if (!messageContainerRef.current || !prevScrollHeight.current) return;
    const container = messageContainerRef.current;
    container.scrollTo({
      top: container.scrollHeight - prevScrollHeight.current,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      try {
        if (!conversationId || isLoading) {
          return;
        }

        setIsLoading(true);

        const response = await getMessages({
          conversationId,
          lastFetchedDate: lastMessageDateRef.current,
        });

        console.log("Messages are", response);

        if (
          response.success &&
          response.data.messages &&
          response.data.messages.length > 0
        ) {
          const result = response.data.messages.sort((a, b) => {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

          // Updating the last message Date
          lastMessageDateRef.current = result[0]?.createdAt as Date;

          await new Promise((resolve) => setTimeout(resolve, 500));

          // Make sure each message has a unique identifier
          setMessages((prevState) => {
            // Create a new array with unique messages only
            const uniqueMessages = [
              ...(response.data.messages as MessageType[]),
              ...prevState,
            ] as MessageType[];
            const seen = new Set();
            return uniqueMessages.filter((msg) => {
              const duplicate = seen.has(msg.id);
              seen.add(msg.id);
              return !duplicate;
            });
          });

          // Maintain scroll position after loading older messages
          setTimeout(() => {
            setIsLoading(false);
          }, 200);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.log("Error while fetching the Messages", err);
        setIsLoading(false);
      }
    }

    // Initial fetch
    fetchMessages();

    function loadMessages(event: Event) {
      const target = event.currentTarget as HTMLDivElement;

      if (target.scrollHeight - target.scrollTop > target.clientHeight + 100)
        setShowSetToBottom(true);
      else setShowSetToBottom(false);

      if (target.scrollTop === 0) {
        setTimeout(() => {
          fetchMessages();
        }, 300);

        prevScrollHeight.current = target.scrollHeight;
      } else {
        return;
      }
    }

    messageContainerRef.current?.addEventListener("scroll", loadMessages);

    return () => {
      if (messageContainerRef.current) {
        lastMessageDateRef.current = new Date();
        messageContainerRef.current?.removeEventListener(
          "scroll",
          loadMessages
        );

        prevScrollHeight.current = 0;
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      axios
        .post("http://localhost:3000/api/update-message-status", {
          conversationId: conversationId,
        })
        .then((response) => {
          // Notify the sender to update the message status
          console.log("Response of update status", response);
          if (socket) {
            socket.send("message-status-updated", {
              conversationId: conversationId,
            });
          }
        })
        .catch((reject) => {
          console.log("Could not update the Message Status");
        });
    }
  }, [conversationId]);

  // scroll positioning
  useEffect(() => {
    if (!messageContainerRef.current) return;

    if (messages.length <= 25) {
      scrollToBottom();
    } else {
      maintainScrollAfterLoad();
    }
  }, [messages, conversationId, scrollToBottom, maintainScrollAfterLoad]);

  const convoName = selectedConversation
    ? selectedConversation?.isGroup
      ? selectedConversation.groupName
      : selectedConversation?.participants[0]?.user.username
    : recipient?.username;

  const convoProfile = selectedConversation
    ? selectedConversation?.isGroup
      ? "/default_Profile.png"
      : selectedConversation?.participants[0]?.user.profilePicture
        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${selectedConversation?.participants[0]?.user.profilePicture}`
        : "/default_Profile.png"
    : recipient?.profilePicture;

  return (
    <div className="h-full w-full flex">
      <LayoutGroup>
        <AnimatePresence>
          <motion.div
            layout
            key="Convo-Top"
            className="h-[100%] w-full rounded-r-md relative z-50 flex flex-col bg-sky-300"
          >
            {/*Top Bar */}
            <motion.div layout>
              <ConvoTop
                convoName={convoName as string}
                convoProfile={convoProfile as string}
                onClick={() => {
                  setShowAbout((value) => !value);
                }}
              ></ConvoTop>
            </motion.div>

            {/* Set To Bottom Button*/}
            {showSetToBottom && (
              <button
                className="absolute right-4 bottom-20 z-[1000] flex flex-col 
                        flex-wrap justify-center items-center cursor-pointer animate-bounce"
                onClick={scrollToBottom}
              >
                <RxChevronDown className="text-5xl text-white rounded-full  bg-[#60B5FF] p-2 hover:bg-[#1B56FD]"></RxChevronDown>
                <span className="text-sm">Scroll To Bottom</span>
              </button>
            )}

            {/*Messages */}
            <motion.div
              layout
              className="flex flex-col grow gap-4 px-2 py-2 overflow-auto relative"
              ref={messageContainerRef}
            >
              {isLoading && (
                <div className="flex justify-center absolute top-auto">
                  <ImSpinner9 className="animate-spin text-lg text-white" />
                </div>
              )}

              {messages.length > 0 ? (
                messages.map((message, index) => {
                  // Check if this is the first message or a new day compared to previous message
                  const currentMessageDate = new Date(message.createdAt);
                  const shouldRenderFlag =
                    index === 0 ||
                    !isSameDay(
                      currentMessageDate,
                      new Date((messages[index - 1] as MessageType).createdAt)
                    );

                  return (
                    <React.Fragment key={message.id}>
                      {shouldRenderFlag && (
                        <motion.div
                          layout
                          key={`Date-${currentMessageDate}-${index}`}
                          className="flex justify-center"
                          initial={{
                            scale: 0.8,
                            opacity: 0.8,
                          }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                          }}
                        >
                          <p className="bg-gray-300 text-gray-600 text-sm rounded-md px-2.5 py-1.5">
                            {ModifiedTimeAgoForMessages(currentMessageDate)}
                          </p>
                        </motion.div>
                      )}
                      <motion.div
                        layout
                        key={message.id}
                        initial={{
                          scale: 0.4,
                          opacity: 0.8,
                          x: 100,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: 0,
                        }}
                      >
                        <Message
                          message={message}
                          isGroup={
                            conversations.find(
                              (value) => value.id === conversationId
                            )?.isGroup as boolean
                          }
                        ></Message>
                      </motion.div>
                    </React.Fragment>
                  );
                })
              ) : isLoading ? (
                ""
              ) : (
                <p className="text-center text-gray-600">No messages yet.</p>
              )}
              <div ref={scrollEle}></div>
            </motion.div>

            {/*Chat Input */}
            <motion.div layout>
              <ChatInput></ChatInput>
            </motion.div>
          </motion.div>

          {/* About Section */}
          {showAbout && (
            <motion.div
              layout
              key="Convo-About"
              className="px-4 pt-8 min-w-[300px] max-w-[400px] relative overflow-hidden"
            >
              <button className="absolute top-5 right-5 hover:bg-gray-200 transition-all rounded-full p-2">
                <RxCross1 className="text-2xl"></RxCross1>
              </button>
              <motion.div
                initial={{
                  x: 100,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                exit={{
                  x: 100,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                <ConvoAbout></ConvoAbout>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
