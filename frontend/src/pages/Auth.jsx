import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiLightningBolt, HiChevronRight, HiArrowRight } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useFormErrors } from '../hooks/useFormErrors';
import { useAuth } from '../context/AuthContext';
import { getProfile, googleLogin } from '../api/auth';
import { getLandingPath } from '../utils/admin';
import { hasGoogleClientId } from '../utils/googleAuth';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthShowcase from '../components/ui/AuthShowcase';

/* ─── email regex (RFC-5322 lite) ─────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  name: (v, isLogin) => (!isLogin && !v.trim() ? 'Full name is required.' : ''),
  email: (v) => {
    if (!v.trim()) return 'Email address is required.';
    if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    return '';
  },
  confirmPassword: (v, isLogin, formPass) =>
    !isLogin && v !== formPass ? 'Passwords do not match.' : '',
};

function GoogleLogoIcon({ loading = false }) {
  if (loading) {
    return (
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
      />
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-5 w-5 flex-shrink-0"
    >
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.23 9.23 3.64l6.9-6.9C36.01 2.77 30.49 0 24 0 14.82 0 6.92 5.27 3.16 12.97l8.02 6.22C12.96 13.14 18 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.55c0-1.61-.14-2.78-.45-4.01H24v7.59h12.66c-.26 1.89-1.49 4.71-4.28 6.62l6.6 5.12c3.95-3.64 7.12-9.03 7.12-15.32z" />
      <path fill="#FBBC05" d="M11.18 28.95A14.5 14.5 0 0 1 10.4 24c0-1.72.3-3.38.78-4.95l-8.02-6.22A24 24 0 0 0 0 24c0 3.86.92 7.5 2.56 10.72l8.62-5.77z" />
      <path fill="#34A853" d="M24 48c6.49 0 12-2.14 16-5.83l-6.6-5.12c-1.77 1.24-4.14 2.1-9.4 2.1-6 0-11.04-3.64-12.82-8.6l-8.62 5.77C6.92 42.73 14.82 48 24 48z" />
    </svg>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    fieldError, generalError,
    setApiErrors, setFieldError,
    clearAll,
  } = useFormErrors();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleAuthTimeoutRef = useRef(null);
  const [mode, setMode] = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );
  const isLogin = mode === 'login';
  const googleEnabled = hasGoogleClientId;

  // Clean up timeout on unmount
  useEffect(() => () => {
    if (googleAuthTimeoutRef.current) window.clearTimeout(googleAuthTimeoutRef.current);
  }, []);

  const clearGoogleAuthState = useCallback(() => {
    if (googleAuthTimeoutRef.current) {
      window.clearTimeout(googleAuthTimeoutRef.current);
      googleAuthTimeoutRef.current = null;
    }
    setGoogleLoading(false);
  }, []);

  // Called from the wrapper div's onClick — fires from the real user gesture
  // before Google opens the popup, so the browser trusts the subsequent popup.
  const handleGoogleWrapperClick = useCallback(() => {
    if (googleLoading) return;
    console.log('[GoogleAuth] Wrapper clicked — genuine user gesture. Setting loading state.');
    clearAll();
    setGoogleLoading(true);
    // Safety timeout: if Google never calls onSuccess/onError, reset after 60 s
    googleAuthTimeoutRef.current = window.setTimeout(() => {
      console.warn('[GoogleAuth] Timeout — Google popup never responded in 60 s.');
      clearGoogleAuthState();
      toast.error('Google sign in timed out. Please try again.', { id: 'google-timeout' });
    }, 60000);
  }, [googleLoading, clearAll, clearGoogleAuthState]);



  const handleGoogleSuccess = async ({ credential }) => {
    console.log('[GoogleAuth] onSuccess callback fired. credential present:', !!credential);

    if (!credential) {
      console.error('[GoogleAuth] onSuccess fired but credential is empty/null.');
      clearGoogleAuthState();
      toast.error('Google sign in failed. Please try again.', { id: 'google-error' });
      return;
    }

    if (googleAuthTimeoutRef.current) {
      window.clearTimeout(googleAuthTimeoutRef.current);
      googleAuthTimeoutRef.current = null;
    }

    clearAll();
    try {
      console.log('[GoogleAuth] Calling backend googleLogin API…');
      const response = await googleLogin(credential);
      const tokens = response.data.data;
      let profileData = null;

      console.log('[GoogleAuth] Backend responded with tokens. Saving to localStorage…');
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      try {
        const profileRes = await getProfile();
        profileData = profileRes.data.data;
        console.log('[GoogleAuth] Profile loaded:', profileData?.email);
      } catch (profileErr) {
        console.warn('[GoogleAuth] Could not load profile after Google login:', profileErr);
        profileData = { email: '', name: 'User' };
      }

      login(tokens, profileData);
      toast.success('Signed in with Google successfully!', { id: 'google-success' });
      navigate(getLandingPath(profileData), { replace: true });
    } catch (err) {
      console.error('[GoogleAuth] Backend error during googleLogin:', err?.response?.status, err?.message);
      if (!err.response) {
        toast.error('Network error. Please try again.', { id: 'google-network' });
      } else {
        const result = setApiErrors(err);
        if (result?.message) {
          toast.error(result.message, { id: 'google-api-error' });
        } else {
          toast.error('Google sign in failed. Please try again.', { id: 'google-api-error' });
        }
      }
    } finally {
      clearGoogleAuthState();
    }
  };

  const handleGoogleError = () => {
    console.error('[GoogleAuth] onError callback fired — Google SDK reported a failure (popup closed, blocked, or misconfigured OAuth client).');
    clearGoogleAuthState();
    toast.error('Google sign in could not be completed. Please try again.', { id: 'google-error' });
  };

  const [formState, setFormState] = useState({
    values: {
      name: '', email: '', password: '', confirmPassword: '',
      city: '', language: '', bio: '', photo: null,
    },
    touched: {},
    clientErrors: {}
  });
  const { values: form, clientErrors } = formState;
  const [showOptional, setShowOptional] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /* refs for auto-focus on server-side field errors */
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const nameRef = useRef(null);



  

  const validateField = useCallback((field, value, currentState) => {
    const fn = validators[field];
    return fn ? fn(value, isLogin, currentState.values.password) : '';
  }, [isLogin]);

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    clearAll();

    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value }
    }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFormState(prev => {
        if (!prev.touched[field]) return prev;
        const msg = validateField(field, prev.values[field], prev);
        if (prev.clientErrors[field] === msg) return prev;
        
        const nextErrors = { ...prev.clientErrors };
        if (msg) nextErrors[field] = msg;
        else delete nextErrors[field];
        
        return { ...prev, clientErrors: nextErrors };
      });
    }, 300);
  }, [clearAll, validateField]);

  const handleBlur = (field) => () => {
    setFormState(prev => {
      const msg = validateField(field, prev.values[field], prev);
      const nextErrors = { ...prev.clientErrors };
      if (msg) nextErrors[field] = msg;
      else delete nextErrors[field];
      
      return {
        ...prev,
        touched: { ...prev.touched, [field]: true },
        clientErrors: nextErrors
      };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormState(prev => ({
        ...prev,
        values: { ...prev.values, photo: file }
      }));
    }
  };

  /* ── Full-form validate on submit ────────────────────────────── */
  const validateAll = () => {
    const fields = isLogin
      ? ['email', 'password']
      : ['name', 'email', 'password', 'confirmPassword'];

    const errs = {};
    const nextTouched = {};
    fields.forEach((f) => {
      const msg = validators[f]?.(form[f] ?? '', isLogin, form.password);
      if (msg) errs[f] = msg;
      nextTouched[f] = true;
    });

    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, ...nextTouched },
      clientErrors: errs
    }));
    return errs;
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      const first = Object.keys(errs)[0];
      if (first === 'email') emailRef.current?.focus();
      else if (first === 'password') passwordRef.current?.focus();
      else if (first === 'name') nameRef.current?.focus();

      toast.error('Please fix the highlighted fields.', { id: 'validation-error' });
      return;
    }

    setLoading(true);
    clearAll();

    try {
      if (isLogin) {
        /* ── Login ─────────────────────────────────────────────── */
        const response = await api.post('/api/v1/auth/login/', {
          email: form.email,
          password: form.password,
        });

        const tokens = response.data.data;
        let firstName = 'back';
        let profileData = { email: form.email, name: 'User', is_staff: false };

        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);

        try {
          const profileRes = await getProfile();
          profileData = profileRes.data.data;
          firstName = profileData?.name?.split(' ')[0] || 'back';
        } catch {
          // If profile loading fails, keep fallback data so we still preserve login state.
        }

        login(tokens, profileData);

        /* Success → toast + navigate (browser may now offer to save password) */
        toast.success(`Welcome back, ${firstName}! 👋`, { id: 'login-success' });
        navigate(getLandingPath(profileData), { replace: true });

      } else {
        /* ── Register ──────────────────────────────────────────── */
        const formData = new FormData();
        formData.append('email', form.email);
        formData.append('name', form.name);
        formData.append('password', form.password);
        formData.append('confirm_password', form.confirmPassword);
        if (form.city) formData.append('city', form.city);
        if (form.language) formData.append('language', form.language);
        if (form.bio) formData.append('bio', form.bio);
        if (form.photo) formData.append('photo', form.photo);

        await api.post('/api/v1/auth/register/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        localStorage.setItem('pending_email', form.email);
        toast.success('Account created! Please verify your email.', { id: 'register-success' });
        navigate('/verify-otp');
      }

    } catch (err) {
      /* ── Network error ───────────────────────────────────────── */
      if (!err.response) {
        toast.error('Connection issue. Please check your network and try again.', { id: 'network-error' });
        return;
      }

      /* Parse the API error — returns { type, message?, raw?, fieldErrors? } */
      const result = setApiErrors(err);

      if (result?.type === 'credentials') {
        setFieldError('email', 'Invalid email or password.');
        setFieldError('password', 'Invalid email or password.');
        setFormState(prev => ({ ...prev, touched: { ...prev.touched, email: true, password: true } }));
        setTimeout(() => emailRef.current?.focus(), 60);
        toast.error('Invalid email or password.', { id: 'auth-error' });
      } else if (result?.fieldErrors) {
        /* Server-validated field errors (registration) — find first + toast */
        const firstField = Object.keys(result.fieldErrors)[0];
        const firstMsg = result.fieldErrors[firstField];
        if (firstField === 'email') setTimeout(() => emailRef.current?.focus(), 60);
        if (firstField === 'password') setTimeout(() => passwordRef.current?.focus(), 60);
        if (firstField === 'name') setTimeout(() => nameRef.current?.focus(), 60);
        toast.error(firstMsg || 'Please fix the errors and try again.', { id: 'field-error' });

      } else if (result?.message) {
        /* General / rate-limit errors — use the message from the return value, NOT React state */
        toast.error(result.message, { id: 'api-error' });

      } else {
        /* Absolute fallback — should never happen, but guarantees a toast always fires */
        toast.error('Unable to sign in. Please try again.', { id: 'api-error' });
      }

    } finally {
      setLoading(false);
    }
  };

  /* helper: union client + server errors — client side wins */
  const fe = (f) => clientErrors[f] || fieldError(f);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="auth-root">
      <div className="auth-container">

        {/* ══════════════════════════════
            LEFT PANEL — Form
        ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="auth-form-panel custom-scrollbar"
        >
          <div className="auth-form-inner py-4">

            {/* Brand */}
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
              <div
                className="w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{ background: 'var(--gradient-1)', borderRadius: '10px' }}
              >
                <HiLightningBolt style={{ color: '#fff', width: 20, height: 20 }} />
              </div>
              <span className="auth-brand-text">SkillUndo</span>
            </Link>

            {/* ── Tabs ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-tabs">
                  {['login', 'register'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setMode(t);
                        setShowOptional(false);
                        setFormState(prev => ({ ...prev, touched: {}, clientErrors: {} }));
                        clearAll();
                      }}
                      className={`auth-tab-btn ${mode === t ? 'active' : ''}`}
                    >
                      {t}
                      {mode === t && (
                        <motion.div
                          layoutId="authTab"
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '2px', background: 'var(--accent-primary)',
                            borderRadius: '2px',
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <p className="auth-subtitle">
                  {isLogin ? 'Sign in to continue your journey.' : 'Start exchanging skills today.'}
                </p>

                {/* ── Form ── */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  {!isLogin && (
                    <Input
                      ref={nameRef}
                      id="auth-name"
                      label="Full name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange('name')}
                      onBlur={handleBlur('name')}
                      error={fe('name')}
                      aria-invalid={!!fe('name')}
                      aria-describedby={fe('name') ? 'auth-name-error' : undefined}
                      errorId="auth-name-error"
                      autoComplete="name"
                    />
                  )}

                  <Input
                    ref={emailRef}
                    id="auth-email"
                    label="Email address"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={fe('email')}
                    aria-invalid={!!fe('email')}
                    aria-describedby={fe('email') ? 'auth-email-error' : undefined}
                    errorId="auth-email-error"
                    autoComplete="username"
                    disabled={loading}
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <label
                        htmlFor="auth-password"
                        className="min-w-0 text-xs font-semibold text-[var(--text-secondary)] ml-1 uppercase tracking-wider opacity-85"
                      >
                        Password
                      </label>

                      {isLogin && (
                        <Link
                          to="/forgot-password"
                          className="auth-forgot-link shrink-0 whitespace-nowrap text-right text-[11px] sm:text-xs"
                        >
                          Forgot Password?
                        </Link>
                      )}
                    </div>

                    <Input
                      ref={passwordRef}
                      id="auth-password"
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={fe('password')}
                      aria-invalid={!!fe('password')}
                      aria-describedby={fe('password') ? 'auth-password-error' : undefined}
                      errorId="auth-password-error"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      disabled={loading}
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <Input
                        id="auth-confirm-password"
                        label="Confirm password"
                        type="password"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        error={fe('confirmPassword')}
                        aria-invalid={!!fe('confirmPassword')}
                        aria-describedby={fe('confirmPassword') ? 'auth-confirm-password-error' : undefined}
                        errorId="auth-confirm-password-error"
                        autoComplete="new-password"
                      />

                      <div className="pt-2 border-t border-[var(--border-default)] mt-2">
                        <button
                          type="button"
                          onClick={() => setShowOptional(!showOptional)}
                          className="flex items-center justify-between w-full text-[var(--text-primary)] text-sm font-semibold hover:text-[var(--accent-primary)] transition-colors"
                        >
                          Optional Details (Profile)
                          <motion.div
                            animate={{ rotate: showOptional ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <HiChevronRight size={18} />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {showOptional && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4 space-y-4"
                            >
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Input
                                  label="City"
                                  placeholder="Your city"
                                  value={form.city}
                                  onChange={handleChange('city')}
                                />
                                <Input
                                  label="Language"
                                  placeholder="Native tongue"
                                  value={form.language}
                                  onChange={handleChange('language')}
                                />
                              </div>
                              <Input
                                label="Short Bio"
                                placeholder="Tell us about yourself"
                                value={form.bio}
                                onChange={handleChange('bio')}
                              />
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                  Profile Photo
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgba(124,111,247,0.1)] file:text-[var(--accent-primary)] hover:file:bg-[rgba(124,111,247,0.2)]"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}

                  {/* Inline general error (non-field, non-network) */}
                  <AnimatePresence>
                    {generalError && generalError !== '__network__' && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="auth-general-error"
                      >
                        {generalError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <div className="pt-2">
                    <Button type="submit" fullWidth loading={loading} size="lg" disabled={loading}>
                      {isLogin && loading ? 'Signing In...' : isLogin ? 'Sign In' : 'Get Started'}
                      {!(isLogin && loading) && (
                        <HiArrowRight className="text-lg transition-transform duration-200 group-hover:translate-x-0.5" />
                      )}
                    </Button>
                  </div>

                  {isLogin && googleEnabled && (
                    <div className="mt-3 flex flex-col gap-3">
                      <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)] text-center">
                        <span className="h-px flex-1 bg-[var(--border-default)]" />
                        <span>Continue with Google</span>
                        <span className="h-px flex-1 bg-[var(--border-default)]" />
                      </div>

                      {/*
                        OVERLAY PATTERN — the only reliable way to get a real Google
                        ID token in production without modifying the backend:

                        1. Wrapper div onClick fires from the GENUINE user gesture
                           (sets loading state / starts timeout).
                        2. GoogleLogin sits in an absolutely-positioned layer, opacity
                           near-zero but still interactive, so it receives the REAL
                           pointer event that the browser trusts for popup opening.
                        3. Our custom visual button is pointer-events:none — purely
                           decorative; the user sees it but never clicks it directly.

                        Why the old hidden-button `.click()` approach failed:
                        Google's GIS SDK validates that its button was activated by a
                        trusted (non-synthetic) pointer event and silently ignores
                        programmatic `.click()` calls on production domains. Neither
                        onSuccess nor onError fires — hence the 60 s timeout.
                      */}
                      <div
                        className="relative w-full cursor-pointer"
                        onClick={handleGoogleWrapperClick}
                        role="presentation"
                      >
                        {/* Layer 1 — Google's real button (invisible but clickable) */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 z-10 overflow-hidden flex items-center justify-center"
                          style={{ opacity: 0.001 }}
                        >
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap={false}
                            width={400}
                            text="continue_with"
                            shape="rectangular"
                            theme="outline"
                            logo_alignment="center"
                          />
                        </div>

                        {/* Layer 2 — Our custom visual (pointer-events:none) */}
                        <div
                          aria-label={googleLoading ? 'Signing in with Google…' : 'Continue with Google'}
                          className="
                            pointer-events-none relative z-0
                            inline-flex w-full items-center justify-center gap-3 rounded-xl border
                            border-[rgba(17,24,39,0.1)] bg-white px-6 py-3.5 text-sm font-semibold text-slate-900
                            shadow-[0_10px_28px_rgba(15,23,42,0.16)] transition-all duration-200
                          "
                        >
                          <GoogleLogoIcon loading={googleLoading} />
                          <span className="flex min-w-0 items-center justify-center gap-2">
                            <span className="truncate">
                              {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {googleLoading && (
                      <motion.div
                        key="google-loading-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(10,10,15,0.42)] px-4 backdrop-blur-[3px]"
                      >
                        <div className="flex w-full max-w-[22rem] flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(17,18,24,0.86)] px-6 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-[var(--accent-primary)]" />
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-white">Signing you in...</p>
                            <p className="text-sm leading-6 text-[var(--text-secondary)]">
                              Please wait while we verify your Google account.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* ── Toggle + Forgot ── */}
                <div className="auth-links-row">
                  <p className="auth-toggle-text">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      type="button"
                      onClick={() => setMode(isLogin ? 'register' : 'login')}
                      className="auth-link-btn whitespace-nowrap"
                    >
                      {isLogin ? 'Join now' : 'Sign in'}
                    </button>
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <p className="auth-footer">
              SkillUndo Corporation © 2026 • Crafted for Experts
            </p>

          </div>
        </motion.div>

        {/* ══════════════════════════════
            RIGHT PANEL — AuthShowcase
        ══════════════════════════════ */}
        <AuthShowcase />
      </div>
    </div>
  );
}
