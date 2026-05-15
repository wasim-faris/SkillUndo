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
          rounded-md object-cover shrink-0 border border-neutral-200
          ${selectedSize}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-md font-bold select-none shrink-0 
        bg-neutral-100 border border-neutral-200 text-neutral-500 transition-all duration-200
        ${selectedSize}
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
