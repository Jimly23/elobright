"use client";

import Navbar from '@/src/components/Navbar'
import FooterSection from '@/src/components/FooterSection'
import EnglishTestHero from '@/src/components/EnglishTest/EnglishTestHero';
import InfoSection from '@/src/components/EnglishTest/InfoSection';
import TakeTestSection from '@/src/components/EnglishTest/TakeTestSection';
import NeedMoreTimeSection from '@/src/components/EnglishTest/NeedMoreTimeSection';

const Page = () => {
  return (
    <>
      <Navbar />
      <EnglishTestHero title={"TOEFL"} />
      <InfoSection url="/english-test/toefl/introduction" />
      <TakeTestSection />
      <NeedMoreTimeSection />
      <FooterSection />
    </>
  )
}

export default Page