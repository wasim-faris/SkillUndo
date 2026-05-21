import { HiX } from 'react-icons/hi';

export default function SkillPill({ name, type = 'teaching', onDelete }) {
  const isTeaching = type === 'teaching';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isTeaching ? 'bg-[rgba(124,111,247,0.12)] border border-[rgba(124,111,247,0.3)] text-[var(--accent-primary)]' : 'bg-[rgba(249,112,102,0.12)] border border-[rgba(249,112,102,0.3)] text-[var(--accent-secondary)]'}`}
    >
      <span>{name}</span>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-1 hover:scale-125 transition-transform focus:outline-none opacity-70 hover:opacity-100"
        >
          <HiX size={12} />
        </button>
      )}
    </span>
  );
}
