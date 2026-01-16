"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useTimer } from "@/hooks/useTimer";
import { TimerDisplay } from "./TimerDisplay";
import { SessionControls } from "./SessionControls";
import { DistractionOverride } from "./DistractionOverride";
import { MoodEnvironmentSelector } from "./MoodEnvironment";
import { SessionSummary } from "./SessionSummary";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import * as sessionQueries from "@/lib/supabase/session-queries";
import { MOOD_ENVIRONMENTS } from "@/types/focus.types";
import type { Distraction } from "@/types/focus.types";
import { ChevronDown } from "lucide-react";

export function FocusMode() {
  const router = useRouter();
  const { user } = useStore();

  // Timer setup
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [moodEnvironment, setMoodEnvironment] = useState("focus");
  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionData, setSessionData] = useState({
    duration: 0,
    xpEarned: 0,
    completed: false,
  });

  const timer = useTimer({
    initialMinutes: timerMinutes,
    onComplete: () => handleSessionComplete(true),
  });

  // Initialize session
  const handleStartSession = async () => {
    if (!user) return;

    try {
      const session = await sessionQueries.createFocusSession(user.id, {
        duration_minutes: timerMinutes,
        mood_environment: moodEnvironment,
      });
      setSessionId(session.id);
      setSessionStarted(true);
      timer.start();
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const handleSessionComplete = async (completed: boolean) => {
    if (!sessionId || !user) return;

    const elapsedMinutes = timerMinutes - Math.ceil(timer.timeRemaining / 60);
    const xpEarned = completed ? elapsedMinutes * 10 : elapsedMinutes * 5;

    try {
      await sessionQueries.completeFocusSession(sessionId, user.id, {
        xpEarned,
        completed,
        distractions,
      });

      setSessionData({
        duration: elapsedMinutes,
        xpEarned,
        completed,
      });
      setShowSummary(true);
      timer.stop();
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };

  const handleNewSession = () => {
    setShowSummary(false);
    setSessionStarted(false);
    setSessionId(null);
    setDistractions([]);
    setTimerMinutes(25);
    timer.stop();
  };

  const handlePause = () => {
    timer.pause();
  };

  const handleResume = () => {
    timer.resume();
  };

  const handleStop = () => {
    handleSessionComplete(false);
  };

  const handleLogDistraction = (distraction: Omit<Distraction, "timestamp">) => {
    const newDistraction: Distraction = {
      ...distraction,
      timestamp: new Date().toISOString(),
    };
    setDistractions((prev) => [...prev, newDistraction]);
    timer.resume();
  };

  const currentMood = MOOD_ENVIRONMENTS.find((m) => m.id === moodEnvironment);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => router.push("/login")}>Login to Start</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      {currentMood && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentMood.bgColor} opacity-20 transition-all duration-500`}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
        {/* Setup Phase */}
        {!sessionStarted && !showSummary && (
          <div className="w-full max-w-2xl space-y-6">
            {/* Timer Duration Selector */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <Slider
                label="Session Duration"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                min={5}
                max={120}
                step={5}
                suffix=" min"
              />
              <p className="text-xs text-gray-500 mt-3">
                Recommended: 25 minutes (Pomodoro) • Maximum: 120 minutes
              </p>
            </div>

            {/* Mood Environment */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <MoodEnvironmentSelector
                selectedId={moodEnvironment}
                onSelect={setMoodEnvironment}
              />
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartSession}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Begin Focus Session
            </Button>
          </div>
        )}

        {/* Active Session Phase */}
        {sessionStarted && !showSummary && (
          <div className="w-full max-w-2xl space-y-8">
            {/* Timer Display */}
            <TimerDisplay
              timeFormatted={timer.formatTime}
              progress={timer.progress}
              isRunning={timer.isRunning}
              isPaused={timer.isPaused}
            />

            {/* Session Controls */}
            <SessionControls
              isRunning={timer.isRunning}
              isPaused={timer.isPaused}
              onStart={handleStartSession}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
            />

            {/* Current Mood */}
            {currentMood && (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Current Mood</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{currentMood.icon}</span>
                  <span className="text-lg font-medium text-gray-300">
                    {currentMood.name}
                  </span>
                </div>
              </div>
            )}

            {/* Stats During Session */}
            <div className="grid grid-cols-2 gap-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Distractions Logged</div>
                <div className="text-2xl font-bold text-red-400 mt-1">
                  {distractions.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Current Focus Score</div>
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {Math.round(
                    ((timerMinutes * 60 - timer.timeRemaining - distractions.length * 5 * 60) /
                      (timerMinutes * 60)) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>

            {/* Distraction Override Button */}
            {timer.isRunning && (
              <button
                onClick={handlePause}
                className="w-full px-4 py-3 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm font-medium"
              >
                📍 Log Distraction
              </button>
            )}
          </div>
        )}

        {/* Distraction Override Dialog */}
        <DistractionOverride
          isOpen={timer.isPaused && sessionStarted && !showSummary}
          isPaused={timer.isPaused}
          onLogDistraction={handleLogDistraction}
          onResume={() => timer.resume()}
        />

        {/* Session Summary */}
        {showSummary && (
          <SessionSummary
            duration={sessionData.duration}
            xpEarned={sessionData.xpEarned}
            distractionCount={distractions.length}
            completed={sessionData.completed}
            onNewSession={handleNewSession}
          />
        )}
      </div>
    </div>
  );
}