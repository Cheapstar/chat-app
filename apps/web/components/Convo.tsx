"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  conversationsAtom,
  messagesAtom,
  previewAtom,
  recipientAtom,
  socketAtom,
  userAtom,
} from "../store/store";
import { getMessages } from "../actions/getMessages";
import { getSession, useSession } from "next-auth/react";
import { motion } from "motion/react";
import moment from "moment";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { MessageType } from "../store/store";
import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { isSameDay, ModifiedTimeAgoForMessages } from "../utils/date";
import React from "react";

export function Convo() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [conversationId] = useAtom(conversationIdAtom);
  const [user] = useAtom(userAtom);
  const [showPreview, setShowPreview] = useAtom(previewAtom);
  const [conversations] = useAtom(conversationsAtom);
  const [isLoading, setIsLoading] = useState(false);

  const [recipient, setRecipient] = useAtom(recipientAtom);

  const scrollEle = useRef<HTMLDivElement>(null);

  // For Rendering the date Flag
  const messageDateRef = useRef<Date>(new Date(0));

  // For Fetching messages as per request
  const lastMessageDateRef = useRef<Date>(new Date());

  // For loading messages on scroll
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const [socket] = useAtom(socketAtom);

  useEffect(() => {
    let initialLoad = true;

    async function fetchMessages() {
      try {
        if (!conversationId || isLoading) {
          return;
        }

        setIsLoading(true);

        // Save current scroll height before fetching new messages
        const scrollHeightBeforeFetch =
          messageContainerRef.current?.scrollHeight || 0;

        const response = await getMessages({
          conversationId,
          lastFetchedDate: lastMessageDateRef.current,
        });

        if (response && response.length > 0) {
          // Fix the sorting function to properly compare dates
          const result = response?.sort((a, b) => {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

          lastMessageDateRef.current = result[0]?.createdAt as Date;

          // Make sure each message has a unique identifier
          setMessages((prevState) => {
            // Create a new array with unique messages only (based on some ID)
            const uniqueMessages = [...response, ...prevState] as MessageType[];
            const seen = new Set();
            return uniqueMessages.filter((msg) => {
              const duplicate = seen.has(msg.id);
              seen.add(msg.id);
              return !duplicate;
            });
          });

          // Small delay to ensure DOM updates
          setTimeout(() => {
            if (messageContainerRef.current) {
              if (initialLoad) {
                // On initial load, scroll to bottom
                messageContainerRef.current.scrollTop =
                  messageContainerRef.current.scrollHeight;
                initialLoad = false;
              } else {
                // When loading older messages, maintain scroll position
                const newScrollHeight =
                  messageContainerRef.current.scrollHeight;
                const heightDifference =
                  newScrollHeight - scrollHeightBeforeFetch;
                messageContainerRef.current.scrollTop = heightDifference;
              }
            }
            setIsLoading(false);
          }, 50);
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

    // Debounce the scroll handler to prevent multiple fetches
    let scrollTimeout: NodeJS.Timeout | null = null;

    function loadMessages(event: Event) {
      const target = event.currentTarget as HTMLDivElement;
      if (target.scrollTop === 0 && !isLoading) {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          fetchMessages();
        }, 300);
      }
    }

    if (messageContainerRef.current) {
      messageContainerRef.current.addEventListener("scroll", loadMessages);
    }

    return () => {
      if (messageContainerRef.current) {
        lastMessageDateRef.current = new Date();
        messageDateRef.current = new Date(0);
        messageContainerRef.current.removeEventListener("scroll", loadMessages);
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      axios
        .post("http://localhost:3000/api/update-message-status", {
          conversationId,
        })
        .then((response) => {
          if (socket)
            socket.send("message-status-updated", {
              conversationId,
              recipientId: recipient?.id,
            });
        })
        .catch((reject) => {
          console.log("Could not update the Message Status");
        });
    }
  }, [conversationId]);

  useEffect(() => {
    if (scrollEle.current) {
      // scrollEle.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  return (
    <div className="bg-sky-300 h-[100%] w-full rounded-r-md relative z-50">
      <div
        className="h-[10%] bg-white rounded-tr-md flex px-4 py-2 items-center 
                                gap-6 shadow-2xl border-1 border-gray-200"
      >
        <div className="rounded-full flex items-center border-white border-1 shadow-2xl">
          <img
            className="rounded-full w-12 h-12 object-cover"
            src={`${recipient?.profilePicture ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${recipient?.profilePicture}` : "/default_Profile.png"}`}
            alt="Profile-Picture"
          ></img>
        </div>
        <div className="grow text-lg">{recipient?.username}</div>
      </div>
      <div
        className="flex flex-col h-[80%] gap-4 px-2 py-2 overflow-scroll hide-scroll"
        ref={messageContainerRef}
      >
        {isLoading && (
          <div className="flex justify-center">
            <p className="bg-gray-300 text-gray-600 text-sm rounded-md px-2.5 py-1.5">
              Loading messages...
            </p>
          </div>
        )}

        {messages.length > 0 ? (
          messages.map((message) => {
            // Check if we should render a date Flag
            let shouldRenderFlag = false;

            console.log("Date is ", messageDateRef);
            if (messageDateRef.current === null) {
              shouldRenderFlag = false;
              messageDateRef.current = new Date(message.createdAt);
            } else {
              shouldRenderFlag = isSameDay(
                new Date(message.createdAt),
                messageDateRef.current
              );

              if (!shouldRenderFlag) {
                messageDateRef.current = new Date(message.createdAt);
              }
            }

            return (
              <React.Fragment key={message.id}>
                {!shouldRenderFlag && (
                  <motion.div className="flex justify-center">
                    <p className="bg-gray-300 text-gray-600 text-sm rounded-md px-2.5 py-1.5">
                      {ModifiedTimeAgoForMessages(new Date(message.createdAt))}
                    </p>
                  </motion.div>
                )}
                <motion.div>
                  <Message message={message}></Message>
                </motion.div>
              </React.Fragment>
            );
          })
        ) : (
          <p className="text-center text-gray-600">No messages yet.</p>
        )}
        <div ref={scrollEle}></div>
      </div>

      {showPreview && (
        <>
          <div className="absolute h-[80%] w-[100%] bottom-16   bg-gray-400/30  backdrop-blur-3xl ">
            <div className="relative h-[100%] w-[100%]">
              <Preview src={showPreview} />
              <button
                type="button"
                className="cursor-pointer rounded-full absolute right-2 top-2"
                onClick={() => {
                  setShowPreview("");
                }}
              >
                <RxCross1 className="text-2xl text-black"></RxCross1>
              </button>
            </div>
          </div>
        </>
      )}
      <div className="h-[10%]">
        <ChatInput></ChatInput>
      </div>
    </div>
  );
}

export function Message({ message }: { message: MessageType }) {
  const [expandImage, setExpandImage] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const fromServer = message.attachmentUrl?.includes("chat-app");
  let imgUrl = "";
  if (fromServer) {
    imgUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${message.attachmentUrl}`;
  } else {
    imgUrl = message.attachmentUrl as string;
  }

  return (
    <>
      <div
        className={`flex ${message.sender ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex   relative rounded-md overflow-hidden flex-col
          ${message.sender ? "bg-gray-700 text-white" : "bg-white text-black"} `}
        >
          {/* Content */}
          {message.attachmentUrl && (
            <div className="max-w-[400px] max-h-[400px] px-2 py-2">
              <img
                src={`${imgUrl}`}
                alt="User Uploaded Image"
                className="object-contain bg-white cursor-pointer"
                onClick={() => setExpandImage(true)}
              />
            </div>
          )}
          <div>
            {message.content && (
              <p className=" pl-3 py-2 max-w-60 text-wrap break-words pr-18">
                {message.content}
              </p>
            )}
          </div>

          <div className="absolute bottom-0 right-2 flex gap-1">
            <p className="text-[10px] text-gray-300 flex items-end px-2 py-2">
              {moment(message.createdAt).format("HH:MM")}
            </p>
            {message.sender && (
              <p className="flex items-end pr-0.5 pb-2">
                <LiaCheckDoubleSolid
                  className={`text-lg transition-all ${message.status === "read" ? "text-green-400" : "text-gray-200"} `}
                />
              </p>
            )}
          </div>
        </div>
      </div>
      {expandImage && (
        // Overlay
        <div
          className="fixed h-[100vh] w-[100vw] inset-0 bg-gray-400/30 z-[10000] 
                backdrop-blur-3xl flex justify-center items-center overflow-auto"
          onClick={() => setExpandImage(false)}
        >
          <button
            className="absolute cursor-pointer right-6 top-4"
            onClick={() => setExpandImage(false)}
          >
            <RxCross1 className="text-5xl text-white" />
          </button>

          <div
            className=" h-[80vh] max-w-[80vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imgUrl}
              className={`object-contain w-[100%] h-[100%] ${
                isZoomed
                  ? "scale-200 cursor-zoom-out"
                  : "scale-100 cursor-zoom-in"
              }`}
              alt="image"
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function Preview({ src }: { src: string }) {
  useEffect(() => {
    console.log("Hi from Preview", src);
  }, []);

  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  return (
    <div className=" h-[100%] w-[100%] rounded-md overflow-hidden flex justify-center items-center px-2 py-4">
      {src ? (
        <img
          src={`${src}`}
          alt="User Uploaded Image"
          className={`object-contain w-[100%] h-[100%] ${
            isZoomed ? "scale-200 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
      ) : (
        <p className="text-red-400 text-sm">*Could not load the image</p>
      )}
    </div>
  );
}
