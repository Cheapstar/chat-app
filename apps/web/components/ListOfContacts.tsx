"use client";
import { useEffect, useState } from "react";
import { ContactCard } from "./ContactCard";
import { getConversations } from "../actions/getConversations";
import { useAtom } from "jotai";
import { conversationsAtom } from "../store/store";
import { motion } from "motion/react";
import { ConversationType } from "../types/types";

export function ListOfContacts() {
  const [conversations, setConversations] = useAtom(conversationsAtom);

  useEffect(() => {
    async function fetchConversations() {
      const newConversations = await getConversations();
      setConversations(
        newConversations.data.conversations as ConversationType[]
      );
      console.log(newConversations);
    }

    fetchConversations();
  }, []);

  return (
    <>
      {conversations.map((conversation) => {
        return (
          <div
            key={conversation?.id}
            className="flex flex-col hover:bg-gray-200"
          >
            <hr className="w-[80%] text-gray-400 self-end"></hr>
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
      })}
    </>
  );
}
