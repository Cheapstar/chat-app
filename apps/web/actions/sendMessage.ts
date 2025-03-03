"use server"

import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export type Message = {
    content:string,
    conversationId:string,
    recepientId:string,
}

export async function sendMessage({content,conversationId,recepientId}:Message){
    const session = await getServerSession(authOptions);
    console.log("RecipientId",recepientId);

    try {
        if(conversationId){
            const message = await prisma.message.create({
                data: {
                  content,
                  senderId:session?.user.userId || "",
                  conversationId: conversationId,
                  statusUpdates: {
                    create: {
                      userId: recepientId, // Recipient should get unread status
                      status: "UNREAD",
                    },
                  },
                },
              }); 
              
        }
        else{
            const conversation = await prisma.conversation.create({
                data: {
                  participants: {
                    create: [
                      { user: { connect: { id: session?.user.userId } } },
                      { user: { connect: { id: recepientId } } },
                    ],
                  },
                },
              });

            const message = await prisma.message.create({
                data: {
                  content,
                  senderId:session?.user.userId || "",
                  conversationId: conversation.id,
                  statusUpdates: {
                    create: {
                      userId: recepientId, // Recipient should get unread status
                      status: "UNREAD",
                    },
                  },
                },
              }); 

              
        }

        return {
            success:true,
            message:"Message is successfully send"
          }

    } catch (error) {
        console.log("Error while Submitting the Message from database",error);
        return {
            success:false,
            message:"Unsuccessful attempt of sending message"
          }
    }
}