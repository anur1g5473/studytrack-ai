"use client";

import { Button } from "@/components/ui/Button";
import { Play, Pause, RotateCcw, X } from "lucide-react";

type SessionControlsProps = {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isLoading?: boolean;
};

export function SessionControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  isLoading = false,
}: SessionControlsProps) {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {!isRunning && !isPaused && (
        <Button
          onClick={onStart}
          variant="primary"
          size="lg"
          className="gap-2 px-8"
          disabled={isLoading}
        >
          <Play className="w-5 h-5" />
          Start Session
        </Button>
      )}

      {isRunning && (
        <Button
          onClick={onPause}
          variant="secondary"
          size="lg"
          className="gap-2 px-8"
        >
          <Pause className="w-5 h-5" />
          Pause
        </Button>
      )}

      {isPaused && (
        <Button
          onClick={onResume}
          variant="primary"
          size="lg"
          className="gap-2 px-8"
        >
          <Play className="w-5 h-5" />
          Resume
        </Button>
      )}

      <Button
        onClick={onStop}
        variant="ghost"
        size="lg"
        className="gap-2 px-8"
      >
        <X className="w-5 h-5" />
        Exit
      </Button>
    </div>
  );
}