"use client";

import React, { useEffect, useState } from 'react';
import { Play, Pause, Lock } from 'lucide-react';
import { exam } from '@/src/api/exam';
import QuestionFeaturedResources from '@/src/components/Exams/QuestionFeaturedResources';
import ExamCard from '@/src/components/Exams/ExamCard';
import { getCachedAnswer, setCachedAnswer } from '@/src/lib/examAnswerCache';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// Helper to resolve media URLs (Prefix with API base if relative)
const resolveMediaUrl = (url: string | null) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const baseUrl = (url.includes("cdn") ? process.env.NEXT_PUBLIC_API_URL_CDN : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:3001";
  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

interface EssayQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
  onPrev?: () => void;
  isLastQuestion?: boolean;
  finishing?: boolean;
  disabled?: boolean;
}

// Simple inline audio player for essay context/question audio
function SimpleAudioPlayer({ src, label, playbackKey }: { src: string; label: string; playbackKey: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [hasPlayed, setHasPlayed] = useState(() => (
    typeof window !== 'undefined' && localStorage.getItem(playbackKey) === 'played'
  ));
  const [startedHere, setStartedHere] = useState(false);

  useEffect(() => () => audioEl?.pause(), [audioEl]);

  const togglePlay = () => {
    if (hasPlayed && !startedHere) return;
    if (!audioEl) {
      const audio = new Audio(src);
      audio.onended = () => {
        setIsPlaying(false);
        setHasPlayed(true);
        setStartedHere(false);
      };
      audio.onerror = () => setIsPlaying(false);
      setAudioEl(audio);
      setStartedHere(true);
      localStorage.setItem(playbackKey, 'played');
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      audioEl.play();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={togglePlay}
      disabled={hasPlayed && !startedHere}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all text-left disabled:border-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
    >
      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
        {hasPlayed && !startedHere ? <Lock size={18} /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </div>
      <div>
        <p className="text-blue-600 text-xs font-black uppercase tracking-wider">{label}</p>
        <p className="text-slate-400 text-[11px] font-medium">{hasPlayed && !startedHere ? 'Audio sudah pernah diputar' : isPlaying ? 'Sedang memutar...' : 'Klik untuk memutar'}</p>
      </div>
    </button>
  );
}

export default function EssayQuestionDisplay({ question, currentIndex, onNext, onPrev, disabled }: EssayQuestionDisplayProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sectionSessionId = typeof window !== 'undefined'
    ? localStorage.getItem('currentSectionSessionId') || ''
    : '';

  useEffect(() => {
    setText(getCachedAnswer(sectionSessionId, question.id)?.textResponse ?? '');
  }, [question.id, sectionSessionId]);

  const handleSubmit = async () => {
    if (!text.trim() || disabled) return;
    setSubmitting(true);

    try {
      const sectionSessionId = localStorage.getItem('currentSectionSessionId');
      const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';

      if (sectionSessionId) {
        setCachedAnswer(sectionSessionId, question.id, { textResponse: text });
        await exam.recordAnswerEssay(sectionSessionId, {
          questionId: question.id,
          textResponse: text
        }, token);
      }
      onNext();
    } catch (e) {
      console.error('Error submitting answer:', e);
      onNext(); // Progress visually
    } finally {
      setSubmitting(false);
    }
  };

  const narrativeAudioUrl = question.audioUrl ? resolveMediaUrl(question.audioUrl) : null;
  const questionAudioUrl = question.questionAudioUrl ? resolveMediaUrl(question.questionAudioUrl) : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-6 pt-[72px] md:pt-20 relative z-10 w-full">
      <ExamCard className="max-w-4xl flex-1 md:flex-none" contentClassName="p-6 md:p-16">

        {/* Question Badge */}
        <div className="flex md:justify-center mb-10 shrink-0">
          <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-100">
            Question {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </span>
        </div>

        {/* Featured resources: image & narrative text */}
        <QuestionFeaturedResources imageUrl={question.imageUrl} narrativeText={question.narrativeText} />

        {/* Audio Players */}
        {(narrativeAudioUrl || questionAudioUrl) && (
          <div className="flex flex-wrap gap-3 mb-6 shrink-0">
            {narrativeAudioUrl && (
              <SimpleAudioPlayer src={narrativeAudioUrl} label="Audio Konteks" playbackKey={`exam-audio:${sectionSessionId}:${encodeURIComponent(narrativeAudioUrl)}`} />
            )}
            {questionAudioUrl && (
              <SimpleAudioPlayer src={questionAudioUrl} label="Audio Pertanyaan" playbackKey={`exam-audio:${sectionSessionId}:${encodeURIComponent(questionAudioUrl)}`} />
            )}
          </div>
        )}

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-medium text-slate-700 text-left leading-relaxed mb-12 shrink-0">
          {question.questionText || 'No question found.'}
        </h2>

        {/* Writing Area */}
        <div className="relative mb-6 flex-1 flex flex-col min-h-[250px]">
          <textarea
            className="w-full flex-1 p-6 rounded-2xl border-2 border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-600 leading-relaxed resize-none disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Tulis jawaban Anda di sini..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting || disabled}
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between mt-auto pt-4 shrink-0">
          {onPrev ? (
            <button
              onClick={onPrev}
              disabled={submitting || disabled}
              className="px-4 py-2.5 text-xs md:px-8 md:py-4 md:text-base bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg md:rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
            >
              ← Previous
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting || disabled}
            className="px-8 py-2.5 text-xs md:px-16 md:py-4 md:text-base bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg md:rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:active:scale-100"
          >
            {submitting ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </ExamCard>
    </div>
  );
}
