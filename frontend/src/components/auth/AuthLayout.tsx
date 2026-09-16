import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import SolarSystemCanvas from '../3d/SolarSystem';

interface AuthLayoutProps {
  onAuthSuccess: (userData: { user_id: number; username: string }) => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Fade in the auth forms after a short delay
    const timer = setTimeout(() => setShowAuth(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = (userData: { user_id: number; username: string }) => {
    // Fade out auth forms, then call success callback
    setShowAuth(false);
    setTimeout(() => {
      onAuthSuccess(userData);
    }, 800);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Persistent Solar System Background */}
      <SolarSystemCanvas />
      
      {/* Glassmorphism Auth Container */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              {/* Glassmorphism Panel */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 w-[450px]">
                {/* Decorative gradient border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 -z-10 blur-xl"></div>
                
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <h1 
                    className="text-4xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    LearnSphere
                  </h1>
                  <p 
                    className="text-white/80 text-lg"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Your Journey to Excellence Begins Here
                  </p>
                </motion.div>

                {/* Form Container */}
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LoginForm 
                        onSuccess={handleAuthSuccess}
                        onToggleForm={toggleForm}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SignupForm 
                        onSuccess={handleAuthSuccess}
                        onToggleForm={toggleForm}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-center"
                >
                  <p 
                    className="text-white/60 text-sm"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={toggleForm}
                      className="ml-1 text-cyan-400 hover:text-cyan-300 underline transition-colors"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {isLogin ? "Sign Up" : "Login"}
                    </button>
                  </p>
                </motion.div>
              </div>

              {/* Floating particles effect */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    opacity: 0
                  }}
                  animate={{
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none z-5"></div>
    </div>
  );
};

export default AuthLayout;
