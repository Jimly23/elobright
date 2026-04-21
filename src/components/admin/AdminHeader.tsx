"use client";

import { Menu, Bell, UserCircle } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500 hover:text-gray-700">
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 hidden md:block">Admin Overview</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Administrator</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
