import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { FaPaperPlane, FaSearch, FaEllipsisV, FaCircle, FaChevronLeft } from 'react-icons/fa';

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const conversationId = searchParams.get('conversation_id');
  const receiverId = searchParams.get('receiver_id');
  const itemId = searchParams.get('item_id');
  
  const { messages, conversations, loading, sendMessage, connected } = useChat(conversationId);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await sendMessage(inputText, itemId, receiverId);
      setInputText('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const currentConversation = conversations.find(c => String(c.id) === String(conversationId));
  const filteredConversations = conversations.filter(c => 
    c.other_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 180px)', 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}>
        {/* Conversations Sidebar */}
        <div style={{ 
          width: '350px', 
          borderRight: '1px solid var(--border)', 
          display: conversationId ? 'none' : 'flex', 
          '@media (min-width: 768px)': { display: 'flex' },
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Messages</h2>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {filteredConversations.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSearchParams({ conversation_id: c.id, receiver_id: c.other_id, item_id: c.item_id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  backgroundColor: String(c.id) === String(conversationId) ? '#f1f5f9' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.other_name)}&background=6366f1&color=fff`} 
                    alt="" 
                    style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                  />
                  <FaCircle style={{ position: 'absolute', bottom: '2px', right: '2px', color: '#22c55e', border: '2px solid white', borderRadius: '50%', fontSize: '10px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{c.other_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.last_message || 'Start chatting...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {conversationId ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    onClick={() => setSearchParams({})}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', display: 'flex', '@media (min-width: 768px)': { display: 'none' } }}
                  >
                    <FaChevronLeft />
                  </button>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentConversation?.other_name || 'User')}&background=6366f1&color=fff`} 
                    alt="" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{currentConversation?.other_name || 'Loading...'}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaCircle size={8} /> Online
                    </div>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><FaEllipsisV /></button>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => {
                  const isMe = String(msg.sender_id) === String(user?.id);
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        backgroundColor: isMe ? 'var(--primary)' : '#f1f5f9',
                        color: isMe ? 'white' : 'var(--text-main)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {msg.message_text}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form 
                onSubmit={handleSend}
                style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}
              >
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1, padding: '0.875rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }}
                />
                <button 
                  type="submit"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    width: '48px', 
                    height: '48px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
                  }}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a contact from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
