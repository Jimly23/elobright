"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Advanced English For TOEFL & IELTS Preparation',
    level: 'Advanced',
    rating: 4.9,
    reviews: '1.560',
    image: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=600&auto=format&fit=crop',
    color: 'bg-green-100',
  },
  {
    id: 2,
    title: 'Building Strong English Skills For Academic Use',
    level: 'Intermediate',
    rating: 4.7,
    reviews: '980',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
    color: 'bg-blue-100',
  },
  {
    id: 3,
    title: 'English Foundations For Daily Communication',
    level: 'Beginner',
    rating: 4.8,
    reviews: '1.240',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    color: 'bg-orange-100',
  },
  {
    id: 4,
    title: 'Practical English For Workplace Communication',
    level: 'Intermediate',
    rating: 4.8,
    reviews: '1.100',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop',
    color: 'bg-indigo-100',
  },
];

export default function CourseCarouselSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100">
              Best English Courses
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
              Grow your English skill
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* CSS Inline untuk menyembunyikan scrollbar di Chrome/Safari */}
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="min-w-[320px] md:min-w-[380px] group cursor-pointer snap-start"
            >
              {/* Image Card */}
              <div className={`relative h-56 w-full rounded-[24px] overflow-hidden mb-6 ${course.color}`}>
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 right-4 text-white/50">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-gray-100 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 5 ? "#FBBF24" : "none"} className="text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800 ml-1">{course.rating}</span>
                    <span className="text-xs text-slate-400">({course.reviews})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}