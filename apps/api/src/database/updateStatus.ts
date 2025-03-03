
import {prisma} from "@repo/database"

export async function updateStatus(
    {
        conversationId,
        senderId
    }:{
        conversationId:string,
        senderId:string
    }
){
    try {
        const messagesStatus = await prisma.messageStatus.updateMany({
            where:{
                message:{
                    conversationId:conversationId,
                    senderId:{not:senderId}
                },
                
            },
            data:{
                status:"READ"
            }
        });


        return true;

    } catch (error) {
        console.log("Some Error Occured while updating the Status");
        return false;
    }
}