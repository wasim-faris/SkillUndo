import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Matches from './pages/Matches';

import OTPVerification from './pages/OTPVerification';
import Sessions from './pages/Sessions';
import Messages from './pages/Messages';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="page-transition-wrapper"
      >
        <Routes location={location}>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/feed" replace />} />
          
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

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:user_id" element={<Profile />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/skills" element={<Skills />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
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
              fontSize:   '13.5px',
              fontWeight:  500,
              lineHeight: '1.5',
              background: 'rgba(22, 20, 35, 0.92)',
              backdropFilter: 'blur(16px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
              color:      '#e8e6f0',
              border:     '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding:    '14px 18px',
              boxShadow:  '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
              minWidth:   '320px',
              maxWidth:   '420px',
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
