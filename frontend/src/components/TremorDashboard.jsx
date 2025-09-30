import React, { useState, useEffect } from 'react';
import { cx } from '../lib/utils.ts';
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
  RiSunLine
} from '@remixicon/react';

// Componente Card básico do Tremor
const Card = ({ children, className = "", ...props }) => (
  <div
    className={cx(
      "rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Componente Metric básico do Tremor
const Metric = ({ children, className = "", ...props }) => (
  <p
    className={cx(
      "text-3xl font-semibold text-gray-900 dark:text-gray-50",
      className
    )}
    {...props}
  >
    {children}
  </p>
);

// Componente Text básico do Tremor
const Text = ({ children, className = "", ...props }) => (
  <p
    className={cx(
      "text-gray-700 dark:text-gray-300",
      className
    )}
    {...props}
  >
    {children}
  </p>
);

// Componente Badge básico do Tremor
const Badge = ({ children, className = "", variant = "default", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
    success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400",
    error: "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Componente Progress básico do Tremor
const ProgressBar = ({ value = 0, className = "", color = "blue", ...props }) => {
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className={cx("w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", className)} {...props}>
      <div
        className={cx("h-2 rounded-full transition-all duration-300", colors[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Componente principal do Dashboard
const TremorDashboard = () => {
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

  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, title: "Meditação Matinal", completed: true, duration: "20 min" },
    { id: 2, title: "Gratidão Diária", completed: true, duration: "5 min" },
    { id: 3, title: "Reflexão Noturna", completed: false, duration: "15 min" },
    { id: 4, title: "Exercício Mindfulness", completed: false, duration: "10 min" },
  ]);

  const [weeklyInsights, setWeeklyInsights] = useState([
    { day: "Seg", meditation: 20, gratitude: 5, reflection: 15 },
    { day: "Ter", meditation: 25, gratitude: 5, reflection: 10 },
    { day: "Qua", meditation: 15, gratitude: 8, reflection: 20 },
    { day: "Qui", meditation: 30, gratitude: 5, reflection: 15 },
    { day: "Sex", meditation: 20, gratitude: 10, reflection: 25 },
    { day: "Sáb", meditation: 35, gratitude: 15, reflection: 30 },
    { day: "Dom", meditation: 40, gratitude: 12, reflection: 20 },
  ]);

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        energyLevel: Math.max(70, Math.min(100, prev.energyLevel + (Math.random() - 0.5) * 4)),
        mindfulnessIndex: Math.max(60, Math.min(100, prev.mindfulnessIndex + (Math.random() - 0.5) * 3)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const completedGoals = dailyGoals.filter(goal => goal.completed).length;
  const goalProgress = (completedGoals / dailyGoals.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <RiDashboardLine className="text-blue-600" />
              Dashboard Espiritual iLyra
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acompanhe sua jornada de crescimento espiritual e bem-estar
            </p>
          </div>
          <Badge variant="success" className="text-sm px-4 py-2">
            <RiLightbulbLine className="w-4 h-4 mr-1" />
            Atualização em Tempo Real
          </Badge>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text>Nível Espiritual</Text>
                <Metric>{metrics.spiritualLevel}%</Metric>
              </div>
              <RiStarLine className="w-8 h-8 text-amber-500" />
            </div>
            <ProgressBar value={metrics.spiritualLevel} color="amber" className="mt-4" />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text>Sequência de Meditação</Text>
                <Metric>{metrics.meditationStreak} dias</Metric>
              </div>
              <RiUser3Line className="w-8 h-8 text-violet-500" />
            </div>
            <ProgressBar value={85} color="violet" className="mt-4" />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text>Índice de Gratidão</Text>
                <Metric>{metrics.gratitudeScore}%</Metric>
              </div>
              <RiHeartLine className="w-8 h-8 text-red-500" />
            </div>
            <ProgressBar value={metrics.gratitudeScore} color="red" className="mt-4" />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text>Mindfulness</Text>
                <Metric>{metrics.mindfulnessIndex}%</Metric>
              </div>
              <RiLeafLine className="w-8 h-8 text-emerald-500" />
            </div>
            <ProgressBar value={metrics.mindfulnessIndex} color="emerald" className="mt-4" />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text>Energia Vital</Text>
                <Metric>{metrics.energyLevel}%</Metric>
              </div>
              <RiSunLine className="w-8 h-8 text-blue-500" />
            </div>
            <ProgressBar value={metrics.energyLevel} color="blue" className="mt-4" />
          </Card>
        </div>

        {/* Seção de Objetivos e Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objetivos Diários */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <RiCalendarLine className="text-blue-600" />
                Objetivos Diários
              </h3>
              <Badge variant={goalProgress === 100 ? "success" : "default"}>
                {completedGoals}/{dailyGoals.length}
              </Badge>
            </div>
            
            <ProgressBar value={goalProgress} color="blue" className="mb-6" />
            
            <div className="space-y-4">
              {dailyGoals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={cx(
                      "w-4 h-4 rounded-full border-2",
                      goal.completed 
                        ? "bg-emerald-500 border-emerald-500" 
                        : "border-gray-300 dark:border-gray-600"
                    )} />
                    <div>
                      <Text className={cx(goal.completed && "line-through text-gray-500")}>
                        {goal.title}
                      </Text>
                      <Text className="text-sm text-gray-500">{goal.duration}</Text>
                    </div>
                  </div>
                  <RiTimeLine className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>

          {/* Insights Semanais */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
              <RiArrowUpLine className="text-emerald-600" />
              Insights da Semana
            </h3>
            
            <div className="space-y-4">
              {weeklyInsights.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Text className="font-medium w-12">{day.day}</Text>
                  <div className="flex-1 mx-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <ProgressBar value={(day.meditation / 40) * 100} color="violet" className="flex-1" />
                      <Text className="text-xs w-8">{day.meditation}m</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <ProgressBar value={(day.gratitude / 15) * 100} color="red" className="flex-1" />
                      <Text className="text-xs w-8">{day.gratitude}m</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <ProgressBar value={(day.reflection / 30) * 100} color="blue" className="flex-1" />
                      <Text className="text-xs w-8">{day.reflection}m</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Métricas Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <Metric className="text-emerald-600">{metrics.peaceScore}</Metric>
              <Text>Índice de Paz Interior</Text>
              <ProgressBar value={metrics.peaceScore} color="emerald" className="mt-4" />
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Metric className="text-violet-600">{metrics.compassionLevel}</Metric>
              <Text>Nível de Compaixão</Text>
              <ProgressBar value={metrics.compassionLevel} color="violet" className="mt-4" />
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Metric className="text-amber-600">{metrics.wisdomPoints}</Metric>
              <Text>Pontos de Sabedoria</Text>
              <div className="mt-4 flex justify-center">
                <Badge variant="warning">+12 hoje</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer com informações adicionais */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm">Última atualização: {new Date().toLocaleString('pt-BR')}</Text>
              <Text className="text-xs text-gray-500">Dados sincronizados com IA Gemini</Text>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="success">
                <RiLightbulbLine className="w-3 h-3 mr-1" />
                Sistema Ativo
              </Badge>
              <Badge variant="default">
                Versão 2.0
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TremorDashboard;
