import { forwardRef } from 'react';

const variants = {
  primary: 'bg-[#6C63FF] hover:bg-[#5B54E0] text-white shadow-lg shadow-purple-200 active:scale-[0.98]',
  secondary: 'bg-[#FF6584] hover:bg-[#E55B77] text-white shadow-lg shadow-pink-200 active:scale-[0.98]',
  outline: 'bg-white border-2 border-gray-100 hover:border-[#6C63FF] hover:text-[#6C63FF] text-gray-600 active:scale-[0.98]',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 active:scale-[0.98]',
  ghost: 'bg-transparent hover:bg-purple-50 text-gray-600 hover:text-[#6C63FF]',
};

const sizes = {
  sm: 'px-4 py-2 text-xs font-bold rounded-lg',
  md: 'px-6 py-3 text-sm font-bold rounded-xl',
  lg: 'px-8 py-4 text-base font-bold rounded-2xl',
};

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${(disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export default Button;
