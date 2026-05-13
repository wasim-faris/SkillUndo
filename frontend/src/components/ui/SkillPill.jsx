import { HiXMark } from 'react-icons/hi2';

/**
 * SkillPill — colored pill with optional × delete button.
 * type: "teaching" | "learning"
 */
export default function SkillPill({ name, type = 'teaching', onDelete }) {
  const isTeaching = type === 'teaching';
  
  const baseClass = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm";
  const colorClass = isTeaching 
    ? 'bg-purple-50 text-[#6C63FF] border border-purple-100' 
    : 'bg-pink-50 text-[#FF6584] border border-pink-100';

  return (
    <span className={`${baseClass} ${colorClass}`}>
      {isTeaching ? 'Teaching:' : 'Learning:'} {name}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-1 hover:scale-125 transition-transform focus:outline-none"
          aria-label={`Remove ${name}`}
        >
          <HiXMark size={14} />
        </button>
      )}
    </span>
  );
}
