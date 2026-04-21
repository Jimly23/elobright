"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, StopCircle, Trash2, Send, Clock, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { exam } from '@/src/api/exam';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';

const TOEFL_ID = '11111111-0000-4000-8000-000000000001';

export default function SpeakingTest() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = getCookie('token') || '';
        const sections = await exam.sectionByExamId(TOEFL_ID, token);
        const speakingSection = sections.find((s: any) => s.title.toLowerCase().includes('speaking')) || sections.find((s:any) => s.orderIndex === 4) || sections[3];
        
        if (speakingSection) {
          const qs = await exam.questionBySectionId(speakingSection.id, token);
          setQuestions(qs);
        }
      } catch(e) {
        console.error('Failed to fetch speaking questions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Fungsi Mulai Rekaman
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

  // Fungsi Berhenti Rekaman
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Handle Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setAudioBlob(null); // Reset rekaman jika upload file
    }
  };

  // Handle Kirim ke API
  const handleSend = async () => {
    const fileToSend = audioBlob || uploadedFile;
    if (!fileToSend) return alert("Pilih atau rekam suara terlebih dahulu!");
    
    setSubmitting(true);
    try {
      const sessionId = localStorage.getItem('currentExamSessionId');
      const token = getCookie('token') || '';
      
      if (sessionId && questions[currentQuestionIndex]) {
        const formData = new FormData();
        formData.append("questionId", questions[currentQuestionIndex].id);
        formData.append("audio", fileToSend, "answer.mp3");

        console.log("Mengirim file ke API...");
        await exam.recordAnswerSpeaking(sessionId, formData, token);
      }
      
      // Lanjut ke soal berikutnya atau finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAudioBlob(null);
        setAudioUrl(null);
        setUploadedFile(null);
      } else {
        router.push('/english-test/toefl/finish');
      }
    } catch (e) {
      console.error('Error submitting speaking answer:', e);
      // Pindah juga jika error terjadi untuk testing
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAudioBlob(null);
        setAudioUrl(null);
        setUploadedFile(null);
      } else {
        router.push('/english-test/toefl/finish');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-white overflow-hidden font-sans">
      {/* Background Layer (Konsisten dengan Elobright UI) */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-white" />
        <div className="relative h-1/2 w-full bg-gradient-to-t from-blue-400 to-transparent">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        </div>
      </div>

      {/* Header */}
      <EnglishTestNavbar 
        sectionName="Speaking"
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-8">
        <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl shadow-blue-200/40 p-12 border border-slate-50 text-center">
          
          <div className="mb-6">
            <span className="bg-blue-50 text-blue-500 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-100">
              Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1}
            </span>
          </div>

          <h2 className="text-2xl font-medium text-slate-700 leading-relaxed max-w-lg mx-auto mb-10">
            {loading ? 'Loading question...' : (questions[currentQuestionIndex]?.questionText || 'No question found.')}
          </h2>

          {/* Recording & Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Opsi 1: Rekam Mikrofon */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center gap-4">
              <span className="text-xs font-bold text-blue-600 uppercase">Option 1: Record</span>
              {!isRecording ? (
                <button disabled={submitting || loading || questions.length === 0} onClick={startRecording} className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:bg-slate-300">
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
              <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={submitting || loading || questions.length === 0} />
              <button disabled={submitting || loading || questions.length === 0} onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors disabled:bg-slate-100">
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

          {/* Tombol Kirim */}
          <button 
            onClick={handleSend}
            disabled={!audioUrl || submitting || questions.length === 0}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              audioUrl && !submitting ? 'bg-blue-500 text-white shadow-xl shadow-blue-200 hover:bg-blue-600 active:scale-[0.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Send Answer'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <span className="bg-white/90 px-6 py-2 rounded-full border border-slate-100 shadow-sm text-[11px] text-slate-400 font-medium">
          © 2026 Elobright. All rights reserved
        </span>
      </footer>
    </div>
  );
}