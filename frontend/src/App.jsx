import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import TremorDashboard from './components/TremorDashboard';
import FunctionalLandingPage from './components/LandingPageIntegrated';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserProfile from './components/user/UserProfile';
import LanguageSettings from './components/admin/LanguageSettings';

import './App.css';

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>; // Ou um spinner de carregamento
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">iLyra</Link>
          <div>
            <Link to="/dashboard" className="mr-4 hover:text-purple-400">Dashboard</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="mr-4 hover:text-purple-400">Profile</Link>
                <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-4 hover:text-purple-400">Login</Link>
                <Link to="/register" className="hover:text-purple-400">Register</Link>
              </>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<FunctionalLandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <TremorDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/language-settings" 
            element={
              <ProtectedRoute>
                <LanguageSettings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

