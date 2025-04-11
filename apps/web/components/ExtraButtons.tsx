"use client";
import { FaFileAlt } from "react-icons/fa";
import { IoMdImages } from "react-icons/io";

export function ExtraButtons({
  onImageClick,
  onDocumentClick,
}: {
  onImageClick: () => void;
  onDocumentClick: () => void;
}) {
  return (
    <div className="flex flex-col bg-white rounded-md shadow-sm border border-gray-300 w-max px-2 py-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick();
        }}
        className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-md transition-all duration-150"
      >
        <IoMdImages className="text-blue-500" />
        <span>Photos & Videos</span>
      </button>

      <div className="w-px bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDocumentClick();
        }}
        className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-md transition-all duration-150"
      >
        <FaFileAlt className="text-green-500" />
        <span>Documents</span>
      </button>
    </div>
  );
}
