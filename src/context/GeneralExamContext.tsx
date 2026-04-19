'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Type declarations based on the backend schema context
export interface ExamSection {
  id: string;
  examId: string;
  title: string;
  instructions: string | null;
  orderIndex: number | null;
}

export interface GeneralExamContextType {
  examData: any; // Based on your internal exam interface
  sections: ExamSection[];
  getNextSectionId: (currentSectionId: string) => string | null;
}

const GeneralExamContext = createContext<GeneralExamContextType | undefined>(undefined);

export const GeneralExamProvider = ({ 
  children, 
  examData, 
  sections 
}: { 
  children: ReactNode;
  examData: any;
  sections: ExamSection[];
}) => {
  // Sort sections by orderIndex whenever they are injected
  const sortedSections = [...sections].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const getNextSectionId = (currentSectionId: string): string | null => {
    const currentIndex = sortedSections.findIndex(s => s.id === currentSectionId);
    if (currentIndex >= 0 && currentIndex < sortedSections.length - 1) {
      return sortedSections[currentIndex + 1].id;
    }
    return null; // Signals we've reached the end of the exam
  };

  return (
    <GeneralExamContext.Provider value={{ examData, sections: sortedSections, getNextSectionId }}>
      {children}
    </GeneralExamContext.Provider>
  );
};

export const useGeneralExamContext = () => {
  const context = useContext(GeneralExamContext);
  if (!context) {
    throw new Error('useGeneralExamContext must be used within a GeneralExamProvider');
  }
  return context;
};
