"use client"

import { useEffect, useRef, useState } from "react"
import { ChatInput } from "./ChatInput"
import { useAtom } from "jotai";
import { conversationIdAtom, conversationsAtom, messagesAtom, previewAtom, recepientIdAtom, socketAtom, userAtom } from "../store/store";
import { getMessages } from "../actions/getMessages";
import { getSession, useSession } from "next-auth/react";
import {motion} from "motion/react"
import moment from "moment"
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { MessageType } from "../store/store";
  

export function Convo(){
    const [messages,setMessages] = useAtom(messagesAtom);
    const [conversationId,] = useAtom(conversationIdAtom);
    const [recepientId,] = useAtom(recepientIdAtom);
    const [user,] = useAtom(userAtom);
    const [showPreview,setShowPreview] = useAtom(previewAtom);
    const [conversations,] = useAtom(conversationsAtom);
    
    const [recipient,setRecipient] = useState<{name:string;profilePic:string}>({
        name:"",
        profilePic:""
    });

    const scrollEle= useRef<HTMLDivElement>(null);

    const [socket,] = useAtom(socketAtom);

    useEffect(()=>{
        async function fetchMessages(){
            try{
                if(!conversationId){
                    return;
                }
                const result = await getMessages({conversationId});
                console.log(result);
                setMessages(result as MessageType[]);
            }
            catch(err){
                console.log("Error while fetching the Messages",err)
            }
        }
        fetchMessages();

        conversations.forEach((convo)=>{
            if(convo.id === conversationId){
                setRecipient({
                    profilePic:convo.participants[0]?.user.profilePicture as string,
                    name:convo.participants[0]?.user.username as string
                });
            }
        })

        // messages has been read
        // yaha se conversation Id jaegi then wo saari ki saari message status update honge
        // then return to recepient as per the Id and then send request to him 
        // if he has the conversation open then messages update honge to read
        
        const data = {
            type:'updateStatus',
            update:{
                conversationId,
                recepientId,
                senderId:user?.userId
            }
        }
        socket?.send(JSON.stringify(data));


    },[conversationId]);



    useEffect(()=>{
        if(scrollEle.current){
            scrollEle.current.scrollIntoView({behavior:"auto"});
        }
    },[messages]);

    return(
        <div className="bg-sky-300 h-[100%] w-full rounded-r-md relative z-50">
            <div className="h-[10%] bg-white rounded-tr-md flex px-4 py-2 items-center 
                                gap-6 shadow-2xl border-1 border-gray-200">
                <div className="rounded-full flex items-center border-white border-1 shadow-2xl">
                    <img className="rounded-full w-12 h-12 object-cover" 
                             src={`${recipient.profilePic ? recipient.profilePic : "/default_Profile.png"}`}
                            alt="Profile-Picture">
                    </img>
                </div>
                <div className="grow text-lg">
                    {recipient.name}
                </div>
            </div>
            <div className="flex flex-col h-[80%] gap-4 px-2 py-2 overflow-scroll hide-scroll">
                {
                    messages.length > 0 ? (
                        messages.map((message) => (
                            <motion.div 
                                key={message.id}
                                initial={{
                                    scale:0.4,
                                    opacity:0.8,
                                    x:100
                                }}
                                animate = {{
                                    scale:1,
                                    opacity:1,
                                    x:0
                                }}
                                >
                                <Message message={message} ></Message>
                            </motion.div>
                        ))
                      ) : (
                        <p className="text-center text-gray-600">No messages yet.</p>
                      )
                }
                <div ref={scrollEle}>
                </div>
            </div>

                {
                    showPreview && (
                        <>
                            <div className="absolute bottom-16 rounded-md right-6">
                                <div className="relative">
                                    <Preview src={showPreview}/>
                                    <button
                                        type="button"
                                        className="bg-white border-1 cursor-pointer
                                                     shadow-2xl px-2 rounded-full absolute -top-2.5 -right-2.5"
                                        onClick={()=>{
                                            setShowPreview("");
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                }
            <div className="h-[10%]">
                <ChatInput></ChatInput>
            </div>
        </div>
    )
}


export function Message({
    message
}:{
    message:MessageType
}){
    return(
        <div className={`flex ${message.sender ? "justify-end" : "justify-start"}`}>
            {
                message.messageType === "text" ? (
                    <div className="flex bg-white rounded-md">
                        <p className=" px-4 py-2 max-w-60 text-wrap break-words">
                            {message.content}
                        </p>
                        <p className="text-[8px] text-gray-300 flex items-end px-2 py-2">
                            {moment(message.createdAt).format("HH:MM")}
                        </p>
                        {
                            message.sender && (
                                <p className="flex items-end pr-2 py-2">
                                    <LiaCheckDoubleSolid className={`text-lg ${message.status === "READ" ? "text-blue-600" : "text-gray-500"} `} />
                                </p>
                            )
                        }            
                    </div>
                ):(
                    <div className="bg-white max-w-[400px] max-h-[400px] rounded-md overflow-hidden px-2 py-2">
                        {
                            message.attachmentUrl ? (
                                <img src={`${message.attachmentUrl}`} alt="User Uploaded Image" className="object-contain"/>
                            ):(
                                <p className="text-red-400 text-sm">*Could not load the image</p>
                            )
                        }        
                         {
                            message.sender && (
                                <p className="flex items-end pr-2 py-2 justify-end">
                                    <LiaCheckDoubleSolid className={`text-lg ${message.status === "READ" ? "text-blue-600" : "text-gray-500"} `} />
                                </p>
                            )
                        }             
                    </div>
                )
            }
            
        </div>
    )
}



function Preview({src}:{src:string}){
    useEffect(()=>{
        console.log("Hi from Preview",src)
    },[]);

    return(
        <div className="bg-white max-w-[400px] max-h-[400px] rounded-md overflow-hidden">
            {
                src ? (
                    <img src={`${src}`} alt="User Uploaded Image" className="object-contain"/>
                ):(
                    <p className="text-red-400 text-sm">*Could not load the image</p>
                )
            }
        </div>
    )
}