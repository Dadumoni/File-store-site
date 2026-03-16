import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function Navbar() {
  const { userData } = useAuth();

  return (
    <header className="h-16 border-b border-neutral-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-neutral-500 font-medium">Balance</span>
          <span className="text-sm font-bold text-emerald-600">{formatCurrency(userData?.balance || 0)}</span>
        </div>
        
        <button className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-neutral-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-neutral-900">{userData?.username}</p>
            <p className="text-xs text-neutral-500">ID: {userData?.userId}</p>
          </div>
          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 border border-neutral-200">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
