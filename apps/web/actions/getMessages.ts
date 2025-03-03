"use server"
import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";



export async function getMessages({conversationId}:{conversationId:string}){
    const session = await getServerSession(authOptions);

    try{
        const result = await prisma.conversation.findFirst({
            where:{
                id:conversationId
            },
            select:{
                messages:{
                    orderBy:{
                        createdAt:"asc"
                    },
                    select:{
                        id:true,
                        senderId:true,
                        content:true,
                        createdAt:true,
                        messageType:true,
                        attachmentUrl:true,
                        statusUpdates:{
                            select:{
                                status:true
                            }
                        }
                    }
                }
            }
        });


        const messages = result?.messages?.map(({id,createdAt,senderId,content,
            statusUpdates,messageType,
            attachmentUrl
        })=>{
            return {
                id,
                createdAt,
                sender:(senderId === session?.user.userId),
                content,
                status:statusUpdates[0]?.status,
                messageType,
                attachmentUrl
            }
        })


        return messages
    }
    catch(err){
        console.log("Error While fetching the Messages");
    }
}