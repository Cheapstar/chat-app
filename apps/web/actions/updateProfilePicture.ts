"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { uploadImage, deleteImage } from "@repo/cloudinary";
import { prisma } from "@repo/database";

export async function updateProfilePicture(publicId: string) {
  const session = await getServerSession(authOptions);

  try {
    console.log("Deleting Thy Image");
    if (session?.user.image) {
      const result = await deleteImage({ url: session?.user.image });
    }

    console.log("Uploading thy image");
    console.log("ImageUrl is :");

    const updateDb = await prisma.user.update({
      where: {
        id: session?.user.userId,
      },
      data: {
        profilePicture: publicId,
      },
    });
  } catch (error) {
    console.log("Some Error Occured While uploading thy Image");
  }
}
