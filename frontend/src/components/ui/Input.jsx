import { useState, forwardRef } from 'react';
import { HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium Input component.
 *
 * Extra props vs original:
 *   errorId    – id applied to the error <span> so aria-describedby can point to it
 *   onBlur     – forwarded straight to the <input>
 *   aria-*     – forwarded via ...props
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    errorId,
    type      = 'text',
    className = '',
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasError   = Boolean(error);

  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[var(--text-secondary)] ml-1 uppercase tracking-wider opacity-85"
        >
          {label}
        </label>
      )}

      <div className="relative group">
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={[
            'w-full rounded-xl px-4 py-3 text-sm text-[var(--text-primary)]',
            'bg-[var(--bg-secondary)] border outline-none',
            'transition-all duration-200',
            'placeholder-[var(--text-muted)]',
            'focus:ring-2',
            hasError
              ? [
                  'border-red-500/60',
                  'focus:border-red-500',
                  'focus:ring-red-500/15',
                  'hover:border-red-500/70',
                ].join(' ')
              : [
                  'border-[var(--border-default)]',
                  'focus:border-[var(--accent-primary)]',
                  'focus:ring-[rgba(124,111,247,0.15)]',
                  'hover:border-[var(--border-hover)]',
                ].join(' '),
            isPassword ? 'pr-12' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={hasError || undefined}
          aria-describedby={errorId && hasError ? errorId : undefined}
          {...props}
        />

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
          >
            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          </button>
        )}
      </div>

      {/* Inline error message — animated */}
      <AnimatePresence mode="wait">
        {hasError && (
          <motion.span
            id={errorId}
            role="alert"
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex items-center gap-1.5 ml-1 mt-0.5 text-[11.5px] font-semibold text-red-400 leading-tight"
          >
            <HiExclamationCircle size={13} className="flex-shrink-0" />
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Input;
