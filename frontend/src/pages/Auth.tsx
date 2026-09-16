import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, BrainCircuit, Sparkles } from 'lucide-react';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const getAuthSuggestion = (message: string, loginMode: boolean) => {
    const text = message?.toLowerCase() || '';

    if (text.includes('email') && text.includes('required')) {
      return 'Please enter a valid email address so we can identify your account.';
    }

    if (text.includes('password') && text.includes('required')) {
      return 'Provide a strong password and try again. Passwords must be at least 8 characters.';
    }

    if (text.includes('already exists') || text.includes('user with this email')) {
      return 'This email is already registered. Try signing in or use a different email to create a new account.';
    }

    if (text.includes('invalid email') || text.includes('invalid email or password') || text.includes('invalid credentials')) {
      return loginMode
        ? 'Check your email and password and try again. If you forgot your password, reset it or use the correct registered email.'
        : 'Use a valid email address and password before trying again.';
    }

    if (text.includes('cannot connect') || text.includes('connection refused') || text.includes('network')) {
      return 'Verify that the backend server is running at http://localhost:5002 and that your network is stable.';
    }

    if (text.includes('failed to create user') || text.includes('login failed')) {
      return loginMode
        ? 'Try signing in again in a few moments, or reset your password if the problem persists.'
        : 'Please review your registration details and try again. If it still fails, contact support.';
    }

    return loginMode
      ? 'Double-check your login details and try again, or create a new account if you do not have one.'
      : 'Double-check your registration details and try again with a valid name, email, and password.';
  };

  const resolveApiError = (response: any) => {
    if (!response) {
      return {
        message: 'An unexpected authentication error occurred.',
        suggestion: 'Please try again, and reach out if the issue continues.'
      };
    }

    if (typeof response.error === 'string') {
      return {
        message: response.error,
        suggestion: response.suggestion
      };
    }

    if (response.error === true) {
      return {
        message: response.message || response.details || 'Authentication failed.',
        suggestion: response.suggestion
      };
    }

    return {
      message: 'Authentication failed.',
      suggestion: response.suggestion
    };
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('learnsphere_token');
    const user = localStorage.getItem('learnsphere_user');
    if (token && user) {
      navigate('/survey');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };
      
      const response = await apiClient.post(endpoint, payload);

      if (response.error) {
        const { message, suggestion: serverSuggestion } = resolveApiError(response);
        setError(message);
        setSuggestion(serverSuggestion || getAuthSuggestion(message, isLogin));
        return;
      }

      // Store token and user info in auth state and localStorage
      authLogin(response.token, response.user);
      setSuccess(isLogin ? 'Login successful! Redirecting...' : 'Account created! Redirecting...');
      setError(null);
      setSuggestion(null);
      
      // Redirect to survey after successful auth
      setTimeout(() => {
        navigate('/survey');
      }, 1500);

    } catch (err: any) {
      console.error('Auth error:', err);
      
      const knownMessage = err?.message || err?.error || '';
      const fallbackError = isLogin ? 'Login failed. Please try again.' : 'Account creation failed. Please try again.';
      const fallbackSuggestion = getAuthSuggestion(knownMessage, isLogin);

      if (knownMessage && (
        knownMessage.includes('Failed to fetch') || 
        knownMessage.includes('ERR_CONNECTION_REFUSED') ||
        knownMessage.includes('NetworkError') ||
        knownMessage.includes('ECONNREFUSED')
      )) {
        setError('Cannot connect to server. Please make sure the Python backend is running on port 5002.');
        setSuggestion('Open the backend server terminal and restart the app if needed.');
      } else {
        const { message, suggestion: serverSuggestion } = resolveApiError(err);
        setError(message || fallbackError);
        setSuggestion(serverSuggestion || fallbackSuggestion);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-600/10 rounded-full blur-xl animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <BrainCircuit className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Join LearnSphere'}
            </h1>
            <p className="text-gray-300 text-lg">
              {isLogin 
                ? 'Sign in to continue your learning journey' 
                : 'Start your personalized career path today'
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Learning</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl mb-6 text-center animate-pulse">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-medium">⚠️ {error}</span>
                {suggestion && (
                  <span className="mt-2 text-xs text-cyan-100 max-w-md">
                    💡 {suggestion}
                  </span>
                )}
              </div>
            </div>
          )}

          
          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Name Field - Only show for Sign Up */}
              {!isLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline decoration-2 hover:decoration-4"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
