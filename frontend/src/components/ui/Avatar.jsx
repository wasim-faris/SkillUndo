export default function Avatar({ firstName = '', lastName = '', src, size = 'md', className = '' }) {
  const initials = [firstName?.charAt(0), lastName?.charAt(0)]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const selectedSize = sizes[size] || sizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={`
          rounded-full object-cover shrink-0 border border-[#3a3a3a]
          ${selectedSize}
          ${className}
        `}
      />

    );
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full font-bold select-none shrink-0 
        bg-[#2a2a2a] border border-[#3a3a3a] text-[#ececec] transition-all duration-200
        ${selectedSize}
        ${className}
      `}
    >
      {initials}
    </div>

  );
}
