import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Get Page Title from Path
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    if (path === 'users') return 'People';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Click outside handlers to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Asset Checkout Request', desc: 'Awdhesh Soni requested Apple MacBook Pro 14"', time: '5m ago', read: false },
    { id: 2, title: 'License Expiration Alert', desc: 'Adobe Creative Cloud expires in 30 days', time: '2h ago', read: false },
    { id: 3, title: 'Low Stock Warning', desc: 'HP Wireless Mouse is below the minimum threshold (12 remaining)', time: '1d ago', read: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      {/* Title & Menu Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="font-display text-lg font-semibold text-slate-800 lg:text-xl">
          {getPageTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input - Desktop */}
        <div className="relative hidden max-w-xs md:block">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-56 rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-2 shadow-premium ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-slate-800">Notifications</span>
                <span className="text-xs text-primary font-medium hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto mt-2">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${!notif.read ? 'text-primary' : 'text-slate-700'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <img
              src={user?.avatar || 'http://3.6.21.202:8000/uploads/default.png'}
              alt={user?.name || 'User'}
              className="h-7 w-7 rounded-lg object-cover border border-slate-100"
            />
            <span className="hidden text-sm font-medium md:block truncate max-w-[100px]">
              {user?.name?.split(' ')[0] || 'Demo'}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-premium ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-medium text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.email || 'demo@example.com'}</p>
              </div>
              <button
                onClick={() => setProfileDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setProfileDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>Account Settings</span>
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
