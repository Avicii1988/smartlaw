import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useSidebar } from './SidebarContext';

interface TopbarProps { title: string; subtitle?: string; }

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const { toggle } = useSidebar();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = `${user?.vorname?.[0] ?? ''}${user?.nachname?.[0] ?? ''}`;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-20">
      <button
        onClick={toggle}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 truncate hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
        </button>

        {/* Account dropdown */}
        <div className="relative pl-2 border-l border-gray-100" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm text-gray-700 font-medium hidden sm:block">{user?.vorname} {user?.nachname}</span>
            <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {/* Header */}
              <div className="px-4 py-4 bg-gradient-to-br from-[#0f172a] to-[#185FA5]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{user?.vorname} {user?.nachname}</p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Stundenansatz</p>
                <p className="text-sm font-semibold text-gray-900">CHF {user?.stundenansatz ?? 250}.–/h</p>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <User size={15} className="text-gray-400" />
                  Profil bearbeiten
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <Settings size={15} className="text-gray-400" />
                  Einstellungen
                </button>
              </div>
              <div className="p-2 border-t border-gray-50">
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <LogOut size={15} />
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
