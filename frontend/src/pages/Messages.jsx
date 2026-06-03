import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiOutlinePaperAirplane, HiOutlinePhotograph, HiOutlineEmojiHappy, HiDotsVertical, HiChat } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { getChats, getConversation, sendMessage } from '../api/chat';
import { getPublicProfile } from '../api/auth';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [search, setSearch] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let active = true;
    setLoadingContacts(true);
    
    getChats()
      .then(async res => {
        if (!active) return;
        const chats = res?.data?.data ?? res?.data ?? [];
        
        // Enrich each contact with their real profile (name + photo)
        // from the public profile endpoint. Run all requests in parallel.
        const enriched = await Promise.all(
          chats.map(async (chat) => {
            try {
              const profileRes = await getPublicProfile(chat.user_id);
              const profile = profileRes?.data?.data ?? profileRes?.data ?? {};
              return {
                ...chat,
                user_name: profile.name || chat.user_name,
                user_photo: profile.photo || null,
              };
            } catch {
              return chat;
            }
          })
        );

        if (!active) return;
        setContacts(enriched);
        if (enriched.length > 0 && !activeContact) {
          setActiveContact(enriched[0]);
        }
      })
      .catch(err => {
        if (!active) return;
        toast.error('Failed to load conversations.');
        console.error(err);
      })
      .finally(() => {
        if (active) setLoadingContacts(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!activeContact?.user_id) return;
    
    let active = true;
    setLoadingMessages(true);
    setMessages([]);
    
    getConversation(activeContact.user_id)
      .then(res => {
        if (!active) return;
        const msgs = res?.data?.data ?? res?.data ?? [];
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      })
      .catch(err => {
        if (!active) return;
        toast.error('Failed to load messages.');
        console.error(err);
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });

    return () => { active = false; };
  }, [activeContact?.user_id]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeContact?.user_id || sendingMessage) return;
    
    const content = inputText.trim();
    setInputText('');
    setSendingMessage(true);
    
    try {
      const res = await sendMessage({
        receiver_id: activeContact.user_id,
        content: content,
      });
      
      const newMsg = res?.data?.data ?? res?.data;
      
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
        
        // Update contact last message locally
        setContacts(prev => {
          const updated = prev.map(c => {
            if (c.user_id === activeContact.user_id) {
              return {
                ...c,
                last_message: content,
                last_message_at: new Date().toISOString()
              };
            }
            return c;
          });
          // Sort so most recent is top
          return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
        });
      }
    } catch (err) {
      toast.error('Failed to send message.');
      console.error(err);
      setInputText(content); // Restore input on failure
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.user_name?.toLowerCase().includes(search.toLowerCase())
  );

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
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="p-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
                      <div className="h-3 bg-[var(--bg-secondary)] rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                    <HiChat size={20} className="text-[var(--text-muted)]" />
                 </div>
                 <p>Start a conversation from your matches to see messages here.</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-muted)] text-sm">No matches found for "{search}"</div>
            ) : (
              filteredContacts.map(contact => (
                <div 
                  key={contact.user_id}
                  onClick={() => setActiveContact(contact)}
                  className={`flex gap-3 p-4 cursor-pointer transition-colors border-l-4 ${activeContact?.user_id === contact.user_id ? 'bg-[var(--bg-secondary)] border-l-[var(--accent-primary)]' : 'border-l-transparent hover:bg-[var(--bg-hover)]'}`}
                >
                  <div className="relative shrink-0">
                    <Avatar 
                      firstName={contact.user_name?.split(' ')[0]} 
                      lastName={contact.user_name?.split(' ')[1]} 
                      src={contact.user_photo}
                      className="!w-12 !h-12 !rounded-full" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm truncate">{contact.user_name}</h3>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(contact.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs truncate text-[var(--text-secondary)]">
                        {contact.last_message}
                      </p>
                      {contact.unread_count > 0 && (
                        <span className="shrink-0 bg-[var(--accent-primary)] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-[var(--bg-card)] relative">
          
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-[72px] border-b border-[var(--border-default)] flex items-center justify-between px-6 shrink-0 bg-[var(--bg-secondary)] bg-opacity-50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Avatar 
                    firstName={activeContact.user_name?.split(' ')[0]} 
                    lastName={activeContact.user_name?.split(' ')[1]} 
                    src={activeContact.user_photo}
                    className="!w-10 !h-10 !rounded-full" 
                  />
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{activeContact.user_name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[var(--text-muted)]">
                  <button className="hover:text-[var(--text-primary)] transition-colors"><HiDotsVertical size={20} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingMessages ? (
                  <div className="flex justify-center p-4">
                    <span className="text-[var(--text-muted)] text-sm animate-pulse">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                    <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-2">
                      <HiOutlinePaperAirplane size={24} className="text-[var(--text-muted)] transform rotate-45 -translate-y-1 -translate-x-1" />
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium">No messages yet</p>
                    <p className="text-[13px] text-[var(--text-muted)] max-w-[200px]">Send a message to {activeContact.user_name} to start the conversation.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <span className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-default)]">
                        Conversation Started
                      </span>
                    </div>

                    {messages.map((msg, index) => {
                      // isMe: if the sender is NOT the contact, we sent it.
                      const isMe = String(msg.sender) !== String(activeContact.user_id);
                      const currentSenderId = msg.sender;

                      const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      // Group consecutive messages from the same sender
                      const prevMsg = index > 0 ? messages[index - 1] : null;
                      const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                      const isPrevSame = prevMsg && String(prevMsg.sender) === String(currentSenderId);
                      const isNextSame = nextMsg && String(nextMsg.sender) === String(currentSenderId);

                      // Bubble color
                      const bubbleColor = isMe
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)]';

                      // Rounded corners: flatten the corner closest to the next same-sender bubble
                      let corners = 'rounded-2xl ';
                      if (isMe) {
                        if (isPrevSame && isNextSame) corners = 'rounded-2xl rounded-r-sm ';
                        else if (isPrevSame)           corners = 'rounded-2xl rounded-tr-sm ';
                        else if (isNextSame)           corners = 'rounded-2xl rounded-br-sm ';
                      } else {
                        if (isPrevSame && isNextSame) corners = 'rounded-2xl rounded-l-sm ';
                        else if (isPrevSame)           corners = 'rounded-2xl rounded-tl-sm ';
                        else if (isNextSame)           corners = 'rounded-2xl rounded-bl-sm ';
                      }

                      const marginTop = isPrevSame ? 'mt-1' : 'mt-5';

                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${marginTop}`}>
                          <div className="max-w-[75%]">
                            <div className={`px-4 py-2.5 ${bubbleColor} ${corners}`}>
                              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                            {!isNextSame && (
                              <p className={`text-[10px] text-[var(--text-muted)] mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                {timeString}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
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
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                    className="flex-1 bg-transparent border-none text-[var(--text-primary)] text-sm focus:ring-0 outline-none placeholder-[var(--text-muted)] disabled:opacity-50"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || sendingMessage}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      inputText.trim() && !sendingMessage
                      ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]' 
                      : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-default)] cursor-not-allowed'
                    }`}
                  >
                    <HiOutlinePaperAirplane size={18} className="transform rotate-90 translate-x-[2px]" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-2 border border-[var(--border-default)]">
                 <HiChat size={24} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-secondary)] font-medium">Your Messages</p>
              <p className="text-[13px] text-[var(--text-muted)] max-w-[200px]">Select a conversation from the sidebar to view your chat history.</p>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
