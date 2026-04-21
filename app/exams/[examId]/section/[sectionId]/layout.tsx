"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { exam as examApi } from '@/src/api/exam';
import { SectionProvider } from '@/src/context/SectionContext';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const sectionId = params.sectionId as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sectionId) return;

    const fetchQuestions = async () => {
      try {
        const token = getCookie('token') || '';
        
        // Fetch questions for this section
        const data = await examApi.questionBySectionId(sectionId, token);
        setQuestions(data || []);
      } catch (error) {
        console.error('Failed to fetch questions for layout:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SectionProvider questions={questions}>
      {children}
    </SectionProvider>
  );
}
