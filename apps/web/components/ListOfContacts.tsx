"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContactCard } from "./ContactCard";
import { getConversations } from "../actions/getConversations";
import { useAtom } from "jotai";
import { conversationsAtom } from "../store/store";
import { motion } from "motion/react";
import { ConversationType } from "../types/types";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export function ListOfContacts() {
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [matchedConversation, setMatchedConversation] = useState<
    ConversationType[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  const searchTextRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchConversations() {
      setIsLoading(true);
      try {
        const newConversations = await getConversations();
        setConversations(
          newConversations.data.conversations as ConversationType[]
        );
        console.log(newConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [setConversations]);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const searchString = event.target.value;
      setSearchText(searchString);

      if (searchString === "") {
        setMatchedConversation([]);
        return;
      }

      const matchingConversations = conversations.filter((conversation) => {
        const { isGroup, groupName, participants } =
          conversation as ConversationType;

        if (isGroup) {
          return groupName?.toLowerCase().includes(searchString.toLowerCase());
        } else {
          const user = participants[0]?.user;
          return user?.username
            ?.toLowerCase()
            .includes(searchString.toLowerCase());
        }
      });

      setMatchedConversation(matchingConversations);
    },
    [conversations]
  );

  const clearSearch = () => {
    setSearchText("");
    setMatchedConversation([]);
    if (searchTextRef.current) {
      searchTextRef.current.value = "";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading conversations...</p>
        </div>
      );
    }

    if (searchText && matchedConversation.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-gray-400 mb-2 text-5xl">
            <IoIosSearch />
          </div>
          <p className="text-gray-500 text-center">
            No conversations match "{searchText}"
          </p>
          <button
            className="mt-4 text-blue-500 hover:underline"
            onClick={clearSearch}
          >
            Clear search
          </button>
        </div>
      );
    }

    return (
      <>
        {(searchText ? matchedConversation : conversations).map(
          (conversation, index) => {
            return (
              <div
                key={conversation?.id}
                className="flex flex-col hover:bg-gray-200"
              >
                {index !== 0 && (
                  <hr className="w-[80%] text-gray-400 self-end"></hr>
                )}
                <motion.div
                  layout="position"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 50,
                  }}
                >
                  <ContactCard conversation={conversation} />
                </motion.div>
              </div>
            );
          }
        )}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex px-4 py-2 border-b">
        <div className="grow flex bg-gray-200 px-2 rounded-md shadow-2xs items-center">
          <IoIosSearch className="text-gray-500" />
          <input
            type="text"
            className="grow text-sm px-2 py-2 focus:outline-none bg-transparent"
            placeholder="Search The Conversations"
            onChange={handleSearch}
            value={searchText}
            ref={searchTextRef}
          />
          {searchText && (
            <button
              className="rounded-full group transition-all cursor-pointer p-1"
              onClick={clearSearch}
            >
              <RxCross2
                className="text-gray-500 transition-all rounded-full
               group-hover:bg-gray-500 group-hover:text-white"
              />
            </button>
          )}
        </div>
      </div>
      <div className="grow overflow-auto">{renderContent()}</div>
    </div>
  );
}
