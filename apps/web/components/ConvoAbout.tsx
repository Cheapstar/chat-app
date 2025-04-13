"use client";
import { ConversationType } from "../types/types";
import { HiTrash, HiOutlineBan } from "react-icons/hi";
import { FiMessageSquare } from "react-icons/fi";
import { useAtom } from "jotai";
import { recipientAtom, selectedConversationAtom } from "../store/store";

export function ConvoAbout() {
  const [selectedConversation] = useAtom(selectedConversationAtom);
  const [recipient] = useAtom(recipientAtom);

  const displayPhoto = selectedConversation
    ? selectedConversation?.isGroup
      ? "/default_Profile.png"
      : selectedConversation?.participants[0]?.user.profilePicture
        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${selectedConversation?.participants[0]?.user.profilePicture}`
        : "/default_Profile.png"
    : recipient?.profilePicture
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${recipient.profilePicture}`
      : "/default_Profile.png";
  const displayName = selectedConversation
    ? selectedConversation?.isGroup
      ? selectedConversation.groupName
      : selectedConversation?.participants[0]?.user.username
    : recipient?.username;

  return (
    <section className="h-full overflow-auto px-6 py-8">
      {/* Profile Section */}
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full overflow-hidden w-40 h-40 border-4 border-gray-300 shadow-lg">
          <img
            src={displayPhoto}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-3xl font-semibold text-gray-800">{displayName}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col gap-4">
        <button
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition"
          disabled
        >
          <FiMessageSquare size={20} />
          Delete Messages
        </button>
        <button
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition"
          disabled
        >
          <HiTrash size={20} />
          Delete
        </button>
        <button
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
          disabled
        >
          <HiOutlineBan size={20} />
          Block
        </button>
      </div>
    </section>
  );
}
