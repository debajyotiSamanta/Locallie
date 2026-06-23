import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am Locallie\'s AI Civic Assistant. You can check the status of your reported issues or ask me questions about how the community platform works!', time: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  const suggestChips = [
    "How to report an issue",
    "What is a Community Hero?",
    "Check reported issues status",
    "Tell me about volunteer drives"
  ];

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text, time: new Date() }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.chatbot.sendMessage(text);
      setMessages(prev => [...prev, { sender: 'bot', text: response.reply, time: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the AI brain right now. Please make sure the backend server is running!', time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[480px] bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-xl flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between border-b border-zinc-850">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-zinc-900 rounded-lg">
                <Sparkles className="w-4 h-4 text-white dark:text-zinc-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-xs">Locallie Civic AI</h3>
                <p className="text-[9px] text-zinc-400">Online Support</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-905 rounded-lg transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none'
                      : 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[8px] mt-1 text-right ${msg.sender === 'user' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-450 dark:text-zinc-500'}`}>
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg rounded-tl-none p-3 shadow-sm flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Chips */}
          <div className="p-2 border-t border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-950 overflow-x-auto flex space-x-1.5 whitespace-nowrap scrollbar-none">
            {suggestChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 hover:text-black dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg text-[9px] font-bold border border-zinc-200/50 dark:border-zinc-800/55 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex items-center space-x-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Locallie AI..."
              className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-lg bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 shadow-2xl shadow-black/30 dark:shadow-white/20 transition-all duration-200 flex items-center justify-center group ring-1 ring-black/20 dark:ring-white/20"
        aria-label="Ask AI Assistant"
      >
        {/* Pulse ring for attention */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-black dark:bg-white opacity-20 pointer-events-none" />
        )}
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
          <Sparkles className="absolute -top-1.5 -right-1.5 w-3 h-3 text-zinc-300 dark:text-zinc-600" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-bold whitespace-nowrap transition-all duration-300">
          Ask AI
        </span>
      </button>
    </div>
  );
}
