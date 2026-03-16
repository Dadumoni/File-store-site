import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrorHandler';
import { Wallet, ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function Withdraw() {
  const { user, userData } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWithdrawals(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'withdrawals');
    });

    return () => unsubscribe();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > userData.balance) {
      setError('Insufficient balance.');
      return;
    }

    if (withdrawAmount < 100) {
      setError('Minimum withdrawal is ₹100.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: withdrawAmount,
        method,
        address,
        status: 'pending',
        requestedAt: serverTimestamp(),
      });
      setSuccess('Withdrawal request submitted successfully!');
      setAmount('');
      setAddress('');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'withdrawals');
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Withdraw Funds</h1>
        <p className="text-sm text-neutral-500">Cash out your earnings to your preferred method.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-neutral-400 text-sm font-medium mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold mb-6">{formatCurrency(userData?.balance || 0)}</h2>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                <span>+₹42.50 today</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Request Withdrawal
            </h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Min. ₹100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                  <option value="Crypto">Crypto (USDT-TRC20)</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">UPI ID / Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your payment details"
                />
              </div>

              {error && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
              {success && <p className="text-emerald-600 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold">Withdrawal History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {withdrawals.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No withdrawal history yet.</td></tr>
                  ) : withdrawals.map((wd) => (
                    <tr key={wd.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-neutral-500">{wd.requestedAt?.toDate().toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900">{formatCurrency(wd.amount)}</td>
                      <td className="px-6 py-4 text-neutral-600">{wd.method}</td>
                      <td className="px-6 py-4">{getStatusBadge(wd.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
