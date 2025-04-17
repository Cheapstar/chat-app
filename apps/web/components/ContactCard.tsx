/* eslint-disable @next/next/no-img-element */
"use client";
import { useAtom } from "jotai";
import Image from "next/image";
import {
  conversationIdAtom,
  conversationsAtom,
  LoadConvoAtom,
  messagesAtom,
  selectedConversationAtom,
} from "../store/store";
import { ModifiedTimeAgo, timeAgo } from "../utils/date";
import { ConversationType, MessageType } from "../types/types";
import { IoIosMusicalNotes } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { TiDocumentText } from "react-icons/ti";
import { CiFileOn } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { PiClockLight } from "react-icons/pi";
import { LiaCheckDoubleSolid } from "react-icons/lia";

export function ContactCard({
  conversation,
}: {
  conversation: ConversationType;
}) {
  const [loadConvo, setLoadConvo] = useAtom(LoadConvoAtom);

  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [messages, setMessages] = useAtom(messagesAtom);

  const [selectedConversation, setSelectedConversation] = useAtom(
    selectedConversationAtom
  );

  function clickHandler() {
    if (conversation.id != conversationId) {
      setConversationId(conversation.id);
      setLoadConvo(true);
      setMessages([]);
      const updatedConversations = conversations.map((convo) => {
        if (convo.id === conversation.id) {
          convo._count.messages = 0;
        }

        return convo;
      });

      setSelectedConversation(conversation);
      setConversations(updatedConversations);
      console.log("ConversationId from ContactCard", conversation.id);
    }
  }

  let status = "read";
  if (conversation.messages.length > 0) {
    console.log("Rendering Conversation", conversation);
    for (
      let i = 0;
      i < (conversation.messages[0] as MessageType).statusUpdates.length;
      i++
    ) {
      if (conversation.messages[0]?.statusUpdates[i]?.status !== "read") {
        status = conversation.messages[0]?.statusUpdates[i]?.status as string;
        break;
      }
    }
  }
  return (
    <div className="flex px-3 py-2 items-center overflow-ellipsis relative">
      <button
        className="grow flex gap-3 items-center"
        onClick={clickHandler}
      >
        <div className="rounded-full flex items-center">
          <img
            className="rounded-full w-14 h-14"
            height={40}
            width={40}
            src={`${
              conversation.participants[0]?.user.profilePicture &&
              !conversation.isGroup
                ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${conversation.participants[0]?.user.profilePicture}`
                : "/default_Profile.png"
            }`}
            alt="Profile-Picture"
          ></img>
        </div>
        <div className="grow flex justify-between">
          <div className="pl-4">
            <p className="text-lg font-normal overflow-ellipsis text-left">
              {conversation.isGroup
                ? conversation.groupName
                : conversation?.participants[0]?.user?.username}
            </p>
            {conversation.messages.length > 0 && (
              <div className="flex gap-2">
                {conversation.messages[0]?.isSender && (
                  <p className="flex items-end ">
                    {status === "sent" ? (
                      <PiClockLight className="text-lg" />
                    ) : (
                      <LiaCheckDoubleSolid
                        className={`text-lg transition-all ${
                          status === "read" ? "text-green-400" : "text-gray-500"
                        }`}
                      />
                    )}
                  </p>
                )}

                {conversation.messages[0]?.messageType === "audio" && (
                  <IoIosMusicalNotes></IoIosMusicalNotes>
                )}
                {conversation.messages[0]?.messageType === "video" && (
                  <FaPlay></FaPlay>
                )}
                {conversation.messages[0]?.messageType === "pdf" && (
                  <TiDocumentText></TiDocumentText>
                )}
                {conversation.messages[0]?.messageType === "image" && (
                  <CiImageOn></CiImageOn>
                )}
                {conversation.messages[0]?.messageType === "unknown" && (
                  <CiFileOn></CiFileOn>
                )}
                <p className="text-left text-sm max-w-56 break-words text-ellipsis line-clamp-1">
                  {conversation.messages[0]?.content
                    ? conversation.messages[0]?.content
                    : ""}
                </p>
              </div>
            )}
          </div>
          {conversation._count.messages > 0 && (
            <div className="px-2 py-0.5 rounded-full bg-green-400 text-white absolute top-4 right-14 text-[12px]">
              {conversation._count.messages}
            </div>
          )}
          <div className="flex items-start text-[12px] font-normal text-gray-400">
            {conversation.messages.length > 0 &&
              ModifiedTimeAgo(
                conversation?.messages[0]?.createdAt || new Date()
              )}
          </div>
        </div>
      </button>
    </div>
  );
}
