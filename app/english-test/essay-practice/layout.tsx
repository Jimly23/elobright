"use client";

import { ExamProvider } from '@/src/context/ExamContext';

export default function EssayPracticeLayout({ children }: { children: React.ReactNode }) {
  return <ExamProvider>{children}</ExamProvider>;
}