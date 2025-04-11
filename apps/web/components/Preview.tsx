"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { GiPaperPlane } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import { FileRegisterType } from "./hooks/useChatForm";
import { MdAudiotrack } from "react-icons/md";
import { FaFile, FaRegFilePdf } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";

export function Preview({
  src,
  setValue,
  watch,
  onClose,
}: {
  src: { type: string; url: string }[];
  setValue: UseFormSetValue<{
    message: string;
    files: FileRegisterType[] | null;
  }>;
  watch: UseFormWatch<{
    message: string;
    files: FileRegisterType[] | null;
  }>;
  onClose: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<{
    type: string;
    url: string;
  }>();
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Set the first file as selected when the component mounts or src changes
  useEffect(() => {
    if (src.length > 0) {
      setSelectedFile(src[0]);
    }
  }, [src]);

  function getFileType(
    url: string
  ): "image" | "video" | "pdf" | "audio" | "unknown" {
    const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase();
    if (!ext) return "unknown";

    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["pdf"].includes(ext)) return "pdf";
    if (["mp3", "wav", "oga", "webm"].includes(ext)) return "audio";
    return "unknown";
  }

  const removeFile = (indexToRemove: number) => {
    const files = watch("files") as FileRegisterType[];
    if (!files) return;

    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setValue("files", newFiles.length > 0 ? newFiles : [], {
      shouldDirty: true,
    });

    // If we removed the selected file, select another one
    if (selectedFile === src[indexToRemove]) {
      if (newFiles.length > 0) {
        const newIndex = indexToRemove > 0 ? indexToRemove - 1 : 0;
        if (src[newIndex]) {
          setSelectedFile(src[newIndex]);
        }
      } else {
        onClose();
      }
    }
  };

  if (src.length === 0) {
    return null;
  }

  return (
    <div className="bg-white h-full rounded-lg shadow-xl  w-full overflow-auto flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium">File Preview</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <RxCross1 size={20} />
        </button>
      </div>

      <main className="flex-1 overflow-auto p-4 flex flex-col">
        {/* Preview Section */}
        <section className="flex-1 flex justify-center items-center overflow-hidden object-cover">
          {selectedFile ? (
            (() => {
              const type = selectedFile.type as string;
              // console.log("SElected File", selectedFile, type);

              if (type === "image") {
                return (
                  <div className="relative h-full flex items-center justify-center">
                    <img
                      src={selectedFile.url}
                      alt="preview"
                      className={`max-h-[60vh] object-contain transition-transform duration-200 ${isZoomed ? "scale-150" : ""}`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                    {isZoomed && (
                      <button
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                        onClick={() => setIsZoomed(false)}
                      >
                        <RxCross1 size={18} />
                      </button>
                    )}
                  </div>
                );
              }

              if (type === "video") {
                return (
                  <video
                    src={selectedFile.url}
                    controls
                    className="max-h-[60vh] max-w-full"
                  />
                );
              }

              if (type === "audio") {
                return (
                  <audio
                    src={selectedFile.url}
                    controls
                    className="w-full"
                  />
                );
              }

              if (type === "pdf") {
                return (
                  <object
                    data={selectedFile.url}
                    type="application/pdf"
                    width="100%"
                    height="500px"
                    className="border"
                  >
                    <p>
                      Cannot display PDF.{" "}
                      <a
                        href={selectedFile.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </p>
                  </object>
                );
              }

              return (
                <div className="flex flex-col justify-center items-center gap-3">
                  <FaFile className="text-9xl"></FaFile>
                  <p className="text-gray-500">Unsupported file type</p>
                </div>
              );
            })()
          ) : (
            <p className="text-gray-500">No file selected</p>
          )}
        </section>

        {/* Thumbnails Section */}
        {src.length > 0 && (
          <section className="flex gap-3 mt-4 overflow-auto py-2 border-t flex-wrap">
            {src.map((file, idx) => {
              const type = file.type;
              // console.log("Type of the file is", type);

              return (
                <div
                  key={idx}
                  className="relative group"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={`relative border-0 ${selectedFile === file ? "ring-2 ring-blue-500 rounded-md" : ""}`}
                  >
                    {type === "image" && (
                      <img
                        src={file.url}
                        alt={`thumbnail ${idx}`}
                        className="w-20 h-20 object-cover rounded-md "
                      />
                    )}
                    {type === "video" && (
                      <div className="w-20 h-20 bg-gray-100 flex justify-center items-center rounded-md ">
                        <span className=" text-gray-700">
                          <FaPlay className="text-3xl"></FaPlay>
                        </span>
                      </div>
                    )}
                    {type === "audio" && (
                      <div className="w-20 h-20 bg-gray-100 flex justify-center items-center rounded-md ">
                        <span className="text-gray-700">
                          <MdAudiotrack className="text-3xl"></MdAudiotrack>
                        </span>
                      </div>
                    )}
                    {type === "pdf" && (
                      <div className="w-20 h-20 bg-gray-100 flex justify-center items-center rounded-md ">
                        <span className=" text-gray-700">
                          <FaRegFilePdf className="text-3xl"></FaRegFilePdf>
                        </span>
                      </div>
                    )}
                    {type === "unknown" && (
                      <div className="w-20 h-20 bg-gray-100 flex justify-center items-center rounded-md ">
                        <span className=" text-gray-700">
                          <FaFile className="text-3xl"></FaFile>
                        </span>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RxCross1 size={14} />
                  </button>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={watch("message")}
          onChange={(e) => {
            setValue("message", e.target.value, { shouldDirty: true });
          }}
          className="grow border-1 border-gray-300 shadow-2xs px-3 py-2 rounded-xl bg-white outline-none"
          placeholder="Enter Message"
        />

        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          <GiPaperPlane className="text-2xl" />
        </button>
        <button className="send-message-button"></button>
      </div>
    </div>
  );
}
