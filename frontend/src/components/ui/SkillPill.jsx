import { HiX } from 'react-icons/hi';

export default function SkillPill({ name, type = 'teaching', onDelete }) {
  const isTeaching = type === 'teaching';

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
      style={{
        background: 'rgba(217, 119, 87, 0.12)',
        border: '1px solid rgba(217, 119, 87, 0.3)',
        color: '#d97757',
      }}
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
