"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import {SubmitHandler, useForm} from "react-hook-form"
import {z} from "zod"
import { signUp } from "../actions/signUp"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

const signUpFormSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

type FormFields = z.infer<typeof signUpFormSchema>


export function SignIn(){
    const {register,
        handleSubmit,
        setError,
        formState : {errors,isSubmitting},
        reset

    } = useForm<FormFields>({
        resolver:zodResolver(signUpFormSchema)
    });

    const router = useRouter()


    const onSubmit : SubmitHandler<FormFields> = async (data)=>{
        try {
            const result = await signIn("credentials",{
                ...data,
                redirect:false
            });

            if(!result?.ok){
                throw new Error(result?.error || "");
            }


            router.push("/chat")
        } catch (err:any) {
            setError("root",{
                message:err.message});
        }
    }

    return (
        <form className="flex flex-col gap-3 bg-white px-6 py-4 rounded-md lg:w-[25%]" onSubmit={handleSubmit(onSubmit)}>
            <p className="text-4xl text-center mb-4">Sign In</p>

            {
                errors.root && (
                    <p className="text-red-500">*{errors.root.message}</p>
                )
            }

            <div className="flex flex-col gap-2">
                <label htmlFor="email">Email</label>
                {
                    errors.email && (
                        <p className="text-red-500">*{errors.email.message}</p>
                    )
                }
                <input 
                    {...register("email")}
                    type="email" 
                    name="email" placeholder="Email"  
                    className="border-1 outline-none border-gray-200 inset-shadow-2xs rounded-md px-3 py-1.5"
                />
            </div>
           
            <div className="flex flex-col gap-2">
                <label htmlFor="password">Password</label>
                {
                    errors.password && (
                        <p className="text-red-500">*{errors.password.message}</p>
                    )
                }
                <input 
                    {...register("password")}
                    type="password" 
                    name="password" placeholder="Password"
                    className="border-1 outline-none border-gray-200 inset-shadow-2xs rounded-md px-3 py-1.5"    
                />
            </div>
            <div className="flex flex-col gap-2 items-stretch">
                <button disabled={isSubmitting} 
                    className="bg-sky-600 hover:bg-sky-800 transition-all duration-200 text-white py-2 rounded-md">
                    {   
                        isSubmitting ? "Loading..." : 
                                        "Create Account"
                    }
                </button>
            </div>
        </form>
    )
}