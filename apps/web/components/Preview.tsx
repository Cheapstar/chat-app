/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

export function Preview({ src }: { src: string }) {
  useEffect(() => {
    console.log("Hi from Preview", src);
  }, []);

  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  return (
    <div className=" h-[100%] w-[100%] rounded-md overflow-hidden flex justify-center items-center px-2 py-4">
      {src ? (
        <img
          src={`${src}`}
          alt="User Uploaded Image"
          className={`object-contain w-[100%] h-[100%] ${
            isZoomed ? "scale-200 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
      ) : (
        <p className="text-red-400 text-sm">*Could not load the image</p>
      )}
    </div>
  );
}
