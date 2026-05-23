import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiCheckCircle, HiLightningBolt, HiLockClosed } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useFormErrors } from '../hooks/useFormErrors';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const { fieldError, generalError, setApiErrors, clearAll, clearFieldError } = useFormErrors();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [clientErrors, setClientErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.new_password) {
      errs.new_password = 'Password is required.';
    } else if (form.new_password.length < 8) {
      errs.new_password = 'Password must be at least 8 characters.';
    }

    if (!form.confirm_password) {
      errs.confirm_password = 'Please confirm your password.';
    } else if (form.new_password !== form.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }

    return errs;
  };

  const focusFirstError = (errs) => {
    const first = Object.keys(errs)[0];
    if (first === 'new_password') passwordRef.current?.focus();
    if (first === 'confirm_password') confirmRef.current?.focus();
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    clearFieldError(field);
    clearFieldError(field === 'confirm_password' ? 'new_confirm_password' : field);
    clearFieldError('password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setClientErrors(errs);
      focusFirstError(errs);
      toast.error('Please fix the highlighted fields.', { id: 'reset-validation' });
      return;
    }

    setLoading(true);
    clearAll();

    try {
      await resetPassword(token, form.new_password, form.confirm_password);
      setCompleted(true);
      toast.success('Password changed successfully.', { id: 'reset-success' });
    } catch (err) {
      if (!err.response) {
        toast.error('Connection issue. Please check your network and try again.', { id: 'reset-network' });
      } else {
        const result = setApiErrors(err);
        if (result?.fieldErrors) {
          const mapped = {};
          if (result.fieldErrors.new_password) mapped.new_password = result.fieldErrors.new_password;
          if (result.fieldErrors.new_confirm_password) mapped.confirm_password = result.fieldErrors.new_confirm_password;
          if (result.fieldErrors.password) mapped.confirm_password = result.fieldErrors.password;
          if (Object.keys(mapped).length > 0) {
            setClientErrors(mapped);
            focusFirstError(mapped);
          }
        }
        if (result?.message) {
          toast.error(result.message, { id: 'reset-api-error' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordError = clientErrors.new_password || fieldError('new_password');
  const confirmError =
    clientErrors.confirm_password ||
    fieldError('confirm_password') ||
    fieldError('new_confirm_password') ||
    fieldError('password');

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
              {completed ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="auth-result"
                >
                  <div className="auth-icon-badge auth-icon-success">
                    <HiCheckCircle size={30} />
                  </div>
                  <div>
                    <h1 className="auth-title">Password updated</h1>
                    <p className="auth-subtitle auth-subtitle-tight">
                      Your SkillSwap password has been changed. Sign in with the new password.
                    </p>
                  </div>
                  <Button type="button" fullWidth size="lg" onClick={() => navigate('/login', { replace: true })}>
                    Back to login
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="auth-icon-badge auth-icon-neutral">
                    <HiLockClosed size={24} />
                  </div>
                  <h1 className="auth-title">Set new password</h1>
                  <p className="auth-subtitle">
                    Choose a new password with at least 8 characters.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="auth-form-stack">
                    <Input
                      ref={passwordRef}
                      id="reset-new-password"
                      label="New password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={form.new_password}
                      onChange={handleChange('new_password')}
                      error={passwordError}
                      errorId="reset-new-password-error"
                      autoComplete="new-password"
                    />

                    <Input
                      ref={confirmRef}
                      id="reset-confirm-password"
                      label="Confirm password"
                      type="password"
                      placeholder="Repeat new password"
                      value={form.confirm_password}
                      onChange={handleChange('confirm_password')}
                      error={confirmError}
                      errorId="reset-confirm-password-error"
                      autoComplete="new-password"
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
                      Reset password
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
