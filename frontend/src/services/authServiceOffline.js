// AuthService que funciona offline para desenvolvimento
// Não faz requisições HTTP reais, simula as respostas

const API_URL = 'http://localhost:5000/api';

// Simulação de API que não faz requisições reais
const mockApi = {
  get: async (url) => {
    console.log(`Mock GET: ${url}`);
    return { data: { message: 'Mock response' } };
  },
  post: async (url, data) => {
    console.log(`Mock POST: ${url}`, data);
    return { data: { message: 'Mock response' } };
  },
  put: async (url, data) => {
    console.log(`Mock PUT: ${url}`, data);
    return { data: { message: 'Mock response' } };
  },
  delete: async (url) => {
    console.log(`Mock DELETE: ${url}`);
    return { data: { message: 'Mock response' } };
  }
};

export const register = async (username, email, password) => {
  console.log('Mock register:', { username, email, password });
  
  // Simular validação
  if (!username || !email || !password) {
    throw new Error('Todos os campos são obrigatórios');
  }
  
  // Simular sucesso
  return { 
    message: 'Usuário registrado com sucesso!',
    user: { id: 'mock-id', username, email }
  };
};

export const login = async (email, password) => {
  console.log('Mock login:', { email, password });
  
  // Simular validação
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }
  
  // Simular tokens
  const access_token = 'mock-access-token-' + Date.now();
  const refresh_token = 'mock-refresh-token-' + Date.now();
  
  localStorage.setItem('accessToken', access_token);
  localStorage.setItem('refreshToken', refresh_token);
  
  return { 
    access_token, 
    refresh_token,
    user: { id: 'mock-id', email }
  };
};

export const logout = () => {
  console.log('Mock logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getUserProfile = async () => {
  console.log('Mock getUserProfile');
  return {
    id: 'mock-id',
    username: 'Usuário Demo',
    email: 'demo@ilyra.com',
    created_at: new Date().toISOString()
  };
};

export const updateUserProfile = async (profileData) => {
  console.log('Mock updateUserProfile:', profileData);
  return {
    ...profileData,
    updated_at: new Date().toISOString()
  };
};

export const exportUserData = async () => {
  console.log('Mock exportUserData');
  return {
    user: {
      id: 'mock-id',
      username: 'Usuário Demo',
      email: 'demo@ilyra.com'
    },
    exported_at: new Date().toISOString()
  };
};

export const deleteUserData = async () => {
  console.log('Mock deleteUserData');
  logout();
  return { message: 'Dados do usuário excluídos com sucesso' };
};

export default mockApi;
