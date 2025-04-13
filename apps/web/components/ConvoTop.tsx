"use client";

export function ConvoTop({
  convoName,
  convoProfile = "/default_Profile.png",
  onClick,
}: {
  convoName: string;
  convoProfile: string;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center
                          gap-6 group bg-white rounded-tr-md  px-4 py-2  shadow-2xl border-1 border-gray-200"
    >
      <div className="rounded-full flex items-center border-white border-1 shadow-2xl">
        <img
          className="rounded-full w-12 h-12 object-cover"
          src={convoProfile}
          alt="Profile-Picture"
        ></img>
      </div>
      <div
        className="grow text-lg"
        onClick={(e) => onClick()}
      >
        <p className="group-hover:underline underline-offset-8 cursor-default">
          {convoName}
        </p>
      </div>
    </div>
  );
}

// ${
//     selectedConversation?.isGroup
//       ? "/default_Profile.png"
//       : selectedConversation?.participants[0]?.user.profilePicture
//         ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${selectedConversation?.participants[0]?.user.profilePicture}`
//         : "/default_Profile.png"
//   }
