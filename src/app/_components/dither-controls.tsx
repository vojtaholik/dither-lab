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
  contrast: number;
  midtones: number;
  highlights: number;
  backgroundColor: string;
  foregroundColor: string;
  ditherScale: number;
  onAlgorithmChange: (algorithm: DitheringAlgorithm) => void;
  onThresholdChange: (threshold: number) => void;
  onContrastChange: (contrast: number) => void;
  onMidtonesChange: (midtones: number) => void;
  onHighlightsChange: (highlights: number) => void;
  onBackgroundColorChange: (color: string) => void;
  onForegroundColorChange: (color: string) => void;
  onDitherScaleChange: (scale: number) => void;
  onSaveImage: () => void;
  onExportSVG: () => void;
  isSvgExporting: boolean;
  onImageLoad: (image: HTMLImageElement) => void;
  externalFile?: File | null;
};

const DitherControls = ({
  algorithm,
  threshold,
  contrast,
  midtones,
  highlights,
  backgroundColor,
  foregroundColor,
  ditherScale,
  onAlgorithmChange,
  onThresholdChange,
  onContrastChange,
  onMidtonesChange,
  onHighlightsChange,
  onBackgroundColorChange,
  onForegroundColorChange,
  onDitherScaleChange,
  onSaveImage,
  onExportSVG,
  isSvgExporting,
  onImageLoad,
  externalFile,
}: DitherControlsProps) => {
  return (
    <div className="flex md:flex-col flex-col-reverse md:h-screen justify-between gap-6 py-6">
      <fieldset className="flex md:flex-col flex-col-reverse gap-6">
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
        <div>
          <Slider
            label={`Contrast: ${contrast.toFixed(2)}`}
            value={[contrast]}
            onValueChange={(value) => onContrastChange(value[0])}
            min={0.5}
            max={2.0}
            step={0.01}
            defaultValue={[1]}
            className="w-full opacity-90"
          />
          <Slider
            label={`Midtones: ${midtones.toFixed(2)}`}
            value={[midtones]}
            onValueChange={(value) => onMidtonesChange(value[0])}
            min={0}
            max={1}
            step={0.01}
            className="w-full opacity-80"
          />
          <Slider
            label={`Highlights: ${highlights.toFixed(2)}`}
            value={[highlights]}
            onValueChange={(value) => onHighlightsChange(value[0])}
            min={0.5}
            max={1.5}
            step={0.01}
            className="w-full opacity-90"
          />
          <Slider
            label={`Scale: ${ditherScale.toFixed(1)}x`}
            value={[ditherScale]}
            onValueChange={(value) => onDitherScaleChange(value[0])}
            defaultValue={[1]}
            min={0.5}
            max={8.0}
            step={0.1}
            className="w-full opacity-80"
          />
        </div>
        <div className="flex items-center gap-5">
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
                placeholder="#0a0a0a"
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
        </div>
      </fieldset>
      <div className="flex gap-2 flex-col md:pt-5">
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
