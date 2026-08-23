"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ArrowRight, LayoutDashboard, ChevronDown } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Image from 'next/image';
import { ESSAY_PRACTICE_ROUTES } from '@/src/constants/essayPractice';
import { examService } from '../api/exam';
import CryptoJS from 'crypto-js';

const navLinks = [
  {
    name: 'English Test',
    href: '/sertification/english-test',
    hasDropdown: true,
    submenus: [
      { name: 'TOEFL', href: '/english-test/toefl' },
      { name: 'IELTS', href: '/english-test/ielts' },
      { name: 'Essay Practice', href: ESSAY_PRACTICE_ROUTES.start }
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [examSubmenus, setExamSubmenus] = useState<any[]>(navLinks[0].submenus || []);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');

    // Fetch exams for navigation
    examService.getAllExams(token || undefined)
      .then(data => {
        if (Array.isArray(data)) {
          const newSubmenus = data.map((exam: any) => ({
            name: exam.title, // Menggunakan title dari response (misal: "TOEFL Practice Exam 1")
            href: `/exams/${exam.id}` // Link ke /exams/[id_examnya]
          }));
          setExamSubmenus(newSubmenus);
        }
      })
      .catch(console.error);

    if (token) {
      setIsLoggedIn(true);

      try {
        const encryptedUserData = localStorage.getItem('userData');
        if (encryptedUserData) {
          const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || 'elobright_secret_key';
          const bytes = CryptoJS.AES.decrypt(encryptedUserData, secretKey);
          const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          if (user && ['admin', 'superadmin', 'reviewer', 'moderator'].includes(user.role)) {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.error('Failed to parse user role for Navbar', e);
      }
    }
  }, []);

  const dynamicNavLinks = navLinks.map(link => {
    if (link.name === 'English Test') {
      return { ...link, submenus: examSubmenus };
    }
    return link;
  });

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    // Clear exam session data
    localStorage.removeItem('examCheckpoint');
    localStorage.removeItem('currentExamSessionId');
    localStorage.removeItem('currentSectionSessionId');
    localStorage.removeItem('currentSectionEndTimeLimit');
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'userId=; path=/; max-age=0; SameSite=Lax';
    setIsLoggedIn(false);

    // Redirect to home or refresh
    router.push('/signin');
    router.refresh();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (name: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-white backdrop-blur-md transition-all">
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

      {/* Desktop Navigation Links */}
      <ul className="hidden md:flex items-center gap-8">
        {dynamicNavLinks.map((link) => (
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

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-4">
        {!isLoggedIn ? (
          <>
            <Link href="/signin">
              <Button variant="secondary">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">
                Get Access
                <ArrowRight size={18} />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={isAdmin ? "/admin/exams" : "/dashboard"}>
              <Button className="text-blue-600 hover:bg-blue-50 border border-blue-200 bg-white">
                <LayoutDashboard size={18} />
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="danger"
            >
              Logout
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu Button (Burger Icon) */}
      <div className="md:hidden flex items-center">
        <Button
          onClick={toggleMobileMenu}
          variant="ghost"
          size="icon"
          className="border-slate-100 bg-slate-50"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 md:hidden z-40
          ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="flex flex-col px-6 py-4 space-y-2">
          {dynamicNavLinks.map((link) => (
            <div key={link.name} className="flex flex-col border-b border-slate-50 last:border-none">
              {link.hasDropdown ? (
                <button
                  onClick={() => toggleDropdown(link.name)}
                  className="flex items-center justify-between py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600"
                >
                  {link.name}
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-[15px] font-medium text-slate-700 hover:text-blue-600"
                >
                  {link.name}
                </Link>
              )}

              {/* Mobile Submenu */}
              {link.hasDropdown && link.submenus && (
                <div className={`overflow-hidden transition-all duration-300 ${openDropdown === link.name ? "max-h-[500px]" : "max-h-0"}`}>
                  <div className="flex flex-col pl-4 pb-2 space-y-1">
                    {link.submenus.map((submenu, index) => (
                      <Link
                        key={index}
                        href={submenu.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 text-sm text-slate-600 hover:text-blue-600"
                      >
                        {submenu.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 pt-6 pb-4">
            {!isLoggedIn ? (
              <>
                <Link href="/signin" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full py-2.5">
                    Login
                  </Button>
                </Link>
                <Button variant="primary" className="w-full py-2.5">
                  Get Access
                  <ArrowRight size={18} />
                </Button>
              </>
            ) : (
              <>
                <Link href={isAdmin ? "/admin/exams" : "/dashboard"} className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full py-2.5 text-blue-600 border border-blue-200 hover:bg-blue-50 bg-white">
                    <LayoutDashboard size={18} />
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="danger"
                  className="w-full py-2.5"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;