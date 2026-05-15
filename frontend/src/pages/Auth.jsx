import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiLightningBolt, HiChevronRight, HiArrowRight } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useFormErrors } from '../hooks/useFormErrors';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthShowcase from '../components/ui/AuthShowcase';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { fieldError, generalError, setApiErrors, clearAll } = useFormErrors();
  const [loading, setLoading] = useState(false);
  
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const isLogin = mode === 'login';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    language: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    setClientErrors({});
    clearAll();
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Please enter your full name.';
    if (!form.email.trim()) errs.email = 'Please enter your email.';
    if (!form.password) errs.password = 'Please enter a password.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';

    if (!isLogin) {
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
      if (!form.city.trim()) errs.city = 'Please enter your city.';
      if (!form.language.trim()) errs.language = 'Please enter your language.';
    }
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setClientErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    clearAll();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setClientErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.post('/api/v1/auth/login/', {
          email: form.email,
          password: form.password,
        });
        
        const tokens = response.data.data;
        localStorage.setItem('access', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);

        try {
          const profileRes = await getProfile();
          login(tokens, profileRes.data);
          toast.success('Signed in successfully');
          navigate('/feed');
        } catch {
          login(tokens, { email: form.email, name: 'User' });
          navigate('/feed');
        }
      } else {
        await api.post('/api/v1/auth/register/', {
          email: form.email,
          name: form.name,
          password: form.password,
          confirm_password: form.confirmPassword,
          city: form.city || '',
          language: form.language || '',
        });
        
        toast.success('Welcome! Please sign in.');
        setMode('login');
      }
    } catch (err) {
      setApiErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const fe = (f) => clientErrors[f] || fieldError(f);

  return (
    <div className="auth-root">

      {/* ══════════════════════════════
          LEFT PANEL — Form
      ══════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="auth-form-panel"
      >
        <div className="auth-form-inner">

          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ background: '#d97757' }}
            >
              <HiLightningBolt style={{ color: '#fff', width: 20, height: 20 }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ececec', letterSpacing: '-0.02em' }}>
              SkillSwap
            </span>
          </Link>

          {/* ── Tabs: Login / Register ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.75rem', borderBottom: '1px solid #3a3a3a' }}>
                {['login', 'register'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setMode(t)}
                    style={{
                      paddingBottom:  '0.875rem',
                      fontSize:       '0.875rem',
                      fontWeight:     600,
                      textTransform:  'capitalize',
                      letterSpacing:  '0.02em',
                      background:     'none',
                      border:         'none',
                      cursor:         'pointer',
                      color:          mode === t ? '#d97757' : '#6b6b6b',
                      position:       'relative',
                      transition:     'color 0.2s',
                    }}
                  >
                    {t}
                    {mode === t && (
                      <motion.div
                        layoutId="authTab"
                        style={{
                          position:   'absolute',
                          bottom:     0,
                          left:       0,
                          right:      0,
                          height:     '2px',
                          background: '#d97757',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <p style={{ color: '#a8a8a8', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                {isLogin ? 'Sign in to continue your journey.' : 'Start exchanging skills today.'}
              </p>

              {/* ── Form fields ── */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!isLogin && (
                  <Input
                    label="Full name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange('name')}
                    error={fe('name')}
                  />
                )}

                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  error={fe('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  error={fe('password')}
                />

                {!isLogin && (
                  <>
                    <Input
                      label="Confirm password"
                      type="password"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      error={fe('confirmPassword')}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Input
                        label="City"
                        placeholder="Your city"
                        value={form.city}
                        onChange={handleChange('city')}
                        error={fe('city')}
                      />
                      <Input
                        label="Language"
                        placeholder="Native tongue"
                        value={form.language}
                        onChange={handleChange('language')}
                        error={fe('language')}
                      />
                    </div>
                  </>
                )}

                {/* General error */}
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding:      '0.875rem 1rem',
                      background:   'rgba(244,67,54,0.08)',
                      border:       '1px solid rgba(244,67,54,0.25)',
                      borderRadius: '10px',
                      color:        '#f44336',
                      fontSize:     '0.8125rem',
                      fontWeight:   500,
                      textAlign:    'center',
                    }}
                  >
                    {generalError}
                  </motion.div>
                )}

                {/* Submit */}
                <div style={{ paddingTop: '0.5rem' }}>
                  <Button type="submit" fullWidth loading={loading} size="lg">
                    {isLogin ? 'Sign In' : 'Get Started'} <HiArrowRight style={{ marginLeft: 8 }} />
                  </Button>
                </div>
              </form>

              {/* ── Toggle + Forgot ── */}
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: '#6b6b6b', fontSize: '0.8125rem' }}>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={() => setMode(isLogin ? 'register' : 'login')}
                    style={{
                      marginLeft:  '0.4rem',
                      color:       '#d97757',
                      fontWeight:  600,
                      background:  'none',
                      border:      'none',
                      cursor:      'pointer',
                      fontSize:    '0.8125rem',
                    }}
                  >
                    {isLogin ? 'Join now' : 'Sign in'}
                  </button>
                </p>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    style={{ color: '#6b6b6b', fontSize: '0.8125rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#d97757'}
                    onMouseLeave={(e) => e.target.style.color = '#6b6b6b'}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <p style={{ marginTop: '2.5rem', color: '#3a3a3a', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            SkillSwap Corporation © 2026 • Crafted for Experts
          </p>
        </div>
      </motion.div>

      {/* ══════════════════════════════
          RIGHT PANEL — AuthShowcase
      ══════════════════════════════ */}
      <AuthShowcase />
    </div>
  );
}
