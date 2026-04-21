'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface Question {
  id: string;
  sectionId: string;
  audioUrl: string | null;
  imageUrl: string | null;
  narrativeText: string | null;
  questionText: string;
  questionType: string | null;
  points: number | null;
  options?: any[]; // For MCQ or prepopulated options
}

export interface SectionContextType {
  questions: Question[];
  getNextQuestionId: (currentQuestionId: string) => string | null;
  getQuestionIndex: (currentQuestionId: string) => number;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const SectionProvider = ({ 
  children, 
  questions 
}: { 
  children: ReactNode;
  questions: Question[];
}) => {
  
  const getNextQuestionId = (currentQuestionId: string): string | null => {
    const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
    if (currentIndex >= 0 && currentIndex < questions.length - 1) {
      return questions[currentIndex + 1].id;
    }
    return null; // Null means we reached the end of this section
  };

  const getQuestionIndex = (currentQuestionId: string): number => {
    return questions.findIndex(q => q.id === currentQuestionId);
  };

  return (
    <SectionContext.Provider value={{ questions, getNextQuestionId, getQuestionIndex }}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSectionContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSectionContext must be used within a SectionProvider');
  }
  return context;
};
