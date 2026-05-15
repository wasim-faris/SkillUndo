import { HiThumbUp, HiChatAlt, HiShare, HiOutlineThumbUp } from 'react-icons/hi';
import Avatar from '../ui/Avatar';
import SkillPill from '../ui/SkillPill';

export default function PostCard({ post, onUserClick }) {
  const nameParts = (post.author || '').split(' ');

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 flex gap-3">
        <button onClick={onUserClick} className="shrink-0 focus:outline-none">
          <Avatar 
            firstName={nameParts[0]} 
            lastName={nameParts[1]} 
            src={post.photo} 
            size="lg" 
            className="!rounded-md"
          />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <button 
              onClick={onUserClick}
              className="text-[14px] font-bold text-black hover:text-[#0a66c2] hover:underline transition-all truncate"
            >
              {post.author}
            </button>
            <span className="text-[12px] text-neutral-500 font-medium">{post.time}</span>
          </div>
          <p className="text-[12px] text-neutral-500 truncate mb-2">
            {post.authorRole}
          </p>

          <p className="text-[14px] text-neutral-800 leading-normal mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.skills?.map((skill, idx) => (
              <SkillPill key={idx} name={skill} type={idx === 0 ? 'teaching' : 'learning'} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-1 border-t border-neutral-100 flex items-center gap-1">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiOutlineThumbUp size={20} />
          <span>Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiChatAlt size={20} />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors text-[14px] font-bold">
          <HiShare size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
