"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type UseTimerProps = {
  initialMinutes: number;
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
};

export function useTimer({ initialMinutes, onTick, onComplete }: UseTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = initialMinutes * 60;
  const elapsedSeconds = totalSeconds - timeRemaining;
  const progress = (elapsedSeconds / totalSeconds) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        const next = prev - 1;
        onTick?.(next);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTick, onComplete]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    progress,
    formatTime: formatTime(timeRemaining),
    start,
    pause,
    resume,
    stop,
  };
}