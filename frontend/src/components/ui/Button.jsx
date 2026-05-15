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
    primary:  'bg-[#d97757] text-white border-transparent shadow-lg shadow-[#d97757]/20 hover:bg-[#c4643f]',
    secondary:'bg-[#2f2f2f] text-[#ececec] border-transparent hover:bg-[#3a3a3a]',
    outline:  'bg-transparent text-[#d97757] border-[#d97757] border hover:bg-[#d97757]/10',
    ghost:    'bg-transparent text-[#a8a8a8] hover:bg-[#2f2f2f] border-transparent hover:text-[#ececec]',
    danger:   'bg-red-500/10 text-red-400 border-transparent hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-full font-bold transition-all duration-300
        disabled:opacity-50 disabled:pointer-events-none
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
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

