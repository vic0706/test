import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Timer, Settings, Bike } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
          <Bike size={24} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-tight text-gray-900 tracking-wide">
            睿睿滑步車
          </h1>
          <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">
            LOUIE RACING
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center max-w-3xl mx-auto">
          <NavItem to="/" icon={<LayoutDashboard size={22} />} label="儀表板" />
          <NavItem to="/races" icon={<Trophy size={22} />} label="賽事" />
          <NavItem to="/training" icon={<Timer size={22} />} label="訓練" />
          <NavItem to="/settings" icon={<Settings size={22} />} label="設定" />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center py-3 px-2 w-full transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`
    }
  >
    <div className="mb-1">{icon}</div>
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

export default Layout;