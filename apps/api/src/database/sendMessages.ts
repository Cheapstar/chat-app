
import { prisma } from "@repo/database";
import {uploadImage} from "@repo/cloudinary"

export type Message = {
    userId:string,
    content:string,
    conversationId:string,
    recepientId:string,
    messageType:string,
    attachmentUrl?:string,
    imageString?:string
  }

export async function sendMessage({userId,content,conversationId,recepientId,messageType,attachmentUrl,imageString}:Message){
    try {
      
        if(messageType === "image"){ 
          try {
            console.log("Uploading thy image")
            const imageUrl = await uploadImage(imageString as string);
            console.log("ImageUrl is :",imageUrl)
            attachmentUrl = imageUrl;
          } catch (error) {
            console.log("Some Error Occured While uploading thy Image");
          }
        }

        if(conversationId){
            const message = await prisma.message.create({
                data: {
                  content,
                  senderId:userId || "",
                  conversationId: conversationId,
                  messageType,
                  attachmentUrl,
                  statusUpdates: {
                    create: {
                      userId: recepientId, // Recipient should get unread status
                      status: "UNREAD",
                    },
                  },
                },
              }); 
              
              return message
        }
        else{
            const conversation = await prisma.conversation.create({
                data: {
                  participants: {
                    create: [
                      { user: { connect: { id: userId } } },
                      { user: { connect: { id: recepientId } } },
                    ],
                  },
                },
              });

            const message = await prisma.message.create({
                data: {
                  content,
                  senderId:userId || "",
                  conversationId: conversation.id,
                  messageType,
                  attachmentUrl,
                  statusUpdates: {
                    create: {
                      userId: recepientId, // Recipient should get unread status
                      status: "UNREAD",
                    },
                  },
                },
              }); 

              
              return message
        }


    } catch (error) {
        console.log("Error while Submitting the Message from database",error);
        return {
            id: null,
            createdAt: null,
            conversationId: null,
            senderId: null,
            content: null,
            messageType: null,
            attachmentUrl: null 
        }
    }
}