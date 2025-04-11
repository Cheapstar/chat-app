"use client";
import { useAtom } from "jotai";
import Image from "next/image";
import {
  conversationIdAtom,
  LoadConvoAtom,
  messagesAtom,
  recipientAtom,
  selectedConversationAtom,
} from "../store/store";
import { useRouter } from "next/navigation";
import { set } from "zod";
import { RiMessage3Line } from "react-icons/ri";

export type User = {
  conversationId: string;
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  status: string;
};

export function UserCard({ user }: { user: User }) {
  const [LoadConvo, setLoadConvo] = useAtom(LoadConvoAtom);
  const [conversationId, setConversationId] = useAtom(conversationIdAtom);
  const [recepient, setRecepient] = useAtom(recipientAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [selectedConversation, setSelectedConversation] = useAtom(
    selectedConversationAtom
  );

  const router = useRouter();

  function onClick() {
    setLoadConvo(true);
    setConversationId(user.conversationId || "");
    setRecepient({
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture as string,
    });
    setSelectedConversation(undefined);
    setMessages([]);
    router.push("/chat");
  }

  return (
    <div className="flex px-3 rounded-md py-2 items-center">
      <div className=" rounded-full flex items-center object-cover">
        <img
          className="rounded-full w-12 h-12"
          src={`${user.profilePicture ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${user.profilePicture}` : "/default_Profile.png"}`}
          alt="Profile-Picture"
        ></img>
      </div>
      <div className="pl-4 grow">
        <p className="text-lg font-normal">{user.username}</p>
      </div>
      <div className="flex">
        <button
          onClick={onClick}
          className="px-4 py-3.5 rounded-full group hover:bg-sky-700 transition-all duration-75"
        >
          <RiMessage3Line
            className="text-2xl text-sky-700
                                                 group-hover:text-white transition-all"
          />
        </button>
      </div>
    </div>
  );
}
