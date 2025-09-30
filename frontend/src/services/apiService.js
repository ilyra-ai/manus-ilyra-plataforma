import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Criar instância do axios com configurações padrão
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratar erros de autenticação
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    // Tratar erros de rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }
    
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao registrar usuário');
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
      
      localStorage.setItem('authToken', response.data.access_token);
      return response.data;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  // Recuperação de senha
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    }
  },

  // Verificação de email
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao verificar email');
    }
  }
};

// Serviços de Usuário
export const userService = {
  // Obter perfil do usuário
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter perfil');
    }
  },

  // Atualizar perfil
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  },

  // Obter estatísticas do usuário
  getStats: async () => {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas');
    }
  },

  // Exportar dados do usuário
  exportData: async () => {
    try {
      const response = await apiClient.get('/users/export', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao exportar dados');
    }
  },

  // Excluir conta
  deleteAccount: async () => {
    try {
      const response = await apiClient.delete('/users/account');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao excluir conta');
    }
  }
};

// Serviços de Métricas Espirituais
export const metricsService = {
  // Obter todas as métricas do usuário
  getMetrics: async (period = '30d') => {
    try {
      const response = await apiClient.get(`/spiritual-metrics?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter métricas');
    }
  },

  // Criar nova métrica
  createMetric: async (metricData) => {
    try {
      const response = await apiClient.post('/spiritual-metrics', metricData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar métrica');
    }
  },

  // Atualizar métrica
  updateMetric: async (metricId, metricData) => {
    try {
      const response = await apiClient.put(`/spiritual-metrics/${metricId}`, metricData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar métrica');
    }
  },

  // Excluir métrica
  deleteMetric: async (metricId) => {
    try {
      const response = await apiClient.delete(`/spiritual-metrics/${metricId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao excluir métrica');
    }
  },

  // Obter análise de métricas via IA
  getAIAnalysis: async (question = null) => {
    try {
      const response = await apiClient.post('/spiritual-metrics/ai-analysis', { question });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter análise de IA');
    }
  },

  // Obter insights para métrica específica
  getMetricInsights: async (metricName) => {
    try {
      const response = await apiClient.get(`/spiritual-metrics/insights/${metricName}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter insights');
    }
  },

  // Obter sugestões de novas métricas
  getMetricSuggestions: async () => {
    try {
      const response = await apiClient.get('/spiritual-metrics/suggestions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter sugestões');
    }
  }
};

// Serviços de IA
export const aiService = {
  // Enviar mensagem para o chat de IA
  sendMessage: async (message, context = null) => {
    try {
      const response = await apiClient.post('/ai/chat', { message, context });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao enviar mensagem');
    }
  },

  // Obter histórico de conversas
  getConversations: async (limit = 50) => {
    try {
      const response = await apiClient.get(`/ai/conversations?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter conversas');
    }
  },

  // Obter insights diários
  getDailyInsights: async () => {
    try {
      const response = await apiClient.get('/ai/insights/daily');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter insights diários');
    }
  },

  // Obter recomendações semanais
  getWeeklyRecommendations: async () => {
    try {
      const response = await apiClient.get('/ai/insights/weekly');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter recomendações semanais');
    }
  },

  // Obter afirmações personalizadas
  getPersonalizedAffirmations: async (count = 5) => {
    try {
      const response = await apiClient.get(`/ai/affirmations?count=${count}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter afirmações');
    }
  },

  // Gerar imagem espiritual
  generateImage: async (description) => {
    try {
      const response = await apiClient.post('/ai/generate-image', { description });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao gerar imagem');
    }
  },

  // Exportar conversa
  exportConversation: async (conversationId) => {
    try {
      const response = await apiClient.get(`/ai/conversations/${conversationId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao exportar conversa');
    }
  },

  // Enviar feedback sobre resposta da IA
  sendFeedback: async (conversationId, score, feedback = null) => {
    try {
      const response = await apiClient.post(`/ai/conversations/${conversationId}/feedback`, {
        score,
        feedback
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao enviar feedback');
    }
  }
};

// Serviços de Gamificação
export const gamificationService = {
  // Obter dados de gamificação do usuário
  getUserGamification: async () => {
    try {
      const response = await apiClient.get('/gamification/user');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter dados de gamificação');
    }
  },

  // Obter conquistas
  getAchievements: async () => {
    try {
      const response = await apiClient.get('/gamification/achievements');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter conquistas');
    }
  },

  // Obter ranking global
  getGlobalRanking: async (limit = 100) => {
    try {
      const response = await apiClient.get(`/gamification/ranking?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter ranking');
    }
  },

  // Obter missões diárias
  getDailyMissions: async () => {
    try {
      const response = await apiClient.get('/gamification/missions/daily');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter missões diárias');
    }
  },

  // Completar missão
  completeMission: async (missionId) => {
    try {
      const response = await apiClient.post(`/gamification/missions/${missionId}/complete`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao completar missão');
    }
  }
};

// Serviços de Planos e Assinaturas
export const planService = {
  // Obter todos os planos disponíveis
  getPlans: async () => {
    try {
      const response = await apiClient.get('/plans');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter planos');
    }
  },

  // Obter assinatura atual do usuário
  getCurrentSubscription: async () => {
    try {
      const response = await apiClient.get('/plans/subscription');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter assinatura');
    }
  },

  // Fazer upgrade/downgrade de plano
  changePlan: async (planId) => {
    try {
      const response = await apiClient.post('/plans/change', { plan_id: planId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao alterar plano');
    }
  },

  // Cancelar assinatura
  cancelSubscription: async () => {
    try {
      const response = await apiClient.post('/plans/cancel');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao cancelar assinatura');
    }
  },

  // Obter histórico de mudanças de planos
  getPlanHistory: async () => {
    try {
      const response = await apiClient.get('/plans/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter histórico');
    }
  }
};

// Serviços de Pagamento
export const paymentService = {
  // Criar sessão de pagamento
  createPaymentSession: async (planId, paymentMethod) => {
    try {
      const response = await apiClient.post('/payments/create-session', {
        plan_id: planId,
        payment_method: paymentMethod
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar sessão de pagamento');
    }
  },

  // Confirmar pagamento
  confirmPayment: async (sessionId) => {
    try {
      const response = await apiClient.post('/payments/confirm', { session_id: sessionId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao confirmar pagamento');
    }
  },

  // Obter histórico de pagamentos
  getPaymentHistory: async () => {
    try {
      const response = await apiClient.get('/payments/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter histórico de pagamentos');
    }
  },

  // Solicitar reembolso
  requestRefund: async (paymentId, reason) => {
    try {
      const response = await apiClient.post('/payments/refund', {
        payment_id: paymentId,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao solicitar reembolso');
    }
  }
};

// Serviços de Notificações
export const notificationService = {
  // Obter notificações do usuário
  getNotifications: async (filter = 'all') => {
    try {
      const response = await apiClient.get(`/notifications?filter=${filter}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter notificações');
    }
  },

  // Marcar notificação como lida
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar como lida');
    }
  },

  // Marcar todas como lidas
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar todas como lidas');
    }
  },

  // Excluir notificação
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao excluir notificação');
    }
  }
};

// Serviços de Analytics (Admin)
export const analyticsService = {
  // Obter KPIs do dashboard admin
  getAdminKPIs: async () => {
    try {
      const response = await apiClient.get('/admin/analytics/kpis');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter KPIs');
    }
  },

  // Obter estatísticas de usuários
  getUserStats: async (period = '30d') => {
    try {
      const response = await apiClient.get(`/admin/analytics/users?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas de usuários');
    }
  },

  // Obter estatísticas de IA
  getAIStats: async () => {
    try {
      const response = await apiClient.get('/admin/analytics/ai');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas de IA');
    }
  },

  // Obter relatórios financeiros
  getFinancialReports: async (period = '30d') => {
    try {
      const response = await apiClient.get(`/admin/analytics/financial?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter relatórios financeiros');
    }
  }
};

// Função utilitária para verificar se a API está online
export const checkAPIHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API não está respondendo');
  }
};

// Função para configurar interceptors personalizados
export const setupCustomInterceptors = (onTokenExpired, onError) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && onTokenExpired) {
        onTokenExpired();
      }
      
      if (onError) {
        onError(error);
      }
      
      return Promise.reject(error);
    }
  );
};

export default apiClient;
