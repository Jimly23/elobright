import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans relative">
      {/* Left Side: Mascot and Branding */}
      <div className="w-full lg:w-1/2 bg-[#fcfcfc] border-r border-slate-100 hidden md:flex flex-col items-center justify-between p-10 lg:p-16 min-h-[50vh] lg:min-h-screen">
        
        {/* Top: Logo */}
        <Link href={'/'} className="mt-8 lg:mt-12">
          <div className='flex items-center gap-x-4'>
            <Image src={'/logo/logo-icon.jpg'} width={150} height={150} alt='logo' className='w-16 md:w-20 mix-blend-multiply' />
            <h2 className='text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 tracking-wide'>Elobright</h2>
          </div>
        </Link>

        {/* Middle: Mascot */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 my-8">
          <Image
            src="/logo/maskot.png"
            alt="Eloo Mascot"
            fill
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Bottom: Copywriting (Preserved) */}
        <div className="text-center max-w-sm mb-8 lg:mb-12">
          <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500 mb-3">
            English testing for everyone
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Welcome to Elobright (Eloo). Prepare yourself for the future and join thousands of other learners.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 bg-white flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-20">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
