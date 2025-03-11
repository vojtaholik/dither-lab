"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";
import { EffectCorners } from "./select";

function Slider({
  className,
  defaultValue,
  value,
  label,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  label?: string;
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
    [value, defaultValue, min, max]
  );

  // Store the initial value to use for reset
  const initialValueRef = React.useRef<number[] | undefined>(
    Array.isArray(value)
      ? [...value]
      : Array.isArray(defaultValue)
      ? [...defaultValue]
      : undefined
  );

  // Handle double-click to reset to default value
  const handleDoubleClick = React.useCallback(() => {
    if (!onValueChange) return;

    // First priority: Use the defaultValue if provided
    if (defaultValue !== undefined) {
      onValueChange(
        Array.isArray(defaultValue) ? defaultValue : [defaultValue]
      );
      return;
    }

    // Second priority: Use the initial value if we captured it
    if (initialValueRef.current) {
      onValueChange(initialValueRef.current);
      return;
    }

    // Last resort: Reset to middle of range
    const middleValue = min + (max - min) / 2;
    onValueChange([middleValue]);
  }, [defaultValue, min, max, onValueChange]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      onValueChange={onValueChange}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
        onDoubleClick={handleDoubleClick}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary mix-blend-difference z-10 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
        {label && (
          <div className="absolute left-1 text-sm text-white">{label}</div>
        )}
        <EffectCorners />
      </SliderPrimitive.Track>
      {/* {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="bg-foreground ring-ring/50 block size-5 shrink-0 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))} */}
    </SliderPrimitive.Root>
  );
}

export { Slider };
