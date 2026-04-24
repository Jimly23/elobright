"use client";

import React, { useState, useRef } from 'react';
import { Mic, Upload, StopCircle, Trash2, Send, Volume2 } from 'lucide-react';
import { exam } from '@/src/api/exam';
import QuestionFeaturedResources from '@/src/components/Exams/QuestionFeaturedResources';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface AudioUploadQuestionDisplayProps {
  question: any;
  currentIndex: number;
  onNext: () => void;
  onPrev?: () => void;
  isLastQuestion?: boolean;
  finishing?: boolean;
}

export default function AudioUploadQuestionDisplay({ question, currentIndex, onNext, onPrev }: AudioUploadQuestionDisplayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/mp3' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setUploadedFile(null); // Reset file upload jika baru merekam
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setAudioBlob(null); // Reset rekaman jika upload file
    }
  };

  const handleSend = async () => {
    const fileToSend = audioBlob || uploadedFile;
    if (!fileToSend) return alert("Pilih atau rekam suara terlebih dahulu!");
    
    setSubmitting(true);
    try {
      const sectionSessionId = localStorage.getItem('currentSectionSessionId');
      const token = getCookie('token') || '';
      
      if (sectionSessionId) {
        const formData = new FormData();
        formData.append("questionId", question.id);
        formData.append("audio", fileToSend, "answer.mp3");

        await exam.recordAnswerSpeaking(sectionSessionId, formData, token);
      }
      onNext();
    } catch (e) {
      console.error('Error submitting speaking answer:', e);
      onNext(); // Proceed anyway for resilience / test mock
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 mt-8 relative z-10 w-full">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 p-12 border border-slate-50 text-center">
        
        <div className="mb-6 flex justify-center">
          <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-100">
            Question {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </span>
        </div>

        <div className="text-left w-full">
          <QuestionFeaturedResources imageUrl={question.imageUrl} narrativeText={question.narrativeText} />
        </div>

        <h2 className="text-2xl font-medium text-slate-700 leading-relaxed max-w-lg mx-auto mb-10">
          {question.questionText || 'No question found.'}
        </h2>

        {/* Recording & Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Opsi 1: Rekam Mikrofon */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center gap-4">
            <span className="text-xs font-bold text-blue-600 uppercase">Option 1: Record</span>
            {!isRecording ? (
              <button disabled={submitting} onClick={startRecording} className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:bg-slate-300">
                <Mic size={28} />
              </button>
            ) : (
              <button onClick={stopRecording} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                <StopCircle size={28} />
              </button>
            )}
            <p className="text-[11px] text-slate-400 font-medium">Click to {isRecording ? 'Stop' : 'Start'} Recording</p>
          </div>

          {/* Opsi 2: Upload File */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Option 2: Upload</span>
            <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={submitting} />
            <button disabled={submitting} onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors disabled:bg-slate-100">
              <Upload size={28} />
            </button>
            <p className="text-[11px] text-slate-400 font-medium">{uploadedFile ? uploadedFile.name : 'Select MP3/WAV File'}</p>
          </div>
        </div>

        {/* Audio Preview Player */}
        {audioUrl && (
          <div className="mb-10 p-4 bg-slate-800 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="text-blue-400"><Volume2 size={20} /></div>
            <audio controls src={audioUrl} className="flex-1 h-8 filter invert" />
            <button disabled={submitting} onClick={() => { setAudioUrl(null); setAudioBlob(null); setUploadedFile(null); }} className="text-red-400 hover:text-red-300 disabled:opacity-50">
              <Trash2 size={20} />
            </button>
          </div>
        )}

        {/* Tombol Navigasi */}
        <div className="flex items-center justify-between mt-2">
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
            onClick={handleSend}
            disabled={!audioUrl || submitting}
            className={`px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              audioUrl && !submitting ? 'bg-blue-500 text-white shadow-xl shadow-blue-200 hover:bg-blue-600 active:scale-[0.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Send Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
