"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/src/components/Navbar';
import FooterSection from '@/src/components/FooterSection';
import EnglishTestHero from '@/src/components/EnglishTest/EnglishTestHero';
import InfoSection from '@/src/components/EnglishTest/InfoSection';
import TakeTestSection from '@/src/components/EnglishTest/TakeTestSection';
import NeedMoreTimeSection from '@/src/components/EnglishTest/NeedMoreTimeSection';
import { exam } from '@/src/api/exam';

const TOEFL_ID = '11111111-0000-0000-0000-000000000001';

const Page = () => {
  const [examData, setExamData] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await exam.examById(TOEFL_ID);
        console.log('examById (TOEFL) response:', data);
        setExamData(data);

        const sections = await exam.sectionByExamId(TOEFL_ID);
        console.log('sectionByExamId (TOEFL) response:', sections);
      } catch (error) {
        console.error('examById (TOEFL) error:', error);
      }
    };

    fetchExam();
  }, []);

  return (
    <>
      <Navbar />
      <EnglishTestHero title="TOEFL" examData={examData} />
      <InfoSection url="/english-test/toefl/introduction" />
      <TakeTestSection />
      <NeedMoreTimeSection />
      <FooterSection />
    </>
  );
};

export default Page;