"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { exam as examApi } from '@/src/api/exam';
import { GeneralExamProvider } from '@/src/context/GeneralExamContext';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const examId = params.examId as string;

  const [examData, setExamData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;

    const fetchExamData = async () => {
      try {
        const token = getCookie('token') || '';
        
        // Fetch core exam data
        const data = await examApi.examById(examId, token);
        setExamData(data);

        // Fetch sections for this exam
        const sectionsData = await examApi.sectionByExamId(examId, token);
        setSections(sectionsData);
      } catch (error) {
        console.error('Failed to fetch exam data for layout:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <GeneralExamProvider examData={examData} sections={sections}>
      {children}
    </GeneralExamProvider>
  );
}
