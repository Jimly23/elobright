"use client";

import React, { useEffect, useRef, useState } from 'react'
import Navbar from '@/src/components/Navbar'
import { Book, CheckCircle2, ChevronDown, FileText, GraduationCap, Headset, Mic2, PenTool } from 'lucide-react';
import { BookOpen, ArrowRight } from 'lucide-react';
import FooterSection from '@/src/components/FooterSection';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import HeroSection from '@/src/components/Learning/HeroSection';


const skills = [
  { name: "TOEFL", icon: <FileText className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "IELTS", icon: <GraduationCap className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "Grammar", icon: <Book className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "Vocabulary", icon: <BookOpen className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "Speaking", icon: <Mic2 className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "Reading", icon: <BookOpen className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "Listening", icon: <Headset className="w-6 h-6 text-white" fill="currentColor" /> },
  { name: "Writing", icon: <PenTool className="w-6 h-6 text-white" fill="currentColor" /> },
];

const courseData = [
  {
    id: 1,
    title: "Advanced English For TOEFL & IELTS Preparation",
    level: "Advanced",
    rating: 4.9,
    reviews: "1.560",
    image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Building Strong English Skills For Academic Use",
    level: "Intermediate",
    rating: 4.7,
    reviews: "980",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "English Foundations For Daily Communication",
    level: "Beginner",
    rating: 4.8,
    reviews: "1.240",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Practical Business English for Professionals",
    level: "Intermediate",
    rating: 4.6,
    reviews: "850",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
  },
];

const courses = Array(12).fill({
  title: "Certify Your English Test Reading, Writing, & Listening..",
  price: "Rp 50.000",
  level: "Intermediate",
  rating: 5,
  reviews: "1.240",
});

const filterCategories = [
  { title: "Category", options: ["Vocabulary", "Grammar", "TOEFL", "IELTS", "Speaking", "Reading", "Listening", "Writing"] },
  { title: "Short By", options: ["Best Seller", "Rating", "Harga Terendah", "Harga Tertinggi", "Promo"] },
  { title: "Level", options: ["Basic", "Intermediate", "Advanced"] },
  { title: "Type", options: ["Free", "Freemium", "Premium"] },
];

const page = () => {

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 350; // Perkiraan lebar kartu + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <>
      <Navbar />
      <HeroSection />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center justify-center p-8 rounded-[24px] bg-gradient-to-b from-blue-100/60 to-blue-50/30 border border-blue-100/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 cursor-pointer"
              >
                {/* Icon Circle */}
                <div className="w-12 h-12 mb-4 rounded-full bg-blue-500 flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                  {skill.icon}
                </div>

                {/* Skill Name */}
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header Section */}
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full">
                Best English Courses
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
                Grow your English skill
              </h2>
            </div>

            {/* Functional Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${canScrollLeft
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }`}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${canScrollRight
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {courseData.map((course) => (
              <div
                key={course.id}
                className="min-w-[320px] md:min-w-[380px] group cursor-pointer"
              >
                {/* Illustration Placeholder */}
                <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden mb-6 bg-slate-100 border border-slate-100 transition-transform duration-300 group-hover:-translate-y-2">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                  />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {course.rating} ({course.reviews})
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header Section */}
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full">
                Best English Courses
              </span>
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
                Grow your English skill
              </h2>
            </div>

            {/* Functional Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${canScrollLeft
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }`}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${canScrollRight
                  ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {courseData.map((course) => (
              <div
                key={course.id}
                className="min-w-[320px] md:min-w-[380px] group cursor-pointer"
              >
                {/* Illustration Placeholder */}
                <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden mb-6 bg-slate-100 border border-slate-100 transition-transform duration-300 group-hover:-translate-y-2">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                  />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {course.rating} ({course.reviews})
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full mb-4">
              Best English Courses
            </span>
            <h2 className="text-5xl font-bold text-slate-900">Grow your English skill</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filter */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-100">
                {filterCategories.map((group, idx) => (
                  <div key={idx} className={`${idx !== 0 ? 'mt-8' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900">{group.title}</h3>
                      <ChevronDown size={16} className="text-slate-400" />
                    </div>
                    <div className="space-y-3">
                      {group.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                            defaultChecked={opt === "Vocabulary" || opt === "Promo" || opt === "Intermediate" || opt === "Free"}
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="w-full mt-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-colors">
                  Clear Filter
                </button>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <div key={index} className="group cursor-pointer">
                    {/* Image Placeholder */}
                    <div className="aspect-[4/3] bg-slate-200 rounded-[20px] mb-4 overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 shadow-sm" />

                    {/* Content */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-blue-500 font-bold text-lg">{course.price}</p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                          {course.level}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">
                            ({course.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </>
  )
}

export default page