import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  fullWidth = false, 
  className = '', 
  disabled = false,
  ...props 
}) {
  const variants = {
    primary:  'bg-[var(--accent-primary)] text-white border-transparent shadow-[0_0_15px_rgba(124,111,247,0.3)] hover:bg-[var(--accent-hover)]',
    secondary:'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-transparent hover:bg-[var(--bg-hover)]',
    outline:  'bg-transparent text-[var(--accent-primary)] border-[var(--accent-primary)] border hover:bg-[rgba(124,111,247,0.1)]',
    ghost:    'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] border-transparent hover:text-[var(--text-primary)]',
    danger:   'bg-red-500/10 text-red-400 border-transparent hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -0.5 }}
      whileTap={{ scale: 0.99 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 group
        disabled:opacity-50 disabled:pointer-events-none outline-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">{children}</span>
    </motion.button>
  );
}

