import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/authServiceOffline';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Mudança: iniciar como false para não travar

  useEffect(() => {
    // Verificar se há tokens salvos no localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      // Se há tokens, assumir que está autenticado
      setUser({ 
        id: 'demo-user', 
        username: 'Usuário Demo',
        email: 'demo@ilyra.com'
      });
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      
      const result = await apiLogin(email, password);
      
      setUser({ 
        id: result.user.id, 
        username: 'Usuário Demo',
        email: result.user.email
      });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      setLoading(true);
      
      const result = await apiRegister(username, email, password);
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
