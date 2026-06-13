import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { hasGoogleClientId } from '../../utils/googleAuth';

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const goToAuth = (path, state = {}) => {
    onClose?.();
    navigate(path, { state });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 px-3 py-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        className="card-premium w-full max-w-[26rem] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-5 py-4">
          <div>
            <h2 id="login-modal-title" className="text-lg font-black text-[var(--text-primary)]">
              Login to Continue
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              Create an account to send swap requests and connect with other learners.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label="Close login modal"
          >
            <HiX size={18} />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <button
            type="button"
            onClick={() => goToAuth('/login', { preferGoogle: true })}
            disabled={!hasGoogleClientId}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span className="h-4 w-4 rounded-full bg-[conic-gradient(from_45deg,#4285F4,#34A853,#FBBC05,#EA4335,#4285F4)]" />
            Continue with Google
          </button>
          <button type="button" onClick={() => goToAuth('/login')} className="btn-primary w-full py-3">
            Login
          </button>
          <button type="button" onClick={() => goToAuth('/register')} className="btn-ghost w-full py-3">
            Sign Up
          </button>
        </div>
      </motion.div>
    </div>
  );
}
