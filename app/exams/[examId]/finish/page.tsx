"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { exam } from "@/src/api/exam";
import Button from '@/src/components/ui/Button';
import ExamCard from '@/src/components/Exams/ExamCard';

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function ExamFinishPage() {
  const [loading, setLoading] = useState(true);
  const finishAttempt = useRef(false);

  useEffect(() => {
    if (finishAttempt.current) return;
    
    const finishExam = async () => {
      finishAttempt.current = true;
      try {
        const sessionId = localStorage.getItem("currentExamSessionId");
        const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || '';

        if (sessionId) {
          await exam.finishExam(sessionId, token);
        }
      } catch (error) {
        console.error("Failed to finish exam", error);
      } finally {
        setLoading(false);
        // Clean up localStorage
        localStorage.removeItem("currentExamSessionId");
        localStorage.removeItem("currentSectionSessionId");
        localStorage.removeItem("currentSectionEndTimeLimit");
        localStorage.removeItem("examCheckpoint");
      }
    };
    finishExam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="relative top-0 bottom-0 bg-gradient-to-b from-blue-50/50 to-white" />
        <div className="relative h-full w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div>

      {/* Header / Logo */}
      <header className="absolute top-8 left-8 z-20">
        <div className="w-10 h-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Image
            src={"/logo/logo-icon.jpg"}
            width={100}
            height={100}
            alt="logo"
            className="w-10"
          />
        </div>
      </header>

      <ExamCard
        className="max-w-lg mx-6 mt-10"
        headerClassName="pt-12 pb-8 h-auto"
        contentClassName="p-10 pt-4 text-center"
        title={
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200">
              <CheckCircle2 size={40} />
            </div>
            <span>Ujian Selesai!</span>
          </div>
        }
        subtitle="Kerja bagus! Sertifikasi Anda sedang diproses."
      >
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <MailCheck size={32} />
          </div>
          <p className="text-slate-600 font-medium leading-relaxed mb-10 px-4">
            Selamat telah menyelesaikan sertifikasi bahasa inggris, jawaban Anda akan direview dan sertifikat akan dikirim melalui email Anda. Silakan cek email secara berkala.
          </p>

          <Link href="/" className="block w-full">
            <Button variant="primary" size="lg" className="w-full shadow-xl shadow-blue-200">
              Kembali ke Halaman Utama
            </Button>
          </Link>
        </div>
      </ExamCard>
    </div>
  );
}
