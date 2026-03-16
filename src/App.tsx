import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PublicFile from './pages/PublicFile';
import Files from './pages/Dashboard/Files';
import Analytics from './pages/Dashboard/Analytics';
import Withdraw from './pages/Dashboard/Withdraw';
import Settings from './pages/Dashboard/Settings';
import AdminUsers from './pages/Admin/Users';
import AdminFiles from './pages/Admin/Files';
import AdminWithdrawals from './pages/Admin/Withdrawals';
import AdminSettings from './pages/Admin/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

import AdminOverview from './pages/Admin/Overview';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/f/:slug" element={<PublicFile />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="files" />} />
            <Route path="files" element={<Files />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index element={<Navigate to="overview" />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="files" element={<AdminFiles />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
