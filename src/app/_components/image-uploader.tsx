"use client";

import { useRef, useState, useEffect } from "react";

type ImageUploaderProps = {
  onImageLoad: (image: HTMLImageElement) => void;
  externalFile?: File | null; // Add prop for external file
};

const ImageUploader = ({ onImageLoad, externalFile }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Cleanup object URL when component unmounts or when URL changes
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Handle external file changes
  useEffect(() => {
    if (externalFile && externalFile !== currentFile) {
      // Create object URL for background image
      const objectUrl = URL.createObjectURL(externalFile);
      setImageUrl(objectUrl);
      setCurrentFile(externalFile);

      // Process the file
      loadImageFile(externalFile);
    }
  }, [externalFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create object URL for background image
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    setCurrentFile(file);

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
      // Create object URL for background image
      const objectUrl = URL.createObjectURL(files[0]);
      setImageUrl(objectUrl);
      setCurrentFile(files[0]);

      loadImageFile(files[0]);
    }
  };

  // Get the filename to display
  const filename = currentFile?.name || fileInputRef.current?.files?.[0]?.name;

  return (
    <div className="mb-4 md:-mt-6 md:-mx-6">
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
        className={`relative px-4 py-2 aspect-video flex-col w-full flex items-center justify-center ${
          isDraggingOver
            ? "bg-gray-400 text-gray-900"
            : "bg-gray-200 text-gray-800"
        } cursor-pointer hover:bg-white/10 bg-white/5 text-white transition-colors duration-200 ${
          isDraggingOver
            ? "border border-dashed border-white"
            : "border-gray-700"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : `url(${process.env.NEXT_PUBLIC_DEFAULT_IMAGE_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="text-sm md:absolute left-2 bottom-2 md:bg-black/50 bg-black px-2 py-1 rounded">
          {!filename && (
            <>{isDraggingOver ? "Drop Image Here" : "Upload Image"}</>
          )}
        </span>
        {filename && (
          <span className="text-sm absolute left-2 bottom-2 truncate max-w-[calc(100%-2rem)] bg-black/50 px-2 py-1 rounded">
            {filename}
          </span>
        )}
      </label>
      {/* filename */}
      {/* {filename && <p className="text-sm text-gray-500 mt-1">{filename}</p>} */}
    </div>
  );
};

export default ImageUploader;
