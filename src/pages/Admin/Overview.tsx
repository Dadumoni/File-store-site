import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Users, FileText, Eye, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalViews: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    });
    const unsubFiles = onSnapshot(collection(db, 'files'), (snap) => {
      setStats(prev => ({ ...prev, totalFiles: snap.size }));
    });
    const unsubWD = onSnapshot(query(collection(db, 'withdrawals'), where('status', '==', 'pending')), (snap) => {
      setStats(prev => ({ ...prev, pendingWithdrawals: snap.size }));
    });

    setLoading(false);
    return () => {
      unsubUsers();
      unsubFiles();
      unsubWD();
    };
  }, []);

  const data = [
    { name: 'Mon', users: 40, files: 24 },
    { name: 'Tue', users: 30, files: 13 },
    { name: 'Wed', users: 20, files: 98 },
    { name: 'Thu', users: 27, files: 39 },
    { name: 'Fri', users: 18, files: 48 },
    { name: 'Sat', users: 23, files: 38 },
    { name: 'Sun', users: 34, files: 43 },
  ];

  const cards = [
    { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Files', value: formatNumber(stats.totalFiles), icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Views', value: '12.4K', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Payouts', value: formatNumber(stats.pendingWithdrawals), icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Overview</h1>
        <p className="text-sm text-neutral-500">Platform performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <p className="text-sm text-neutral-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold">Growth Analytics</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-neutral-500 font-medium">New Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-neutral-500 font-medium">Uploads</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
              <Area type="monotone" dataKey="files" stroke="#10b981" fillOpacity={1} fill="url(#colorFiles)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
