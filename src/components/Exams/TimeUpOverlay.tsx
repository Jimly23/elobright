"use client";

import React, { useState } from 'react';
import { Clock, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

interface TimeUpOverlayProps {
  onFinishSection: () => Promise<void>;
}

export default function TimeUpOverlay({ onFinishSection }: TimeUpOverlayProps) {
  const [finishing, setFinishing] = useState(false);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await onFinishSection();
    } catch (e) {
      console.error('Error finishing after time up:', e);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Overlay blocks all interaction beneath */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-6 overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <Clock size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Waktu Habis!</h2>
            <p className="text-white/80 text-sm font-medium mt-0.5">Sesi bagian ini telah berakhir</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Waktu untuk bagian ini telah habis. Semua jawaban yang sudah Anda masukkan <strong>tetap tersimpan</strong> dengan aman. Anda tidak dapat mengubah jawaban lagi.
            </p>
          </div>

          <button
            onClick={handleFinish}
            disabled={finishing}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {finishing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Lanjutkan
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
