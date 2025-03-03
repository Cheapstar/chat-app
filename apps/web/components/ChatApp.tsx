"use client"
import { ListOfContacts } from "./ListOfContacts";
import { Convo } from "./Convo";
import { useAtom } from "jotai";
import { LoadConvoAtom } from "../store/store";
import { useEffect } from "react";
import { getSession } from "next-auth/react";

export function ChatApp(){
    const [loadConvo,] = useAtom(LoadConvoAtom);

    return (
        <div className="bg-white h-[100%] shadow-2xs border-1 border-gray-200 rounded-sm flex rounded-r-md">
            <div className="flex flex-col gap-2 pr-2 border-r-1 border-gray-200 min-w-[30%] z-20">
                <div className="bg-white text-4xl px-6 py-4 text-sky-700">
                    Chats
                </div>
                <ListOfContacts></ListOfContacts>
            </div>
            {
                loadConvo && (
                    <Convo></Convo>
                )
            }
        </div>
    )
}