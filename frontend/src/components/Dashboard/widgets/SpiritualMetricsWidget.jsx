/**
 * Widget de Métricas Espirituais - iLyra Platform
 * Componente completo para visualização e gestão de métricas espirituais
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Alert,
  AlertDescription,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import {
  Heart,
  Brain,
  Zap,
  Moon,
  Sun,
  Star,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Calendar,
  Clock,
  Target,
  Award,
  Sparkles,
  Eye,
  Lightbulb,
  Shield,
  Flame,
  Waves,
  Mountain,
  Leaf,
  Compass,
  Infinity,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

// Métricas espirituais predefinidas
const SPIRITUAL_METRICS = {
  // Chakras
  root_chakra: {
    name: 'Chakra Raiz',
    icon: Mountain,
    color: '#dc2626',
    category: 'chakras',
    description: 'Conexão com a terra, segurança e estabilidade',
    maxValue: 100
  },
  sacral_chakra: {
    name: 'Chakra Sacral',
    icon: Waves,
    color: '#ea580c',
    category: 'chakras',
    description: 'Criatividade, sexualidade e emoções',
    maxValue: 100
  },
  solar_plexus_chakra: {
    name: 'Chakra Plexo Solar',
    icon: Sun,
    color: '#facc15',
    category: 'chakras',
    description: 'Poder pessoal, confiança e autoestima',
    maxValue: 100
  },
  heart_chakra: {
    name: 'Chakra Cardíaco',
    icon: Heart,
    color: '#22c55e',
    category: 'chakras',
    description: 'Amor, compaixão e conexão',
    maxValue: 100
  },
  throat_chakra: {
    name: 'Chakra Laríngeo',
    icon: Sparkles,
    color: '#3b82f6',
    category: 'chakras',
    description: 'Comunicação e expressão da verdade',
    maxValue: 100
  },
  third_eye_chakra: {
    name: 'Chakra Terceiro Olho',
    icon: Eye,
    color: '#6366f1',
    category: 'chakras',
    description: 'Intuição, sabedoria e visão espiritual',
    maxValue: 100
  },
  crown_chakra: {
    name: 'Chakra Coronário',
    icon: Star,
    color: '#8b5cf6',
    category: 'chakras',
    description: 'Conexão espiritual e consciência superior',
    maxValue: 100
  },

  // Práticas Espirituais
  meditation_frequency: {
    name: 'Frequência de Meditação',
    icon: Brain,
    color: '#7c3aed',
    category: 'practices',
    description: 'Regularidade da prática meditativa',
    maxValue: 7,
    unit: 'dias/semana'
  },
  meditation_duration: {
    name: 'Duração da Meditação',
    icon: Clock,
    color: '#059669',
    category: 'practices',
    description: 'Tempo médio de meditação diária',
    maxValue: 120,
    unit: 'minutos'
  },
  prayer_frequency: {
    name: 'Frequência de Oração',
    icon: Shield,
    color: '#dc2626',
    category: 'practices',
    description: 'Regularidade das orações',
    maxValue: 7,
    unit: 'dias/semana'
  },
  gratitude_practice: {
    name: 'Prática de Gratidão',
    icon: Heart,
    color: '#f59e0b',
    category: 'practices',
    description: 'Exercícios de gratidão e reconhecimento',
    maxValue: 10
  },
  mindfulness: {
    name: 'Atenção Plena',
    icon: Lightbulb,
    color: '#06b6d4',
    category: 'practices',
    description: 'Consciência presente no momento',
    maxValue: 10
  },

  // Estados Espirituais
  inner_peace: {
    name: 'Paz Interior',
    icon: Leaf,
    color: '#10b981',
    category: 'states',
    description: 'Sensação de tranquilidade e serenidade',
    maxValue: 10
  },
  spiritual_connection: {
    name: 'Conexão Espiritual',
    icon: Infinity,
    color: '#8b5cf6',
    category: 'states',
    description: 'Sentimento de união com o divino',
    maxValue: 10
  },
  emotional_balance: {
    name: 'Equilíbrio Emocional',
    icon: Compass,
    color: '#3b82f6',
    category: 'states',
    description: 'Estabilidade e harmonia emocional',
    maxValue: 10
  },
  energy_level: {
    name: 'Nível de Energia',
    icon: Zap,
    color: '#f59e0b',
    category: 'states',
    description: 'Vitalidade e força espiritual',
    maxValue: 10
  },
  intuition_clarity: {
    name: 'Clareza Intuitiva',
    icon: Eye,
    color: '#6366f1',
    category: 'states',
    description: 'Capacidade de percepção intuitiva',
    maxValue: 10
  },

  // Desenvolvimento
  self_awareness: {
    name: 'Autoconhecimento',
    icon: Brain,
    color: '#7c3aed',
    category: 'development',
    description: 'Compreensão de si mesmo',
    maxValue: 10
  },
  compassion_level: {
    name: 'Nível de Compaixão',
    icon: Heart,
    color: '#ec4899',
    category: 'development',
    description: 'Capacidade de amar e compreender',
    maxValue: 10
  },
  wisdom_growth: {
    name: 'Crescimento da Sabedoria',
    icon: Lightbulb,
    color: '#f59e0b',
    category: 'development',
    description: 'Desenvolvimento da sabedoria espiritual',
    maxValue: 10
  },
  service_to_others: {
    name: 'Serviço aos Outros',
    icon: Shield,
    color: '#059669',
    category: 'development',
    description: 'Dedicação ao bem-estar alheio',
    maxValue: 10
  }
};

const METRIC_CATEGORIES = {
  chakras: { name: 'Chakras', color: '#8b5cf6' },
  practices: { name: 'Práticas', color: '#059669' },
  states: { name: 'Estados', color: '#3b82f6' },
  development: { name: 'Desenvolvimento', color: '#f59e0b' }
};

export const SpiritualMetricsWidget = ({ 
  id, 
  settings = {}, 
  data = {}, 
  onUpdateSettings, 
  isFullscreen = false,
  theme 
}) => {
  // Estados
  const [metrics, setMetrics] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState(settings.viewMode || 'overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState(settings.timeRange || '7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados do formulário
  const [editForm, setEditForm] = useState({
    value: 0,
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Carregar métricas
  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      // Simular carregamento de dados
      // Em produção, fazer chamada para API
      const mockMetrics = {};
      Object.keys(SPIRITUAL_METRICS).forEach(key => {
        mockMetrics[key] = {
          current: Math.floor(Math.random() * SPIRITUAL_METRICS[key].maxValue),
          history: generateMockHistory(key),
          lastUpdated: new Date(),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
      });
      setMetrics(mockMetrics);
    } catch (err) {
      setError('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = (metricKey) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const history = [];
    const maxValue = SPIRITUAL_METRICS[metricKey].maxValue;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * maxValue),
        note: i % 7 === 0 ? 'Sessão especial de meditação' : null
      });
    }
    return history;
  };

  // Métricas filtradas
  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.entries(SPIRITUAL_METRICS);
    }
    return Object.entries(SPIRITUAL_METRICS).filter(
      ([key, metric]) => metric.category === selectedCategory
    );
  }, [selectedCategory]);

  // Estatísticas gerais
  const overallStats = useMemo(() => {
    const values = Object.entries(metrics).map(([key, data]) => ({
      key,
      value: data.current,
      maxValue: SPIRITUAL_METRICS[key].maxValue,
      percentage: (data.current / SPIRITUAL_METRICS[key].maxValue) * 100
    }));

    const avgPercentage = values.reduce((sum, item) => sum + item.percentage, 0) / values.length;
    const topMetrics = values.sort((a, b) => b.percentage - a.percentage).slice(0, 3);
    const improvementNeeded = values.filter(item => item.percentage < 50);

    return {
      overall: avgPercentage,
      topMetrics,
      improvementNeeded,
      totalMetrics: values.length
    };
  }, [metrics]);

  // Funções
  const updateMetric = async (metricKey, value, note = '') => {
    try {
      setLoading(true);
      
      // Atualizar localmente
      setMetrics(prev => ({
        ...prev,
        [metricKey]: {
          ...prev[metricKey],
          current: value,
          lastUpdated: new Date(),
          history: [
            ...prev[metricKey].history,
            {
              date: new Date().toISOString().split('T')[0],
              value,
              note
            }
          ]
        }
      }));

      // Em produção, enviar para API
      // await metricsService.updateMetric(metricKey, value, note);
      
    } catch (err) {
      setError('Erro ao atualizar métrica');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMetric = (metricKey) => {
    const metric = metrics[metricKey];
    setSelectedMetric(metricKey);
    setEditForm({
      value: metric?.current || 0,
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleSaveMetric = async () => {
    if (selectedMetric) {
      await updateMetric(selectedMetric, editForm.value, editForm.note);
      setIsEditing(false);
      setSelectedMetric(null);
    }
  };

  // Renderização de componentes
  const MetricCard = ({ metricKey, metricData, currentData }) => {
    const IconComponent = metricData.icon;
    const percentage = (currentData.current / metricData.maxValue) * 100;
    const trend = currentData.trend;

    return (
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${metricData.color}20` }}
              >
                <IconComponent 
                  className="h-4 w-4" 
                  style={{ color: metricData.color }}
                />
              </div>
              <div>
                <h4 className="font-medium text-sm">{metricData.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {metricData.category}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditMetric(metricKey)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {currentData.current}
                {metricData.unit && (
                  <span className="text-sm text-muted-foreground ml-1">
                    {metricData.unit}
                  </span>
                )}
              </span>
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.floor(Math.random() * 10)}%
                </span>
              </div>
            </div>

            <Progress 
              value={percentage} 
              className="h-2"
              style={{ 
                '--progress-background': metricData.color 
              }}
            />

            <p className="text-xs text-muted-foreground">
              {metricData.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ChakraRadar = () => {
    const chakraMetrics = Object.entries(SPIRITUAL_METRICS)
      .filter(([key, metric]) => metric.category === 'chakras')
      .map(([key, metric]) => ({
        name: metric.name.replace('Chakra ', ''),
        value: metrics[key]?.current || 0,
        fullMark: metric.maxValue
      }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chakraMetrics}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Chakras"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const MetricsChart = () => {
    const chartData = Object.entries(metrics).map(([key, data]) => ({
      name: SPIRITUAL_METRICS[key].name,
      value: data.current,
      maxValue: SPIRITUAL_METRICS[key].maxValue,
      percentage: (data.current / SPIRITUAL_METRICS[key].maxValue) * 100
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <RechartsTooltip />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(overallStats.overall)}%
            </div>
            <p className="text-sm text-muted-foreground">Progresso Geral</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {overallStats.topMetrics.length}
            </div>
            <p className="text-sm text-muted-foreground">Métricas Altas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {overallStats.improvementNeeded.length}
            </div>
            <p className="text-sm text-muted-foreground">Precisam Atenção</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.totalMetrics}
            </div>
            <p className="text-sm text-muted-foreground">Total de Métricas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Chakras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Equilíbrio dos Chakras</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChakraRadar />
        </CardContent>
      </Card>

      {/* Top Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Melhores Performances</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallStats.topMetrics.map((metric, index) => (
              <div key={metric.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium">
                    {SPIRITUAL_METRICS[metric.key].name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{Math.round(metric.percentage)}%</div>
                  <div className="text-sm text-muted-foreground">
                    {metric.value}/{metric.maxValue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const MetricsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMetrics.map(([key, metricData]) => (
        <MetricCard
          key={key}
          metricKey={key}
          metricData={metricData}
          currentData={metrics[key] || { current: 0, trend: 'up' }}
        />
      ))}
    </div>
  );

  if (loading && Object.keys(metrics).length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(METRIC_CATEGORIES).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="grid">Grade</TabsTrigger>
            <TabsTrigger value="chart">Gráficos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto">
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={viewMode} className="h-full">
          <TabsContent value="overview" className="h-full">
            <OverviewPanel />
          </TabsContent>
          
          <TabsContent value="grid" className="h-full">
            <MetricsGrid />
          </TabsContent>
          
          <TabsContent value="chart" className="h-full">
            <MetricsChart />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Atualizar {selectedMetric && SPIRITUAL_METRICS[selectedMetric]?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Valor</Label>
              <Slider
                value={[editForm.value]}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, value: value[0] }))}
                max={selectedMetric ? SPIRITUAL_METRICS[selectedMetric].maxValue : 100}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-medium">{editForm.value}</span>
                <span>{selectedMetric ? SPIRITUAL_METRICS[selectedMetric].maxValue : 100}</span>
              </div>
            </div>

            <div>
              <Label>Observações (opcional)</Label>
              <Textarea
                value={editForm.note}
                onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Adicione uma nota sobre esta atualização..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMetric} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpiritualMetricsWidget;
