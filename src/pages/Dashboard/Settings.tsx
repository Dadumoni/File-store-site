import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { User, Lock, Shield, Bell, Copy, Check } from 'lucide-react';

export default function Settings() {
  const { userData, user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      // Also update in Firestore for our custom auth logic
      await updateDoc(doc(db, 'users', user!.uid), { password: newPassword });
      setSuccess('Password updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `User ID: ${userData?.userId}\nPassword: ${userData?.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Account Settings</h1>
        <p className="text-sm text-neutral-500">Manage your profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 border-4 border-white shadow-sm">
              <User className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-lg">{userData?.username}</h3>
            <p className="text-sm text-neutral-500 mb-4">Telegram ID: {userData?.userId}</p>
            <button 
              onClick={copyCredentials}
              className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mx-auto hover:bg-emerald-100 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Credentials'}
            </button>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-neutral-900 text-white shadow-md">
              <Shield className="w-5 h-5" /> Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all">
              <Bell className="w-5 h-5" /> Notifications
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-neutral-400" />
              Change Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Min. 8 characters"
                />
              </div>
              {success && <p className="text-emerald-600 text-sm font-medium">{success}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
            <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-all shadow-md">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
