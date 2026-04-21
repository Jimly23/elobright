"use client";

import { Menu, Bell, User } from 'lucide-react';

const UserHeader = () => {
  return (
    <header className="h-16 px-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500 hover:text-gray-700">
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden md:block">Welcome back, User!</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">Student</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
