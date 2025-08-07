'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  Menu,
  X,
  ArrowLeft,
  Plus,
  Settings,
  MessageSquare,
  Sparkles,
  SendHorizontal,
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Start with a clean slate when user logs in
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
      if (!input.trim()) return;

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

      setMessages((prevMessages) => [...prevMessages, userMessage, aiResponse]);
      setInput('');
    },
    [input],
  );

  // A derived state to determine if the welcome screen should be shown
  const showWelcomeScreen = messages.length === 0;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* --- Drawer --- */}
      <div
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-white dark:bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">History</h2>
          <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <button
            onClick={() => {
              startNewChat();
              setDrawerOpen(false);
            }}
            className="flex w-full items-center gap-2.5 justify-center p-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> New Chat
          </button>

          {/* Past Chats Section */}
          <div className="flex-grow">
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mt-4 mb-2">
              Past Chats
            </p>
            <ul className="space-y-1">
              {['Example Chat 1', 'Example Chat 2'].map((chatName) => (
                <li
                  key={chatName}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                >
                  <MessageSquare size={16} className="text-slate-500" /> {chatName}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => router.push('/ai-customize')}
              className="flex w-full items-center gap-3 p-2.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings size={18} /> AI Customize
            </button>
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
              <Menu size={22} />
            </button>
            <button
              onClick={() => router.push('/home')}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Back to Home"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
          </div>
          <h1 className="font-semibold text-lg">AI Chat</h1>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {showWelcomeScreen ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center h-full">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full inline-block mb-6">
                 <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400">
                Welcome, {user?.displayName || 'there'}!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">How can I help you today?</p>
              <div className="flex flex-wrap justify-center gap-3">
                {suggestionPrompts.map((prompt) => (
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
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white self-end rounded-br-lg'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 self-start rounded-bl-lg shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))
          )}
        </main>

        {/* Input Area */}
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-3">
                <input
                    type="text"
                    placeholder="Message AI Chat..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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