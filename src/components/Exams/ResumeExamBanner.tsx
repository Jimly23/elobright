"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Clock, AlertTriangle } from "lucide-react";

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
      const currentUserId = getCookie('userId') || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null) || '';
      // Fallback: if we can't get userId from cookie, we assume it matches for now
      if (currentUserId && data.userId && data.userId !== currentUserId) return;

      // Check if the section end time hasn't passed yet
      if (data.endTimeLimit) {
        const endTime = new Date(data.endTimeLimit).getTime();
        if (Date.now() >= endTime) {
          // Expired — clean up
          localStorage.removeItem("examCheckpoint");
          return;
        }
      }

      // Small delay before showing for smooth animation
      setTimeout(() => {
        setCheckpoint(data);
        setVisible(true);
      }, 100);
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

  if (!checkpoint || !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full overflow-hidden animate-[scaleUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 relative z-10">
            <PlayCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white relative z-10">Ujian Belum Selesai</h2>
          <p className="text-blue-100 mt-2 font-medium relative z-10 text-sm">
            Anda memiliki sesi ujian yang sedang berjalan.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <AlertTriangle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              Apakah Anda ingin melanjutkan ujian dari soal terakhir yang sedang dikerjakan?
            </p>
          </div>

          {timeLeft && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <Clock size={16} className="text-slate-400" />
              <span className="text-slate-500 text-sm font-medium">Sisa waktu:</span>
              <span className="text-slate-800 font-black tabular-nums">{timeLeft}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResume}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
