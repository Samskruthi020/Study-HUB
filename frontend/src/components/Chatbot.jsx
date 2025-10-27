import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Removed arrow indicator
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // No arrow indicator

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('/api/chatbot', { message: input });
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: res.data.reply }
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: 'Sorry, I could not get a response.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ sender: 'bot', text: 'Hi! Ask me anything.' }]);
  };

  const handleButtonClick = () => {
    setOpen((o) => !o);
  };

  // Helper: Check if last bot message is about features
  const lastBotMsg = messages.filter(m => m.sender === 'bot').slice(-1)[0]?.text || '';
  const showFeatures = lastBotMsg.includes('StudyHub features:');
  const features = [
    { label: 'Resources', path: '/resources' },
    { label: 'Quizzes', path: '/Quiz' },
    { label: 'Notes', path: '/notes' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleButtonClick}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          borderRadius: 18,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg,#6366f1,#60a5fa)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
          fontSize: 26,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform .15s ease',
        }}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
        title={open ? 'Close chatbot' : 'Open chatbot'}
      >
        {open ? '×' : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12C21 16.4183 16.9706 20 12 20C10.3431 20 8.794 19.6582 7.46447 19.0503L3 20L4.05025 15.5355C3.3418 14.206 3 12.6569 3 11C3 6.58172 7.02944 3 12 3C16.9706 3 21 6.58172 21 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Arrow indicator removed */}

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 120,
            right: 32,
            width: 380,
            maxWidth: '95vw',
            height: 520,
            background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)',
            borderRadius: 16,
            boxShadow: '0 20px 48px rgba(15,23,42,0.22)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: '#0f172a' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: 9999, display: 'inline-block' }} />
              StudyHub Assistant
            </span>
            <button
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                color: '#475569',
                fontSize: 14,
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: 8,
                transition: 'background 0.2s',
              }}
              title="Clear chat"
            >
              Clear
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f8fafc',
              fontSize: 15,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.sender === 'user' ? 'linear-gradient(90deg,#6366f1,#60a5fa)' : '#eef2ff',
                    color: msg.sender === 'user' ? '#fff' : '#0f172a',
                    borderRadius: 14,
                    padding: '8px 12px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>Assistant is typing...</div>
            )}
            <div ref={chatEndRef} />
            {showFeatures && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {features.map(f => (
                  <button
                    key={f.path}
                    onClick={() => navigate(f.path)}
                    style={{
                      background: '#f3f3f3',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 14,
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={handleSend}
            style={{ display: 'flex', borderTop: '1px solid #e5e7eb', padding: 10, background: '#ffffff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                outline: 'none',
                fontSize: 15,
                background: '#fff',
                padding: '8px 10px',
                borderRadius: 10,
              }}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: 'linear-gradient(90deg,#6366f1,#60a5fa)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '0 16px',
                marginLeft: 8,
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot; 