'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';

// Type definition for the floating balls animation
type FloatingBall = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
};

// Generates the initial set of floating balls
const createInitialBalls = (): FloatingBall[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 6 + 3,
    opacity: Math.random() * 0.5 + 0.1,
  }));
};

const GenixAILanding = () => {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Memoize the array of texts for the typewriter effect
  const typewriterTexts = useMemo(
    () => [
      'AI Chat',
      'AI Image',
      'AI Upscale Image',
      'AI Code',
      'AI Character',
      'AI Voice',
    ],
    []
  );

  // State for the floating balls animation
  const [balls, setBalls] = useState<FloatingBall[]>([]);

  // Initialize balls animation only once on component mount
  useEffect(() => {
    setBalls(createInitialBalls());
  }, []);

  // Effect for running the floating balls animation
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBalls(prevBalls =>
        prevBalls.map(ball => ({
          ...ball,
          x: (ball.x + ball.vx + 100) % 100,
          y: (ball.y + ball.vy + 100) % 100,
        }))
      );
    }, 50);
    return () => clearInterval(animationInterval);
  }, []);

  // Effect for the typewriter animation logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      // Typing forward
      if (currentText.length < typewriterTexts[currentTextIndex].length) {
        timeout = setTimeout(() => {
          setCurrentText(
            typewriterTexts[currentTextIndex].slice(0, currentText.length + 1)
          );
        }, 100);
      } else {
        // Pause after typing is complete
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      // Deleting backward
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(prev => prev.slice(0, -1));
        }, 50);
      } else {
        // Move to the next text after deletion is complete
        timeout = setTimeout(() => {
          setCurrentTextIndex(prev => (prev + 1) % typewriterTexts.length);
          setIsTyping(true);
        }, 500);
      }
    }

    // Cleanup timeout on effect re-run or unmount
    return () => clearTimeout(timeout);
  }, [currentText, isTyping, currentTextIndex, typewriterTexts]);

  // Effect for the blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  const handleGetStarted = useCallback(async () => {
    setIsNavigating(true);
    // Short delay for visual feedback before navigating
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push('/auth');
  }, [router]);

  // Memoize theme classes to avoid recalculating on every render
  const themeClasses = useMemo(
    () => ({
      background: isDark
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950'
        : 'bg-gradient-to-br from-gray-50 via-white to-purple-50',
      text: isDark ? 'text-white' : 'text-gray-900',
      subtitle: isDark ? 'text-gray-300' : 'text-gray-600',
      accent: isDark ? 'text-purple-400' : 'text-purple-600',
      button: isDark
        ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-xl shadow-purple-500/30'
        : 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 text-white shadow-xl shadow-purple-500/20',
      toggle: isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200',
      grid: isDark ? 'opacity-8' : 'opacity-4',
      ball: isDark ? 'bg-purple-400' : 'bg-purple-300',
    }),
    [isDark]
  );

  return (
    <div
      className={`min-h-screen w-full relative transition-all duration-700 ease-in-out ${themeClasses.background} overflow-hidden`}
    >
      {/* Animated Grid Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${themeClasses.grid} pointer-events-none`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? '#a855f720' : '#c084fc20'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? '#a855f720' : '#c084fc20'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating Balls Animation */}
      {balls.map(ball => (
        <div
          key={ball.id}
          className={`absolute rounded-full ${themeClasses.ball} transition-colors duration-700 animate-pulse pointer-events-none backdrop-blur-sm`}
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            opacity: ball.opacity,
            filter: 'blur(0.5px)',
            boxShadow: isDark
              ? '0 0 30px rgba(168, 85, 247, 0.4)'
              : '0 0 30px rgba(192, 132, 252, 0.4)',
          }}
        />
      ))}

      {/* Theme Toggle Button */}
      <div className="absolute top-8 right-8 z-10">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`flex items-center justify-center w-16 h-9 rounded-full border transition-all duration-500 ${themeClasses.toggle} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg`}
        >
          <div
            className={`w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center transition-transform duration-500 ${isDark ? 'translate-x-3' : '-translate-x-3'}`}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-white" />
            ) : (
              <Sun className="w-4 h-4 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-5xl mx-auto relative z-10">
          <div className="relative inline-block">
            <h1
              className={`text-7xl md:text-9xl font-bold mb-8 ${themeClasses.text} transition-colors duration-700 tracking-tighter`}
            >
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Genix
              </span>
              <span className={`${themeClasses.text} relative`}>
                AI
                <Sparkles className="absolute -top-8 -right-8 w-6 h-6 text-purple-400 animate-pulse" />
              </span>
            </h1>
          </div>

          <div className="mb-10">
            <span
              className={`text-2xl font-medium ${themeClasses.subtitle} mr-2`}
            >
              Unlock
            </span>
            <span
              className={`text-2xl font-mono font-bold ${themeClasses.accent}`}
            >
              {currentText}
              <span
                className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
              >
                |
              </span>
            </span>
          </div>

          <p
            className={`text-xl md:text-2xl mb-14 ${themeClasses.subtitle} transition-colors duration-700 max-w-3xl mx-auto leading-relaxed font-light`}
          >
            Experience the next generation of AI-powered tools designed to
            revolutionize your workflow and unlock unprecedented creativity.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              disabled={isNavigating}
              className={`relative z-30 group px-14 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${themeClasses.button} focus:outline-none focus:ring-4 focus:ring-purple-500/30 ${isNavigating ? 'scale-95 opacity-75 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center justify-center space-x-3">
                <span>{isNavigating ? 'Loading...' : 'Get Started'}</span>
                <ArrowRight
                  className={`w-6 h-6 transition-all duration-300 ${isNavigating ? 'translate-x-2 opacity-50' : 'group-hover:translate-x-2'}`}
                />
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10 blur-sm" />
              {isNavigating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subtle background glow effects */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? 'bg-purple-500' : 'bg-purple-400'} rounded-full opacity-[0.15] blur-[100px] animate-pulse pointer-events-none`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full opacity-[0.1] blur-[120px] animate-pulse pointer-events-none`}
      />
    </div>
  );
};

export default GenixAILanding;
