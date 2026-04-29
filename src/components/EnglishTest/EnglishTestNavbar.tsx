"use client";

import { useEffect, useState } from "react";
import { BookOpen, Timer, Headphones, Edit3, Mic, ClipboardCheck } from "lucide-react";

interface EnglishTestNavbarProps {
    sectionName?: string;
    currentQuestion?: number;
    totalQuestions?: number;
}

export default function EnglishTestNavbar({
    sectionName = "Reading",
    currentQuestion = 0,
    totalQuestions = 0
}: EnglishTestNavbarProps) {
    const [timeLeft, setTimeLeft] = useState<string>("0.00 min");

    useEffect(() => {
        // Read the section-level end time limit from localStorage
        const endTimeStr = localStorage.getItem("currentSectionEndTimeLimit");
        if (!endTimeStr) return;

        const endTime = new Date(endTimeStr).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = endTime - now;

            if (difference <= 0) {
                setTimeLeft("0.00 min");
            } else {
                const minutes = Math.floor(difference / 1000 / 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft(`${minutes}.${seconds.toString().padStart(2, '0')} min`);
            }
        };

        // Eksekusi pertama agar tidak nunggu 1 detik
        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    const isUsability = sectionName.toLowerCase().includes('usability') || sectionName.toLowerCase().includes('feedback');

    const getSectionIcon = () => {
        const name = sectionName.toLowerCase();
        if (name.includes('usability') || name.includes('feedback')) return <ClipboardCheck size={24} />;
        switch (name) {
            case 'listening': return <Headphones size={24} />;
            case 'writing': return <Edit3 size={24} />;
            case 'speaking': return <Mic size={24} />;
            case 'reading':
            default:
                return <BookOpen size={24} />;
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Section info */}
                <div className="flex items-center gap-3 w-48">
                    <div className={isUsability ? 'text-teal-500' : 'text-[#0080FF]'}>
                        {getSectionIcon()}
                    </div>
                    <span className="font-bold text-slate-800 text-lg capitalize">{sectionName}</span>
                </div>

                {/* Progress bar centered */}
                {totalQuestions > 0 && (
                    <div className="flex-1 flex items-center justify-center gap-6">
                        <div className="w-full max-w-xl h-2.5 bg-[#E5F0FF] rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isUsability ? 'bg-teal-500' : 'bg-[#4080FF]'} rounded-full transition-all duration-500`}
                                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                            {currentQuestion}/{totalQuestions}
                        </span>
                    </div>
                )}

                {/* Timer right */}
                <div className="flex items-center justify-end gap-3 md:border-l px-6 border-slate-200 w-48">
                    <div className="text-[#0080FF]">
                        <Timer size={28} />
                    </div>
                    <div className="flex gap-x-1 items-center">
                        <span className="text-sm font-bold text-slate-800 leading-none">{timeLeft}</span>
                        {/* <span className="text-[9px] text-red-500 font-bold">time left</span> */}
                    </div>
                </div>
            </div>
        </header>
    );
}