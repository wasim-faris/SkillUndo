import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation }           from 'react-router-dom';
import { HiLightningBolt, HiChevronRight, HiArrowRight } from 'react-icons/hi';
import { motion, AnimatePresence }                   from 'framer-motion';
import toast                                         from 'react-hot-toast';
import { useFormErrors }                             from '../hooks/useFormErrors';
import { useAuth }                                   from '../context/AuthContext';
import { getProfile }                                from '../api/auth';
import api                                           from '../api/axios';
import Input                                         from '../components/ui/Input';
import Button                                        from '../components/ui/Button';
import AuthShowcase                                  from '../components/ui/AuthShowcase';

/* ─── email regex (RFC-5322 lite) ─────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const {
    fieldError, generalError,
    setApiErrors, setFieldError,
    clearAll, setGeneralError,
  } = useFormErrors();

  const [loading, setLoading]           = useState(false);
  const [mode, setMode]                 = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );
  const isLogin = mode === 'login';

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    city: '', language: '', bio: '', photo: null,
  });

  /* touched tracks which fields the user has interacted with */
  const [touched,       setTouched]       = useState({});
  const [clientErrors,  setClientErrors]  = useState({});
  const [showOptional,  setShowOptional]  = useState(false);

  /* refs for auto-focus on server-side field errors */
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const nameRef     = useRef(null);

  /* reset everything on mode switch */
  useEffect(() => {
    setClientErrors({});
    setTouched({});
    clearAll();
  }, [mode]);                        // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Real-time per-field validators ─────────────────────────── */
  const validators = {
    name:            (v) => (!isLogin && !v.trim() ? 'Full name is required.' : ''),
    email:           (v) => {
      if (!v.trim())          return 'Email address is required.';
      if (!EMAIL_RE.test(v))  return 'Please enter a valid email address.';
      return '';
    },
    password:        (v) => {
      if (!v)        return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      return '';
    },
    confirmPassword: (v) =>
      !isLogin && v !== form.password ? 'Passwords do not match.' : '',
  };

  /* run a single field validator and push result into clientErrors */
  const validateField = useCallback((field, value) => {
    const fn  = validators[field];
    const msg = fn ? fn(value) : '';
    setClientErrors((prev) => {
      if (!msg) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: msg };
    });
    return msg;
  }, [form.password, isLogin]);  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    /* clear server-side error for this field immediately */
    clearAll();

    /* only show inline error if the field was already touched */
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field] ?? '');
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setForm((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  /* ── Full-form validate on submit ────────────────────────────── */
  const validateAll = () => {
    const fields = isLogin
      ? ['email', 'password']
      : ['name', 'email', 'password', 'confirmPassword'];

    const errs = {};
    fields.forEach((f) => {
      const msg = validators[f]?.(form[f] ?? '');
      if (msg) errs[f] = msg;
    });

    /* mark all required fields as touched */
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    setClientErrors(errs);
    return errs;
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      const first = Object.keys(errs)[0];
      if      (first === 'email')    emailRef.current?.focus();
      else if (first === 'password') passwordRef.current?.focus();
      else if (first === 'name')     nameRef.current?.focus();

      toast.error('Please fix the highlighted fields.', { id: 'validation-error' });
      return;
    }

    setLoading(true);
    clearAll();

    try {
      if (isLogin) {
        /* ── Login ─────────────────────────────────────────────── */
        const response = await api.post('/api/v1/auth/login/', {
          email:    form.email,
          password: form.password,
        });

        const tokens = response.data.data;
        let firstName = 'back';

        try {
          const profileRes  = await getProfile();
          const profileData = profileRes.data.data;
          firstName = profileData?.name?.split(' ')[0] || 'back';
          login(tokens, profileData);
        } catch {
          login(tokens, { email: form.email, name: 'User' });
        }

        /* Success → toast + navigate (browser may now offer to save password) */
        toast.success(`Welcome back, ${firstName}! 👋`, { id: 'login-success' });
        navigate('/feed');

      } else {
        /* ── Register ──────────────────────────────────────────── */
        const formData = new FormData();
        formData.append('email',            form.email);
        formData.append('name',             form.name);
        formData.append('password',         form.password);
        formData.append('confirm_password', form.confirmPassword);
        if (form.city)     formData.append('city',     form.city);
        if (form.language) formData.append('language', form.language);
        if (form.bio)      formData.append('bio',      form.bio);
        if (form.photo)    formData.append('photo',    form.photo);

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
        setTouched((prev) => ({ ...prev, email: true, password: true }));
        setTimeout(() => emailRef.current?.focus(), 60);
        toast.error('Invalid email or password.', { id: 'auth-error' });
      } else if (result?.fieldErrors) {
        /* Server-validated field errors (registration) — find first + toast */
        const firstField = Object.keys(result.fieldErrors)[0];
        const firstMsg   = result.fieldErrors[firstField];
        if (firstField === 'email')    setTimeout(() => emailRef.current?.focus(), 60);
        if (firstField === 'password') setTimeout(() => passwordRef.current?.focus(), 60);
        if (firstField === 'name')     setTimeout(() => nameRef.current?.focus(), 60);
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
                      onClick={() => { setMode(t); setShowOptional(false); }}
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
                  />

                  <Input
                    ref={passwordRef}
                    id="auth-password"
                    label="Password"
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
                  />

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
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{    opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="auth-general-error"
                      >
                        {generalError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <div style={{ paddingTop: '0.5rem' }}>
                    <Button type="submit" fullWidth loading={loading} size="lg" disabled={loading}>
                      {isLogin ? 'Sign In' : 'Get Started'}
                      <HiArrowRight className="text-lg transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </form>

                {/* ── Toggle + Forgot ── */}
                <div className="auth-links-row">
                  <p className="auth-toggle-text">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      type="button"
                      onClick={() => setMode(isLogin ? 'register' : 'login')}
                      className="auth-link-btn"
                    >
                      {isLogin ? 'Join now' : 'Sign in'}
                    </button>
                  </p>
                  {isLogin && (
                    <Link to="/forgot-password" className="auth-forgot-link">
                      Forgot password?
                    </Link>
                  )}
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
