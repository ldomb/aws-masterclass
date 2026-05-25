"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useId } from "react";

interface ControlPanelProps {
  children?: React.ReactNode;
  isRunning?: boolean;
  onToggle?: () => void;
  onReset?: () => void;
  showPlayback?: boolean;
}

export function ControlPanel({
  children,
  isRunning,
  onToggle,
  onReset,
  showPlayback = true,
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3 mt-2">
      {showPlayback && (
        <div className="flex items-center gap-1.5">
          {onToggle && (
            <Button
              size="sm"
              variant="outline"
              onClick={onToggle}
              className="h-10 w-10 p-0"
              aria-label={isRunning ? "Pause simulation" : "Play simulation"}
              title={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
          {onReset && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              className="h-10 w-10 p-0"
              aria-label="Reset simulation"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
}

export function SliderControl({ label, value, min, max, step = 1, onChange, unit }: SliderControlProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="text-muted-foreground whitespace-nowrap">
        {label}:
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 accent-primary"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}${unit ?? ""}`}
      />
      <span className="font-mono text-xs w-12">
        {value}{unit}
      </span>
    </div>
  );
}
