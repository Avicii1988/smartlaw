import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

interface TopbarProps { title: string; subtitle?: string; }

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuthStore();
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-xs font-bold text-white">
            {user?.vorname?.[0]}{user?.nachname?.[0]}
          </div>
          <span className="text-sm text-gray-700 font-medium hidden sm:block">{user?.vorname} {user?.nachname}</span>
        </div>
      </div>
    </header>
  );
}
