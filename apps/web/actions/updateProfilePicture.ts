"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import {uploadImage, deleteImage} from "@repo/cloudinary";
import { prisma } from "@repo/database";

type UserData = {
    profilePicture:string
}


export async function UpdateProfilePicture(userData:UserData){
    const session = await getServerSession(authOptions);

    try {
        console.log("Deleting Thy Image")
        if(session?.user.image){
            const result = await deleteImage({url:session?.user.image})
        }

        console.log("Uploading thy image")
        const imageUrl = await uploadImage(userData.profilePicture as string);
        console.log("ImageUrl is :",imageUrl)

        const updateDb = await prisma.user.update({
            where:{
                id:session?.user.userId
            },
            data:{
                profilePicture:imageUrl
            }
        })

      } 
      catch (error) {
        console.log("Some Error Occured While uploading thy Image");
      }

}