import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-white flex flex-col font-sans p-5 lg:p-10 lg:overflow-hidden overflow-auto relative">
      <Link href={'/'}>
        <div className='absolute left-10 top-10 flex items-center gap-x-2'>
          <Image src={'/logo/logo-icon.jpg'} width={100} height={100} alt='logo' className='w-10' />
          <h2 className='text-xl  font-medium text-slate-600'>Elobright</h2>
        </div>
      </Link>
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-20 gap-16 lg:gap-24">
        {/* Left Side: Form Content (from page) */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Right Side: Illustration Card */}
        <div className="hidden lg:block w-full max-w-[500px]">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-blue-50 to-blue-100 rounded-[40px] overflow-hidden flex flex-col items-center justify-center p-12">
            {/* Blue Glow Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/20 blur-[100px] rounded-full" />

            <div className="relative z-10 text-center mb-12">
              <h2 className="text-[44px] font-bold text-slate-900 leading-[1.1]">
                English testing <br /> for <span className="relative">
                  everyone
                  {/* Blue Badge "Eloo" */}
                  <div className="absolute -right-10 -top-2 bg-blue-500 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg">
                    Eloo
                  </div>
                </span>
              </h2>
            </div>

            {/* Mascot Image */}
            <div className="relative z-10 w-full h-64">
              <Image
                src="/logo/maskot.png"
                alt="Eloo Mascot"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 flex flex-col md:flex-row items-center justify-center gap-6 text-[13px] text-slate-400 font-medium">
        <p>© 2026 Elobright. All rights reserved</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors">
          <span>English</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </footer>
    </div>
  );
}
