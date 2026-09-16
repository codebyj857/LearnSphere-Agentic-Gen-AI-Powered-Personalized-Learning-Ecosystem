import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // FORM ALWAYS RENDERS - NO CONDITIONAL RETURNS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        navigate('/home');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] w-full pt-20">
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Access your personalized learning universe</p>
        </div>
        
        {/* ERROR ALWAYS SHOWS IN RED TEXT IF EXISTS - FORM REMAINS VISIBLE */}
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Enter username" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                disabled={loading}
              />
            </div>
          </div>

          {/* BUTTON ALWAYS CLICKABLE - DISABLED ONLY DURING LOADING */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Sign In"} <ArrowRight size={20} />
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-400">
          Don't have an account? <span onClick={() => navigate('/signup')} className="text-purple-400 hover:text-purple-300 cursor-pointer font-semibold">Sign Up</span>
        </p>
      </div>
    </div>
  );
};
export default LoginForm;
