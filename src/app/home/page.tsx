'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, User as UserIcon, LogOut, X, Sparkles } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import app from '../../firebaseConfig';

type FloatingBall = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
};

const GlowMotion = ({ isDark }: { isDark: boolean }) => {
  const [orientation, setOrientation] = useState({ gamma: 0, beta: 0 });

  useEffect(() => {
    function handleOrientation(event: DeviceOrientationEvent) {
      setOrientation({
        gamma: event.gamma || 0,
        beta: event.beta || 0,
      });
    }

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return (
    <>
      <div
        className={`absolute w-[40rem] h-[40rem] ${isDark ? 'bg-purple-500/30' : 'bg-purple-400/20'} rounded-full blur-[100px] animate-pulse pointer-events-none transition-all duration-500`}
        style={{
          transform: `translate(${orientation.gamma}px, ${orientation.beta}px)`,
          top: '-10%',
          left: '-10%',
        }}
      />
      <div
        className={`absolute w-[35rem] h-[35rem] ${isDark ? 'bg-blue-500/20' : 'bg-blue-400/20'} rounded-full blur-[100px] animate-pulse pointer-events-none transition-all duration-500`}
        style={{
          transform: `translate(${-orientation.gamma}px, ${-orientation.beta}px)`,
          bottom: '-10%',
          right: '-10%',
        }}
      />
    </>
  );
};

const MainPage = () => {
  const router = useRouter();

  // حالة الثيم
  const [isDark, setIsDark] = useState(true);

  // تايب رايتر
  const typewriterTexts = ['AI Chat', 'AI Image', 'AI Upscale Image', 'AI Code', 'AI Character', 'AI Voice'];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
const [isDeleting, setIsDeleting] = useState(false); // خليها false بالبداية
  const [showCursor, setShowCursor] = useState(true);

  // تحية واسم المستخدم
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);

 useEffect(() => {
  let typingTimeout: NodeJS.Timeout;

  const fullText = typewriterTexts[currentTextIndex];

  if (!isDeleting && currentText.length < fullText.length) {
    // سرعة الكتابة أسرع
    typingTimeout = setTimeout(() => {
      setCurrentText(fullText.slice(0, currentText.length + 1));
    }, 80); // من 150 إلى 80 مللي ثانية
  } else if (isDeleting && currentText.length > 0) {
    // سرعة الحذف أسرع
    typingTimeout = setTimeout(() => {
      setCurrentText(fullText.slice(0, currentText.length - 1));
    }, 50); // من 100 إلى 50 مللي ثانية
  } else {
    // فترة التوقف بين النصوص (بلاش تكون طويلة)
    typingTimeout = setTimeout(() => {
      if (!isDeleting) {
        setIsDeleting(true);
      } else {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length);
      }
    }, 700); // من 1000 إلى 700 مللي ثانية
  }

  return () => clearTimeout(typingTimeout);
}, [currentText, isDeleting, currentTextIndex, typewriterTexts]);



  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // تحية حسب الوقت
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    return () => unsubscribe();
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSignOut = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  const themeClasses = {
    background: isDark
      ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950'
      : 'bg-gradient-to-br from-gray-50 via-white to-purple-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    subtitle: isDark ? 'text-gray-300' : 'text-gray-600',
    accent: isDark ? 'text-purple-400' : 'text-purple-600',
    card: isDark
      ? 'bg-gray-900/50 backdrop-blur-lg border border-gray-800'
      : 'bg-white/80 backdrop-blur-lg border border-gray-100',
    button: 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25 transition-all duration-300',
  };

  return (
    <div className={`min-h-screen w-full relative ${themeClasses.background}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <GlowMotion isDark={isDark} />

        {/* Navigation */}
        <nav className="absolute top-0 w-full z-50 px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-500" size={24} />
              <span className={`text-xl font-bold ${themeClasses.text}`}>GenixAI</span>
            </div>
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-full ${themeClasses.card} hover:scale-105 transition-transform`}
              aria-label="Account Menu"
            >
              <UserIcon size={20} className={themeClasses.text} />
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-7xl md:text-8xl font-bold mb-8 tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent">
                  The Future of AI
                </span>
              </h1>
              {user && (
                <p className={`text-2xl font-medium mb-4 ${themeClasses.accent}`}>
                  {greeting}, {user.displayName || 'User'}!
                </p>
              )}
              <p className={`text-xl ${themeClasses.subtitle} max-w-2xl mx-auto`}>
               Unlock{' '}
                <span className={`font-semibold ${themeClasses.accent}`}>
                  {currentText}
                  <span className={`${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
                </span>
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  title: 'AI Chat',
                  description: 'Engage in natural conversations with advanced AI',
                  path: '/chat1',
                  icon: '🤖',
                },
                {
                  title: 'AI Image',
                  description: 'Create stunning visuals with AI generation',
                  path: '/image',
                  icon: '🎨',
                },
                {
                  title: 'AI Upscale',
                  description: 'Enhance and perfect your images',
                  path: '/upscale',
                  icon: '✨',
                },
                {
                  title: 'AI Coder',
                  description: 'Get intelligent coding assistance',
                  path: '/coder',
                  icon: '💻',
                },
                {
                  title: 'Coming Soon',
                  description: 'More exciting features on the way',
                  path: '#',
                  icon: '🚀',
                },
              ].map(({ title, description, path, icon }) => (
                <div
                  key={title}
                  onClick={() => path !== '#' && router.push(path)}
                  className={`${themeClasses.card} p-6 rounded-2xl cursor-pointer group hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${themeClasses.text} group-hover:text-purple-500 transition-colors`}
                  >
                    {title}
                  </h3>
                  <p className={`${themeClasses.subtitle} text-sm`}>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Account</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Drawer"
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {user ? (
            <>
              <p className="text-gray-800 dark:text-gray-200 font-semibold">{user.displayName || 'User'}</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                <LogOut size={18} /> Sign Out
              </button>
              <button
                onClick={() => {
                  router.push('/profile');
                  setDrawerOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                <UserIcon size={18} /> Profile
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                router.push('/login');
                setDrawerOpen(false);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Login
            </button>
          )}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
