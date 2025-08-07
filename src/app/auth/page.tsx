'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
} from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
} from 'firebase/auth';
import { Sun, Moon, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import app from '../../firebaseConfig';

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
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 6 + 3,
    opacity: Math.random() * 0.4 + 0.1,
  }));
};

const AuthPage = () => {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the auth instance to prevent re-initialization on re-renders
  const auth = useMemo(() => getAuth(app), []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  // State for the floating balls animation
  const [balls, setBalls] = useState<FloatingBall[]>([]);

  // Initialize balls animation only once
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

    // Cleanup interval on component unmount
    return () => clearInterval(animationInterval);
  }, []); // Empty dependency array is correct here because we use a callback in setBalls

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Resets form and error when switching between Login and Sign Up
  const handleAuthModeChange = useCallback((mode: boolean) => {
    setIsLogin(mode);
    setError(null);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  }, []);

  const handleEmailAuth = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      const { email, password, confirmPassword } = formData;

      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          if (password !== confirmPassword) {
            setError('Passwords do not match!');
            setIsLoading(false);
            return;
          }
          await createUserWithEmailAndPassword(auth, email, password);
        }
        router.push('/home');
      } catch (err: unknown) {
        const authError = err as AuthError;
        console.error('Authentication error:', authError.message);
        setError(authError.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    },
    [auth, formData, isLogin, router]
  );

  const handleGoogleAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (err: unknown) {
      const authError = err as AuthError;
      console.error('Google authentication error:', authError.message);
      setError(authError.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [auth, router]);

  // Memoize theme classes to avoid recalculating on every render
  const themeClasses = useMemo(
    () => ({
      background: isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-purple-50',
      text: isDark ? 'text-white' : 'text-gray-900',
      subtitle: isDark ? 'text-gray-300' : 'text-gray-600',
      accent: isDark ? 'text-purple-400' : 'text-purple-600',
      button: isDark
        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25'
        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30',
      googleButton: isDark
        ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
        : 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-700',
      toggle: isDark
        ? 'bg-gray-700 border-gray-600'
        : 'bg-gray-200 border-gray-300',
      grid: isDark ? 'opacity-10' : 'opacity-5',
      ball: isDark ? 'bg-purple-500' : 'bg-purple-400',
      card: isDark
        ? 'bg-gray-800/50 border-gray-700/50'
        : 'bg-white/80 border-gray-200/50',
      input: isDark
        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
        : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500',
    }),
    [isDark]
  );

  return (
    <div
      className={`min-h-screen w-full relative transition-all duration-700 ease-in-out ${themeClasses.background} overflow-auto`}
    >
      {/* Animated Grid Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${themeClasses.grid}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? '#a855f7' : '#c084fc'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? '#a855f7' : '#c084fc'} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Balls */}
      {balls.map(ball => (
        <div
          key={ball.id}
          className={`absolute rounded-full ${themeClasses.ball} transition-colors duration-700 animate-pulse pointer-events-none`}
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            opacity: ball.opacity,
            filter: 'blur(0.5px)',
            boxShadow: isDark
              ? '0 0 15px rgba(168, 85, 247, 0.2)'
              : '0 0 15px rgba(192, 132, 252, 0.2)',
            zIndex: 1,
          }}
        />
      ))}

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-14 h-8 rounded-full border-2 transition-all duration-500 ${themeClasses.toggle} hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
          aria-label="Toggle theme"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform duration-500 ${isDark ? 'translate-x-3' : '-translate-x-3'}`}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-purple-600" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-10 relative z-10">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <form
            onSubmit={handleEmailAuth}
            className={`backdrop-blur-lg rounded-2xl border ${themeClasses.card} shadow-2xl p-8 transition-all duration-700`}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1
                className={`text-3xl font-bold mb-1 ${themeClasses.text} transition-colors duration-700`}
              >
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p
                className={`${themeClasses.subtitle} transition-colors duration-700 text-sm`}
              >
                {isLogin
                  ? 'Sign in to your GenixAI account'
                  : 'Join GenixAI and unlock AI tools'}
              </p>
            </div>

            {/* Auth Toggle */}
            <div className="relative flex mb-6 rounded-lg w-full bg-gray-200/20 dark:bg-gray-700/50 p-1">
              <div
                className={`absolute transition-all duration-500 ease-in-out h-[calc(100%-8px)] w-[calc(50%-4px)] ${themeClasses.button} rounded-lg`}
                style={{
                  transform: `translateX(${isLogin ? '4px' : 'calc(100% + 4px)'})`,
                }}
              />
              <button
                type="button"
                onClick={() => handleAuthModeChange(true)}
                className={`relative flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-300 ${isLogin ? 'text-white' : `${themeClasses.subtitle} hover:${themeClasses.text}`}`}
              >
                <span
                  className={`transition-transform duration-300 ${isLogin ? 'scale-110' : 'scale-100'}`}
                >
                  Login
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleAuthModeChange(false)}
                className={`relative flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-300 ${!isLogin ? 'text-white' : `${themeClasses.subtitle} hover:${themeClasses.text}`}`}
              >
                <span
                  className={`transition-transform duration-300 ${!isLogin ? 'scale-110' : 'scale-100'}`}
                >
                  Sign Up
                </span>
              </button>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text} mb-1`}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-3 w-5 h-5 ${themeClasses.subtitle}`}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${themeClasses.input}`}
                      placeholder="Enter your full name"
                      required={!isLogin}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}
              <div>
                <label
                  className={`block text-sm font-medium ${themeClasses.text} mb-1`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-3 w-5 h-5 ${themeClasses.subtitle}`}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${themeClasses.input}`}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${themeClasses.text} mb-1`}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-3 w-5 h-5 ${themeClasses.subtitle}`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${themeClasses.input}`}
                    placeholder="Enter your password"
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className={`absolute right-3 top-3 ${themeClasses.subtitle} hover:${themeClasses.text} transition-colors duration-200`}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text} mb-1`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-3 w-5 h-5 ${themeClasses.subtitle}`}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${themeClasses.input}`}
                      placeholder="Confirm your password"
                      required={!isLogin}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className={`text-sm ${themeClasses.accent} hover:underline transition-all duration-200`}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Error Message Display */}
            {error && (
              <p className="text-red-400 text-xs text-center mt-4 bg-red-500/10 p-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-30 ${themeClasses.button} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </span>
            </button>

            {/* Divider */}
            <div
              className={`my-6 flex items-center justify-center text-sm ${themeClasses.subtitle}`}
            >
              <div
                className={`border-t w-full max-w-xs ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              />
              <span className="mx-2">or</span>
              <div
                className={`border-t w-full max-w-xs ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              />
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-30 ${themeClasses.googleButton} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <img
                src="/Image/Google_icon.svg"
                alt="Google icon"
                className="w-6 h-6"
                draggable={false}
              />
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </div>

      {/* Subtle glow effects */}
      <div
        className={`absolute top-1/4 left-1/4 w-48 h-48 ${isDark ? 'bg-purple-500' : 'bg-purple-400'} rounded-full opacity-5 blur-3xl animate-pulse pointer-events-none`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full opacity-5 blur-3xl animate-pulse pointer-events-none`}
      />
    </div>
  );
};

export default AuthPage;
