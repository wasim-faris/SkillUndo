import { HiX } from 'react-icons/hi';

export default function SkillPill({ name, type = 'teaching', onDelete }) {
  const isTeaching = type === 'teaching';

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold tracking-tight transition-all
        ${isTeaching 
          ? 'bg-blue-50 text-[#0a66c2] border border-[#0a66c2]/20' 
          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
        }
      `}
    >
      <span>{name}</span>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-1 hover:text-red-600 transition-colors focus:outline-none"
        >
          <HiX size={12} />
        </button>
      )}
    </span>
  );
}
