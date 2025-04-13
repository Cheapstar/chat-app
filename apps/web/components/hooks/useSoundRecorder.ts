"use client";
import { useEffect, useRef, useState } from "react";

export function useSoundRecorder() {
  const [audioUrl, setAudioUrl] = useState<string>();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob>();

  const audioContextRef = useRef<AudioContext | null>(null);

  const [hasRecorded, setHasRecorded] = useState<boolean>();

  async function startRecording() {
    try {
      const isAllowed = await navigator.permissions.query({
        name: "microphone",
      });

      console.log("Permission", isAllowed);
      if (isAllowed.state === "denied" || isAllowed.state === "prompt") {
        alert("Please Allow the microphone settings in your system");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        console.log("URL is", url);
        setAudioUrl(url);
      };

      recorder.start();

      setAudioUrl("");
      setMediaRecorder(recorder);
      setIsRecording(true);
      setHasRecorded(true);
    } catch (error) {
      alert(error);
      console.log("Error", error);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }

  function deleteAudio() {
    setAudioUrl(undefined);
    setMediaRecorder(null);
    setIsRecording(false);
    setHasRecorded(false);
  }

  return {
    audioUrl,
    setAudioUrl,
    isRecording,
    startRecording,
    stopRecording,
    deleteAudio,
    mediaRecorder,
    audioBlob,
    setAudioBlob,
    hasRecorded,
    setHasRecorded,
  };
}
