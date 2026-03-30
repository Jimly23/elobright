import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

// Custom X (Twitter) Icon Component
const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
  </svg>
);

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Brand & Heading Section */}
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-2">
              {/* Logo Icon */}
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
                   <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Elobright</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
              English testing for <br />
              <span className="relative inline-block mt-2">
                <span className="absolute inset-x-[-8px] inset-y-1 bg-blue-100 rounded-xl" />
                <span className="relative">everyone</span>
                {/* Eloo Tag */}
                <span className="absolute -right-8 -top-3 bg-blue-500 text-[9px] text-white px-1.5 py-0.5 rounded-md font-black shadow-sm">
                  Eloo
                </span>
              </span>
            </h2>
          </div>

          {/* Social Icons Section */}
          <div className="flex gap-3">
            {[
              { icon: <XIcon size={18} />, href: "#" },
              { icon: <Facebook size={20} fill="currentColor" />, href: "#" },
              { icon: <Linkedin size={20} fill="currentColor" />, href: "#" },
              { icon: <Instagram size={20} />, href: "#" },
            ].map((social, idx) => (
              <Link
                key={idx}
                href={social.href}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pb-16">
          <div className="flex flex-col gap-4">
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">TOEFL Test</Link>
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">English Sertification</Link>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">IELTS Test</Link>
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">English Club</Link>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">Practice Test</Link>
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">About Us</Link>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">English Level</Link>
            <Link href="#" className="text-sm font-bold text-slate-700 hover:text-blue-600">Contact</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-slate-400">
            © {currentYear} EloBright. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Term & Conditional</Link>
            <Link href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}