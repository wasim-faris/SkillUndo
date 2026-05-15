import { useState } from 'react';
import { HiEye, HiEyeOff, HiXCircle } from 'react-icons/hi';

export default function Input({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label className="text-[13px] font-semibold text-neutral-600 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={inputType}
          className={`
            w-full bg-[#f9fafb] border border-neutral-300 rounded-md px-3 py-2 text-sm text-black placeholder-neutral-400
            transition-all duration-200 outline-none
            focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]
            hover:border-neutral-400
            ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20' : ''}
            ${className}
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 mt-1 ml-1 text-red-600 animate-fade-in">
          <HiXCircle size={14} />
          <span className="text-[11px] font-bold">{error}</span>
        </div>
      )}
    </div>
  );
}
