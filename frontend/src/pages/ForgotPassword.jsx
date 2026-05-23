import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiLightningBolt, HiMail } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useFormErrors } from '../hooks/useFormErrors';
import { forgotPassword } from '../api/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const emailRef = useRef(null);
  const {
    fieldError,
    generalError,
    setApiErrors,
    clearFieldError,
    clearAll,
  } = useFormErrors();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState('');

  const validate = () => {
    const value = email.trim();
    if (!value) return 'Email address is required.';
    if (!EMAIL_RE.test(value)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      setClientError(error);
      emailRef.current?.focus();
      toast.error('Please enter a valid email address.', { id: 'forgot-validation' });
      return;
    }

    setLoading(true);
    clearAll();

    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
      toast.success('Reset link sent. Check your email or terminal output.', { id: 'forgot-success' });
    } catch (err) {
      if (!err.response) {
        toast.error('Connection issue. Please check your network and try again.', { id: 'forgot-network' });
      } else {
        const result = setApiErrors(err);
        if (result?.fieldErrors?.email) {
          setTimeout(() => emailRef.current?.focus(), 60);
        }
        if (result?.message) {
          toast.error(result.message, { id: 'forgot-api-error' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const emailError = clientError || fieldError('email');

  return (
    <div className="auth-root">
      <div className="auth-container auth-container-compact">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="auth-form-panel auth-form-panel-full"
        >
          <div className="auth-form-inner py-4">
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
              <div
                className="w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{ background: 'var(--gradient-1)', borderRadius: '10px' }}
              >
                <HiLightningBolt style={{ color: '#fff', width: 20, height: 20 }} />
              </div>
              <span className="auth-brand-text">SkillSwap</span>
            </Link>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="auth-result"
                >
                  <div className="auth-icon-badge auth-icon-success">
                    <HiMail size={28} />
                  </div>
                  <div>
                    <h1 className="auth-title">Check your email</h1>
                    <p className="auth-subtitle auth-subtitle-tight">
                      If the address exists, a reset link was sent to <strong>{email.trim()}</strong>.
                    </p>
                  </div>

                  <div className="auth-hint">
                    In local development, Django may print the link in the backend terminal.
                    Open that token on the frontend reset page.
                  </div>

                  <div className="auth-action-stack">
                    <Button type="button" fullWidth size="lg" onClick={() => setSubmitted(false)}>
                      Send another link
                    </Button>
                    <Link to="/login" className="auth-secondary-link">
                      <HiArrowLeft /> Back to login
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="auth-title">Reset password</h1>
                  <p className="auth-subtitle">
                    Enter the email for your SkillSwap account and we will send a reset link.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="auth-form-stack">
                    <Input
                      ref={emailRef}
                      id="forgot-email"
                      label="Email address"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setClientError('');
                        clearFieldError('email');
                      }}
                      error={emailError}
                      errorId="forgot-email-error"
                      autoComplete="email"
                    />

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

                    <Button type="submit" fullWidth loading={loading} size="lg" disabled={loading}>
                      Send reset link
                      <HiArrowRight className="text-lg transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </form>

                  <div className="auth-back-row">
                    <Link to="/login" className="auth-secondary-link">
                      <HiArrowLeft /> Back to login
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="auth-footer">SkillSwap Corporation © 2026 • Crafted for Experts</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
