import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { 
    name: 'English Test', 
    href: '/sertification/english-test', 
    hasDropdown: true,
    submenus: [
      { name: 'TOEFL', href: '/english-test/toefl' },
      { name: 'IELTS', href: '/english-test/ielts' }
    ]
  },
  { 
    name: 'Sertification', 
    href: '/sertification/english-test', 
    hasDropdown: true,
    submenus: [
      { name: 'English Sertification Test', href: '/sertification/english-test' },
      { name: 'English Level', href: '/sertification/english-level' }
    ]
  },
  { 
    name: 'Learning', 
    href: '/learning', 
    hasDropdown: true,
    submenus: [
      { name: 'All Courses', href: '/learning' },
      { name: 'TOEFL', href: '/learning/toefl' },
      { name: 'IELTS', href: '/learning/ielts' },
      { name: 'Grammar', href: '/learning/grammar' },
      { name: 'Vocabulary', href: '/learning/vocabulary' },
      { name: 'Speaking', href: '/learning/speaking' },
      { name: 'Reading', href: '/learning/reading' },
      { name: 'Listening', href: '/learning/listening' },
      { name: 'Writing', href: '/learning/writing' },
    ]
  },
  { name: 'English Club', href: '/english-club', hasDropdown: false },
  { name: 'About Us', href: '/about', hasDropdown: false },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md transition-all">
      {/* Logo Section */}
      <Link href="/">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center">
          {/* Ganti dengan Logo SVG Elobright Anda */}
          <Image
            src="/logo/logo-fixx.png"
            alt="Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">
          Elobright
        </span>
      </div>
      </Link>

      {/* Navigation Links */}
      <ul className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <li key={link.name} className="relative group">
            <Link 
              href={link.href}
              className="flex items-center gap-1 text-[15px] font-medium text-slate-700 hover:text-blue-600 transition-colors py-2"
            >
              {link.name}
              {link.hasDropdown && (
                <ChevronDown size={16} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              )}
            </Link>
            
            {/* Dropdown Menu */}
            {link.hasDropdown && link.submenus && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden text-sm">
                <div className="py-2">
                  {link.submenus.map((submenu, index) => (
                    <Link
                      key={index}
                      href={submenu.href}
                      className="block px-4 py-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {submenu.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link href="/signin">
          <button className="px-6 py-2 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 border border-gray-200 rounded-xl transition-all">
            Login
          </button>
        </Link>
        <button className="flex items-center gap-2 px-6 py-2 text-[15px] font-semibold text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-md shadow-blue-100 transition-all">
          Get Access
          <ArrowRight size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;