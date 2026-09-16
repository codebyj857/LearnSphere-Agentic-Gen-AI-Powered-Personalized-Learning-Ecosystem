import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Map, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext'; // Import the new context

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { openChat } = useChat(); // Use the hook

  const navItems = [
    { label: 'Home', path: '/home', icon: Home, color: 'text-cyan-400' },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'text-purple-400' },
    { label: 'Roadmap', path: '/roadmap', icon: Map, color: 'text-pink-400' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/home')}>
          LearnSphere
        </h1>
        
        <div className="flex gap-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-transparent hover:bg-gray-800 ${
                location.pathname === item.path ? 'bg-gray-800 border-gray-600 shadow-lg shadow-purple-900/20' : ''
              }`}
            >
              <item.icon size={18} className={item.color} />
              <span className={`font-medium ${location.pathname === item.path ? 'text-white' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          ))}

          {/* HELP BUTTON - Now Opens Chat */}
          <button
            onClick={openChat}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
          >
            <MessageCircle size={18} />
            <span className="font-medium">Help</span>
          </button>

          <button
            onClick={() => { logout(); navigate('/auth'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
