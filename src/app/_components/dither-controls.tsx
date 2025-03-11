"use client";

import { Slider } from "@/components/ui/slider";
import ImageUploader from "./image-uploader";
import { DitheringAlgorithm } from "./utils/shader-loader";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DitherControlsProps = {
  algorithm: DitheringAlgorithm;
  threshold: number;
  backgroundColor: string;
  foregroundColor: string;
  onAlgorithmChange: (algorithm: DitheringAlgorithm) => void;
  onThresholdChange: (threshold: number) => void;
  onBackgroundColorChange: (color: string) => void;
  onForegroundColorChange: (color: string) => void;
  onSaveImage: () => void;
  onExportSVG: () => void;
  isSvgExporting: boolean;
  onImageLoad: (image: HTMLImageElement) => void;
  externalFile?: File | null;
};

const DitherControls = ({
  algorithm,
  threshold,
  backgroundColor,
  foregroundColor,
  onAlgorithmChange,
  onThresholdChange,
  onBackgroundColorChange,
  onForegroundColorChange,
  onSaveImage,
  onExportSVG,
  isSvgExporting,
  onImageLoad,
  externalFile,
}: DitherControlsProps) => {
  return (
    <div className="flex flex-col h-screen justify-center gap-6 rounded-lg">
      <ImageUploader onImageLoad={onImageLoad} externalFile={externalFile} />
      <div>
        <Label>Algorithm</Label>
        <Select
          value={algorithm}
          onValueChange={(value) =>
            onAlgorithmChange(value as DitheringAlgorithm)
          }
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select a dithering algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bayer">Bayer Ordered</SelectItem>
            <SelectItem value="random">Random Noise</SelectItem>
            <SelectItem value="blue-noise">Blue Noise</SelectItem>
            <SelectItem value="halftone">Halftone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Threshold</Label>
        <Slider
          label={threshold.toFixed(2)}
          value={[threshold]}
          onValueChange={(value) => onThresholdChange(value[0])}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>
      <fieldset className="flex items-center gap-5">
        <div>
          <Label className="mb-1">Color #1</Label>
          <div className="flex items-center">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                console.log("Color picker changed to:", e.target.value);
                onBackgroundColorChange(e.target.value);
              }}
              className="w-10 h-11 -mr-px cursor-pointer"
            />

            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => {
                console.log("Background input changed to:", e.target.value);
                onBackgroundColorChange(e.target.value);
              }}
              className="flex-1 h-9"
              placeholder="#000000"
            />
          </div>
        </div>
        <div>
          <Label className="mb-1">Color #2</Label>
          <div className="flex items-center">
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) => {
                console.log(
                  "Foreground color picker changed to:",
                  e.target.value
                );
                onForegroundColorChange(e.target.value);
              }}
              className="w-10 h-11 -mr-px border-none flex cursor-pointer"
            />
            <Input
              type="text"
              value={foregroundColor}
              onChange={(e) => {
                console.log("Foreground input changed to:", e.target.value);
                onForegroundColorChange(e.target.value);
              }}
              className="flex-1 h-9"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </fieldset>
      <div className="flex gap-2 flex-col pt-5">
        <Button onClick={onSaveImage}>Save Image</Button>
        <Button
          variant="secondary"
          onClick={onExportSVG}
          disabled={isSvgExporting}
        >
          {isSvgExporting ? "Exporting SVG..." : "Export SVG"}
        </Button>
      </div>
    </div>
  );
};

export default DitherControls;
