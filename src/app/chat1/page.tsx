'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import app from '../../firebaseConfig';
import { Menu, X, ArrowLeft, Plus, Settings, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export default function AIChat() {
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const router = useRouter();

  // Load user
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      startNewChat(firebaseUser);
    });
    return () => unsub();
  }, []);

  // Start new chat
  const startNewChat = (firebaseUser: User | null) => {
    setMessages([]);
    setInput('');
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { sender: 'user', text: input },
      { sender: 'ai', text: 'This is a placeholder AI response.' }, // Placeholder
    ];
    setMessages(newMessages as Message[]);
    setInput('');
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-20 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button onClick={() => setDrawerOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <button
            onClick={() => {
              startNewChat(user);
              setDrawerOpen(false);
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            <Plus size={18} /> New Chat
          </button>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 mb-2">Past Chats</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <MessageSquare size={16} /> Example Chat 1
              </li>
              <li className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <MessageSquare size={16} /> Example Chat 2
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 mb-2">Tools</p>
            <button
              onClick={() => router.push('/ai-customize')}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
            >
              <Settings size={18} /> AI Customize
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Menu size={22} />
            </button>
            <button
              onClick={() => router.push('/home')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Back to Home"
            >
              <ArrowLeft size={20} className="text-purple-600" />
            </button>
          </div>
          <h1 className="font-semibold">AI Chat</h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {showWelcome ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 dark:text-gray-400">
              <h2 className="text-2xl font-bold mb-2">
                Welcome {user?.displayName || 'User'}
              </h2>
              <p>How can I assist you today?</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white self-end ml-auto'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white self-start mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
