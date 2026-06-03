import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiOutlinePaperAirplane, HiOutlinePhotograph, HiOutlineEmojiHappy, HiDotsVertical } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';

const CONTACTS = [
  { id: 1, name: 'Rahul Desai', role: 'React Developer', lastMessage: 'See you at 4 PM! Looking forward to it.', time: '2m', unread: 2, online: true },
  { id: 2, name: 'Sneha M', role: 'UI/UX Designer', lastMessage: 'Could you share the figma link again?', time: '1h', unread: 0, online: true },
  { id: 3, name: 'Karthik Iyer', role: 'Backend Engineer', lastMessage: 'Thanks for the system design tips.', time: '1d', unread: 0, online: false },
  { id: 4, name: 'Priya Sharma', role: 'Data Scientist', lastMessage: 'Let me know when you are free.', time: '2d', unread: 0, online: false },
];

const MESSAGES = [
  { id: 1, senderId: 'me', text: 'Hey Rahul! Are we still on for our React swap session today at 4?', time: '10:30 AM' },
  { id: 2, senderId: 1, text: 'Hey Wasim! Yes absolutely.', time: '10:32 AM' },
  { id: 3, senderId: 1, text: 'I have set up the project locally. We can go over the advanced hooks first if that works for you.', time: '10:33 AM' },
  { id: 4, senderId: 'me', text: 'Perfect! I also prepared some examples for custom hooks.', time: '10:45 AM' },
  { id: 5, senderId: 1, text: 'See you at 4 PM! Looking forward to it.', time: '10:46 AM' },
];

export default function Messages() {
  const [activeContact, setActiveContact] = useState(CONTACTS[0]);
  const [inputText, setInputText] = useState('');

  return (
    <AppLayout>
      <div className="card-premium h-[calc(100vh-130px)] flex overflow-hidden !p-0">
        
        {/* Contacts Sidebar */}
        <div className="w-[320px] border-r border-[var(--border-default)] flex flex-col h-full bg-[var(--bg-primary)]">
          
          <div className="p-4 border-b border-[var(--border-default)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Messages</h2>
            <div className="relative">
              <HiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONTACTS.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`flex gap-3 p-4 cursor-pointer transition-colors border-l-4 ${activeContact.id === contact.id ? 'bg-[var(--bg-secondary)] border-l-[var(--accent-primary)]' : 'border-l-transparent hover:bg-[var(--bg-hover)]'}`}
              >
                <div className="relative shrink-0">
                  <Avatar firstName={contact.name.split(' ')[0]} lastName={contact.name.split(' ')[1]} className="!w-12 !h-12 !rounded-full" />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-card)] rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm truncate">{contact.name}</h3>
                    <span className={`text-[10px] ${contact.unread ? 'text-[var(--accent-primary)] font-bold' : 'text-[var(--text-muted)]'}`}>{contact.time}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-xs truncate ${contact.unread ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="shrink-0 bg-[var(--accent-primary)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-[var(--bg-card)] relative">
          
          {/* Chat Header */}
          <div className="h-[72px] border-b border-[var(--border-default)] flex items-center justify-between px-6 shrink-0 bg-[var(--bg-secondary)] bg-opacity-50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Avatar firstName={activeContact.name.split(' ')[0]} lastName={activeContact.name.split(' ')[1]} className="!w-10 !h-10 !rounded-full" />
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">{activeContact.name}</h3>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  {activeContact.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[var(--text-muted)]">
              <button className="hover:text-[var(--text-primary)] transition-colors"><HiDotsVertical size={20} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
              <span className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-default)]">
                Today, 10:30 AM
              </span>
            </div>

            {MESSAGES.map(msg => {
              const isMe = msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                    <div 
                      className={`px-4 py-2.5 rounded-2xl ${
                        isMe 
                        ? 'bg-[var(--accent-primary)] text-white rounded-br-sm' 
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-sm'
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed">{msg.text}</p>
                    </div>
                    <p className={`text-[10px] text-[var(--text-muted)] mt-1.5 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-primary)] shrink-0">
            <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-2 pr-3 focus-within:border-[var(--accent-primary)] transition-colors">
              <button className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors rounded-lg">
                <HiOutlinePhotograph size={22} />
              </button>
              <button className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-yellow)] transition-colors rounded-lg">
                <HiOutlineEmojiHappy size={22} />
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none text-[var(--text-primary)] text-sm focus:ring-0 outline-none placeholder-[var(--text-muted)]"
              />
              <button 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  inputText.trim() 
                  ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]' 
                  : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-default)]'
                }`}
              >
                <HiOutlinePaperAirplane size={18} className="transform rotate-90 translate-x-[2px]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
