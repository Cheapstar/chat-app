"use client";

import { useForm } from "react-hook-form";
import { AiOutlinePlus } from "react-icons/ai";
import { HiMiniMicrophone } from "react-icons/hi2";
import { GiPaperPlane } from "react-icons/gi";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RxCross2 } from "react-icons/rx";
import { LiveAudioVisualizer } from "./LiveAudioVisualizer";
import { Preview } from "./Preview";
import { ExtraButtons } from "./ExtraButtons";
import { FileRegisterType, useChatForm } from "./hooks/useChatForm";
import { useSoundRecorder } from "./hooks/useSoundRecorder";

export function ChatInput() {
  const {
    register,
    handleSubmit,
    watch,
    isDirty,
    setValue,
    resetField,
    urls,
    setUrls,
  } = useChatForm();

  const [showOptions, setShowOptions] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);

  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Enhanced audio recording with timer
  const {
    isRecording,
    startRecording,
    stopRecording,
    mediaRecorder,
    audioUrl,
    deleteAudio,
    audioBlob,
  } = useSoundRecorder();
  const [recordingTime, setRecordingTime] = useState(0);

  function getFileType(
    mimeType: string
  ): "image" | "video" | "pdf" | "audio" | "unknown" {
    if (mimeType.startsWith("image")) return "image";
    if (mimeType.startsWith("video")) return "video";
    if (mimeType.startsWith("audio")) return "audio";
    if (mimeType === "application/pdf") return "pdf";
    return "unknown";
  }

  // Create file URLs for preview
  useEffect(() => {
    const files = watch("files");
    if (files && files.length > 0 && !audioUrl) {
      const urlRecords: { type: string; url: string }[] = [];
      Array.from(files).map((file) => {
        const url = URL.createObjectURL(file.file);
        urlRecords.push({ type: getFileType(file.file.type), url });
      });
      setUrls(urlRecords);

      if (!showPreview) {
        setShowPreview(true);
      }
    }
  }, [watch("files")]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url.url));
    };
  }, [urls]);

  useEffect(() => {
    function hideOptions(e: MouseEvent) {
      // Check if the click is outside the options menu
      const target = e.target as HTMLElement;
      if (
        !target.closest(".options-menu") &&
        !target.closest(".options-button")
      ) {
        setShowOptions(false);
      }
    }

    window.addEventListener("click", hideOptions);
    return () => window.removeEventListener("click", hideOptions);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Handle audio recording completion
  useEffect(() => {
    if (audioBlob && !isRecording) {
      // Add audio to form data when recording completes
      if (watch("files")) {
        console.log("Changing the files");
        setValue(
          "files",
          [
            {
              type: "audio",
              file: new File([audioBlob], "audio-recording.webm", {
                type: "audio/webm;codecs=opus",
              }),
            },
          ],
          { shouldDirty: true }
        );
      }
    }
  }, [audioBlob, isRecording, setValue, watch]);

  useEffect(() => {
    if (audioUrl) {
      setUrls([
        {
          type: "audio",
          url: audioUrl,
        },
      ]);
    }
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const filesArray = files.map((file) => {
        return {
          type: getFileType(file.type),
          file: file,
        };
      });

      if (
        watch("files") &&
        (watch("files") as FileRegisterType[]).length === 0
      ) {
        console.log("Submitting the file");
        setValue("files", filesArray, { shouldDirty: true });
      } else {
        const currentFiles = watch("files") as FileRegisterType[];
        setValue("files", [...currentFiles, ...filesArray], {
          shouldDirty: true,
        });
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    urls.forEach((url) => URL.revokeObjectURL(url.url));
    setUrls([]);
    setValue("files", [], { shouldDirty: true });
  };

  return (
    <form
      className="flex flex-col bg-gray-200 py-2.5 px-4 rounded-br-md z-50 "
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
        setShowPreview(false);

        deleteAudio();
      }}
    >
      {audioUrl && (
        <div className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-2 mb-2 shadow-sm">
          <audio
            src={audioUrl}
            controls
            className="w-full"
          />
          <button
            type="button"
            className="ml-3 p-1 rounded-full hover:bg-gray-200 transition"
            onClick={() => {
              deleteAudio();
              setValue("files", [], { shouldDirty: true });
            }}
          >
            <RxCross2 className="text-xl text-gray-600" />
          </button>
        </div>
      )}

      <section className="flex gap-4 relative">
        {isRecording ? (
          <div className="flex grow items-center gap-3 justify-end">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-600">
                {formatTime(recordingTime)}
              </div>

              {/* Audio Visualizer */}
              <div className="flex items-end gap-0.5 h-8 grow">
                <LiveAudioVisualizer
                  mediaRecorder={mediaRecorder as MediaRecorder}
                />
              </div>
            </div>

            <button
              type="button"
              className="ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
              onClick={stopRecording}
            >
              <RxCross2 className="text-lg text-red-600" />
            </button>
          </div>
        ) : (
          <>
            {!audioUrl && (
              <button
                type="button"
                className="block options-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
              >
                <AiOutlinePlus className="text-2xl" />
              </button>
            )}
            <input
              className="grow border-1 border-gray-200 shadow-2xs px-3 py-2 rounded-xl bg-white outline-none"
              placeholder="Enter Message"
              {...register("message")}
            />
          </>
        )}

        <input
          type="file"
          accept="image/*"
          className="w-0 h-0 opacity-0"
          multiple
          onChange={handleFileChange}
          ref={imageRef}
        />
        <input
          type="file"
          className="w-0 h-0 opacity-0"
          multiple
          onChange={handleFileChange}
          ref={documentRef}
        />

        {isDirty ? (
          <button
            className="px-3 py-1.5 self-end"
            disabled={!isDirty}
          >
            <GiPaperPlane className="text-2xl" />
          </button>
        ) : (
          <button
            type="button"
            className={`px-3 py-1.5 relative transition-all self-end ${isRecording ? "scale-150" : ""}`}
            onClick={startRecording}
          >
            <HiMiniMicrophone className="text-2xl" />
            <span
              className={`top-0 left-0 absolute h-full w-full z-0 pointer-events-none
               ${isRecording ? "animate-ping bg-sky-400 opacity-75" : "bg-transparent"} rounded-full`}
            />
          </button>
        )}

        <AnimatePresence>
          {showOptions && (
            <motion.div
              className="absolute -left-16 bottom-10 options-menu"
              initial={{
                y: 50,
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                y: 0,
                scale: 1,
                opacity: 1,
              }}
              exit={{
                y: 25,
                scale: 0.5,
                opacity: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExtraButtons
                onImageClick={() => {
                  if (imageRef.current) {
                    imageRef.current.click();
                  }
                  setShowOptions(false);
                }}
                onDocumentClick={() => {
                  if (documentRef.current) {
                    documentRef.current.click();
                  }
                  setShowOptions(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {showPreview && (
        <div className="absolute top-0 right-0 w-full h-full bg-black/30 flex items-center justify-center z-50">
          <Preview
            src={urls}
            setValue={setValue}
            watch={watch}
            onClose={closePreview}
          />
        </div>
      )}
    </form>
  );
}
