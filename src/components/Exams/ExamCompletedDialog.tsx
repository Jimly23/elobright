"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface ExamCompletedDialogProps {
  title?: string;
  message?: string;
  homeUrl?: string;
}

export default function ExamCompletedDialog({
  title = "Ujian Telah Diselesaikan",
  message = "Anda telah selesai mengerjakan ujian ini dan tidak dapat mengulangnya. Jika belum mendapatkan sertifikat, silakan cek email secara berkala atau hubungi panitia.",
  homeUrl = "/"
}: ExamCompletedDialogProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    Cookies.remove("token");
    Cookies.remove("userData");
    Cookies.remove("userId");
    router.push("/signin");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full overflow-hidden animate-[scaleUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20 relative z-10">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white relative z-10">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 text-center">
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            {message}
          </p>

          <button onClick={handleLogout} className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            Kembali
            <ArrowRight size={18} />
          </button>
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
