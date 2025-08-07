'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  Plus,
  X,
  MessageSquare,
  History,
  Video,
  Play,
  Mic,
  Database,
  User as UserIcon,
  Search,
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
  {
    icon: <Play size={20} />,
    title: 'Generate True 4K Next-Gen Videos',
    prompt: 'Generate a true 4K next-gen video about a futuristic city at sunset.',
  },
  {
    icon: <Mic size={20} />,
    title: 'Generate Voiceovers, Music, or Sound Effects',
    prompt: 'Generate a voiceover for a sci-fi documentary.',
  },
  {
    icon: <Database size={20} />,
    title: 'Interact with the Smartest Data Bot Ever',
    prompt: 'Analyze this dataset and give me key insights.',
  },
];

const chatTabs = ['General', 'Text', 'Media', 'Music', 'Analytics'];

export default function AIChat() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState(chatTabs[0]);
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
        text: `You asked: "${input}". This is a placeholder AI response.`, // Placeholder
      };

      setMessages(prevMessages => [...prevMessages, userMessage, aiResponse]);
      setInput('');
    },
    [input]
  );

  // A derived state to determine if the welcome screen should be shown
  const showWelcomeScreen = messages.length === 0;

  return (
    <div className="flex h-screen bg-[#FDFEFE] dark:bg-gray-900 text-gray-900 dark:text-gray-50 overflow-hidden relative">
      {/* --- Sidebar --- */}
      <aside className="w-20 flex-shrink-0 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center justify-between py-6 z-20">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <X size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <button
            onClick={startNewChat}
            className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors"
            aria-label="New chat"
          >
            <Plus size={24} />
          </button>
          <div className="flex flex-col items-center space-y-4 pt-4">
            <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <History size={24} className="text-gray-500" />
            </button>
            <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MessageSquare size={24} className="text-gray-500" />
            </button>
            <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Video size={24} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <UserIcon size={24} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-r from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {showWelcomeScreen ? (
            <div className="flex flex-col items-center text-center h-full max-w-4xl mx-auto py-12">
              <div
                className="w-32 h-32 rounded-full mb-8 bg-gradient-to-br from-purple-500 to-pink-500 blur-md opacity-70 animate-pulse"
              />
              <div className="text-4xl font-semibold mb-2 text-purple-900 dark:text-purple-50">
                Hi there, {user?.displayName || 'Sam'}
              </div>
              <p className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-12">
                How can I help you today?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                {suggestionPrompts.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(item.prompt)}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="p-3 mb-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat History View
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-3xl ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Input Area --- */}
        <footer className="p-8 pt-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center space-x-6 text-gray-500 dark:text-gray-400 mb-4 text-sm font-medium">
              {chatTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-1 ${
                    activeTab === tab
                      ? 'text-purple-600 dark:text-purple-400 font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-purple-600 after:rounded-full'
                      : 'hover:text-purple-600 transition-colors'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <input
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 py-4 px-6 bg-transparent rounded-full focus:outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                className="p-3 bg-purple-600 text-white rounded-full m-1 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}