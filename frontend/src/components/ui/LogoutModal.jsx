import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiLogout } from 'react-icons/hi';

/**
 * LogoutModal — two-phase UX:
 *   Phase 1: Confirmation dialog ("Sign Out?" with Cancel / Sign Out buttons)
 *   Phase 2: Loading overlay ("Signing you out…") while logout completes
 *
 * Props:
 *   onCancel  () => void   — close modal without logging out
 *   onConfirm () => Promise<void> — async logout action; overlay shown until it resolves
 */
export default function LogoutModal({ onCancel, onConfirm }) {
  const [phase, setPhase] = useState('confirm'); // 'confirm' | 'loading'

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key closes confirmation phase only (not loading phase)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && phase === 'confirm') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [phase, onCancel]);

  const handleConfirm = async () => {
    setPhase('loading');
    try {
      await onConfirm();
    } catch {
      // onConfirm handles its own error toasts; just reset to confirm on failure
      setPhase('confirm');
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="logout-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={phase === 'confirm' ? onCancel : undefined}
        aria-modal="true"
        role="dialog"
        aria-label={phase === 'confirm' ? 'Sign out confirmation' : 'Signing out'}
      >
        <AnimatePresence mode="wait">
          {phase === 'confirm' ? (
            /* ── Confirmation card ── */
            <motion.div
              key="confirm-card"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="card-premium w-full max-w-[min(95vw,24rem)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <HiLogout size={17} className="text-red-400" />
                  </div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Sign Out?</h2>
                </div>
                <button
                  id="logout-modal-close"
                  type="button"
                  onClick={onCancel}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all hover:text-[var(--text-primary)]"
                  aria-label="Close"
                >
                  <HiX size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5 sm:px-6">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Are you sure you want to sign out of your account?
                </p>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  id="logout-cancel"
                  type="button"
                  onClick={onCancel}
                  className="btn-ghost w-full px-5 text-sm sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  id="logout-confirm"
                  type="button"
                  onClick={handleConfirm}
                  className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-red-500 px-5 py-[10px] text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] sm:w-auto"
                >
                  <HiLogout size={15} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Loading overlay card ── */
            <motion.div
              key="loading-card"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full max-w-[min(95vw,22rem)] flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(17,18,24,0.90)] px-6 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-[var(--accent-primary)]" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">Signing you out…</p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Please wait a moment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
