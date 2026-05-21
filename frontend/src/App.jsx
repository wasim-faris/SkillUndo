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
import Dashboard from './pages/Dashboard';
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
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile" element={<Profile />} />
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
      </BrowserRouter>

      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4500,
          style: {
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize:   '13.5px',
            fontWeight: 500,
            lineHeight: '1.4',
            background: 'var(--bg-secondary)',
            color:      'var(--text-primary)',
            border:     '1px solid var(--border-default)',
            borderLeft: '3px solid var(--accent-primary)',
            borderRadius:'12px',
            padding:    '13px 16px',
            boxShadow:  '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
            minWidth:   '300px',
            maxWidth:   '400px',
          },
          success: {
            duration: 3500,
            style:    { borderLeft: '3px solid var(--accent-green)' },
            iconTheme: { primary: 'var(--accent-green)', secondary: 'var(--bg-secondary)' },
          },
          error: {
            duration: 5000,
            style:    { borderLeft: '3px solid var(--accent-secondary)' },
            iconTheme: { primary: 'var(--accent-secondary)', secondary: 'var(--bg-secondary)' },
          },
        }}
      />

    </AuthProvider>
  );
}

