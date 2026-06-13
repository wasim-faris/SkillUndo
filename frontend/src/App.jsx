import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AdminRoute from './routes/AdminRoute';

import React, { Suspense } from 'react';
import PageSkeleton from './components/ui/PageSkeleton';

const Auth = React.lazy(() => import('./pages/Auth'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Skills = React.lazy(() => import('./pages/Skills'));
const Matches = React.lazy(() => import('./pages/Matches'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminSessions = React.lazy(() => import('./pages/admin/AdminSessions'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));

const OTPVerification = React.lazy(() => import('./pages/OTPVerification'));
const Sessions = React.lazy(() => import('./pages/Sessions'));
const Messages = React.lazy(() => import('./pages/Messages'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-transition-wrapper">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/matches" replace />} />

            {/* Authentication Routes (Public) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/reset-password-confirm/:token" element={<ResetPassword />} />
              <Route path="/api/v1/auth/reset-password-confirm/:token" element={<ResetPassword />} />
            </Route>

            {/* Guest-browsable Application Routes */}
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile/:user_id" element={<Profile />} />
            <Route path="/skills" element={<Skills />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/messages" element={<Messages />} />

              <Route element={<AdminRoute />}>
                <Route path="/dashboard" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="sessions" element={<AdminSessions />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/matches" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />

        <Toaster
          position="top-right"
          gutter={10}
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '13.5px',
              fontWeight: 500,
              lineHeight: '1.5',
              background: 'rgba(22, 20, 35, 0.92)',
              backdropFilter: 'blur(16px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
              color: '#e8e6f0',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '14px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
              minWidth: '320px',
              maxWidth: '420px',
            },
            success: {
              duration: 3000,
              style: {
                borderLeft: '3px solid #34d399',
              },
              iconTheme: { primary: '#34d399', secondary: 'rgba(22, 20, 35, 0.92)' },
            },
            error: {
              duration: 5000,
              style: {
                borderLeft: '3px solid #f87171',
              },
              iconTheme: { primary: '#f87171', secondary: 'rgba(22, 20, 35, 0.92)' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
