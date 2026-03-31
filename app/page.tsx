import CourseCarouselSection from "@/src/components/CourseCarouselSection";
import EloClubSection from "@/src/components/EloClubSection";
import FAQSection from "@/src/components/FAQSection";
import FeaturedSection from "@/src/components/FeaturedSection";
import FooterSection from "@/src/components/FooterSection";
import HeroSection from "@/src/components/HeroSection";
import Navbar from "@/src/components/Navbar";
import PreFooterCTASection from "@/src/components/PreFooterCTASection";
import TrustSection from "@/src/components/TrustSection";
import { BookOpen, Check, Sparkles } from "lucide-react";
import ExamLogger from "@/src/components/ExamLogger";

export default function Home() {
  return (
    <>
      <ExamLogger />
      <Navbar />
      <HeroSection />
      <TrustSection />
      <FeaturedSection />
      <CourseCarouselSection />
      <EloClubSection />
      <FAQSection />
      <PreFooterCTASection />
      <FooterSection />
    </>
  );
}
