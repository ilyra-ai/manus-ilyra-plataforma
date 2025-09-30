import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiDashboardLine, 
  RiHeartLine, 
  RiUser3Line, 
  RiStarLine,
  RiArrowUpLine,
  RiCalendarLine,
  RiTimeLine,
  RiLightbulbLine,
  RiLeafLine,
  RiSunLine,
  RiMoonLine,
  RiSparklingLine,
  RiFireLine,
  RiFlowerLine,
  RiMagicLine,
  RiTrophyLine,
  RiGiftLine,
  RiThunderstormsLine,
  RiRainbowLine
} from '@remixicon/react';

const ModernAnimatedDashboard = () => {
  const [metrics, setMetrics] = useState({
    spiritualLevel: 85,
    meditationStreak: 12,
    gratitudeScore: 92,
    mindfulnessIndex: 78,
    energyLevel: 88,
    peaceScore: 95,
    compassionLevel: 82,
    wisdomPoints: 156,
    balanceScore: 89,
    harmonyIndex: 91
  });

  const [activeCard, setActiveCard] = useState(null);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, title: "Meditação Matinal", completed: true, duration: "20 min", icon: RiSunLine },
    { id: 2, title: "Gratidão Diária", completed: true, duration: "5 min", icon: RiHeartLine },
    { id: 3, title: "Reflexão Noturna", completed: false, duration: "15 min", icon: RiMoonLine },
    { id: 4, title: "Exercício Mindfulness", completed: false, duration: "10 min", icon: RiLeafLine },
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: "Mestre da Meditação", icon: RiTrophyLine, unlocked: true, rarity: "legendary" },
    { id: 2, title: "Coração Grato", icon: RiGiftLine, unlocked: true, rarity: "epic" },
    { id: 3, title: "Guerreiro da Luz", icon: RiThunderstormsLine, unlocked: false, rarity: "rare" },
    { id: 4, title: "Alma Iluminada", icon: RiRainbowLine, unlocked: false, rarity: "legendary" },
  ]);

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        energyLevel: Math.max(70, Math.min(100, prev.energyLevel + (Math.random() - 0.5) * 4)),
        mindfulnessIndex: Math.max(60, Math.min(100, prev.mindfulnessIndex + (Math.random() - 0.5) * 3)),
      }));
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 5000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color, suffix = "", trend = null }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        boxShadow: `0 20px 40px ${color}20`,
        borderColor: color
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveCard(activeCard === title ? null : title)}
      className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 cursor-pointer transition-all duration-300 overflow-hidden ${
        pulseEffect ? 'animate-pulse' : ''
      }`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-current rounded-full`}
            style={{ color }}
            initial={{ 
              x: Math.random() * 300, 
              y: Math.random() * 200,
              opacity: 0 
            }}
            animate={{
              x: Math.random() * 300,
              y: Math.random() * 200,
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.6 }}
          >
            <Icon size={32} style={{ color }} />
          </motion.div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              <RiArrowUpLine 
                size={16} 
                className={trend > 0 ? '' : 'rotate-180'} 
              />
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        
        <motion.h3 
          className="text-white/80 text-sm font-medium mb-2"
          animate={{ opacity: activeCard === title ? 1 : 0.8 }}
        >
          {title}
        </motion.h3>
        
        <motion.div
          className="flex items-baseline"
          animate={{ scale: activeCard === title ? 1.1 : 1 }}
        >
          <motion.span
            className="text-3xl font-bold text-white"
            animate={{ 
              color: activeCard === title ? color : '#ffffff',
              textShadow: activeCard === title ? `0 0 20px ${color}` : 'none'
            }}
          >
            {value}
          </motion.span>
          <span className="text-white/60 ml-1">{suffix}</span>
        </motion.div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${typeof value === 'number' ? value : 50}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0"
        style={{ 
          background: `radial-gradient(circle at center, ${color}20, transparent 70%)` 
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );

  const GoalItem = ({ goal, onToggle }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 10, scale: 1.02 }}
      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
        goal.completed 
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
          : 'bg-white/5 border border-white/10 hover:border-purple-400/50'
      }`}
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.2, rotate: 360 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggle(goal.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            goal.completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-white/30 hover:border-purple-400'
          }`}
        >
          {goal.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </motion.button>
        
        <motion.div
          animate={{ opacity: goal.completed ? 0.6 : 1 }}
        >
          <goal.icon size={24} className="text-purple-300" />
        </motion.div>
        
        <div>
          <motion.h4
            className={`font-medium transition-all duration-300 ${
              goal.completed ? 'text-white/60 line-through' : 'text-white'
            }`}
            animate={{ 
              textDecoration: goal.completed ? 'line-through' : 'none',
              opacity: goal.completed ? 0.6 : 1
            }}
          >
            {goal.title}
          </motion.h4>
          <p className="text-white/50 text-sm">{goal.duration}</p>
        </div>
      </div>
      
      <motion.div
        animate={{ rotate: goal.completed ? 360 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <RiTimeLine size={16} className="text-white/40" />
      </motion.div>
    </motion.div>
  );

  const AchievementBadge = ({ achievement }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: achievement.unlocked ? 1 : 0.3, 
        scale: 1, 
        rotate: 0 
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 5,
        boxShadow: achievement.unlocked ? "0 10px 30px rgba(255, 215, 0, 0.3)" : "none"
      }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        achievement.unlocked
          ? achievement.rarity === 'legendary' 
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
            : achievement.rarity === 'epic'
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50'
            : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <motion.div
        animate={{ rotate: achievement.unlocked ? [0, 360] : 0 }}
        transition={{ duration: 2, repeat: achievement.unlocked ? Infinity : 0, ease: "linear" }}
        className="text-center"
      >
        <achievement.icon 
          size={32} 
          className={achievement.unlocked ? 'text-yellow-400' : 'text-white/30'} 
        />
      </motion.div>
      <h4 className={`text-sm font-medium mt-2 text-center ${
        achievement.unlocked ? 'text-white' : 'text-white/30'
      }`}>
        {achievement.title}
      </h4>
      
      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
        >
          <RiStarLine size={12} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );

  const toggleGoal = (goalId) => {
    setDailyGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  const completedGoals = dailyGoals.filter(goal => goal.completed).length;
  const goalProgress = (completedGoals / dailyGoals.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0.1, 0.5, 0.1]
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

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1 
              className="text-4xl font-bold text-white flex items-center gap-3"
              animate={{ 
                textShadow: "0 0 20px rgba(255, 255, 255, 0.5)" 
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <RiDashboardLine className="text-purple-400" />
              </motion.div>
              Dashboard Espiritual iLyra
            </motion.h1>
            <motion.p 
              className="text-white/70 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentTime.toLocaleString('pt-BR')} - Sua jornada de crescimento espiritual
            </motion.p>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 px-4 py-2 rounded-full"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
              <span className="text-green-400 font-medium">Sistema Ativo</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Métricas Principais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <MetricCard
            title="Nível Espiritual"
            value={metrics.spiritualLevel}
            icon={RiStarLine}
            color="#fbbf24"
            suffix="%"
            trend={5}
          />
          <MetricCard
            title="Sequência de Meditação"
            value={metrics.meditationStreak}
            icon={RiUser3Line}
            color="#8b5cf6"
            suffix=" dias"
            trend={2}
          />
          <MetricCard
            title="Índice de Gratidão"
            value={metrics.gratitudeScore}
            icon={RiHeartLine}
            color="#ef4444"
            suffix="%"
            trend={8}
          />
          <MetricCard
            title="Mindfulness"
            value={metrics.mindfulnessIndex}
            icon={RiLeafLine}
            color="#10b981"
            suffix="%"
            trend={-1}
          />
          <MetricCard
            title="Energia Vital"
            value={metrics.energyLevel}
            icon={RiSunLine}
            color="#3b82f6"
            suffix="%"
            trend={3}
          />
        </motion.div>

        {/* Seção Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Objetivos Diários */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                <RiCalendarLine className="text-blue-400" />
                Objetivos Diários
              </h3>
              <motion.div
                animate={{ rotate: goalProgress === 100 ? 360 : 0 }}
                transition={{ duration: 1 }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  goalProgress === 100 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {completedGoals}/{dailyGoals.length}
              </motion.div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6 h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {dailyGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onToggle={toggleGoal}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Conquistas */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-2xl font-semibold text-white flex items-center gap-2 mb-6">
              <RiTrophyLine className="text-yellow-400" />
              Conquistas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Métricas Avançadas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-lg rounded-2xl p-6 border border-emerald-500/30 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RiSparklingLine size={48} className="text-emerald-400" />
            </motion.div>
            <motion.div
              className="text-3xl font-bold text-emerald-400 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {metrics.peaceScore}
            </motion.div>
            <p className="text-white/80">Índice de Paz Interior</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RiMagicLine size={48} className="text-purple-400" />
            </motion.div>
            <motion.div
              className="text-3xl font-bold text-purple-400 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {metrics.compassionLevel}
            </motion.div>
            <p className="text-white/80">Nível de Compaixão</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30 text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-4"
            >
              <RiLightbulbLine size={48} className="text-amber-400" />
            </motion.div>
            <motion.div
              className="text-3xl font-bold text-amber-400 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              {metrics.wisdomPoints}
            </motion.div>
            <p className="text-white/80">Pontos de Sabedoria</p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-green-400 text-sm font-medium"
            >
              +12 hoje
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModernAnimatedDashboard;
