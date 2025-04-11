"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function LiveAudioVisualizer({
  mediaRecorder,
}: {
  mediaRecorder: MediaRecorder;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [context, setContext] = useState<AudioContext | null>(null);
  const animationRef = useRef<number>(null);
  const barHistoryRef = useRef<number[]>([]);

  const BAR_WIDTH = 2;
  const GAP = 2;
  const CANVAS_WIDTH = 100;
  const CANVAS_HEIGHT = 100;
  const MAX_BARS = Math.floor(CANVAS_WIDTH / (BAR_WIDTH + GAP));

  useEffect(() => {
    if (!mediaRecorder?.stream) return;

    const audioContext = new AudioContext();
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 64;
    const source = audioContext.createMediaStreamSource(mediaRecorder.stream);
    source.connect(analyserNode);

    setAnalyser(analyserNode);
    setContext(audioContext);

    return () => {
      source.disconnect();
      analyserNode.disconnect();
      if (audioContext.state !== "closed") audioContext.close();
      cancelAnimationFrame(animationRef.current!);
    };
  }, [mediaRecorder?.stream]);

  const drawBars = useCallback(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      //   console.log("DataArray", dataArray);

      // we will get the new DataArray each frame

      const avg =
        dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

      if (barHistoryRef.current.length >= MAX_BARS) {
        barHistoryRef.current.shift();
      }
      barHistoryRef.current.push(avg); // or smoothed, for smoother animation

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;

      barHistoryRef.current.forEach((val, i) => {
        // console.log(val);
        const x = i * (BAR_WIDTH + GAP);
        const normalized = val / 255;
        const halfHeight = normalized * (CANVAS_HEIGHT / 2);

        ctx.beginPath();
        ctx.fillStyle = "rgb(160, 198, 255)";
        ctx.roundRect(x, centerY - halfHeight, BAR_WIDTH, halfHeight * 2, [20]);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [analyser]);

  useEffect(() => {
    if (analyser && mediaRecorder.state === "recording") {
      barHistoryRef.current = [];
      drawBars();
    } else {
      cancelAnimationFrame(animationRef.current!);
    }
  }, [analyser, mediaRecorder.state, drawBars]);

  return (
    <canvas
      ref={canvasRef}
      className="w-[100px] h-full rounded-md"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
    />
  );
}
