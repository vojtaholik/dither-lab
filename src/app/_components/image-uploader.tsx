"use client";

import { useRef } from "react";

type ImageUploaderProps = {
  onImageLoad: (image: HTMLImageElement) => void;
};

const ImageUploader = ({ onImageLoad }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded cursor-pointer hover:bg-gray-300 inline-block"
      >
        Upload Image
      </label>
    </div>
  );
};

export default ImageUploader;
