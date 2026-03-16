import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Files, 
  BarChart3, 
  Wallet, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings2
} from 'lucide-react';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const userLinks = [
    { to: '/dashboard/files', icon: Files, label: 'My Files' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/withdraw', icon: Wallet, label: 'Withdraw' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/files', icon: FileText, label: 'All Files' },
    { to: '/admin/withdrawals', icon: CreditCard, label: 'Withdrawals' },
    { to: '/admin/settings', icon: Settings2, label: 'Global Settings' },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <LayoutDashboard className="w-6 h-6" />
          <span>TeleShare</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {!isAdmin ? (
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-2">User Menu</p>
            <nav className="space-y-1">
              {userLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-emerald-50 text-emerald-600" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-2">Admin Panel</p>
            <nav className="space-y-1">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-50 text-blue-600" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
