// "use client";

// import { useCallback, useEffect, useRef } from "react";

// export function AudioVisualizer({ audioUrl }: { audioUrl: string }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//     const getAudioData = useCallback((audioUrl:string)=>{
//         const audioContext = new AudioContext();
//         const audio = new Audio(audioUrl)
//         const source = audioContext.createMediaElementSource(audio);
//         const analyser = audioContext.createAnalyser();

//         source.connect(analyser);

//         analyser.fftSize = 256;

//         const bufferLength = analyser.frequencyBinCount;
//         const dataArray = new Uint8Array(bufferLength);

//     },[audioUrl]);

//   useEffect(()=>{
//   },[]);

//   return <canvas ref={canvasRef}></canvas>;
// }
