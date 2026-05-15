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
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label className="text-[13px] font-semibold text-[#a8a8a8] ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={inputType}
          className={`
            w-full bg-[#2f2f2f] border border-[#3a3a3a] rounded-xl px-4 py-3 text-sm text-[#ececec] placeholder-[#6b6b6b]
            transition-all duration-200 outline-none
            focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20
            hover:border-[#505050]
            ${error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />

        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#ececec] transition-colors"
          >
            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          </button>
        )}

      </div>
      {error && (
        <div className="flex items-center gap-1 mt-1 ml-1 text-red-500 animate-fade-in">
          <HiXCircle size={14} />
          <span className="text-[11px] font-bold tracking-tight">{error}</span>
        </div>
      )}
    </div>
  );
}
