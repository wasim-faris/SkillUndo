import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { HiSearch, HiOutlinePaperAirplane, HiDotsVertical, HiChat, HiArrowLeft } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import { getChats, getConversation, sendMessage } from '../api/chat';
import { getPublicProfile } from '../api/auth';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';

const ConversationItem = memo(({ contact, isActive, onClick }) => {
  return (
    <div 
      onClick={() => onClick(contact)}
      className={`flex gap-3 p-3.5 mx-2 my-1.5 rounded-xl cursor-pointer transition-all duration-200 border-l-4 ${
        isActive 
          ? 'bg-[var(--bg-secondary)] border-l-[var(--accent-primary)] shadow-sm' 
          : 'border-l-transparent hover:bg-[var(--bg-hover)]'
      }`}
    >
      <div className="relative shrink-0">
        <Avatar 
          firstName={contact.user_name?.split(' ')[0]} 
          lastName={contact.user_name?.split(' ')[1]} 
          src={contact.user_photo}
          className="!w-11 !h-11 md:!w-12 md:!h-12 !rounded-full" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className={`font-bold text-sm truncate transition-colors ${
            isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
          }`}>{contact.user_name}</h3>
          <span className="text-[10px] text-[var(--text-muted)] shrink-0 ml-2">
            {new Date(contact.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <p className={`text-xs truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
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
  );
});

export default function Messages() {
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const openChatWith = location.state?.openChatWith;
    if (openChatWith && !activeContact) {
      setTimeout(() => {
        setActiveContact(openChatWith);
        setShowChatMobile(true);
        setContacts(prev => {
          if (!prev.find(c => c.user_id === openChatWith.user_id)) {
             return [{
               ...openChatWith,
               last_message: '',
               last_message_at: new Date().toISOString(),
               unread_count: 0
             }, ...prev];
          }
          return prev;
        });
      }, 0);
      // Clean up the state so it doesn't trigger again on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state, activeContact]);
  
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [search, setSearch] = useState('');
  
  const messagesContainerRef = useRef(null);
  const profilesCache = useRef({});

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    let active = true;
    let pollInterval = null;

    const fetchContacts = async (isInitial = false) => {
      if (isInitial) {
        setLoadingContacts(true);
      }
      
      try {
        const res = await getChats();
        if (!active) return;
        const chats = res?.data?.data ?? res?.data ?? [];
        
        const enriched = await Promise.all(
          chats.map(async (chat) => {
            if (profilesCache.current[chat.user_id]) {
              return {
                ...chat,
                ...profilesCache.current[chat.user_id]
              };
            }
            try {
              const profileRes = await getPublicProfile(chat.user_id);
              const profile = profileRes?.data?.data ?? profileRes?.data ?? {};
              const cachedProfile = {
                user_name: profile.name || chat.user_name,
                user_photo: profile.photo || null,
              };
              profilesCache.current[chat.user_id] = cachedProfile;
              return {
                ...chat,
                ...cachedProfile
              };
            } catch {
              return chat;
            }
          })
        );

        if (!active) return;

        // Sort contacts by last_message_at descending
        const sortedEnriched = enriched.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

        setContacts(sortedEnriched.map(c => 
          activeContact && c.user_id === activeContact.user_id
            ? { ...c, unread_count: 0 }
            : c
        ));
      } catch (err) {
        if (!active) return;
        if (isInitial) toast.error('Failed to load conversations.');
        console.error(err);
      } finally {
        if (active && isInitial) setLoadingContacts(false);
      }
    };

    fetchContacts(true);

    pollInterval = setInterval(() => {
      fetchContacts(false);
    }, 3000);

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeContact]);

  useEffect(() => {
    if (!activeContact?.user_id) return;
    
    let active = true;
    let pollInterval = null;
    
    const fetchMessages = async (isInitial = false) => {
      if (isInitial) {
        setLoadingMessages(true);
      }
      
      try {
        const res = await getConversation(activeContact.user_id);
        if (!active) return;
        
        const msgs = res?.data?.data ?? res?.data ?? [];
        
        setMessages(prev => {
          // If this is the initial load, always set and scroll
          if (isInitial || prev.length === 0) {
            setTimeout(scrollToBottom, 100);
            return msgs;
          }
          
          // Check if any read status changed
          let readStatusChanged = false;
          if (prev.length === msgs.length) {
            for (let i = 0; i < msgs.length; i++) {
              if (prev[i].is_read !== msgs[i].is_read) {
                readStatusChanged = true;
                break;
              }
            }
          }
          
          // Smart update: only update state if the array length changed 
          // or the last message ID is different, or read status changed
          const hasNewMessages = prev.length !== msgs.length || 
            (msgs.length > 0 && prev[prev.length - 1].id !== msgs[msgs.length - 1].id) ||
            readStatusChanged;
            
          if (hasNewMessages) {
            // DO NOT auto-scroll here during polling. 
            // It disrupts the user if they are reading older messages.
            // React will naturally preserve the scroll position because of msg.id keys.
            return msgs;
          }
          
          return prev; // No change, bail out of state update
        });
        
        // The backend automatically marks messages as read when fetched.
        // Immediately clear the unread_count badge in the sidebar for this contact and update the last message preview if changed.
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          setContacts(prevContacts => {
            const updated = prevContacts.map(c => 
              c.user_id === activeContact.user_id 
                ? { 
                    ...c, 
                    last_message: lastMsg.content, 
                    last_message_at: lastMsg.created_at, 
                    unread_count: 0 
                  } 
                : c
            );
            return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
          });
        } else {
          setContacts(prevContacts => prevContacts.map(c => 
            c.user_id === activeContact.user_id && c.unread_count > 0 
              ? { ...c, unread_count: 0 } 
              : c
          ));
        }
      } catch (err) {
        if (!active) return;
        if (isInitial) toast.error('Failed to load messages.');
        console.error('[Chat Polling Error]:', err);
      } finally {
        if (active && isInitial) setLoadingMessages(false);
      }
    };

    // 1. Clear messages for new contact
    setTimeout(() => {
      if (active) setMessages([]);
    }, 0);
    
    // 2. Initial fetch with loading state
    fetchMessages(true);
    
    // 3. Start polling every 3 seconds without loading state
    pollInterval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    // 4. Cleanup on unmount or contact change
    return () => { 
      active = false; 
      if (pollInterval) clearInterval(pollInterval);
    };
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

  useEffect(() => {
    const totalUnread = contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    window.dispatchEvent(new CustomEvent('unread-count-update', { detail: totalUnread }));
  }, [contacts]);

  const debouncedSearch = useDebounce(search, 300);

  const filteredContacts = contacts.filter(c => 
    c.user_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleContactClick = useCallback((contact) => {
    setActiveContact(contact);
    setShowChatMobile(true);
  }, []);

  return (
    <AppLayout>
      <div className="card-premium flex h-[calc(100dvh-184px)] flex-col overflow-hidden !p-0 md:h-[calc(100dvh-130px)] md:flex-row md:overflow-hidden">
        
        {/* Contacts Sidebar */}
        {/* === Contacts Sidebar: mobile shows only when chat is NOT open === */}
        <div className={`h-full w-full flex-col border-b border-[var(--border-default)] bg-[var(--bg-primary)] md:flex md:h-full md:w-[320px] md:border-b-0 md:border-r ${
          showChatMobile ? 'hidden' : 'flex'
        }`}>
          
          <div className="p-4 border-b border-[var(--border-default)] shrink-0">
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
                <ConversationItem
                  key={contact.user_id}
                  contact={contact}
                  isActive={activeContact?.user_id === contact.user_id}
                  onClick={handleContactClick}
                />
              ))
            )}
          </div>

        </div>

        {/* Chat Area */}
        {/* === Chat Area: mobile fullscreen when open, desktop always shows === */}
        <div className={`bg-[var(--bg-card)] ${
          showChatMobile
            ? 'fixed inset-0 z-[110] flex flex-col md:relative md:inset-auto md:z-auto md:flex md:h-full md:flex-1'
            : 'hidden md:flex md:flex-col md:min-h-0 md:flex-1 md:h-full'
        }`}>
          
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 md:px-6 md:py-3 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => setShowChatMobile(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] md:hidden shrink-0 transition-colors"
                    aria-label="Back to messages"
                  >
                    <HiArrowLeft size={20} />
                  </button>

                  <Avatar 
                    firstName={activeContact.user_name?.split(' ')[0]} 
                    lastName={activeContact.user_name?.split(' ')[1]} 
                    src={activeContact.user_photo}
                    className="!w-9 !h-9 md:!w-10 md:!h-10 !rounded-full shrink-0" 
                  />
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[var(--text-primary)] text-sm md:text-base">{activeContact.user_name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] shrink-0">
                  <button className="hover:text-[var(--text-primary)] transition-colors p-2 rounded-full hover:bg-[var(--bg-hover)]"><HiDotsVertical size={20} /></button>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3.5 md:px-6 md:py-6 md:space-y-4">
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
                    <div className="text-center my-2">
                      <span className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-default)]">
                        Conversation Started
                      </span>
                    </div>

                    {(() => {
                      // Find the index of the last message sent by the current user
                      const lastMyMsgIdx = messages.reduce((lastIdx, msg, idx) => 
                        String(msg.sender) !== String(activeContact.user_id) ? idx : lastIdx, -1
                      );

                      return messages.map((msg, index) => {
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

                        const marginTop = isPrevSame ? 'mt-1' : 'mt-4 md:mt-5';

                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${marginTop}`}>
                            <div className="max-w-[85%] sm:max-w-[75%]">
                              <div className={`px-3.5 py-2 md:px-4 md:py-2.5 ${bubbleColor} ${corners}`}>
                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                              {!isNextSame && (
                                <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <p className={`text-[10px] text-[var(--text-muted)]`}>
                                    {timeString}
                                  </p>
                                  {isMe && index === lastMyMsgIdx && (
                                    <span className="text-[10px] font-semibold tracking-wide flex items-center">
                                      {msg.is_read ? (
                                        <span className="text-[#3b82f6]">Seen</span>
                                      ) : (
                                        <span className="text-[var(--text-muted)]">Sent</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })})()}

                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="shrink-0 border-t border-[var(--border-default)] bg-[var(--bg-primary)] p-2.5 sm:p-4">
                <div className="flex items-center gap-2 md:gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-1.5 pl-3 pr-2 md:p-2 md:pl-4 md:pr-3 transition-colors focus-within:border-[var(--accent-primary)]">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                    className="min-w-0 flex-1 border-none bg-transparent py-1.5 text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] focus:ring-0 disabled:opacity-50"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || sendingMessage}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
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
