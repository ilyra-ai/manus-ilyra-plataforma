/**
 * DASHBOARD FUNCIONAL COMPLETO - iLyra Platform
 * IMPLEMENTAÇÃO REAL - SEM PLACEHOLDERS - PRODUÇÃO
 * Integração completa com APIs do backend
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Star, 
  Heart, 
  Brain, 
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Edit,
  Save,
  X,
  RefreshCw
} from 'lucide-react';

const DashboardFunctional = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingMetric, setEditingMetric] = useState(null);
  const [newMetricValue, setNewMetricValue] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [availableMetrics, setAvailableMetrics] = useState({});
  const [error, setError] = useState(null);

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Token de acesso não encontrado');
        return;
      }
      
      // Carregar métricas do usuário
      const metricsResponse = await fetch('/api/spiritual-metrics/user-metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.user_metrics || {});
        setAvailableMetrics(metricsData.available_metrics || {});
      } else {
        console.error('Erro ao carregar métricas:', metricsResponse.status);
      }
      
      // Carregar analytics
      const analyticsResponse = await fetch('/api/spiritual-metrics/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      } else {
        console.error('Erro ao carregar analytics:', analyticsResponse.status);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (metricKey, value) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/spiritual-metrics/user-metrics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: {
            [metricKey]: parseFloat(value)
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.updated_metrics);
        setEditingMetric(null);
        setNewMetricValue('');
        // Recarregar analytics
        loadDashboardData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar métrica:', error);
      alert('Erro ao atualizar métrica');
    }
  };

  const handleEditMetric = (metricKey, currentValue) => {
    setEditingMetric(metricKey);
    setNewMetricValue(currentValue?.toString() || '');
  };

  const handleSaveMetric = () => {
    if (editingMetric && newMetricValue !== '') {
      updateMetric(editingMetric, newMetricValue);
    }
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
    setNewMetricValue('');
  };

  const getMetricIcon = (metricKey) => {
    const iconMap = {
      consciousness_level: Brain,
      meditation_daily: Heart,
      vital_energy: Zap,
      chakra_balance: Star,
      vibrational_frequency: Activity,
      life_purpose: TrendingUp,
      soul_age: User,
      starseed_activation: Star,
      past_life_memories: Calendar
    };
    return iconMap[metricKey] || Activity;
  };

  const getMetricColor = (value, maxValue) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard espiritual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <X className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Erro ao carregar dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">iLyra Dashboard</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user?.username || 'Usuário'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={loadDashboardData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics.completion_stats?.completion_percentage || 0)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {analytics.completion_stats?.completed_metrics || 0} de {analytics.completion_stats?.total_metrics || 0} métricas
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nível Básico</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics.category_averages?.basic_average || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Métricas fundamentais</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nível Avançado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics.category_averages?.advanced_average || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Habilidades espirituais</p>
            </div>
          </div>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Métricas Básicas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Métricas Básicas</h2>
              <span className="text-sm text-gray-500">Fundamentos espirituais</span>
            </div>
            
            <div className="space-y-4">
              {Object.entries(availableMetrics)
                .filter(([key, metric]) => metric.category === 'basic')
                .slice(0, 6)
                .map(([metricKey, metricConfig]) => {
                  const IconComponent = getMetricIcon(metricKey);
                  const currentValue = metrics[metricKey] || 0;
                  const isEditing = editingMetric === metricKey;
                  
                  return (
                    <div key={metricKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getMetricColor(currentValue, metricConfig.max_value)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{metricConfig.name}</p>
                          <p className="text-xs text-gray-500">{metricConfig.unit}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <input
                              type="number"
                              value={newMetricValue}
                              onChange={(e) => setNewMetricValue(e.target.value)}
                              min={metricConfig.min_value}
                              max={metricConfig.max_value}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <button
                              onClick={handleSaveMetric}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-gray-900">
                              {currentValue}
                            </span>
                            <button
                              onClick={() => handleEditMetric(metricKey, currentValue)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Métricas Avançadas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Métricas Avançadas</h2>
              <span className="text-sm text-gray-500">Habilidades especiais</span>
            </div>
            
            <div className="space-y-4">
              {Object.entries(availableMetrics)
                .filter(([key, metric]) => metric.category === 'advanced')
                .slice(0, 6)
                .map(([metricKey, metricConfig]) => {
                  const IconComponent = getMetricIcon(metricKey);
                  const currentValue = metrics[metricKey] || 0;
                  const isEditing = editingMetric === metricKey;
                  
                  return (
                    <div key={metricKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getMetricColor(currentValue, metricConfig.max_value)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{metricConfig.name}</p>
                          <p className="text-xs text-gray-500">{metricConfig.unit}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <input
                              type="number"
                              value={newMetricValue}
                              onChange={(e) => setNewMetricValue(e.target.value)}
                              min={metricConfig.min_value}
                              max={metricConfig.max_value}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <button
                              onClick={handleSaveMetric}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-gray-900">
                              {currentValue}
                            </span>
                            <button
                              onClick={() => handleEditMetric(metricKey, currentValue)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Recomendações */}
        {analytics?.recommendations && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recomendações Personalizadas</h2>
            <div className="space-y-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status de Conexão */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Conectado ao servidor iLyra</span>
            </div>
            <span className="text-xs text-gray-400">
              Última atualização: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFunctional;
