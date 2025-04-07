"use client";
import { useAtom } from "jotai";
import {
  conversationsAtom,
  showCreateGroupModal,
  socketAtom,
  userAtom,
} from "../store/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export function CreateGroupModal() {
  const [showGroupModal, setShowGroupModal] = useAtom(showCreateGroupModal);
  const [conversations, setConversations] = useAtom(conversationsAtom);

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useAtom(socketAtom);

  const contacts = conversations
    .filter((value) => !value.isGroup)
    .map((value) => ({
      name: value.participants[0]?.user.username,
      userId: value.participants[0]?.user.id,
    }));

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert("Please enter a group name and select at least two members.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/create-group",
        {
          groupName,
          selectedMembers,
        }
      );

      const newConversation = response.data.conversation;
      setConversations((prev) => [...prev, newConversation]);

      getSession().then((session) => {
        if (socket) {
          socket.send("new-group-created", {
            conversation: newConversation,
            admin: {
              id: session?.user.userId,
              username: session?.user.name,
              profilePicture: session?.user.image,
            },
          });
        }
      });

      // Clear form and close modal
      setShowGroupModal(false);
      setGroupName("");
      setSelectedMembers([]);
    } catch (error: any) {
      console.error("Group creation failed:", error);
      alert(error?.response?.data?.error || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showGroupModal && (
        <main
          className="bg-black/40 fixed inset-0 flex justify-center items-center z-40"
          onClick={() => setShowGroupModal(false)}
        >
          <section
            className="bg-white px-6 py-6 rounded-xl shadow-md flex flex-col gap-4 min-w-[320px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-sky-700">Create Group</h2>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={isLoading}
            />

            <div className="flex flex-col gap-2">
              <span className="text-gray-600 font-medium">Select Members:</span>
              {contacts.map((contact) => (
                <label
                  key={contact.userId}
                  className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.userId as string)}
                    onChange={() => toggleMember(contact.userId as string)}
                    className="accent-sky-600 w-4 h-4"
                    disabled={isLoading}
                  />
                  <span className="text-gray-800">{contact.name}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={isLoading}
              className={`${
                isLoading
                  ? "bg-sky-400 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700"
              } text-white py-2 rounded-md font-medium transition flex justify-center items-center gap-2`}
            >
              {isLoading && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              )}
              {isLoading ? "Creating..." : "Create Group"}
            </button>
          </section>
        </main>
      )}
    </>
  );
}
