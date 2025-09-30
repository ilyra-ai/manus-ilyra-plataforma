import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Brain, 
  Zap, 
  Clock, 
  Star, 
  Eye, 
  Shield, 
  Compass, 
  Waves, 
  Target,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';

const SpiritualMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Definição das métricas espirituais básicas
  const metricsDefinitions = [
    {
      id: 'meditation',
      name: 'Meditação Diária',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      description: 'Tempo dedicado à prática meditativa diária',
      unit: 'minutos',
      target: 30
    },
    {
      id: 'consciousness',
      name: 'Nível de Consciência',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      description: 'Grau de expansão da consciência espiritual',
      unit: 'pontos',
      target: 100
    },
    {
      id: 'energy',
      name: 'Energia Vital',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      description: 'Nível de energia vital e vitalidade',
      unit: 'pontos',
      target: 100
    },
    {
      id: 'soul_age',
      name: 'Idade da Alma',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      description: 'Maturidade espiritual da alma',
      unit: 'ciclos',
      target: 7
    },
    {
      id: 'starseed',
      name: 'Ativação Starseed',
      icon: Star,
      color: 'from-indigo-500 to-purple-500',
      description: 'Grau de ativação da consciência estelar',
      unit: '%',
      target: 100
    },
    {
      id: 'past_lives',
      name: 'Memórias de Vidas Passadas',
      icon: Eye,
      color: 'from-teal-500 to-green-500',
      description: 'Acesso a memórias de encarnações anteriores',
      unit: 'lembranças',
      target: 10
    },
    {
      id: 'chakras',
      name: 'Equilíbrio dos Chakras',
      icon: Compass,
      color: 'from-green-500 to-emerald-500',
      description: 'Alinhamento e equilíbrio dos centros energéticos',
      unit: '%',
      target: 100
    },
    {
      id: 'protection',
      name: 'Proteção Energética',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      description: 'Força do campo de proteção energética',
      unit: 'pontos',
      target: 100
    },
    {
      id: 'intuition',
      name: 'Intuição e Clarividência',
      icon: Eye,
      color: 'from-violet-500 to-purple-500',
      description: 'Desenvolvimento das capacidades intuitivas',
      unit: 'pontos',
      target: 100
    },
    {
      id: 'guides',
      name: 'Conexão com Guias',
      icon: Compass,
      color: 'from-cyan-500 to-blue-500',
      description: 'Qualidade da conexão com guias espirituais',
      unit: 'pontos',
      target: 100
    },
    {
      id: 'frequency',
      name: 'Frequência Vibracional',
      icon: Waves,
      color: 'from-emerald-500 to-teal-500',
      description: 'Nível da frequência vibracional pessoal',
      unit: 'Hz',
      target: 528
    },
    {
      id: 'purpose',
      name: 'Propósito de Vida',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      description: 'Clareza sobre o propósito de vida atual',
      unit: '%',
      target: 100
    }
  ];

  // Simular carregamento de dados das métricas
  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerar dados simulados para as métricas
      const metricsData = metricsDefinitions.map(def => ({
        ...def,
        currentValue: Math.floor(Math.random() * def.target * 1.2),
        previousValue: Math.floor(Math.random() * def.target),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date().toISOString(),
        history: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * def.target)
        })).reverse()
      }));
      
      setMetrics(metricsData);
      setLoading(false);
    };

    loadMetrics();
  }, []);

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? TrendingUp : BarChart3;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Métricas Espirituais
        </h2>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Calendar className="w-4 h-4 mr-2" />
          Histórico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          const TrendIcon = getTrendIcon(metric.trend);
          const progress = getProgressPercentage(metric.currentValue, metric.target);
          
          return (
            <div
              key={metric.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => setSelectedMetric(metric)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center ${metric.trend === 'up' ? 'text-green-500' : 'text-blue-500'}`}>
                  <TrendIcon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {metric.name}
                </h3>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.currentValue}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.unit}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Meta: {metric.target} {metric.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalhes da métrica */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedMetric.name}
              </h3>
              <button
                onClick={() => setSelectedMetric(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {selectedMetric.description}
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Valor Atual:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedMetric.currentValue} {selectedMetric.unit}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Meta:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedMetric.target} {selectedMetric.unit}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Progresso:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getProgressPercentage(selectedMetric.currentValue, selectedMetric.target).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpiritualMetrics;
