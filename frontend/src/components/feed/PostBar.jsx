import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { HiPhotograph, HiVideoCamera, HiCalendar, HiDocumentText } from 'react-icons/hi';

export default function PostBar({ onOpenModal }) {
  const { user } = useAuth();
  const nameParts = (user?.name || '').split(' ');

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar 
          firstName={nameParts[0]} 
          lastName={nameParts[1]} 
          src={user?.photo}
          size="md" 
          className="!rounded-full"
        />
        <button 
          onClick={onOpenModal}
          className="flex-1 text-left px-4 h-12 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-full text-[14px] font-bold text-neutral-500 transition-colors"
        >
          Start a post
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <button onClick={onOpenModal} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiPhotograph size={22} className="text-[#378fe9]" />
          <span>Photo</span>
        </button>
        <button onClick={onOpenModal} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiVideoCamera size={22} className="text-[#5f9b41]" />
          <span>Video</span>
        </button>
        <button onClick={onOpenModal} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiCalendar size={22} className="text-[#c37d16]" />
          <span>Event</span>
        </button>
        <button onClick={onOpenModal} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiDocumentText size={22} className="text-[#e06847]" />
          <span>Article</span>
        </button>
      </div>
    </div>
  );
}
