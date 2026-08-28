"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FileText, LogOut, ListChecks, Award } from 'lucide-react';
import Cookies from 'js-cookie';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ isOpen = false, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Kelola Ujian', href: '/admin/exams', icon: FileText },
    { name: 'Kelola Pengguna', href: '/admin/users', icon: Users },
  ];

  const certificationLinks = [
    { name: 'Definisi Nilai', href: '/admin/score-definitions', icon: ListChecks },
    { name: 'Sertifikasi', href: '/admin/certification', icon: Award },
  ];

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userData');
    Cookies.remove('userId');
    router.push('/signin');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full text-slate-300 transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight text-white">Panel Admin</span>
        </div>
        
        <div className="flex flex-col flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Manajemen</p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {link.name}
              </Link>
            );
          })}

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Sertifikasi</p>
          {certificationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
