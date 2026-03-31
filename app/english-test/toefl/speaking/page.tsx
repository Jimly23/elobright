"use client";

import React, { useState } from 'react';
import { Mic2 } from 'lucide-react';
import TestLayout from '@/src/components/EnglishTest/TestLayout';
import SectionIntroPage from '@/src/components/EnglishTest/SectionIntroPage';
import { useExam } from '@/src/context/ExamContext';

export default function SpeakingPage() {
  const { sections, questionsBySection } = useExam();
  const [started, setStarted] = useState(false);

  const section = sections.find(s => s.name === 'Speaking');
  const questions = section ? (questionsBySection[section.id] ?? []) : [];

  if (!started) {
    return (
      <SectionIntroPage
        sectionName="Speaking"
        duration={section ? `${section.durationMinutes} mins` : '15 mins'}
        questionCount={questions.length}
        onStart={() => setStarted(true)}
      />
    );
  }

  return (
    <TestLayout
      sectionName="Speaking"
      sectionColor="bg-purple-500"
      sectionIcon={<Mic2 size={28} />}
      questions={questions}
      durationMinutes={section?.durationMinutes ?? 15}
      nextRoute="/english-test/toefl"
      nextSectionName=""
    />
  );
}
