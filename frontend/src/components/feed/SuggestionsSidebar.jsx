import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { HiUserAdd, HiInformationCircle } from 'react-icons/hi';

export default function SuggestionsSidebar() {
  const suggestions = [
    { name: 'Sarah Chen', role: 'Full Stack Dev', initials: ['S', 'C'] },
    { name: 'Marcus Bell', role: 'UX Researcher', initials: ['M', 'B'] },
    { name: 'Elena Rodriguez', role: 'Language Coach', initials: ['E', 'R'] },
  ];

  return (
    <aside className="hidden xl:flex flex-col gap-2 w-[315px] shrink-0 sticky top-[calc(var(--nav-height)+1.5rem)] h-fit">
      
      {/* Add to your feed Card */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-black">Add to your feed</h3>
          <HiInformationCircle size={16} className="text-neutral-500" />
        </div>

        <div className="flex flex-col gap-4">
          {suggestions.map((person, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <Avatar firstName={person.initials[0]} lastName={person.initials[1]} size="lg" className="!rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-black group-hover:text-[#0a66c2] transition-colors truncate">{person.name}</p>
                <p className="text-[12px] text-neutral-500 leading-tight mb-2">{person.role}</p>
                <Button variant="outline" size="sm" className="!px-4 !py-1">
                  <HiUserAdd size={16} className="mr-1" /> Follow
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 pt-2 text-[14px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-md transition-all text-left px-2 flex items-center gap-1">
          View all recommendations <span className="text-lg">→</span>
        </button>
      </div>

      {/* Footer Links */}
      <div className="px-4 py-4 flex flex-wrap gap-x-3 gap-y-1 justify-center">
        {['About', 'Accessibility', 'Help Center', 'Privacy & Terms', 'Ad Choices', 'Advertising', 'Business Services'].map(link => (
          <button key={link} className="text-[12px] text-neutral-500 hover:text-[#0a66c2] hover:underline transition-all">
            {link}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 text-[12px] font-bold text-black">
        <span className="w-6 h-6 bg-[#0a66c2] rounded-sm flex items-center justify-center text-white text-[10px]">in</span>
        SkillSwap Corporation © 2026
      </div>

    </aside>
  );
}
