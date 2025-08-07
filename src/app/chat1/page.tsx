'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  Menu,
  X,
  Plus,
  Settings,
  MessageSquare,
  Sparkles,
  SendHorizontal,
  Search,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import app from '../../firebaseConfig';

type Message = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
};

// Suggestion chips for the welcome screen
const suggestionPrompts = [
  'Explain quantum computing in simple terms',
  'What are three tips for a healthy diet?',
  'Write a short story about a robot who discovers music',
];

export default function AIChat() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const router = useRouter();

  const auth = getAuth(app);

  // Resets the chat to its initial state
  const startNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      // Start with a clean slate when a user logs in
      if (firebaseUser) {
        startNewChat();
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, startNewChat]);

  // Handles sending a message
  const handleSendMessage = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim()) {
        return;
      }

      const userMessage: Message = {
        id: Date.now(),
        sender: 'user',
        text: input,
      };

      const aiResponse: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'This is a placeholder AI response.', // Placeholder
      };

      setMessages(prevMessages => [...prevMessages, userMessage, aiResponse]);
      setInput('');
    },
    [input]
  );

  // A derived state to determine if the welcome screen should be shown
  const showWelcomeScreen = messages.length === 0;

  return (
    <div className="flex h-screen bg-[#F5F7FA] dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* --- Sidebar --- */}
      <aside className="w-[300px] flex-shrink-0 bg-white dark:bg-[#1A202C] border-r border-slate-200 dark:border-slate-800 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-bold">CHAT A.I.+</h1>
        </div>

        {/* New Chat Button and Search */}
        <div className="space-y-4 mb-8">
          <button
            onClick={startNewChat}
            className="flex w-full items-center gap-2.5 justify-start px-3 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> New chat
          </button>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search chat"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Chat History and other links */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-1">
            {[
              'Create Intem Game Environment',
              'Apply To Leave For Emergency',
              'What is UI/UX Design?',
              'Create POS System',
              'What is UX Audit',
              'Create Chatbot GPT...',
              'How Chat GPT Work?',
              'Last 7 Days',
              'Cryptic Landing App Name',
              'Obatator Grammer Types',
              'Min 3000 Pcs To Get Discount',
            ].map((chatName, index) => (
              <li key={index}>
                <a
                  href="#"
                  className={`flex items-center gap-3 p-2.5 rounded-md text-sm transition-colors ${
                    chatName === 'Create Chatbot GPT...'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <MessageSquare
                    size={16}
                    className={
                      chatName === 'Create Chatbot GPT...'
                        ? 'text-blue-600 dark:text-blue-300'
                        : 'text-slate-500'
                    }
                  />
                  {chatName}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                <Settings size={18} className="text-slate-500" />
                Settings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                <UserIcon size={18} className="text-slate-500" />
                Andrew Nielson
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-red-500"
              >
                <LogOut size={18} className="text-red-500" />
                Logout
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Upgrade Sidebar */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 transform rotate-90 origin-bottom-right p-2.5 bg-blue-600 text-white rounded-t-lg z-10 cursor-pointer">
          <span className="font-semibold text-xs whitespace-nowrap">
            Upgrade to Pro
          </span>
        </div>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {showWelcomeScreen ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center h-full max-w-2xl mx-auto">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full inline-block mb-6">
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400">
                Welcome, {user?.displayName || 'there'}!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                How can I help you today?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {suggestionPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-lg'
                      : 'bg-white dark:bg-[#1C2635] text-slate-800 dark:text-slate-200 rounded-bl-lg shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Input Area */}
        <footer className="p-6">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex items-center bg-white dark:bg-[#1C2635] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              placeholder="Message AI Chat..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 py-4 px-6 bg-transparent rounded-l-xl focus:outline-none"
            />
            <button
              type="submit"
              className="p-4 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <SendHorizontal size={20} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}