"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/src/components/Navbar';
import FooterSection from '@/src/components/FooterSection';
import EnglishTestHero from '@/src/components/EnglishTest/EnglishTestHero';
import InfoSection from '@/src/components/EnglishTest/InfoSection';
import TakeTestSection from '@/src/components/EnglishTest/TakeTestSection';
import NeedMoreTimeSection from '@/src/components/EnglishTest/NeedMoreTimeSection';
import { exam } from '@/src/api/exam';

const IELTS_ID = '11111111-0000-0000-0000-000000000002';

const Page = () => {
  const [examData, setExamData] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await exam.examById(IELTS_ID);
        console.log('examById (IELTS) response:', data);
        setExamData(data);

        const sections = await exam.sectionByExamId(IELTS_ID);
        console.log('sectionByExamId (IELTS) response:', sections);
      } catch (error) {
        console.error('examById (IELTS) error:', error);
      }
    };

    fetchExam();
  }, []);

  return (
    <>
      <Navbar />
      <EnglishTestHero title="IELTS" examData={examData} />
      <InfoSection url="/english-test/ielts/introduction" />
      <TakeTestSection />
      <NeedMoreTimeSection />
      <FooterSection />
    </>
  );
};

export default Page;