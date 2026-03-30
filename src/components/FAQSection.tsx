import React from 'react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "What is Elobright?",
    answer: "Elobright is an advanced English certification platform designed to provide reliable, accessible, and free online testing for learners worldwide.",
  },
  {
    question: "What types of businesses can use Passionfroot?",
    answer: "Agencies and brands looking to streamline their creator management and payment processes efficiently.",
  },
  {
    question: "Freelancers looking to monetize their skills.",
    answer: "We provide tools for freelancers to showcase their expertise and connect with potential clients or students globally.",
  },
  {
    question: "Small businesses aiming to establish a subscription model.",
    answer: "Our platform supports various business models including recurring subscriptions for learning materials and club access.",
  },
  {
    question: "What types of businesses can use Passionfroot?",
    answer: "Any business that interacts with digital creators or needs an automated system for sponsorship and collaboration.",
  },
  {
    question: "Freelancers looking to monetize their skills through various offerings.",
    answer: "From courses to consultation, we help you package your knowledge into digital products.",
  },
  {
    question: "Agencies aiming to streamline client management and payment processes.",
    answer: "Integrated tools to manage multiple clients, invoices, and performance tracking in one dashboard.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full border border-blue-100 mb-6">
            Frequently Asked Questions
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
            Have questions?
          </h2>
        </div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className="group cursor-pointer py-4 border-b border-transparent hover:border-gray-100 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon Circle */}
                <div className="mt-1 flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <ChevronDown size={14} strokeWidth={3} />
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-[17px] font-bold text-slate-800 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </h3>
                  {/* Answer (Hidden by default or shown on click) */}
                  {/* <p className="text-slate-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}