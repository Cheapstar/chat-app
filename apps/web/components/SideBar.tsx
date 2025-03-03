"use client"

import { useRouter } from "next/navigation"
import { BsChatSquareTextFill } from "react-icons/bs";
import { RiUserCommunityLine } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { signOut } from "next-auth/react";



export function SideBar(){
    const router = useRouter();


    return (
        <div className="flex flex-col bg-gray-500 py-4 px-2 gap-4">
            <button onClick={()=>{
                router.push("/chat");
            }} className="px-2 py-2.5 font-medium rounded-full cursor-pointr 
                            hover:bg-gray-700  ">
                <BsChatSquareTextFill className=" text-3xl" />
            </button>
            <button onClick={()=>{
                router.push("/explore")
            }} className="px-2 py-2 font-medium rounded-full cursor-pointer
                           hover:bg-gray-700 ">
                <RiUserCommunityLine className=" text-3xl" />
            </button>
            <div className="grow flex flex-col justify-end gap-3">
                <button onClick={()=>{
                    router.push("/settings")
                }} className="px-2 py-2 font-medium rounded-full cursor-pointer
                            hover:bg-gray-700 ">
                    <IoSettingsSharp className=" text-3xl" />
                </button>
                <button onClick={async ()=>{
                    const data = await signOut({
                        redirect:false,
                        callbackUrl:"http://localhost:3000/signin"
                    });

                    router.push(data.url);

                }} className="px-2 py-2 font-medium rounded-full cursor-pointer
                            hover:bg-gray-700 ">
                    <LuLogOut className=" text-3xl" />
                </button>

            </div>
        </div>
    )
}