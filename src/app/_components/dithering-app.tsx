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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
      process.env.NEXT_PUBLIC_DEFAULT_IMAGE_URL || "default-image.png";
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
        setUploadedFile(file);

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
      <div className="flex md:flex-row flex-col items-center justify-center">
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
            <p className="animate-pulse flex flex-row gap-2 items-center justify-center w-full h-full">
              <svg
                width={24}
                height={24}
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.04869 0H3.31256V2.20837H4.04869V0ZM4.04869 5.15287H3.31256V7.36125H4.04869V5.15287ZM7.36125 3.31256V4.04869H5.15287V3.31256H7.36125ZM2.20837 4.04869V3.31256H0V4.04869H2.20837ZM4.78481 1.84031H5.52094V2.57644H4.78481V1.84031ZM6.25706 1.10419H5.52094V1.84031H6.25706V1.10419ZM2.57644 1.84031H1.84031V2.57644H2.57644V1.84031ZM1.10419 1.10419H1.84031V1.84031H1.10419V1.10419ZM4.78481 5.52094H5.52094V6.25706H6.25706V5.52094H5.52094V4.78481H4.78481V5.52094ZM1.84031 5.52094V4.78481H2.57644V5.52094H1.84031V6.25706H1.10419V5.52094H1.84031Z"
                  fill="currentColor"
                />
              </svg>
              Loading...
            </p>
          )}
        </div>
        <div className="w-full max-w-sm  bg-gray-900 px-6 border-l border-white/10">
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
            externalFile={uploadedFile}
          />
        </div>
      </div>
    </div>
  );
};

export default DitheringApp;
