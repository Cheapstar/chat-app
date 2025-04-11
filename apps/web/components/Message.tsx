/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { MessageType } from "../types/types";
import moment from "moment";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { RxCross1 } from "react-icons/rx";
import { PiClockLight } from "react-icons/pi";

// messageType  ---   cloudinary Type

type KnownMessageType = "audio" | "pdf" | "video" | "image" | "compose";

const TYPE = {
  audio: "video",
  pdf: "raw",
  video: "video",
  image: "image",
  compose: "image",
};

export function Message({
  message,
  isGroup,
}: {
  message: MessageType;
  isGroup: boolean;
}) {
  const [expandImage, setExpandImage] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const fromServer = message.attachmentUrl?.includes("chat-app");
  let attachmentUrl = "";
  if (fromServer && TYPE[message.messageType as KnownMessageType]) {
    attachmentUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${TYPE[message.messageType as KnownMessageType]}/upload/${message.attachmentUrl}`;
  } else {
    attachmentUrl = message.attachmentUrl as string;
  }

  let status = "read";
  for (let i = 0; i < message.statusUpdates.length; i++) {
    if (message.statusUpdates[i]?.status !== "read") {
      status = message.statusUpdates[i]?.status as string;
      break;
    }
  }

  const shouldShowAvatar = isGroup && !message.isSender;
  const shouldShowUsername =
    isGroup && !message.isSender && message.sender.username;

  return (
    <>
      <div
        className={`flex ${message.isSender ? "justify-end" : "justify-start"} px-2 py-1`}
      >
        {/* Only show avatar in group chats for others' messages */}
        {shouldShowAvatar && (
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender.username}`}
            alt="avatar"
            className="w-8 h-8 rounded-full mr-2 self-start mt-1"
          />
        )}

        <div
          className={`relative rounded-md overflow-hidden flex flex-col px-2 py-2 max-w-[75%]
          ${message.isSender ? "bg-gray-700 text-white" : "bg-white text-black"}`}
        >
          {/* Group sender label - "You" for own messages or username for others */}
          {isGroup && (
            <span
              className={`text-xs font-semibold text-sky-600 pl-1 pb-1 pr-2 ${message.isSender ? "self-end" : ""}`}
            >
              {message.isSender ? "You" : message.sender.username}
            </span>
          )}

          {/* Attachment */}
          {/* Media Handling */}
          {message.attachmentUrl && (
            <div className="max-w-[600px] max-h-[400px]">
              {(message.messageType === "image" ||
                message.messageType === "compose") && (
                <img
                  src={attachmentUrl}
                  alt="Image"
                  className="object-contain bg-white cursor-pointer rounded"
                  onClick={() => setExpandImage(true)}
                />
              )}

              {message.messageType === "video" && (
                <div className="w-full min-w-[200px] max-w-[600px]">
                  <video
                    src={attachmentUrl}
                    controls
                    className="w-full max-h-[300px] rounded bg-black"
                  />
                </div>
              )}

              {message.messageType === "audio" && (
                <div className="w-full min-w-[200px] max-w-[600px]">
                  <audio
                    src={attachmentUrl}
                    controls
                    className="w-full outline-none"
                  />
                </div>
              )}

              {message.messageType === "pdf" && (
                <div className="flex flex-col gap-2 border rounded p-2 ">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <p className="font-medium break-words">
                      {attachmentUrl.split("/").pop()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 underline text-sm"
                    >
                      View PDF
                    </a>
                    <a
                      href={attachmentUrl}
                      download
                      className="text-gray-300 underline text-sm"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              {message.messageType === "unknown" && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 underline"
                >
                  <span className="text-xl">📎</span>
                  <span className="break-words">
                    {attachmentUrl.split("/").pop()}
                  </span>
                </a>
              )}
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <p className="pl-1 py-1 pr-16 text-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Timestamp + status */}
          <div className=" flex gap-2 justify-end">
            <p className="text-[10px] text-gray-300 flex items-end ">
              {moment(message.createdAt).format("HH:mm")}
            </p>
            {message.isSender && (
              <p className="flex items-end ">
                {status === "sent" ? (
                  <PiClockLight className="text-lg" />
                ) : (
                  <LiaCheckDoubleSolid
                    className={`text-lg transition-all ${
                      status === "read" ? "text-green-400" : "text-gray-200"
                    }`}
                  />
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {expandImage && (
        <div
          className="fixed h-[100vh] w-[100vw] inset-0 bg-gray-400/30 z-[10000] 
          backdrop-blur-3xl flex justify-center items-center overflow-auto"
          onClick={() => setExpandImage(false)}
        >
          <button
            className="absolute cursor-pointer right-6 top-4"
            onClick={() => setExpandImage(false)}
          >
            <RxCross1 className="text-5xl text-white" />
          </button>

          <div
            className="h-[80vh] max-w-[80vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={attachmentUrl}
              className={`object-contain w-full h-full ${
                isZoomed
                  ? "scale-200 cursor-zoom-out"
                  : "scale-100 cursor-zoom-in"
              }`}
              alt="Expanded"
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>
        </div>
      )}
    </>
  );
}
