"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CountdownPopup() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Nonaktifkan scroll pada body saat popup muncul agar tidak bisa di-scroll ke bawah
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(19, 0, 0, 0); // Set ke jam 19:00:00 hari ini

      const difference = targetTime.getTime() - now.getTime();

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const initialTimeLeft = calculateTimeLeft();
    if (initialTimeLeft) {
      setTimeLeft(initialTimeLeft);
      setIsVisible(true);
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        clearInterval(timer);
        setIsVisible(false); // Sembunyikan jika waktu sudah lewat jam 7 malam
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  // Hindari hydration mismatch dan jangan tampilkan jika tidak perlu
  if (!isClient || !isVisible || !timeLeft) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-center border border-gray-100 animate-in zoom-in-95 duration-300 select-none">
        <div className="mb-6 mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600">
          <Clock size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Belum Dibuka</h2>
        <p className="text-gray-600 mb-8">
          Website ini sedang dipersiapkan dan baru dapat diakses secara penuh pada jam 7 malam.
        </p>

        <div className="flex justify-center gap-4 text-gray-800">
          <div className="flex flex-col items-center">
            <div className="bg-slate-50 border border-slate-100 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold font-mono shadow-sm">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Jam</span>
          </div>
          <div className="text-2xl font-bold mt-3 text-slate-300">:</div>
          <div className="flex flex-col items-center">
            <div className="bg-slate-50 border border-slate-100 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold font-mono shadow-sm">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Menit</span>
          </div>
          <div className="text-2xl font-bold mt-3 text-slate-300">:</div>
          <div className="flex flex-col items-center">
            <div className="bg-slate-50 border border-slate-100 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold font-mono shadow-sm text-blue-600">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Detik</span>
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-400">
          Mohon menunggu hingga waktu hitung mundur selesai.
        </div>
      </div>
    </div>
  );
}
