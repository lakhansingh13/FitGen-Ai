'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hey! I am your FitGen AI Coach. Ask me anything about workouts, diets, or fitness goals!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionPills = [
    'Suggest a home abs workout',
    'High-protein Indian food options?',
    'How do I correct my squat form?',
    'Explain BMI'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, chatHistory: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })) }),
      });

      if (!res.ok) throw new Error('Failed to fetch reply');
      const data = await res.json();

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: 'Sorry, I am facing a connection issue right now. Please try again shortly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {/* Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-[350px] sm:w-[400px] h-[500px] rounded-3xl overflow-hidden border border-neon-green/20 flex flex-col shadow-[0_15px_50px_rgba(0,0,0,0.6)] mb-4 bg-[#0a0f1d]/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0d141e] to-[#05070c] px-5 py-4 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    FitGen AI Coach
                    <Sparkles className="w-3.5 h-3.5 text-neon-blue animate-pulse" />
                  </h3>
                  <span className="text-[11px] text-neon-green font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
                    Online & Ready
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      msg.sender === 'user'
                        ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                        : 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-neon-blue/10 text-white rounded-tr-none border border-neon-blue/15'
                        : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {/* Typing Loader */}
              {isLoading && (
                <div className="flex gap-2.5 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-white/5 bg-white/2">
                {suggestionPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => handleSendMessage(pill)}
                    className="text-[11px] bg-white/5 border border-white/5 hover:border-neon-green/20 hover:text-neon-green text-gray-400 px-3 py-1.5 rounded-full transition-all duration-200"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-white/5 bg-[#05070c] flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-neon-green hover:bg-white text-black flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-neon-green to-neon-blue text-black flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 animate-pulse-green shadow-[0_0_20px_rgba(57,255,20,0.3)] border border-neon-green/20"
      >
        {isOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <MessageSquare className="w-6 h-6 stroke-[2.5]" />}
      </button>
    </div>
  );
}
