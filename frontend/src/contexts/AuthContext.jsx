import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Em um ambiente real, você validaria o token com o backend
          // e buscaria os dados do usuário.
          // Por enquanto, vamos simular um usuário logado.
          const simulatedUser = {
            id: '123',
            name: 'Usuário Teste',
            email: 'teste@example.com',
            profile_picture: 'https://ui-avatars.com/api/?name=UT&background=random',
            phone: '11987654321',
            address: 'Rua Teste, 123',
            bio: 'Sou um usuário de teste da plataforma iLyra.'
          };
          setUser(simulatedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulação de login
      if (email === 'teste@example.com' && password === 'password') {
        const token = 'fake-jwt-token'; // Token JWT simulado
        localStorage.setItem('token', token);
        const simulatedUser = {
          id: '123',
          name: 'Usuário Teste',
          email: 'teste@example.com',
          profile_picture: 'https://ui-avatars.com/api/?name=UT&background=random',
          phone: '11987654321',
          address: 'Rua Teste, 123',
          bio: 'Sou um usuário de teste da plataforma iLyra.'
        };
        setUser(simulatedUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error('Credenciais inválidas');
      }
      // Em um ambiente real:
      // const response = await apiService.post('/auth/login', { email, password });
      // const { token, user } = response.data;
      // localStorage.setItem('token', token);
      // setUser(user);
      // setIsAuthenticated(true);
      // return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Simulação de registro
      console.log('Registrando usuário:', userData);
      // Em um ambiente real:
      // const response = await apiService.post('/auth/register', userData);
      // return response.data;
      return { success: true, message: 'Registro bem-sucedido. Verifique seu e-mail.' };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
