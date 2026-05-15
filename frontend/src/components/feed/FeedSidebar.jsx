import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { HiBookmark } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function FeedSidebar() {
  const { user } = useAuth();
  const nameParts = (user?.name || '').split(' ');

  return (
    <aside className="hidden lg:flex flex-col gap-2 w-[225px] shrink-0 sticky top-[calc(var(--nav-height)+1.5rem)] h-fit">
      
      {/* Profile Summary Card */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
        <div className="h-14 bg-[#a0b4b7]" /> {/* Placeholder cover */}
        <div className="px-3 pb-4 -mt-7 flex flex-col items-center text-center">
          <Avatar 
            firstName={nameParts[0]} 
            lastName={nameParts[1]} 
            src={user?.photo}
            size="xl" 
            className="!rounded-full border-2 border-white mb-4 shadow-sm" 
          />
          <Link to="/profile" className="text-[16px] font-bold text-black hover:underline mb-0.5">{user?.name || 'User'}</Link>
          <p className="text-[12px] text-neutral-500 font-medium">Software Engineer at SkillSwap</p>
        </div>

        <div className="border-t border-neutral-100 py-3">
          <div className="px-3 py-1 flex items-center justify-between hover:bg-neutral-100 transition-colors cursor-pointer group">
            <span className="text-[12px] font-bold text-neutral-500 group-hover:text-black">Profile viewers</span>
            <span className="text-[12px] font-bold text-[#0a66c2]">42</span>
          </div>
          <div className="px-3 py-1 flex items-center justify-between hover:bg-neutral-100 transition-colors cursor-pointer group">
            <span className="text-[12px] font-bold text-neutral-500 group-hover:text-black">Post impressions</span>
            <span className="text-[12px] font-bold text-[#0a66c2]">1,240</span>
          </div>
        </div>

        <div className="border-t border-neutral-100 p-3 hover:bg-neutral-100 transition-colors cursor-pointer group">
          <p className="text-[12px] text-neutral-500 font-medium group-hover:text-black">Access exclusive tools & insights</p>
          <p className="text-[12px] font-bold text-black group-hover:text-[#0a66c2] underline">Try Premium for free</p>
        </div>

        <div className="border-t border-neutral-100 p-3 flex items-center gap-2 hover:bg-neutral-100 transition-colors cursor-pointer group">
           <HiBookmark size={16} className="text-neutral-500 group-hover:text-black" />
           <span className="text-[12px] font-bold text-neutral-500 group-hover:text-black">My items</span>
        </div>
      </div>

      {/* Community Section */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-3 flex flex-col gap-3 sticky top-[400px]">
        <p className="text-[12px] font-bold text-[#0a66c2] hover:underline cursor-pointer">Groups</p>
        <p className="text-[12px] font-bold text-[#0a66c2] hover:underline cursor-pointer flex items-center justify-between">
          Events <span className="text-black text-sm">+</span>
        </p>
        <p className="text-[12px] font-bold text-[#0a66c2] hover:underline cursor-pointer">Followed Hashtags</p>
        <div className="border-t border-neutral-100 pt-2 text-center">
           <p className="text-[14px] font-bold text-neutral-500 hover:bg-neutral-100 py-1 rounded-md transition-colors cursor-pointer">Discover more</p>
        </div>
      </div>

    </aside>
  );
}
