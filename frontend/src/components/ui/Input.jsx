import { forwardRef, useState } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

const Input = forwardRef(function Input(
  {
    label,
    error,
    type = 'text',
    id,
    className = '',
    onChange,
    onClearError,
    ...rest
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const handleChange = (e) => {
    if (onClearError) onClearError();
    if (onChange) onChange(e);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className} animate-fade-in`}>
      {label && (
        <label
          htmlFor={inputId}
          className="label-premium"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          onChange={handleChange}
          className={`
            input-premium
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : ''}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6C63FF] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1 animate-slide-left"
          role="alert"
        >
          <span className="w-1 h-1 bg-red-500 rounded-full"></span> {error}
        </p>
      )}
    </div>
  );
});

export default Input;
