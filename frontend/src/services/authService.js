import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust if your backend runs on a different port/path

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        const { access_token } = response.data;
        localStorage.setItem('accessToken', access_token);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid, logout user
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
  }
  return Promise.reject(error);
});

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, refresh_token } = response.data;
  localStorage.setItem('accessToken', access_token);
  localStorage.setItem('refreshToken', refresh_token);
  return { accessToken: access_token, refreshToken: refresh_token };
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common['Authorization'];
};

export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/user/profile', profileData);
  return response.data;
};

export const exportUserData = async () => {
  const response = await api.get('/user/data/export');
  return response.data;
};

export const deleteUserData = async () => {
  const response = await api.delete('/user/data/delete');
  logout(); // Clear tokens after account deletion
  return response.data;
};

export default api;
