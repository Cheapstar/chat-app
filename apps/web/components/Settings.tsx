"use client";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { BsFillPencilFill } from "react-icons/bs";
import { updateProfilePicture } from "../actions/updateProfilePicture";
import { updateUsername } from "../actions/updateUsername";
import { getUserDetails, UserDetailsType } from "../actions/getUserDetails";
import axios from "axios";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon

export function Settings() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isSubmitting, dirtyFields },
  } = useForm<{
    username: string;
    profilePicture: FileList | null;
  }>({
    defaultValues: {
      username: "",
      profilePicture: null,
    },
  });

  const profileRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [updatedProfilePicture, setUpdatedProfilePicture] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateError, setUpdateError] = useState<string | null>(null);

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target?.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setUpdatedProfilePicture(imageUrl);
        setValue("profilePicture", e.target.files, { shouldDirty: true });
      }
    } catch (error) {
      console.error("Error occurred while changing the profile picture", error);
      setUpdateError("Failed to preview image. Please try again.");
    }
  }

  async function updateChanges(data: {
    username: string;
    profilePicture: FileList | null;
  }) {
    setIsLoading(true);
    setUpdateError(null);

    try {
      // Update profile picture if changed
      if (
        dirtyFields.profilePicture &&
        data.profilePicture &&
        data.profilePicture.length > 0
      ) {
        const file = data.profilePicture[0] as File;
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          "http://localhost:3000/api/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const public_Id = response.data.public_Id;
        await updateProfilePicture(public_Id);
      }

      // Update username if changed
      if (dirtyFields.username) {
        await updateUsername(data.username);
      }

      // Success - reload page to show changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("Failed to update profile. Please try again.");
      setIsLoading(false);
    }
  }

  function handleCancel() {
    setUpdatedProfilePicture("");
    setValue("profilePicture", null);
    reset();
    setUpdateError(null);
  }

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (updatedProfilePicture && updatedProfilePicture.startsWith("blob:")) {
        URL.revokeObjectURL(updatedProfilePicture);
      }
    };
  }, [updatedProfilePicture]);

  // Fetch user details on component mount
  useEffect(() => {
    async function fetchUserDetails() {
      setIsLoading(true);
      try {
        const userDetails = (await getUserDetails()) as UserDetailsType;
        setProfilePicture(userDetails.profilePicture);
        reset({ username: userDetails.username });
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUpdateError("Failed to load user details. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserDetails();
  }, [reset]);

  // Handle profile picture display
  const profilePictureUrl =
    updatedProfilePicture ||
    (profilePicture
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${profilePicture}`
      : "/default_Profile.png");

  return (
    <div className="flex flex-col gap-4 pt-10">
      {/* Profile Picture Section */}
      <div className="flex flex-col">
        <div className="flex justify-center">
          <div className="w-32 h-32 border-1 rounded-full overflow-hidden relative">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <FaSpinner className="animate-spin text-2xl text-sky-500" />
              </div>
            ) : (
              <>
                <img
                  src={profilePictureUrl}
                  alt="user-profile-picture"
                  className="object-cover w-32 h-32 border-1 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "/default_Profile.png";
                    setIsLoading(false);
                  }}
                  onLoad={() => setIsLoading(false)}
                  style={{ opacity: !isLoading ? 1 : 0 }}
                />
                <div className="absolute w-32 h-32 rounded-full overflow-hidden top-[75%]">
                  <button
                    type="button"
                    onClick={() => profileRef.current?.click()}
                    className="bg-black opacity-[0.75] w-full h-full 
                              relative group hover:bg-white transition-all"
                    disabled={isLoading}
                  >
                    <BsFillPencilFill
                      className="text-white group-hover:text-black transition-all 
                                absolute top-2 left-14"
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {updateError && (
        <div className="text-red-500 text-sm text-center">{updateError}</div>
      )}

      {/* Settings Form */}
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={handleSubmit(
          updateChanges as SubmitHandler<{
            username: string;
            profilePicture: FileList | null;
          }>
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="opacity-0 w-0 h-0"
          {...register("profilePicture")}
          ref={profileRef}
          onChange={handleProfileChange}
          disabled={isLoading}
        />
        <input
          type="text"
          className="border-b-2 outline-none text-md px-4 py-2"
          placeholder="Username"
          {...register("username")}
          disabled={isLoading}
        />

        {/* Action Buttons */}
        {(isDirty || isLoading) && (
          <div className="self-stretch flex justify-end px-10 gap-2">
            <button
              disabled={!isDirty || isLoading}
              className={`bg-sky-300 text-white border-white border-1 shadow-2xl px-5
                        py-2.5 font-semibold rounded-md text-md  
                        hover:bg-sky-500 transition-all
                        disabled:hover:bg-sky-300 disabled:opacity-50
                        flex items-center justify-center min-w-[80px]`}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : "Save"}
            </button>
            <button
              onClick={handleCancel}
              type="button"
              disabled={isLoading}
              className="bg-gray-300 text-white border-white border-1 shadow-2xl px-5
                        py-2.5 font-semibold rounded-md text-md 
                        hover:bg-gray-500 transition-all
                        disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
