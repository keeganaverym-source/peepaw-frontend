import { NavLink } from 'react-router-dom';
import { Map, Users, LayoutDashboard, Zap, Target, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Map, label: 'Map', exact: true },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pitch', icon: Zap, label: 'Pitch' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-16 bg-dark-900 border-r border-dark-700 flex flex-col items-center py-4 gap-2 z-10">
      {/* Logo */}
      <div className="mb-4 flex flex-col items-center">
        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Target size={18} className="text-accent" />
        </div>
      </div>

      {/* Nav Items */}
      {navItems.map(({ to, icon: Icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            `w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative
            ${isActive
              ? 'bg-accent/15 text-accent border border-accent/30 shadow-glow-sm'
              : 'text-gray-500 hover:text-gray-300 hover:bg-dark-700'
            }`
          }
          title={label}
        >
          <Icon size={18} />
          {/* Tooltip */}
          <span className="absolute left-14 bg-dark-700 text-gray-200 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-dark-500 z-50">
            {label}
          </span>
        </NavLink>
      ))}

      {/* Bottom branding */}
      <div className="mt-auto">
        <div className="text-[9px] text-gray-600 font-mono text-center leading-tight">
          <div className="text-accent/50">PP</div>
          <div>v1.0</div>
        </div>
      </div>
    </aside>
  );
}
