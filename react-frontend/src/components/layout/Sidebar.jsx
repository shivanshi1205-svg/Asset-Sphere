import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Laptop, 
  Key, 
  Keyboard, 
  Package, 
  Cpu, 
  Users, 
  Settings, 
  LogOut,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Assets', href: '/assets', icon: Laptop },
    { name: 'Licenses', href: '/licenses', icon: Key },
    { name: 'Accessories', href: '/accessories', icon: Keyboard },
    { name: 'Consumables', href: '/consumables', icon: Package },
    { name: 'Components', href: '/components', icon: Cpu },
    { name: 'People', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header / Brand Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/30">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-wide">
            Asset <span className="text-secondary font-medium">Sphere</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile / Logout footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user?.avatar || 'http://3.6.21.202:8000/uploads/default.png'} 
              alt={user?.name || 'User'} 
              className="h-10 w-10 rounded-full border border-slate-700 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Demo User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role || 'Super Admin'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 text-sm font-medium text-slate-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
