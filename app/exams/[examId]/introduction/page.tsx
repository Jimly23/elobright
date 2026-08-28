"use client";

import Image from 'next/image';
import { BookOpen, Headphones, PenTool, Mic2, Loader2, ClipboardCheck } from 'lucide-react';
import { useGeneralExamContext } from '@/src/context/GeneralExamContext';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { exam } from "@/src/api/exam";
import ExamCard from "@/src/components/Exams/ExamCard";
import Button from '@/src/components/ui/Button';
import ExamCompletedDialog from "@/src/components/Exams/ExamCompletedDialog";

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function ExamIntroductionPage() {
  const { examData, sections, setExamSessionId, setCurrentSectionSession } = useGeneralExamContext();
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCheckingHistory, setIsCheckingHistory] = useState(true);
  
  const [studyProgram, setStudyProgram] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [showIntro, setShowIntro] = useState(false);

  // Cek history jika exam isOnce
  useEffect(() => {
    const checkHistory = async () => {
      if (!examData?.isOnce) {
        setIsCheckingHistory(false);
        return;
      }
      
      try {
        const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';
        const history = await exam.getExamHistory(token);
        
        // Cari submission yang sudah selesai untuk exam ini
        const hasCompleted = history.some((sub: any) => 
          sub.examId === examId && 
          (sub.status === 'submitted' || sub.status === 'finished-late')
        );
        
        if (hasCompleted) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error('Failed to fetch exam history:', err);
      } finally {
        setIsCheckingHistory(false);
      }
    };
    
    checkHistory();
  }, [examId, examData?.isOnce]);

  // We map the dynamic sections array to the static display style
  const getSectionIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('usability') || t.includes('feedback')) return <ClipboardCheck size={24} />;
    if (t.includes('listen')) return <Headphones size={24} />;
    if (t.includes('writ')) return <PenTool size={24} />;
    if (t.includes('speak')) return <Mic2 size={24} />;
    return <BookOpen size={24} />; // Default reading/other
  };

  // Filter out Usability Testing section so users don't see it beforehand
  const visibleSections = sections.filter(s => {
    const t = (s.title || '').toLowerCase();
    return !t.includes('usability') && !t.includes('feedback');
  });

  const testSections = visibleSections.length > 0 ? visibleSections.map(s => ({
    icon: getSectionIcon(s.title || ''),
    title: s.title || 'Section',
    duration: s.durationMinutes ? `${s.durationMinutes} mins` : '-- mins',
  })) : [
    { icon: <BookOpen size={24} />, title: 'Reading', duration: '-- mins' },
    { icon: <Headphones size={24} />, title: 'Listening', duration: '-- mins' },
    { icon: <PenTool size={24} />, title: 'Writing', duration: '-- mins' },
    { icon: <Mic2 size={24} />, title: 'Speaking', duration: '-- mins' },
  ];

  // Helper: store session data from API response and navigate
  const storeSessionAndNavigate = useCallback((session: any, checkpoint: any) => {
    // Store exam session
    setExamSessionId(session.id);
    localStorage.setItem('currentExamSessionId', session.id);

    // Store current section session
    if (session.currentSectionSession) {
      const ss = session.currentSectionSession;
      setCurrentSectionSession(ss);
      localStorage.setItem('currentSectionSessionId', ss.id);
      localStorage.setItem('currentSectionEndTimeLimit', ss.endTimeLocale || ss.endTimeLimit);
    }

    // Navigate based on checkpoint or section
    if (checkpoint?.questionId && checkpoint?.sectionId) {
      router.push(`/exams/${session.examId || examId}/section/${checkpoint.sectionId}/question/${checkpoint.questionId}`);
    } else if (session.currentSectionSession?.examSectionId) {
      router.push(`/exams/${session.examId || examId}/section/${session.currentSectionSession.examSectionId}`);
    } else if (sections.length > 0) {
      router.push(`/exams/${examId}/section/${sections[0].id}`);
    }
  }, [examId, sections, router, setExamSessionId, setCurrentSectionSession]);

  // Helper: check if a session is stale (endTimeLimit already passed)
  const isSessionStale = (session: any): boolean => {
    const sectionSession = session?.currentSectionSession;
    if (!sectionSession) return false;
    const endTime = sectionSession.endTimeLocale || sectionSession.endTimeLimit;
    if (!endTime) return false;
    return new Date(endTime).getTime() < Date.now();
  };

  // Helper: finish a stale session and start a new one
  const finishStaleAndRestart = async (staleSessionId: string, token: string, userId: number) => {
    try {
      console.log('Finishing stale session:', staleSessionId);
      await exam.finishExam(staleSessionId, token);
      // Clean up old session data
      localStorage.removeItem('currentExamSessionId');
      localStorage.removeItem('currentSectionSessionId');
      localStorage.removeItem('currentSectionEndTimeLimit');
      localStorage.removeItem('examCheckpoint');
    } catch (err) {
      console.warn('Failed to finish stale session, proceeding anyway:', err);
    }

    // Now start a fresh exam
    const freshRes = await exam.startExam({
      userId: userId,
      examId: examId,
      group_number: groupNumber.trim(),
      study_program: studyProgram.trim(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta'
    }, token);

    console.log('Fresh startExam response:', freshRes);
    return freshRes;
  };

  const handleStart = async () => {
    if (sections.length === 0) return;

    const trimmedStudyProgram = studyProgram.trim();
    const trimmedGroupNumber = groupNumber.trim();

    setLoading(true);
    try {
      const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';
      const cookieUserId = getCookie('userId') || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
      const userId = cookieUserId ? parseInt(cookieUserId, 10) : 2;

      let res = await exam.startExam({
        userId: userId,
        examId: examId,
        group_number: trimmedGroupNumber,
        study_program: trimmedStudyProgram,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta'
      }, token);

      console.log('startExam response:', res);

      // Check if this is an "ongoing session" response (200 with ongoing message)
      if (res?.message === 'Ongoing session already exists' && res?.session) {
        // If the session is stale (time expired), auto-finish and start fresh
        if (isSessionStale(res.session)) {
          res = await finishStaleAndRestart(res.session.id, token, userId);
        } else {
          // Session is still valid, resume it
          storeSessionAndNavigate(res.session, res.checkpoint || null);
          return;
        }
      }

      if (res && res.session) {
        // Fresh start — store session and navigate to first section
        const sessionId = res.session.id;
        setExamSessionId(sessionId);
        localStorage.setItem('currentExamSessionId', sessionId);

        if (res.session.currentSectionSession) {
          const sectionSession = res.session.currentSectionSession;
          setCurrentSectionSession(sectionSession);
          localStorage.setItem('currentSectionSessionId', sectionSession.id);
          localStorage.setItem('currentSectionEndTimeLimit', sectionSession.endTimeLocale || sectionSession.endTimeLimit);
        }
      }

      router.push(`/exams/${examId}/section/${sections[0].id}`);
    } catch (e: any) {
      console.error('Failed to start exam:', e.response?.data || e);

      // Handle 403 Forbidden - Exam can only be taken once
      if (e.response?.status === 403 && e.response?.data?.message === 'Exam can only be taken once') {
        setIsCompleted(true);
        return;
      }

      // Handle 409 Conflict — ongoing session
      if (e.response?.status === 409 && e.response?.data?.session) {
        const conflictSession = e.response.data.session;

        // If the conflicting session is stale, finish it and retry
        if (isSessionStale(conflictSession)) {
          try {
            const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';
            const cookieUserId = getCookie('userId') || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
            const userId = cookieUserId ? parseInt(cookieUserId, 10) : 2;
            const freshRes = await finishStaleAndRestart(conflictSession.id, token, userId);

            if (freshRes && freshRes.session) {
              const sessionId = freshRes.session.id;
              setExamSessionId(sessionId);
              localStorage.setItem('currentExamSessionId', sessionId);
              if (freshRes.session.currentSectionSession) {
                const ss = freshRes.session.currentSectionSession;
                setCurrentSectionSession(ss);
                localStorage.setItem('currentSectionSessionId', ss.id);
                localStorage.setItem('currentSectionEndTimeLimit', ss.endTimeLocale || ss.endTimeLimit);
              }
            }
            router.push(`/exams/${examId}/section/${sections[0].id}`);
            return;
          } catch (retryErr) {
            console.error('Failed to restart after finishing stale session:', retryErr);
          }
        } else {
          // Session is still valid, resume it
          storeSessionAndNavigate(conflictSession, e.response.data.checkpoint || null);
          return;
        }
      }

      if (e.response?.data) {
        alert('Gagal memulai exam: ' + JSON.stringify(e.response.data));
      } else {
        alert('Gagal memulai exam: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">

      {/* ── Full-Screen Loading Overlay ── */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
          {/* Animated ring */}
          <div className="relative w-28 h-28 mb-8">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-[5px] border-blue-100" />
            <div
              className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-blue-500 border-r-blue-400"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            {/* Inner icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                <Loader2 size={28} className="text-white" style={{ animation: 'spin 1.5s linear infinite' }} />
              </div>
            </div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Preparing Your Exam</h2>
          <p className="text-slate-400 font-medium text-sm mb-8">Setting up your session, please wait...</p>

          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                style={{
                  animation: 'bounce 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>

          {/* CSS keyframes */}
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0.6);
                opacity: 0.4;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* Background Layer: Gradient & Grid */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="relative top-0 bottom-0 bg-gradient-to-b from-blue-50/50 to-white" />

        <div className="relative h-full w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div>

      {/* Main Card */}
      <ExamCard
        title="Welcome"
        subtitle="You are about to start the test"
        className="flex-1 w-full md:flex-none md:w-auto max-w-none md:max-w-3xl md:max-h-[90vh]"
      >
        {/* Test Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {testSections.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-3 rounded-[16px] bg-white/50 border border-white/60 shadow-sm transition-all hover:bg-white/70">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-[12px] flex items-center justify-center mb-2 md:mb-3 shadow-md shadow-blue-300">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-[11px] md:text-[13px] leading-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-[10px] md:text-[11px] mt-1 font-medium">
                {item.duration}
              </p>
            </div>
          ))}
        </div>

        {/* Instructions List */}
        <div className="bg-white/40 border border-white/60 rounded-[20px] p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
          <ul className="space-y-3 md:space-y-4 text-slate-700 text-[11px] md:text-[13px] leading-relaxed">
            {[
              "Check you will have enough time to complete the whole test before you begin. Once you begin the test, you cannot pause the timer or restart the test. You can take very short breaks between test sections if needed. These breaks are also timed.",
              "You can only take the test once. You cannot repeat the test to practice.",
              "If your internet connection isn't stable, you may not be able to complete the test. Partial tests are not saved.",
              "You will not lose points for wrong answers.",
              "Once you submit an exercise, you cannot go back."
            ].map((text, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* User Info Form - REMOVED: now in popup */}

        <div className="w-full flex justify-center">
          <button
            onClick={handleStart}
            disabled={sections.length === 0 || loading || isCheckingHistory || isCompleted}
            className="w-full md:w-2/3 py-3.5 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm md:text-base rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-blue-200 outline-none disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
          >
            {loading || isCheckingHistory ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Memuat...
              </span>
            ) : isCompleted ? 'Ujian Selesai' : 'Start Exam'}
          </button>
        </div>
      </ExamCard>
      
      {isCompleted && (
        <ExamCompletedDialog 
          title="Ujian Telah Diselesaikan"
          message="Anda telah selesai mengerjakan ujian ini dan tidak dapat mengulangnya. Jika belum mendapatkan sertifikat, silakan cek email secara berkala atau hubungi panitia."
          homeUrl="/"
        />
      )}

      {/* ── Popup Modal: Program Studi & Kelompok ── */}
      {!showIntro && !isCheckingHistory && !isCompleted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 md:px-8 md:py-6">
              <h2 className="text-lg md:text-xl font-bold text-white">Informasi Peserta</h2>
              <p className="text-blue-100 text-xs md:text-sm mt-1 font-medium">Lengkapi data berikut sebelum memulai ujian</p>
            </div>

            {/* Body */}
            <div className="px-6 py-6 md:px-8 md:py-8">
              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Program Studi</label>
                  <input 
                    type="text"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    placeholder="Contoh: Informatika"
                    required
                    className="w-full px-4 py-3 text-sm md:text-base text-slate-700 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Kelompok / Kelas</label>
                  <input 
                    type="text"
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    placeholder="Contoh: 3"
                    required
                    className="w-full px-4 py-3 text-sm md:text-base text-slate-700 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setFormError('');
                  const trimSP = studyProgram.trim();
                  const trimGN = groupNumber.trim();
                  if (!trimSP) { setFormError('Program Studi wajib diisi'); return; }
                  if (trimSP.length > 255) { setFormError('Program Studi maksimal 255 karakter'); return; }
                  if (!trimGN) { setFormError('Kelompok/Kelas wajib diisi'); return; }
                  if (trimGN.length > 50) { setFormError('Kelompok/Kelas maksimal 50 karakter'); return; }
                  setShowIntro(true);
                }}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm md:text-base rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-blue-200 outline-none"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

