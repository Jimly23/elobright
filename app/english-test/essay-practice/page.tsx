"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/src/components/Navbar';
import FooterSection from '@/src/components/FooterSection';
import EnglishTestHero from '@/src/components/EnglishTest/EnglishTestHero';
import InfoSection from '@/src/components/EnglishTest/InfoSection';
import TakeTestSection from '@/src/components/EnglishTest/TakeTestSection';
import NeedMoreTimeSection from '@/src/components/EnglishTest/NeedMoreTimeSection';
import { exam } from '@/src/api/exam';

const ESSAY_PRACTICE_ID = '11111111-0000-4000-8000-000000000003';

const ESSAY_BENEFITS = [
  "Practice with real exam-style essay prompts",
  "Track your word count and writing progress",
  "Write at your own pace with no time pressure"
];

const Page = () => {
  const [examData, setExamData] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const tokenStr = document.cookie.split('; ').find(row => row.startsWith('token='));
        const token = tokenStr ? tokenStr.split('=')[1] : undefined;

        const data = await exam.examById(ESSAY_PRACTICE_ID, token);
        console.log('examById (Essay Practice) response:', data);
        setExamData(data);

        const sections = await exam.sectionByExamId(ESSAY_PRACTICE_ID, token);
        console.log('sectionByExamId (Essay Practice) response:', sections);
      } catch (error) {
        console.error('examById (Essay Practice) error:', error);
      }
    };

    fetchExam();
  }, []);

  return (
    <>
      <Navbar />
      <EnglishTestHero title="Essay Practice" examData={examData} />
      <InfoSection 
        url="/english-test/essay-practice/introduction"
        testName="Essay Practice"
        testBadge="Essay Practice"
        titleLine1="Free Essay Practice"
        titleLine2="writing test"
        description="Practice and improve your essay writing skills with real exam-style prompts. Get feedback on your writing structure, vocabulary, and argumentation."
        benefits={ESSAY_BENEFITS}
      />
      <TakeTestSection />
      <NeedMoreTimeSection />
      <FooterSection />
    </>
  );
};

export default Page;