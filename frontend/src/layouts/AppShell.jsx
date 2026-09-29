import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Map as MapIcon,
  FileText,
  BarChart3,
  User,
  LogOut,
  Plus,
  Users,
  Building2,
  Megaphone,
  ShieldCheck,
  Settings as SettingsIcon,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { logout } from '../redux/slices/authSlice';
import { NotificationBell } from '../components/NotificationBell';

const ICONS = {
  dashboard: LayoutDashboard,
  map: MapIcon,
  complaints: FileText,
  analytics: BarChart3,
  profile: User,
  report: Plus,
  users: Users,
  departments: Building2,
  announcements: Megaphone,
  audit: ShieldCheck,
  settings: SettingsIcon,
};

const NAV_BY_ROLE = {
  citizen: [
    { key: 'dashboard', label: 'Dashboard', to: '/citizen/dashboard' },
    { key: 'map', label: 'Map', to: '/citizen/map' },
    { key: 'complaints', label: 'Complaints', to: '/citizen/complaints' },
    { key: 'profile', label: 'Profile', to: '/citizen/profile' },
  ],
  authority: [
    { key: 'dashboard', label: 'Dashboard', to: '/authority/dashboard' },
    { key: 'map', label: 'Map', to: '/authority/map' },
    { key: 'complaints', label: 'Assigned', to: '/authority/complaints' },
    { key: 'analytics', label: 'Analytics', to: '/authority/analytics' },
    { key: 'profile', label: 'Profile', to: '/authority/profile' },
  ],
  admin: [
    { key: 'dashboard', label: 'Command Center', to: '/admin/dashboard' },
    { key: 'complaints', label: 'Complaints', to: '/admin/complaints' },
    { key: 'users', label: 'Users', to: '/admin/users' },
    { key: 'departments', label: 'Departments', to: '/admin/departments' },
    { key: 'analytics', label: 'Analytics', to: '/admin/analytics' },
    { key: 'announcements', label: 'Announcements', to: '/admin/announcements' },
    { key: 'audit', label: 'Audit Logs', to: '/admin/audit-logs' },
    { key: 'settings', label: 'Settings', to: '/admin/settings' },
  ],
};

// Mobile bottom nav is intentionally shorter per spec: Home, Map, Report, Complaints, Profile.
const MOBILE_NAV_BY_ROLE = {
  citizen: [
    { key: 'dashboard', label: 'Home', to: '/citizen/dashboard' },
    { key: 'map', label: 'Map', to: '/citizen/map' },
    { key: 'report', label: 'Report', to: '/citizen/report', highlight: true },
    { key: 'complaints', label: 'Complaints', to: '/citizen/complaints' },
    { key: 'profile', label: 'Profile', to: '/citizen/profile' },
  ],
  authority: [
    { key: 'dashboard', label: 'Home', to: '/authority/dashboard' },
    { key: 'map', label: 'Map', to: '/authority/map' },
    { key: 'complaints', label: 'Assigned', to: '/authority/complaints' },
    { key: 'analytics', label: 'Stats', to: '/authority/analytics' },
    { key: 'profile', label: 'Profile', to: '/authority/profile' },
  ],
  admin: [
    { key: 'dashboard', label: 'Home', to: '/admin/dashboard' },
    { key: 'complaints', label: 'Complaints', to: '/admin/complaints' },
    { key: 'users', label: 'Users', to: '/admin/users' },
    { key: 'analytics', label: 'Stats', to: '/admin/analytics' },
    { key: 'settings', label: 'Settings', to: '/admin/settings' },
  ],
};

export const AppShell = () => {
  const { user, role } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useSocket();

  const desktopNav = NAV_BY_ROLE[role] || [];
  const mobileNav = MOBILE_NAV_BY_ROLE[role] || [];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* -------- Desktop sidebar -------- */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-stone-200 bg-surface-raised lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-char-950">
            <span className="font-display text-sm font-semibold text-mint-200">N</span>
          </div>
          <span className="font-display text-lg font-medium text-char-950">NagarSetu</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {desktopNav.map((item) => {
            const Icon = ICONS[item.key];
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-char-700 hover:bg-stone-100'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {role === 'citizen' && (
          <div className="px-3 pb-3">
            <NavLink to="/citizen/report" className="btn-primary w-full">
              <Plus size={16} /> Report an Issue
            </NavLink>
          </div>
        )}

        <div className="border-t border-stone-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-mint-200 font-medium text-emerald-800">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-char-950">{user?.name}</p>
              <p className="truncate text-xs capitalize text-stone-500">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-stone-400 hover:text-rust-500" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* -------- Main column -------- */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-surface/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-char-950">
              <span className="font-display text-xs font-semibold text-mint-200">N</span>
            </div>
            <span className="font-display font-medium text-char-950">NagarSetu</span>
          </div>
          <div className="hidden lg:block" />
          <NotificationBell />
        </header>

        <main className="container-page py-6 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* -------- Mobile bottom nav -------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-stone-200 bg-surface-raised lg:hidden">
        {mobileNav.map((item) => {
          const Icon = ICONS[item.key];
          if (item.highlight) {
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className="relative -mt-5 flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-raised">
                  <Icon size={22} />
                </div>
                <span className="text-[11px] font-medium text-emerald-700">{item.label}</span>
              </NavLink>
            );
          }
          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? 'text-emerald-700' : 'text-stone-500'
                }`
              }
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
