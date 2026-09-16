import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Check localStorage.getItem('token') directly
  // If the token is there, allow access
  // Do not rely solely on React State which might be slow to update
  const token = localStorage.getItem('token');

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Allow access if either isAuthenticated state is true OR token exists in localStorage
  if (isAuthenticated || token) {
    return <>{children}</>;
  }

  // Redirect to auth page if not authenticated
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
