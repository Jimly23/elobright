"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGeneralExamContext } from '@/src/context/GeneralExamContext';
import { useSectionContext } from '@/src/context/SectionContext';
import EnglishTestNavbar from '@/src/components/EnglishTest/EnglishTestNavbar';
import McqQuestionDisplay from '@/src/components/Exams/McqQuestionDisplay';
import ListeningQuestionDisplay from '@/src/components/Exams/ListeningQuestionDisplay';
import EssayQuestionDisplay from '@/src/components/Exams/EssayQuestionDisplay';
import AudioUploadQuestionDisplay from '@/src/components/Exams/AudioUploadQuestionDisplay';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;
  const questionId = params.questionId as string;

  const { sections, getNextSectionId } = useGeneralExamContext();
  const { questions, getNextQuestionId, getQuestionIndex } = useSectionContext();

  const currentSection = sections.find(s => s.id === sectionId);
  const sectionName = currentSection?.title || 'Section';
  const sectionTitleLower = sectionName.toLowerCase();

  const currentQuestion = questions.find(q => q.id === questionId);
  const currentIndex = getQuestionIndex(questionId);

  // If questions are not yet loaded or wrong ID
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  const handleNext = () => {
    const nextQuestionId = getNextQuestionId(questionId);
    if (nextQuestionId) {
      router.push(`/exams/${examId}/section/${sectionId}/question/${nextQuestionId}`);
    } else {
      // Reached the end of the section, go to the next section or finish
      const nextSectionId = getNextSectionId(sectionId);
      if (nextSectionId) {
        router.push(`/exams/${examId}/section/${nextSectionId}`);
      } else {
        router.push(`/exams/${examId}/finish`);
      }
    }
  };

  // Determine component based on question_type or section title mapping
  let DisplayComponent = McqQuestionDisplay;
  
  const type = currentQuestion.questionType?.toLowerCase();
  
  if (type === 'audio_upload' || type === 'speaking' || sectionTitleLower.includes('speak')) {
    DisplayComponent = AudioUploadQuestionDisplay as any;
  } else if (type === 'essay' || type === 'writing' || sectionTitleLower.includes('writ')) {
    DisplayComponent = EssayQuestionDisplay as any;
  } else if (type === 'listening_mcq' || sectionTitleLower.includes('listen')) {
    DisplayComponent = ListeningQuestionDisplay as any;
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-white">
      {/* Background Layer: Gradient & Grid (Consistent Theme) */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-1/2 bg-white" />
        <div className="relative h-1/2 w-full bg-gradient-to-t from-blue-400 to-transparent">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      </div>

      <EnglishTestNavbar 
        sectionName={sectionName} 
        currentQuestion={currentIndex + 1} 
        totalQuestions={questions.length} 
      />

      <main className="relative flex-1 flex items-center justify-center w-full z-10 p-0 text-center md:text-left">
        <DisplayComponent 
          question={currentQuestion} 
          currentIndex={currentIndex} 
          onNext={handleNext} 
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 flex justify-center">
        <div className="bg-white/90 backdrop-blur-md px-8 py-2 rounded-full border border-white/50 shadow-sm">
          <p className="text-slate-400 text-[11px] font-medium tracking-tight">
            © 2026 Elobright. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
