import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Clock, Settings, LogOut, Trophy } from 'lucide-react';

const UserSidebar = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Exams', href: '/dashboard/exams', icon: BookOpen },
    { name: 'Scores', href: '/dashboard/scores', icon: Trophy },
    { name: 'History', href: '/dashboard/history', icon: Clock },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-full">
      <div className="flex items-center justify-center h-16 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight text-blue-600">User Panel</span>
      </div>
      
      <div className="flex flex-col flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-red-500 hover:bg-red-50">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default UserSidebar;
