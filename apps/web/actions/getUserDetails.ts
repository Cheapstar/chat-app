"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma, User } from "@repo/database";

export type UserDetailsType = {
    username:string,
    profilePicture:string
}

export async function getUserDetails():Promise<UserDetailsType | null>{
    const session = await getServerSession(authOptions);

    try {
        const userDetails = await prisma.user.findFirst({
            where:{
                id:session?.user.userId
            },
            select:{
                username:true,
                profilePicture:true
            }
        });


        console.log("Successfuly retreived the user details");
        return userDetails as UserDetailsType;
    } catch (error) {
        console.log("An Error Occured While fetching the user details");
        return null;
    }
}