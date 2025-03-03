"use client"
import { RefObject, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { BsFillPencilFill } from "react-icons/bs";
import { UpdateProfilePicture } from "../actions/updateProfilePicture";
import { updateUsername } from "../actions/updateUsername";
import { useAtom } from "jotai";
import { userAtom } from "../store/store";
import { getSession, signIn, useSession } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";
import { getUserDetails,UserDetailsType } from "../actions/getUserDetails";


export function Settings(){
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState:{isDirty,isSubmitting,dirtyFields}
    } = useForm<{
        username:string,
        profilePicture:FileList | null
    }>({
        defaultValues:{
            username:"",
            profilePicture:null
        }
    });

    const profileRef = useRef<HTMLInputElement>(null);
    const [profilePicture,setProfilePicture] = useState<string>("");

    function handleProfileChange(e:React.ChangeEvent<HTMLInputElement>){
        try {
            const file = e.target?.files?.[0] as File
            const imageUrl = URL.createObjectURL(file);
            setProfilePicture(imageUrl);

            setValue("profilePicture",e.target.files,{shouldDirty:true});
        } catch (error) {
            console.log("Error Occured while changing the profile Picture",error);
        }
    }

    async function updateChanges(data: { username: string; profilePicture: FileList }) {
    
        if (dirtyFields.profilePicture) {
            // Update Profile Picture
            console.log(data);
            const file = data.profilePicture[0] as File;
            const reader = new FileReader();
    
            reader.readAsDataURL(file);
    
            const profilePicturePromise = new Promise(async (resolve, reject) => {
                reader.onload = async () => {
                    try {
                        console.log("Base64 Image:", reader.result as string);
                        const result = await UpdateProfilePicture({ profilePicture: reader.result as string });
                        console.log(result);
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                };
            });
    
            await profilePicturePromise; // Wait for profile picture update
        }
    
        if (dirtyFields.username) {
            // Update Username
            try {
                await updateUsername(data.username);
                console.log("Username is successfully updated");
            } catch (err) {
                console.log("Error Occurred While Updating the username", err);
            }
        }
    
        window.location.reload();
    }

    function handleCancel(){
        setProfilePicture("");
        setValue("profilePicture",null)
        reset();
    }

    useEffect(()=>{
        async function fetchUserDetails(){
            try {
                const userDetails:UserDetailsType = await getUserDetails() as UserDetailsType;
                setProfilePicture(userDetails.profilePicture);
                console.log("User Details",userDetails)
                reset({username:userDetails.username})
            } catch (error) {
                console.log("Some Error Occured While fetching the User Details in the Settings");
            }
        }

        fetchUserDetails();
    },[]);


    return(
        <div className="flex flex-col gap-4 pt-10">
            <div className="flex flex-col">
                <div className=" flex justify-center">
                    <div className="w-32 h-32 border-1 rounded-full overflow-hidden relative ">
                        <img 
                            src={`${profilePicture ? profilePicture :"./default_Profile.png"}`} 
                            alt="user-profile-picture"
                            className="object-cover w-32 h-32 border-1 rounded-full"
                            />
                        <div className="absolute w-32 h-32 rounded-full overflow-hidden top-[75%]">
                            <button 
                                onClick={()=>{
                                    console.log("Click click")
                                    profileRef.current?.dispatchEvent(new MouseEvent("click"));
                                }}
                                className="bg-black opacity-[0.75] w-full h-full 
                                            relative group hover:bg-white transition-all"
                            >
                                <BsFillPencilFill 
                                    className="text-white group-hover:text-black transition-all 
                                            absolute top-2 left-14"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <form className="flex flex-col items-center gap-4" onSubmit={
                            handleSubmit(updateChanges as SubmitHandler<{ username: string; profilePicture: FileList | null; }>)}>
                <input 
                    type="file"  
                    className="opacity-0 w-0 h-0"  
                    {...register("profilePicture")}
                    ref={profileRef} 
                    onChange={handleProfileChange}
                />
                <input 
                    type="text" 
                    className="border-b-2 outline-none text-md px-4 py-2"
                    placeholder="Username"
                    {...register("username")}
                 />
                 {
                    isDirty && (
                        <div className="self-stretch flex justify-end px-10 gap-2">
                            <button 
                                disabled={!isDirty}
                                className={`bg-sky-300 text-white border-white border-1 shadow-2xl px-5
                                                py-2.5 font-semibold rounded-md text-md  
                                                hover:bg-sky-500 transition-all
                                                disabled:hover:bg-sky-300
                                                `}>
                                Save
                            </button>
                            <button 
                                onClick={handleCancel}
                                type="button"
                                    className="bg-gray-300 text-white border-white border-1 shadow-2xl px-5
                                                py-2.5 font-semibold rounded-md text-md 
                                                hover:bg-gray-500 transition-all">
                                Cancel
                            </button>
                        </div>
                    )
                 }
            </form>
        </div>
    )
}