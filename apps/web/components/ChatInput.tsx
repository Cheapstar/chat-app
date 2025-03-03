"use client"

import { useForm } from "react-hook-form"
import { sendMessage } from "../actions/sendMessage";
import { useAtom } from "jotai";
import { conversationIdAtom, conversationsAtom, messagesAtom, previewAtom, recepientIdAtom, socketAtom } from "../store/store";
import { getSession } from "next-auth/react";
import { AiOutlinePlus } from "react-icons/ai";
import { HiMiniMicrophone } from "react-icons/hi2";
import { GiPaperPlane } from "react-icons/gi";
import { EventHandler, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BsPlusSquareDotted } from "react-icons/bs";
import Image from "next/image";
import { ExtraButtons } from "./ExtraButtons";
import { useChatForm } from "./hooks/useChatForm";


export function ChatInput(){
   const {
        register,
        handleSubmit,
        watch,
        isDirty,
        setValue,
        showPreview,
        setShowPreview,
        resetField
    } = useChatForm();

    const [showOptions, setShowOptions] = useState(false);
    const imageRef = useRef<HTMLInputElement>(null);
    const selectedField = watch("image");


    useEffect(() => {
        function hideOptions() {
            setShowOptions(false);
        }
        window.addEventListener("click", hideOptions);
        return () => window.removeEventListener("click", hideOptions);
    }, []);

    useEffect(() => {
        if (!showPreview) {
            resetField("image")
        }
    }, [showPreview]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setShowPreview(URL.createObjectURL(file));
            setValue("image", e.target.files, { shouldDirty: true });
        }
    }


    return(
        <form className="flex bg-gray-200 gap-4 py-2.5 px-4 h-full relative z-50 rounded-br-md" onSubmit={handleSubmit} >
            <button 
                type="button" 
                className="block" 
                onClick={(e)=>{
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                }} 
            >
                <AiOutlinePlus className="text-2xl"></AiOutlinePlus>
            </button>



            <input className="grow border-1 border-gray-200 shadow-2xs px-3 py-2 rounded-xl bg-white" 
                    placeholder="Enter Message"

                    {...register("message")}
                >
            
            </input>
            <input 
                type="file"
                className="w-0 h-0 opacity-0" 
                {...register("image")}
                onChange={handleImageChange}
                ref={imageRef}
            />

            <button className="px-3 py-1.5"  disabled={!isDirty}>
                {
                    (isDirty) ? (
                        <GiPaperPlane className="text-2xl" />
                    ): (
                        <HiMiniMicrophone className="text-2xl" />
                    )
                }
            </button>
            <AnimatePresence>
                {
                    showOptions && (
                        <motion.div className="absolute -left-8 -top-10"
                            initial={{
                                    y:50,
                                    scale:0.5,
                                    opacity:0
                                }}
                                animate={{
                                    y:0,
                                    scale:1,
                                    opacity:1
                                }}
                                exit={{
                                    y:25,
                                    scale:0.5,
                                    opacity:0
                                }}
                            >
                            <ExtraButtons 
                                onClick={()=>{    
                                    imageRef.current?.dispatchEvent(new MouseEvent("click"));
                                    setShowOptions(showOptions);
                                }}
                            />
                        </motion.div>
                    )
                }
            </AnimatePresence> 
        </form>
    )
}


