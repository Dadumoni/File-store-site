import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, XCircle, Clock, Search, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'), orderBy('requestedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWithdrawals(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (id: string, userId: string, amount: number, status: 'approved' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${status} this withdrawal?`)) {
      await updateDoc(doc(db, 'withdrawals', id), { 
        status,
        processedAt: new Date(),
      });

      if (status === 'approved') {
        // Deduct from user balance
        await updateDoc(doc(db, 'users', userId), {
          balance: increment(-amount)
        });
      }
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.userId.includes(searchTerm) || 
    w.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Withdrawal Requests</h1>
          <p className="text-sm text-neutral-500">Review and process user withdrawal requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by User ID or method..."
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
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading requests...</td></tr>
              ) : filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{w.userId}</td>
                  <td className="px-6 py-4 font-bold text-neutral-900">{formatCurrency(w.amount)}</td>
                  <td className="px-6 py-4 text-neutral-600">{w.method}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-[150px] truncate text-xs text-neutral-500" title={w.address}>
                      {w.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {w.status === 'pending' && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>}
                    {w.status === 'approved' && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                    {w.status === 'rejected' && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAction(w.id, w.userId, w.amount, 'approved')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(w.id, w.userId, w.amount, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
