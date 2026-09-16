import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './components/pages/Home';
import Auth from './pages/Auth';
import Survey from './components/onboarding/Survey';
import Roadmap from './components/roadmap/Roadmap';
import ChatWidget from './components/navigation/ChatWidget';
import Dashboard from './components/dashboard/Dashboard';
import FeedbackPage from './pages/FeedbackPage';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const token = localStorage.getItem('learnsphere_token');
  
  if (loading) return <div className="flex min-h-screen overflow-y-auto overflow-x-hidden items-center justify-center text-white">Loading...</div>;
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/survey" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="relative w-full min-h-screen overflow-y-auto overflow-x-hidden bg-deep-space text-white flex flex-col">
        <Navbar />
        <div className="absolute inset-0 z-[-1] bg-[url('https://cdn.pixabay.com/photo/2011/12/14/12/11/astronaut-11080_1280.jpg')] opacity-20 bg-cover bg-center" />
        <div className="flex-1 min-h-screen overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/survey" : "/auth"} replace />} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/home" element={<Home />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard userId={user?.id || user?.user_id || 0} /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Survey userId={user?.id || user?.user_id || 0} onComplete={() => {}} /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
          </Routes>
        </div>
        <ChatWidget />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
