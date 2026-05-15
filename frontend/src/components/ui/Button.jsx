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
    primary: 'bg-[#0a66c2] text-white hover:bg-[#004182] border-transparent',
    secondary: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-transparent',
    outline: 'bg-transparent text-[#0a66c2] hover:bg-[#0a66c2]/10 border-[#0a66c2]',
    ghost: 'bg-transparent text-neutral-500 hover:bg-black/5 border-transparent',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-5 py-1.5 text-sm',
    lg: 'px-6 py-2 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-full font-bold border transition-all duration-200
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
      {children}
    </button>
  );
}
