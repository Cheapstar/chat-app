"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { useAtom } from "jotai";
import {
  conversationIdAtom,
  conversationsAtom,
  messagesAtom,
  previewAtom,
  recepientIdAtom,
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

export function Convo() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [conversationId] = useAtom(conversationIdAtom);
  const [recipientId] = useAtom(recepientIdAtom);
  const [user] = useAtom(userAtom);
  const [showPreview, setShowPreview] = useAtom(previewAtom);
  const [conversations] = useAtom(conversationsAtom);

  const [recipient, setRecipient] = useState<{
    name: string;
    profilePic: string;
  }>({
    name: "",
    profilePic: "",
  });

  const scrollEle = useRef<HTMLDivElement>(null);

  const [socket] = useAtom(socketAtom);

  useEffect(() => {
    async function fetchMessages() {
      try {
        if (!conversationId) {
          return;
        }
        const result = await getMessages({ conversationId });
        console.log(result);
        setMessages(result as MessageType[]);
      } catch (err) {
        console.log("Error while fetching the Messages", err);
      }
    }
    fetchMessages();

    conversations.forEach((convo) => {
      if (convo.id === conversationId) {
        setRecipient({
          profilePic: convo.participants[0]?.user.profilePicture as string,
          name: convo.participants[0]?.user.username as string,
        });
      }
    });

    // update the message status and notify that to the participant

    axios
      .post("http://localhost:3000/api/update-message-status", {
        conversationId,
      })
      .then((response) => {
        if (socket)
          socket.send("message-status-updated", {
            conversationId,
            recipientId: recipientId,
          });
      })
      .catch((reject) => {
        console.log("Could not update the Message Status");
      });

    // messages has been read
    // yaha se conversation Id jaegi then wo saari ki saari message status update honge
    // then return to recepient as per the Id and then send request to him
    // if he has the conversation open then messages update honge to read
  }, [conversationId]);

  useEffect(() => {
    if (scrollEle.current) {
      scrollEle.current.scrollIntoView({ behavior: "auto" });
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
            src={`${recipient.profilePic ? recipient.profilePic : "/default_Profile.png"}`}
            alt="Profile-Picture"
          ></img>
        </div>
        <div className="grow text-lg">{recipient.name}</div>
      </div>
      <div className="flex flex-col h-[80%] gap-4 px-2 py-2 overflow-scroll hide-scroll">
        {messages.length > 0 ? (
          messages.map((message) => (
            <motion.div
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
              <Message message={message}></Message>
            </motion.div>
          ))
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

  const fromServer = message.attachmentUrl?.includes("chat-app");
  let imgUrl = "";
  if (fromServer) {
    imgUrl = `https://res.cloudinary.com/dqungk1o5/image/upload/${message.attachmentUrl}`;
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
          <div className="max-w-[400px] max-h-[400px] px-2 py-2">
            {message.attachmentUrl && (
              <img
                src={`${imgUrl}`}
                alt="User Uploaded Image"
                className="object-contain bg-white cursor-pointer"
                onClick={() => setExpandImage(true)}
              />
            )}
          </div>
          <div>
            {message.content && (
              <p className=" pl-4 py-2 max-w-60 text-wrap break-words p-18">
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
              className="object-contain w-[100%] h-[100%]"
              alt="image"
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

  return (
    <div className=" h-[100%] w-[100%] rounded-md overflow-hidden flex justify-center items-center px-2 py-4">
      {src ? (
        <img
          src={`${src}`}
          alt="User Uploaded Image"
          className="object-contain h-[100%] w-[100%]"
        />
      ) : (
        <p className="text-red-400 text-sm">*Could not load the image</p>
      )}
    </div>
  );
}
