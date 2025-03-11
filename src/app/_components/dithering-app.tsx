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
  const canvasRef = useRef<{
    saveImage: () => void;
    exportSVG: () => void;
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
    defaultImg.src = "/default-image.jpg";
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

  const handleSaveImage = () => {
    canvasRef.current?.saveImage();
  };

  const handleExportSVG = () => {
    canvasRef.current?.exportSVG();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        <div className="w-full flex justify-center items-center h-screen">
          {image ? (
            <DitheringCanvas
              ref={canvasRef}
              image={image}
              algorithm={algorithm}
              threshold={threshold}
              shaders={shaders}
            />
          ) : (
            <div className="flex items-center justify-center h-64 rounded-lg border border-gray-300 w-full">
              <p className="text-gray-500">Loading default image...</p>
            </div>
          )}
        </div>
        <div className="w-full max-w-sm  bg-gray-900 p-5 border border-white/5">
          <ImageUploader onImageLoad={handleImageLoad} />
          <DitherControls
            algorithm={algorithm}
            threshold={threshold}
            onAlgorithmChange={handleAlgorithmChange}
            onThresholdChange={handleThresholdChange}
            onSaveImage={handleSaveImage}
            onExportSVG={handleExportSVG}
          />
        </div>
      </div>
    </div>
  );
};

export default DitheringApp;
