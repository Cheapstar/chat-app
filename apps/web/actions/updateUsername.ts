"use server"

import { prisma } from "@repo/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";


export async function updateUsername(username:string){
    const session = await getServerSession(authOptions);


    try{
        const user = await prisma.user.update({
            where:{
                id:session?.user.userId
            },
            data:{
                username:username
            }
        });

        console.log("Username Successfully Updated");
    }
    catch(err){
        console.log("Error Occured While Updating the Username",err);
    }
}


