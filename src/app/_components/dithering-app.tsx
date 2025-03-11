"use client";

import { useState, useRef, useEffect } from "react";
import ImageUploader from "./image-uploader";
import DitherControls from "./dither-controls";
import DitheringCanvas from "./dithering-canvas";
import { DitheringAlgorithm } from "./utils/shader-loader";

type Shaders = {
  vertex: string;
  bayer: string;
  random: string;
  "blue-noise": string;
  halftone: string;
};

type DitheringAppProps = {
  shaders: Shaders;
};

const DitheringApp = ({ shaders }: DitheringAppProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [algorithm, setAlgorithm] = useState<DitheringAlgorithm>("bayer");
  const [threshold, setThreshold] = useState(0.5);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [foregroundColor, setForegroundColor] = useState("#ffffff");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<{
    saveImage: () => void;
    exportSVG: () => void;
    isSvgExporting: boolean;
  } | null>(null);

  // Load default image on component mount
  useEffect(() => {
    const defaultImg = new Image();
    defaultImg.onload = () => {
      setImage(defaultImg);
    };
    defaultImg.onerror = (err) => {
      console.error("Error loading default image:", err);
    };
    defaultImg.src =
      process.env.NEXT_PUBLIC_DEFAULT_IMAGE_URL || "default-image.jpg";
  }, []);

  const handleImageLoad = (img: HTMLImageElement) => {
    setImage(img);
  };

  const handleAlgorithmChange = (alg: DitheringAlgorithm) => {
    setAlgorithm(alg);
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  const handleForegroundColorChange = (color: string) => {
    setForegroundColor(color);
  };

  const handleSaveImage = () => {
    canvasRef.current?.saveImage();
  };

  const handleExportSVG = () => {
    canvasRef.current?.exportSVG();
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.match("image.*")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            handleImageLoad(img);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Get the SVG exporting state for the UI
  const isSvgExporting = canvasRef.current?.isSvgExporting || false;

  return (
    <div
      className={`w-full ${isDragging ? "drag-active" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/80 p-8 rounded-lg border-2 border-dashed border-white/70">
            <p className="text-white text-xl font-bold">Drop image to dither</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="w-full flex justify-center items-center h-screen">
          {image ? (
            <DitheringCanvas
              ref={canvasRef}
              image={image}
              algorithm={algorithm}
              threshold={threshold}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              shaders={shaders}
            />
          ) : (
            <div className="flex items-center justify-center h-64 rounded-lg border border-gray-300 w-full">
              <p className="text-gray-500">Loading default image...</p>
            </div>
          )}
        </div>
        <div className="w-full max-w-sm  bg-gray-900 p-5 border border-white/5">
          <DitherControls
            algorithm={algorithm}
            threshold={threshold}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            onAlgorithmChange={handleAlgorithmChange}
            onThresholdChange={handleThresholdChange}
            onBackgroundColorChange={handleBackgroundColorChange}
            onForegroundColorChange={handleForegroundColorChange}
            onSaveImage={handleSaveImage}
            onExportSVG={handleExportSVG}
            onImageLoad={handleImageLoad}
            isSvgExporting={isSvgExporting}
          />
        </div>
      </div>
    </div>
  );
};

export default DitheringApp;
