import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { fetchCurrentUser } from './redux/slices/authSlice';

import { PublicLayout } from './layouts/PublicLayout';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportComplaint } from './pages/citizen/ReportComplaint';
import { MyComplaints } from './pages/citizen/MyComplaints';
import { CitizenMap } from './pages/citizen/CitizenMap';

import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';
import { AssignedComplaints } from './pages/authority/AssignedComplaints';
import { AuthorityAnalytics } from './pages/authority/AuthorityAnalytics';
import { AuthorityMap } from './pages/authority/AuthorityMap';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

import { ComplaintDetail } from './pages/shared/ComplaintDetail';
import { ProfilePage } from './pages/shared/ProfilePage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { AIDetectionPage } from './pages/shared/AIDetectionPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* -------- Public -------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* -------- Authenticated -------- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* Citizen */}
          <Route element={<RoleRoute allowed={['citizen']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportComplaint />} />
            <Route path="/citizen/complaints" element={<MyComplaints />} />
            <Route path="/citizen/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/citizen/map" element={<CitizenMap />} />
            <Route path="/citizen/ai-detection" element={<AIDetectionPage />} />
            <Route path="/citizen/profile" element={<ProfilePage />} />
          </Route>

          {/* Authority */}
          <Route element={<RoleRoute allowed={['authority']} />}>
            <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
            <Route path="/authority/complaints" element={<AssignedComplaints />} />
            <Route path="/authority/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/authority/map" element={<AuthorityMap />} />
            <Route path="/authority/analytics" element={<AuthorityAnalytics />} />
            <Route path="/authority/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allowed={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Shared across all authenticated roles */}
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
