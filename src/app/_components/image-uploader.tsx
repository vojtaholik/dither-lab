"use client";

import { useRef, useState } from "react";

type ImageUploaderProps = {
  onImageLoad: (image: HTMLImageElement) => void;
};

const ImageUploader = ({ onImageLoad }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadImageFile(file);
  };

  const loadImageFile = (file: File) => {
    if (!file.type.match("image.*")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onImageLoad(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      loadImageFile(files[0]);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`px-4 py-2 aspect-video w-full flex items-center justify-center ${
          isDraggingOver
            ? "bg-gray-400 text-gray-900"
            : "bg-gray-200 text-gray-800"
        } rounded cursor-pointer hover:bg-gray-300 bg-white/5 text-white border-dashed transition-colors duration-200 border ${
          isDraggingOver ? "border-white" : "border-gray-700"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDraggingOver ? "Drop Image Here" : "Upload Image"}
      </label>
      {/* filename */}
      <p className="text-sm text-gray-500">
        {fileInputRef.current?.files?.[0]?.name}
      </p>
    </div>
  );
};

export default ImageUploader;
