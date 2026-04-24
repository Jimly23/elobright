"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Clock, X } from "lucide-react";

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface CheckpointData {
  examId: string;
  sectionId: string;
  questionId: string;
  userId: string;
  sectionSessionId: string;
  examSessionId: string;
  endTimeLimit: string;
  savedAt: string;
}

interface ResumeExamBannerProps {
  examId?: string; // Optional — if not provided, matches any exam
}

export default function ResumeExamBanner({ examId }: ResumeExamBannerProps) {
  const router = useRouter();
  const [checkpoint, setCheckpoint] = useState<CheckpointData | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for checkpoint data on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("examCheckpoint");
      if (!raw) return;

      const data: CheckpointData = JSON.parse(raw);

      // If examId prop is provided, only show if it matches
      if (examId && data.examId !== examId) return;

      // Only show if the checkpoint belongs to the current user
      const currentUserId = getCookie('userId') || '';
      if (!currentUserId || data.userId !== currentUserId) return;

      // Check if the section end time hasn't passed yet
      if (data.endTimeLimit) {
        const endTime = new Date(data.endTimeLimit).getTime();
        if (Date.now() >= endTime) {
          // Expired — clean up
          localStorage.removeItem("examCheckpoint");
          return;
        }
      }

      setCheckpoint(data);
      // Small delay before showing for smooth animation
      setTimeout(() => setVisible(true), 100);
    } catch {
      // Invalid data
    }
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (!checkpoint?.endTimeLimit) return;

    const endTime = new Date(checkpoint.endTimeLimit).getTime();

    const updateTimer = () => {
      const diff = endTime - Date.now();

      if (diff <= 0) {
        setTimeLeft("00:00");
        setVisible(false);
        setTimeout(() => {
          setCheckpoint(null);
          localStorage.removeItem("examCheckpoint");
        }, 300);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [checkpoint]);

  const handleResume = () => {
    if (!checkpoint) return;

    // Restore session data to localStorage so answer submission and timer work
    if (checkpoint.examSessionId) {
      localStorage.setItem("currentExamSessionId", checkpoint.examSessionId);
    }
    if (checkpoint.sectionSessionId) {
      localStorage.setItem("currentSectionSessionId", checkpoint.sectionSessionId);
    }
    if (checkpoint.endTimeLimit) {
      localStorage.setItem("currentSectionEndTimeLimit", checkpoint.endTimeLimit);
    }

    router.push(`/exams/${checkpoint.examId}/section/${checkpoint.sectionId}/question/${checkpoint.questionId}`);
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 300);
  };

  if (!checkpoint || dismissed) return null;

  return (
    <div
      className={`w-full transition-all duration-500 ease-out overflow-hidden ${
        visible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left side: Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <PlayCircle size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">
                You have an ongoing exam!
              </p>
              <p className="text-white/70 text-xs font-medium truncate">
                Continue where you left off
              </p>
            </div>
          </div>

          {/* Center: Timer */}
          {timeLeft && (
            <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 flex-shrink-0">
              <Clock size={14} className="text-white/80" />
              <span className="text-white font-black text-sm tabular-nums">{timeLeft}</span>
              <span className="text-white/60 text-[10px] font-bold">left</span>
            </div>
          )}

          {/* Right side: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleResume}
              className="px-5 py-2 bg-white text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-50 transition-all active:scale-95 shadow-lg shadow-orange-600/20"
            >
              Resume
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
