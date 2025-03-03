import {v2 as cloudinary, UploadApiResponse} from "cloudinary";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64String: string): Promise<string> {
  try {
      console.log("Cloudinary Credentials",process.env.CLOUDINARY_CLOUD_NAME)
      console.log("Cloudinary Credentials",process.env.CLOUDINARY_API_KEY)
      console.log("Cloudinary Credentials", process.env.CLOUDINARY_API_SECRET)
      console.log("Base64 Image",base64String);
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        base64String,
        { folder: "chat-app" }
      );
  
      return result.secure_url;
  } catch (error) {
      console.error("Error uploading image:", error);
      throw error; 
  }
}


export async function deleteImage({url}:{url:string}){
  try {
    const publicId = getPublicId(url);
    cloudinary.uploader.destroy(publicId,function(result){
      console.log(result);
    })
  } catch (error) {
    console.log("Error Occured While Deleting the Image",error);
  }
}

function getPublicId(url:string = ""):string{
  const arr = url.split("/");
  const redux = arr[arr.length - 1];
  const imageId = redux?.split(".")[0];
  const publicId = `chat-app/${imageId}`
  return publicId
}