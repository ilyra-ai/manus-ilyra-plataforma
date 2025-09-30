import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  authService, 
  userService, 
  metricsService, 
  aiService, 
  gamificationService,
  planService,
  paymentService,
  notificationService,
  analyticsService,
  checkAPIHealth
} from '../services/apiService';

// Hook para gerenciar estado de loading e erro
export const useAPIState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
};

// Hook para autenticação
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { execute, error } = useAPIState();

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await execute(() => authService.login(email, password));
    if (result) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  }, [execute]);

  const register = useCallback(async (userData) => {
    return await execute(() => authService.register(userData));
  }, [execute]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return await execute(() => authService.forgotPassword(email));
  }, [execute]);

  const verifyEmail = useCallback(async (token) => {
    return await execute(() => authService.verifyEmail(token));
  }, [execute]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    verifyEmail
  };
};

// Hook para perfil do usuário
export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const { loading, error, execute } = useAPIState();

  const getProfile = useCallback(async () => {
    const result = await execute(() => userService.getProfile());
    if (result) {
      setProfile(result);
    }
    return result;
  }, [execute]);

  const updateProfile = useCallback(async (profileData) => {
    const result = await execute(() => userService.updateProfile(profileData));
    if (result) {
      setProfile(result);
    }
    return result;
  }, [execute]);

  const exportData = useCallback(async () => {
    return await execute(() => userService.exportData());
  }, [execute]);

  const deleteAccount = useCallback(async () => {
    return await execute(() => userService.deleteAccount());
  }, [execute]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return {
    profile,
    loading,
    error,
    getProfile,
    updateProfile,
    exportData,
    deleteAccount
  };
};

// Hook para métricas espirituais
export const useSpiritualMetrics = (period = '30d') => {
  const [metrics, setMetrics] = useState([]);
  const [insights, setInsights] = useState(null);
  const { loading, error, execute } = useAPIState();

  const getMetrics = useCallback(async (newPeriod = period) => {
    const result = await execute(() => metricsService.getMetrics(newPeriod));
    if (result) {
      setMetrics(result);
    }
    return result;
  }, [execute, period]);

  const createMetric = useCallback(async (metricData) => {
    const result = await execute(() => metricsService.createMetric(metricData));
    if (result) {
      // Atualizar lista de métricas
      await getMetrics();
    }
    return result;
  }, [execute, getMetrics]);

  const updateMetric = useCallback(async (metricId, metricData) => {
    const result = await execute(() => metricsService.updateMetric(metricId, metricData));
    if (result) {
      await getMetrics();
    }
    return result;
  }, [execute, getMetrics]);

  const deleteMetric = useCallback(async (metricId) => {
    const result = await execute(() => metricsService.deleteMetric(metricId));
    if (result) {
      await getMetrics();
    }
    return result;
  }, [execute, getMetrics]);

  const getAIAnalysis = useCallback(async (question = null) => {
    const result = await execute(() => metricsService.getAIAnalysis(question));
    if (result) {
      setInsights(result);
    }
    return result;
  }, [execute]);

  const getMetricInsights = useCallback(async (metricName) => {
    return await execute(() => metricsService.getMetricInsights(metricName));
  }, [execute]);

  useEffect(() => {
    getMetrics();
  }, [getMetrics]);

  return {
    metrics,
    insights,
    loading,
    error,
    getMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
    getAIAnalysis,
    getMetricInsights
  };
};

// Hook para chat de IA
export const useAIChat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [dailyInsights, setDailyInsights] = useState(null);
  const [weeklyRecommendations, setWeeklyRecommendations] = useState(null);
  const { loading, error, execute } = useAPIState();

  const sendMessage = useCallback(async (message, context = null) => {
    const result = await execute(() => aiService.sendMessage(message, context));
    if (result) {
      // Adicionar mensagem à conversa atual
      setCurrentConversation(prev => [...prev, {
        id: Date.now(),
        user_message: message,
        ai_response: result.response,
        timestamp: new Date().toISOString()
      }]);
    }
    return result;
  }, [execute]);

  const getConversations = useCallback(async (limit = 50) => {
    const result = await execute(() => aiService.getConversations(limit));
    if (result) {
      setConversations(result);
    }
    return result;
  }, [execute]);

  const getDailyInsights = useCallback(async () => {
    const result = await execute(() => aiService.getDailyInsights());
    if (result) {
      setDailyInsights(result);
    }
    return result;
  }, [execute]);

  const getWeeklyRecommendations = useCallback(async () => {
    const result = await execute(() => aiService.getWeeklyRecommendations());
    if (result) {
      setWeeklyRecommendations(result);
    }
    return result;
  }, [execute]);

  const getPersonalizedAffirmations = useCallback(async (count = 5) => {
    return await execute(() => aiService.getPersonalizedAffirmations(count));
  }, [execute]);

  const generateImage = useCallback(async (description) => {
    return await execute(() => aiService.generateImage(description));
  }, [execute]);

  const sendFeedback = useCallback(async (conversationId, score, feedback = null) => {
    return await execute(() => aiService.sendFeedback(conversationId, score, feedback));
  }, [execute]);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation([]);
  }, []);

  useEffect(() => {
    getConversations();
    getDailyInsights();
  }, [getConversations, getDailyInsights]);

  return {
    conversations,
    currentConversation,
    dailyInsights,
    weeklyRecommendations,
    loading,
    error,
    sendMessage,
    getConversations,
    getDailyInsights,
    getWeeklyRecommendations,
    getPersonalizedAffirmations,
    generateImage,
    sendFeedback,
    clearCurrentConversation
  };
};

// Hook para gamificação
export const useGamification = () => {
  const [userGamification, setUserGamification] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [dailyMissions, setDailyMissions] = useState([]);
  const { loading, error, execute } = useAPIState();

  const getUserGamification = useCallback(async () => {
    const result = await execute(() => gamificationService.getUserGamification());
    if (result) {
      setUserGamification(result);
    }
    return result;
  }, [execute]);

  const getAchievements = useCallback(async () => {
    const result = await execute(() => gamificationService.getAchievements());
    if (result) {
      setAchievements(result);
    }
    return result;
  }, [execute]);

  const getGlobalRanking = useCallback(async (limit = 100) => {
    const result = await execute(() => gamificationService.getGlobalRanking(limit));
    if (result) {
      setRanking(result);
    }
    return result;
  }, [execute]);

  const getDailyMissions = useCallback(async () => {
    const result = await execute(() => gamificationService.getDailyMissions());
    if (result) {
      setDailyMissions(result);
    }
    return result;
  }, [execute]);

  const completeMission = useCallback(async (missionId) => {
    const result = await execute(() => gamificationService.completeMission(missionId));
    if (result) {
      // Atualizar dados de gamificação
      await getUserGamification();
      await getDailyMissions();
    }
    return result;
  }, [execute, getUserGamification, getDailyMissions]);

  useEffect(() => {
    getUserGamification();
    getAchievements();
    getDailyMissions();
  }, [getUserGamification, getAchievements, getDailyMissions]);

  return {
    userGamification,
    achievements,
    ranking,
    dailyMissions,
    loading,
    error,
    getUserGamification,
    getAchievements,
    getGlobalRanking,
    getDailyMissions,
    completeMission
  };
};

// Hook para planos e assinaturas
export const usePlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const { loading, error, execute } = useAPIState();

  const getPlans = useCallback(async () => {
    const result = await execute(() => planService.getPlans());
    if (result) {
      setPlans(result);
    }
    return result;
  }, [execute]);

  const getCurrentSubscription = useCallback(async () => {
    const result = await execute(() => planService.getCurrentSubscription());
    if (result) {
      setCurrentSubscription(result);
    }
    return result;
  }, [execute]);

  const changePlan = useCallback(async (planId) => {
    const result = await execute(() => planService.changePlan(planId));
    if (result) {
      await getCurrentSubscription();
    }
    return result;
  }, [execute, getCurrentSubscription]);

  const cancelSubscription = useCallback(async () => {
    const result = await execute(() => planService.cancelSubscription());
    if (result) {
      await getCurrentSubscription();
    }
    return result;
  }, [execute, getCurrentSubscription]);

  const getPlanHistory = useCallback(async () => {
    const result = await execute(() => planService.getPlanHistory());
    if (result) {
      setPlanHistory(result);
    }
    return result;
  }, [execute]);

  useEffect(() => {
    getPlans();
    getCurrentSubscription();
  }, [getPlans, getCurrentSubscription]);

  return {
    plans,
    currentSubscription,
    planHistory,
    loading,
    error,
    getPlans,
    getCurrentSubscription,
    changePlan,
    cancelSubscription,
    getPlanHistory
  };
};

// Hook para notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { loading, error, execute } = useAPIState();

  const getNotifications = useCallback(async (filter = 'all') => {
    const result = await execute(() => notificationService.getNotifications(filter));
    if (result) {
      setNotifications(result.notifications || []);
      setUnreadCount(result.unread_count || 0);
    }
    return result;
  }, [execute]);

  const markAsRead = useCallback(async (notificationId) => {
    const result = await execute(() => notificationService.markAsRead(notificationId));
    if (result) {
      await getNotifications();
    }
    return result;
  }, [execute, getNotifications]);

  const markAllAsRead = useCallback(async () => {
    const result = await execute(() => notificationService.markAllAsRead());
    if (result) {
      await getNotifications();
    }
    return result;
  }, [execute, getNotifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    const result = await execute(() => notificationService.deleteNotification(notificationId));
    if (result) {
      await getNotifications();
    }
    return result;
  }, [execute, getNotifications]);

  useEffect(() => {
    getNotifications();
    
    // Polling para novas notificações a cada 30 segundos
    const interval = setInterval(() => {
      getNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [getNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

// Hook para analytics (Admin)
export const useAnalytics = () => {
  const [kpis, setKpis] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [aiStats, setAIStats] = useState(null);
  const [financialReports, setFinancialReports] = useState(null);
  const { loading, error, execute } = useAPIState();

  const getAdminKPIs = useCallback(async () => {
    const result = await execute(() => analyticsService.getAdminKPIs());
    if (result) {
      setKpis(result);
    }
    return result;
  }, [execute]);

  const getUserStats = useCallback(async (period = '30d') => {
    const result = await execute(() => analyticsService.getUserStats(period));
    if (result) {
      setUserStats(result);
    }
    return result;
  }, [execute]);

  const getAIStats = useCallback(async () => {
    const result = await execute(() => analyticsService.getAIStats());
    if (result) {
      setAIStats(result);
    }
    return result;
  }, [execute]);

  const getFinancialReports = useCallback(async (period = '30d') => {
    const result = await execute(() => analyticsService.getFinancialReports(period));
    if (result) {
      setFinancialReports(result);
    }
    return result;
  }, [execute]);

  return {
    kpis,
    userStats,
    aiStats,
    financialReports,
    loading,
    error,
    getAdminKPIs,
    getUserStats,
    getAIStats,
    getFinancialReports
  };
};

// Hook para verificar saúde da API
export const useAPIHealth = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  const checkIntervalRef = useRef(null);

  const checkHealth = useCallback(async () => {
    try {
      await checkAPIHealth();
      setIsOnline(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsOnline(false);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    // Verificação inicial
    checkHealth();

    // Verificação a cada 60 segundos
    checkIntervalRef.current = setInterval(checkHealth, 60000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkHealth]);

  return { isOnline, lastCheck, checkHealth };
};

// Hook para cache de dados
export const useDataCache = (key, fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Verificar cache se não for refresh forçado
    if (!forceRefresh) {
      const cached = localStorage.getItem(`cache_${key}`);
      const cacheTime = localStorage.getItem(`cache_time_${key}`);
      
      if (cached && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        // Cache válido por 5 minutos
        if (cacheAge < 300000) {
          setData(JSON.parse(cached));
          setLoading(false);
          setLastFetch(new Date(parseInt(cacheTime)));
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setLastFetch(new Date());
      
      // Salvar no cache
      localStorage.setItem(`cache_${key}`, JSON.stringify(result));
      localStorage.setItem(`cache_time_${key}`, Date.now().toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`cache_${key}`);
    localStorage.removeItem(`cache_time_${key}`);
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, lastFetch, refetch: fetchData, clearCache };
};
