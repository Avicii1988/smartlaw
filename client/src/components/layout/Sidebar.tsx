import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderOpen, Clock, FileText,
  FileSignature, Bot, Package, Scale, LogOut, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/mandanten', icon: Users, label: 'Mandanten' },
  { to: '/dossiers', icon: FolderOpen, label: 'Dossiers' },
  { to: '/leistungen', icon: Clock, label: 'Leistungserfassung' },
  { to: '/rechnungen', icon: FileText, label: 'Rechnungen' },
  { to: '/dokumente', icon: FileSignature, label: 'Dokumente' },
  { to: '/ki-assistent', icon: Bot, label: 'KI-Assistent' },
  { to: '/pakete', icon: Package, label: 'Rechtspakete' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-[220px] min-h-screen bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#185FA5] rounded-lg flex items-center justify-center">
          <Scale size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide">LexFlow</div>
          <div className="text-[10px] text-white/50 uppercase tracking-widest">Kanzleisoftware</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-[#185FA5] text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-xs font-bold">
            {user?.vorname?.[0]}{user?.nachname?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.vorname} {user?.nachname}</div>
            <div className="text-xs text-white/40 truncate">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
        >
          <LogOut size={15} />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
