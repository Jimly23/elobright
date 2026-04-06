"use client";

import { BookOpen, Timer } from "lucide-react";

export default function EnglishTestNavbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Section info */}
                <div className="flex items-center gap-3 w-48">
                    <div className="text-[#0080FF]">
                        <BookOpen size={24} />
                    </div>
                    <span className="font-bold text-slate-800 text-lg">Reading</span>
                </div>

                {/* Progress bar centered */}
                <div className="flex-1 flex items-center justify-center gap-6">
                    <div className="w-full max-w-xl h-2.5 bg-[#E5F0FF] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#4080FF] rounded-full transition-all duration-500"
                            style={{ width: `${(16 / 35) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                        16/35
                    </span>
                </div>

                {/* Timer right */}
                <div className="flex items-center justify-end gap-3 border-l px-6 border-slate-200 w-48">
                    <div className="text-[#0080FF]">
                        <Timer size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-none">16.43 min</span>
                        <span className="text-[9px] text-red-500 font-bold tracking-tight self-end mt-0.5">time left</span>
                    </div>
                </div>
            </div>
        </header>
    );
}