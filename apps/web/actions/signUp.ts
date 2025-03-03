"use server";

import { z } from "zod";
import { prisma } from "@repo/database"; // Ensure you have a Prisma instance
import bcrypt from "bcrypt";

const signUpFormSchema = z.object({
  email: z.string().email(),
  username: z.string().min(5),
  password: z.string().min(8),
});

type FormFields = z.infer<typeof signUpFormSchema>

export async function signUp(formData: FormFields) {

   try {
       // Parse and validate input
       const parsedData = signUpFormSchema.safeParse({
         email: formData.email,
         username: formData.username,
         password: formData.password,
       });
     
       if (!parsedData.success) {
         return { success: false, errors: parsedData.error.format() };
       }
     
       const { email, username, password } = parsedData.data;
     
       // Check if user already exists
       const existingUser = await prisma.user.findUnique({
         where: { email },
       });
     
       if (existingUser) {
         return { success: false, message: "Email already in use." };
       }
     
       // Hash password
       const hashedPassword = await bcrypt.hash(password, 10);
     
       // Create new user
       await prisma.user.create({
         data: {
           email,
           username,
           password: hashedPassword,
         },
       });
     
       return { success: true, message: "User created successfully!" };

   } 
   catch (error) {
        console.error("Signup error:", error);
        return { success: false, message: "Something went wrong. Please try again later." };
   } 
}
