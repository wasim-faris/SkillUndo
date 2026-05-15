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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/matches" element={<Matches />} />
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
        position="bottom-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize:   '14px',
            fontWeight: 500,
            background: '#2f2f2f',
            color:      '#ececec',
            border:     '1px solid #3a3a3a',
            borderLeft: '3px solid #d97757',
            borderRadius:'10px',
            padding:    '14px 18px',
            boxShadow:  '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            minWidth:   '300px',
            maxWidth:   '420px',
          },
          success: {
            style:    { borderLeft: '3px solid #4caf50' },
            iconTheme: { primary: '#4caf50', secondary: '#2f2f2f' },
          },
          error: {
            style:    { borderLeft: '3px solid #f44336' },
            iconTheme: { primary: '#f44336', secondary: '#2f2f2f' },
          },
        }}
      />

    </AuthProvider>
  );
}

