
import Image from 'next/image';
import { BookOpen, Headphones, PenTool, Mic2 } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const testSections = [
    { icon: <BookOpen size={24} />, title: 'Reading', duration: '20 mins' },
    { icon: <Headphones size={24} />, title: 'Listening', duration: '20 mins' },
    { icon: <PenTool size={24} />, title: 'Writing', duration: '35 mins' },
    { icon: <Mic2 size={24} />, title: 'Speaking', duration: '15 mins' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Layer: Gradient & Grid */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="relative top-0 bottom-0 bg-gradient-to-b from-blue-50/50 to-white" />

        <div className="relative h-full w-full bg-gradient-to-t from-blue-300 to-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(147,197,253,0.3)_100%)]" />
        </div>
      </div>

      {/* Header / Logo (Konsisten dengan halaman lain) */}
      <header className="absolute top-8 left-8 z-20">
        <div className="w-10 h-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Image src={'/logo/logo-icon.jpg'} width={100} height={100} alt='logo' className='w-10' />
        </div>
      </header>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-[20px] shadow-2xl shadow-blue-200/50 overflow-hidden mx-6">
        
        {/* Card Header: Sky Image & Text */}
        <div className="h-48 bg-gradient-to-b from-blue-200 to-white relative flex flex-col items-center justify-end pb-4">
           {/* Simulasi Awan (Bisa diganti dengan file image awan asli Anda) */}
           <div 
             className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]"
             style={{ backgroundRepeat: 'repeat-x', backgroundPosition: 'center' }}
           />
           <h1 className="text-5xl font-bold text-slate-900 relative z-10 leading-tight">
             Welcome
           </h1>
           <p className="text-slate-500 font-medium mt-2 relative z-10">
             You are about to start the test
           </p>
        </div>

        {/* Card Content Area */}
        <div className="p-10">
          
          {/* Test Icons Grid */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {testSections.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-400 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 transition-all hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-[10px] md:text-xs mt-1">
                  {item.duration}
                </p>
              </div>
            ))}
          </div>

          {/* Instructions List (Bullet Points) */}
          <ul className="space-y-5 text-slate-600 text-[13px] leading-relaxed mb-12">
            {[
              "Check you will have enough time to complete the whole test before you begin. Once you begin the test, you cannot pause the timer or restart the test. You can take very short breaks between test sections if needed. These breaks are also timed.",
              "You can only take the test once. You cannot repeat the test to practice.",
              "If your internet connection isn't stable, you may not be able to complete the test. Partial tests are not saved.",
              "You will not lose points for wrong answers.",
              "Once you submit an exercise, you cannot go back."
            ].map((text, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full flex-shrink-0" />
                <span className='-mt-2 text-sm'>{text}</span>
              </li>
            ))}
          </ul>

          <Link href="/english-test/toefl/reading">
            <button className="w-full py-4.5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] focus:ring-4 focus:ring-blue-200 outline-none">
              Continue
            </button>
          </Link>
        </div>
      </div>

      {/* Floating Footer Copyright */}
      <footer className="relative z-10 mt-10 py-2.5 px-8 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm mb-10">
        <p className="text-slate-400 text-xs font-medium">
          © 2026 Elobright. All rights reserved.
        </p>
      </footer>
    </div>
  );
}