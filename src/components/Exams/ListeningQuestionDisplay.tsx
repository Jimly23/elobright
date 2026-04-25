"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, AlertCircle, Lock } from "lucide-react";
import { exam } from "@/src/api/exam";
import { useAudioPlayback } from "@/src/hooks/useAudioPlayback";
import {
  DirectAudioElement,
  HLSAudioElement,
} from "@/src/components/Exams/AudioElements";
import QuestionFeaturedResources from "./QuestionFeaturedResources";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

// Helper to resolve media URLs (Prefix with API base if relative)
const resolveMediaUrl = (url: string | null) => {
  if (!url) return "";
  if (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  )
    return url;

  // Get API URL from env, default to local if not set
  const baseUrl =
    (url.includes("oranged")
      ? process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL_NOCDN) || "http://localhost:3001";
  // Remove trailing slash and append leading slash if needed
  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

interface ListeningQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
  onPrev?: () => void;
  isLastQuestion?: boolean;
  finishing?: boolean;
}

const AudioPlayer = ({
  src,
  state,
  togglePlay,
  audioRef,
  handlers,
  label,
}: any) => {
  const isHLS = src.endsWith(".m3u8");

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isDisabled = state.error || state.hasPlayed;

  return (
    <div
      className={`flex items-center gap-6 p-6 rounded-3xl border transition-colors ${state.error ? "bg-red-50 border-red-100" : state.hasPlayed ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-100"}`}
    >
      {isHLS ? (
        <HLSAudioElement src={src} audioRef={audioRef} handlers={handlers} />
      ) : (
        <DirectAudioElement src={src} audioRef={audioRef} handlers={handlers} />
      )}
      <button
        onClick={togglePlay}
        disabled={isDisabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${state.error ? "bg-slate-300 cursor-not-allowed" : state.hasPlayed ? "bg-slate-300 cursor-not-allowed text-white" : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-blue-200"}`}
      >
        {state.error ? (
          <AlertCircle />
        ) : state.hasPlayed ? (
          <Lock size={22} />
        ) : state.isPlaying ? (
          <Pause fill="currentColor" />
        ) : (
          <Play fill="currentColor" className="ml-1" />
        )}
      </button>
      <div>
        <p
          className={`${state.error ? "text-red-500" : state.hasPlayed ? "text-slate-400" : "text-blue-600"} text-xs font-black uppercase tracking-wider mb-1`}
        >
          {state.error ? "Playback Error" : state.hasPlayed ? "Played" : label}
        </p>
        <p className={`font-black text-xl tabular-nums ${state.hasPlayed ? "text-slate-400" : "text-slate-800"}`}>
          {state.error
            ? "--:--"
            : `${formatTime(state.progress)} / ${formatTime(state.duration)}`}
        </p>
      </div>
    </div>
  );
};

export default function ListeningQuestionDisplay({
  question,
  currentIndex,
  onNext,
  onPrev,
}: ListeningQuestionDisplayProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use the new custom hook
  const leftAudio = useAudioPlayback();
  const rightAudio = useAudioPlayback();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      if (question.options && question.options.length > 0) {
        setOptions(question.options);
        setLoading(false);
      } else {
        try {
          const token = getCookie("token") || "";
          const opts = await exam.getOptionsByQuestionIdAttempt(
            question.id,
            token,
          );
          setOptions(opts);
        } catch (e) {
          console.error("Failed to fetch options", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOptions();
    setSelectedOption(null);
    leftAudio.reset();
    rightAudio.reset();
  }, [question.id]);

  const handleSubmit = async () => {
    if (!selectedOption) return;
    setSubmitting(true);

    try {
      const sectionSessionId = localStorage.getItem("currentSectionSessionId");
      const token = getCookie("token") || "";

      if (sectionSessionId) {
        await exam.recordAnswerMCQ(
          sectionSessionId,
          {
            questionId: question.id,
            selectedOptionId: selectedOption,
          },
          token,
        );
      }
      onNext();
    } catch (e) {
      console.error("Error submitting answer:", e);
      onNext();
    } finally {
      setSubmitting(false);
    }
  };

  const leftSrc = resolveMediaUrl(question.audioUrl);
  const rightSrc = resolveMediaUrl(question.questionAudioUrl);

  return (
    <div className="flex-1 flex items-center justify-center p-6 mt-20 relative z-10 w-full font-sans">
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 border border-slate-200 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Left Side: Context Audio Player */}
        <div className="flex-1 p-8 md:p-12 border-r border-slate-100 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100">
              Context Audio
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Listen to the conversation
          </h3>

          <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">
            Please listen to the conversation or lecture carefully. You will
            hear it only once. After the audio ends, answer the questions on the
            right.
          </p>

          {question.audioUrl ? (
            <AudioPlayer
              src={leftSrc}
              state={leftAudio.state}
              togglePlay={leftAudio.togglePlay}
              audioRef={leftAudio.audioRef}
              handlers={leftAudio.handlers}
              label="Context Player"
            />
          ) : (
            <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <Volume2 size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No context audio available</p>
            </div>
          )}
        </div>

        {/* Right Side: Question & Options */}
        <div className="flex-[1.2] p-8 md:p-12 bg-slate-50/30 flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="bg-blue-100/50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                Question {currentIndex + 1}
              </span>
            </div>

            <QuestionFeaturedResources
              imageUrl={question.imageUrl}
              narrativeText={question.narrativeText}
            />

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight mb-6">
              {question.questionText || "No question text provided."}
            </h2>

            {/* Question Audio Player (if exists) */}
            {question.questionAudioUrl && (
              <div
                className={`mb-10 flex items-center gap-4 p-4 rounded-2xl border shadow-sm w-fit transition-colors ${rightAudio.state.error ? "bg-red-50 border-red-100" : rightAudio.state.hasPlayed ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100"}`}
              >
                {rightSrc.endsWith(".m3u8") ? (
                  <HLSAudioElement
                    src={rightSrc}
                    audioRef={rightAudio.audioRef}
                    handlers={rightAudio.handlers}
                  />
                ) : (
                  <DirectAudioElement
                    src={rightSrc}
                    audioRef={rightAudio.audioRef}
                    handlers={rightAudio.handlers}
                  />
                )}
                <button
                  onClick={rightAudio.togglePlay}
                  disabled={rightAudio.state.error || rightAudio.state.hasPlayed}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${rightAudio.state.error ? "bg-red-100 text-red-500 cursor-not-allowed" : rightAudio.state.hasPlayed ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                >
                  {rightAudio.state.error ? (
                    <AlertCircle size={14} />
                  ) : rightAudio.state.hasPlayed ? (
                    <Lock size={14} />
                  ) : rightAudio.state.isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div
                  className={`text-xs font-black tabular-nums ${rightAudio.state.error ? "text-red-400" : rightAudio.state.hasPlayed ? "text-slate-400" : "text-slate-500"}`}
                >
                  {rightAudio.state.error
                    ? "Error"
                    : rightAudio.state.hasPlayed
                      ? "Played"
                      : `${formatTime(rightAudio.state.progress)} / ${formatTime(rightAudio.state.duration)}`}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mt-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
                  ))}
                </div>
              ) : (
                options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedOption === option.id
                        ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-100 scale-[1.02]"
                        : "border-white bg-white text-slate-600 hover:border-blue-100 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="listening-test"
                      className="hidden"
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                    />

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedOption === option.id
                          ? "border-white bg-white text-blue-500"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {selectedOption === option.id && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    <span
                      className={`text-base font-bold ${selectedOption === option.id ? "text-white" : "text-slate-700"}`}
                    >
                      {option.optionText || option.label}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-12 flex items-center justify-between">
            {onPrev ? (
              <button
                onClick={onPrev}
                disabled={submitting}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
              >
                ← Previous
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting || loading}
              className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100 disabled:shadow-none"
            >
              {submitting ? "Submitting..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
