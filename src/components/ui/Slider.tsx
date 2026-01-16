"use client";

import { cn } from "@/lib/utils";

type SliderProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  suffix?: string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  showValue = true,
  suffix = "",
  className,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          {showValue && (
            <span className="text-sm font-bold text-indigo-400">
              {value}
              {suffix}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={cn(
            "w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-indigo-500",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:shadow-lg",
            "[&::-moz-range-thumb]:h-4",
            "[&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-indigo-500",
            "[&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:border-0",
            className
          )}
          {...props}
        />
        <div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}