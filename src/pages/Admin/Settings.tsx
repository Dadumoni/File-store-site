import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Settings2, Save, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        // Initial settings if not exist
        setSettings({
          minWithdrawal: 100,
          rewardPerView: 0.05,
          botToken: '',
          maintenanceMode: false,
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Global Settings</h1>
        <p className="text-sm text-neutral-500">Configure platform-wide parameters and maintenance.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Reward Per View (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.rewardPerView}
                onChange={(e) => setSettings({...settings, rewardPerView: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Minimum Withdrawal (₹)</label>
              <input
                type="number"
                required
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({...settings, minWithdrawal: parseInt(e.target.value)})}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Telegram Bot Token</label>
            <input
              type="password"
              value={settings.botToken}
              onChange={(e) => setSettings({...settings, botToken: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your bot token"
            />
            <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> This token is used for Telegram API integrations.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-bold text-orange-900">Maintenance Mode</p>
                  <p className="text-xs text-orange-700">When enabled, users will see a maintenance screen.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-orange-600' : 'bg-neutral-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
