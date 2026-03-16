import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Search, User, Ban, CheckCircle, MoreVertical, Shield } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleBan = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'users', id), { isBanned: !currentStatus });
  };

  const toggleAdmin = async (id: string, currentStatus: boolean) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'make'} this user an admin?`)) {
      await updateDoc(doc(db, 'users', id), { isAdmin: !currentStatus });
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.userId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-sm text-neutral-500">Manage all registered users and their permissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by ID or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Files</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading users...</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 border border-neutral-200">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 flex items-center gap-1">
                          {u.username}
                          {u.isAdmin && <Shield className="w-3 h-3 text-blue-600" title="Admin" />}
                        </p>
                        <p className="text-xs text-neutral-500">ID: {u.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(u.balance)}</td>
                  <td className="px-6 py-4 text-neutral-600">{formatNumber(u.totalFiles)}</td>
                  <td className="px-6 py-4 text-neutral-600">{formatNumber(u.totalViews)}</td>
                  <td className="px-6 py-4">
                    {u.isBanned ? (
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">Banned</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleAdmin(u.id, u.isAdmin)}
                        className={`p-2 rounded-lg transition-colors ${u.isAdmin ? 'text-blue-600 hover:bg-blue-50' : 'text-neutral-400 hover:bg-neutral-100'}`}
                        title={u.isAdmin ? "Remove Admin" : "Make Admin"}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleBan(u.id, u.isBanned)}
                        className={`p-2 rounded-lg transition-colors ${u.isBanned ? 'text-red-600 hover:bg-red-50' : 'text-neutral-400 hover:bg-neutral-100'}`}
                        title={u.isBanned ? "Unban User" : "Ban User"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
