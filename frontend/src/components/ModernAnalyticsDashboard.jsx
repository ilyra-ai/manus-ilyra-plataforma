import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiBarChartLine,
  RiLineChartLine,
  RiPieChartLine,
  RiTrendingUpLine,
  RiTrendingDownLine,
  RiEyeLine,
  RiUserLine,
  RiTimeLine,
  RiCalendarLine,
  RiHeartLine,
  RiSparklingLine,
  RiStarLine,
  RiFireLine,
  RiLeafLine,
  RiSunLine,
  RiMoonLine,
  RiThunderstormsLine,
  RiRainbowLine,
  RiFlowerLine,
  RiMagicLine,
  RiLightbulbLine,
  RiSettings3Line,
  RiRefreshLine,
  RiDownloadLine,
  RiShareLine,
  RiFilterLine,
  RiSearchLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiMoreLine,
  RiPlayLine,
  RiPauseLine,
  RiStopLine
} from '@remixicon/react';

const ModernAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetrics, setSelectedMetrics] = useState(['spiritual_growth', 'meditation_time', 'mood_score']);
  const [isRealTime, setIsRealTime] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [data, setData] = useState({});

  // Métricas espirituais disponíveis
  const availableMetrics = {
    spiritual_growth: {
      name: 'Crescimento Espiritual',
      icon: RiSunLine,
      color: '#f59e0b',
      unit: '%',
      description: 'Nível de desenvolvimento espiritual baseado em práticas e insights'
    },
    meditation_time: {
      name: 'Tempo de Meditação',
      icon: RiLeafLine,
      color: '#10b981',
      unit: 'min',
      description: 'Minutos diários dedicados à meditação e mindfulness'
    },
    mood_score: {
      name: 'Pontuação de Humor',
      icon: RiHeartLine,
      color: '#ef4444',
      unit: '/10',
      description: 'Avaliação diária do estado emocional e bem-estar'
    },
    gratitude_entries: {
      name: 'Entradas de Gratidão',
      icon: RiSparklingLine,
      color: '#8b5cf6',
      unit: 'entradas',
      description: 'Número de reflexões de gratidão registradas'
    },
    mindfulness_moments: {
      name: 'Momentos Mindful',
      icon: RiStarLine,
      color: '#06b6d4',
      unit: 'momentos',
      description: 'Instantes de presença plena ao longo do dia'
    },
    energy_level: {
      name: 'Nível de Energia',
      icon: RiFireLine,
      color: '#f97316',
      unit: '/10',
      description: 'Vitalidade e energia física/mental percebida'
    },
    wisdom_insights: {
      name: 'Insights de Sabedoria',
      icon: RiLightbulbLine,
      color: '#eab308',
      unit: 'insights',
      description: 'Momentos de compreensão profunda e sabedoria'
    },
    connection_score: {
      name: 'Conexão Espiritual',
      icon: RiRainbowLine,
      color: '#a855f7',
      unit: '/10',
      description: 'Sensação de conexão com o divino/universo'
    },
    peace_index: {
      name: 'Índice de Paz',
      icon: RiMoonLine,
      color: '#3b82f6',
      unit: '/10',
      description: 'Nível de tranquilidade e paz interior'
    },
    compassion_acts: {
      name: 'Atos de Compaixão',
      icon: RiFlowerLine,
      color: '#ec4899',
      unit: 'atos',
      description: 'Gestos de bondade e compaixão realizados'
    }
  };

  // Gera dados simulados realistas
  const generateData = (metric, days = 30) => {
    const data = [];
    const baseValue = Math.random() * 50 + 25;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simula variação natural com tendência de crescimento
      const trend = (days - i) * 0.5;
      const noise = (Math.random() - 0.5) * 10;
      const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 5 : 0;
      
      let value = baseValue + trend + noise + weekendBoost;
      
      // Ajusta baseado no tipo de métrica
      if (metric.includes('score') || metric.includes('level') || metric.includes('index')) {
        value = Math.max(1, Math.min(10, value / 10));
      } else if (metric === 'meditation_time') {
        value = Math.max(0, Math.min(120, value));
      } else if (metric === 'spiritual_growth') {
        value = Math.max(0, Math.min(100, value));
      } else {
        value = Math.max(0, Math.floor(value / 5));
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        timestamp: date.getTime()
      });
    }
    
    return data;
  };

  // Atualiza dados quando métricas ou período mudam
  useEffect(() => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const newData = {};
    
    selectedMetrics.forEach(metric => {
      newData[metric] = generateData(metric, days);
    });
    
    setData(newData);
  }, [selectedMetrics, timeRange]);

  // Atualização em tempo real
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = { ...prevData };
        
        selectedMetrics.forEach(metric => {
          if (newData[metric] && newData[metric].length > 0) {
            const lastValue = newData[metric][newData[metric].length - 1].value;
            const change = (Math.random() - 0.5) * 2;
            let newValue = lastValue + change;
            
            // Aplica limites baseados no tipo de métrica
            if (metric.includes('score') || metric.includes('level') || metric.includes('index')) {
              newValue = Math.max(1, Math.min(10, newValue));
            } else if (metric === 'meditation_time') {
              newValue = Math.max(0, Math.min(120, newValue));
            } else if (metric === 'spiritual_growth') {
              newValue = Math.max(0, Math.min(100, newValue));
            } else {
              newValue = Math.max(0, newValue);
            }
            
            // Atualiza último valor
            newData[metric] = [...newData[metric]];
            newData[metric][newData[metric].length - 1] = {
              ...newData[metric][newData[metric].length - 1],
              value: Math.round(newValue * 100) / 100
            };
          }
        });
        
        return newData;
      });
    }, 2000 / animationSpeed);
    
    return () => clearInterval(interval);
  }, [isRealTime, selectedMetrics, animationSpeed]);

  // Calcula estatísticas
  const getMetricStats = (metricKey) => {
    const metricData = data[metricKey];
    if (!metricData || metricData.length === 0) return null;
    
    const values = metricData.map(d => d.value);
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || current;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return {
      current,
      change,
      changePercent,
      average,
      max,
      min,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  // Componente de métrica individual
  const MetricCard = ({ metricKey, index }) => {
    const metric = availableMetrics[metricKey];
    const stats = getMetricStats(metricKey);
    const metricData = data[metricKey] || [];
    
    if (!metric || !stats) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: metric.color }}
              initial={{ 
                x: Math.random() * 400, 
                y: Math.random() * 300,
                opacity: 0 
              }}
              animate={{
                x: Math.random() * 400,
                y: Math.random() * 300,
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${metric.color}20`, border: `2px solid ${metric.color}50` }}
              >
                <metric.icon size={24} style={{ color: metric.color }} />
              </motion.div>
              <div>
                <h3 className="text-white font-semibold">{metric.name}</h3>
                <p className="text-white/60 text-sm">{metric.description}</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RiMoreLine size={16} className="text-white/70" />
            </motion.button>
          </div>

          {/* Current Value */}
          <div className="mb-4">
            <motion.div
              className="flex items-baseline gap-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl font-bold text-white">
                {stats.current}
              </span>
              <span className="text-white/60">{metric.unit}</span>
            </motion.div>
            
            {/* Change Indicator */}
            <div className={`flex items-center gap-1 mt-1 ${
              stats.trend === 'up' ? 'text-green-400' : 
              stats.trend === 'down' ? 'text-red-400' : 'text-white/60'
            }`}>
              {stats.trend === 'up' && <RiArrowUpLine size={16} />}
              {stats.trend === 'down' && <RiArrowDownLine size={16} />}
              <span className="text-sm font-medium">
                {Math.abs(stats.changePercent).toFixed(1)}%
              </span>
              <span className="text-xs text-white/50">vs anterior</span>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="h-16 mb-4">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id={`gradient-${metricKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: metric.color, stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: metric.color, stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              
              {/* Area Chart */}
              <motion.path
                d={`M 0,64 ${metricData.map((point, i) => {
                  const x = (i / (metricData.length - 1)) * 100;
                  const maxValue = Math.max(...metricData.map(d => d.value));
                  const y = 64 - (point.value / maxValue) * 48;
                  return `L ${x},${y}`;
                }).join(' ')} L 100,64 Z`}
                fill={`url(#gradient-${metricKey})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              
              {/* Line Chart */}
              <motion.path
                d={`M ${metricData.map((point, i) => {
                  const x = (i / (metricData.length - 1)) * 100;
                  const maxValue = Math.max(...metricData.map(d => d.value));
                  const y = 64 - (point.value / maxValue) * 48;
                  return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}`}
                stroke={metric.color}
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              
              {/* Data Points */}
              {metricData.map((point, i) => {
                const x = (i / (metricData.length - 1)) * 100;
                const maxValue = Math.max(...metricData.map(d => d.value));
                const y = 64 - (point.value / maxValue) * 48;
                
                return (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={metric.color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.5 }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white/60 text-xs">Média</p>
              <p className="text-white font-medium">
                {stats.average.toFixed(1)}{metric.unit}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Máximo</p>
              <p className="text-white font-medium">
                {stats.max.toFixed(1)}{metric.unit}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Mínimo</p>
              <p className="text-white font-medium">
                {stats.min.toFixed(1)}{metric.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{ 
            background: `radial-gradient(circle at center, ${metric.color}15, transparent 70%)` 
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 flex items-center justify-center"
            >
              <RiBarChartLine size={32} className="text-purple-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Espiritual</h1>
              <p className="text-white/70">Acompanhe sua jornada de crescimento pessoal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">Tempo Real</span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRealTime(!isRealTime)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isRealTime ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: isRealTime ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-400/50'
                      : 'bg-white/10 text-white/70 border border-white/20 hover:border-white/40'
                  }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <RiRefreshLine size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <RiDownloadLine size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Métricas Selecionadas</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(availableMetrics).map(([key, metric]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (selectedMetrics.includes(key)) {
                    setSelectedMetrics(prev => prev.filter(m => m !== key));
                  } else {
                    setSelectedMetrics(prev => [...prev, key]);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  selectedMetrics.includes(key)
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-400/50'
                    : 'bg-white/10 text-white/70 border border-white/20 hover:border-white/40'
                }`}
              >
                <metric.icon size={16} style={{ color: metric.color }} />
                {metric.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {selectedMetrics.map((metricKey, index) => (
              <MetricCard key={metricKey} metricKey={metricKey} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Metrics Selected */}
        {selectedMetrics.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RiBarChartLine size={64} className="text-white/30" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-2">Selecione suas Métricas</h3>
            <p className="text-white/60">Escolha as métricas que deseja acompanhar em sua jornada espiritual</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernAnalyticsDashboard;
