/**
 * Dashboard Principal Completo - iLyra Platform
 * Implementação com widgets customizáveis, gráficos interativos, métricas espirituais,
 * chat IA integrado, sistema de notificações e perfil completo
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Textarea,
  Switch,
  Slider,
  Progress,
  Alert,
  AlertDescription,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  Bell,
  Settings,
  User,
  MessageCircle,
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Brain,
  Zap,
  Moon,
  Sun,
  Star,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  Share2,
  ExternalLink,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Mic,
  Video,
  Send,
  Smile,
  Paperclip,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

// Hooks personalizados
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNotifications } from '@/hooks/useNotifications';
import { useSpiritualMetrics } from '@/hooks/useSpiritualMetrics';
import { useAIChat } from '@/hooks/useAIChat';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';

// Serviços
import { apiService } from '@/services/api';
import { metricsService } from '@/services/metrics';
import { aiService } from '@/services/ai';
import { notificationService } from '@/services/notifications';

// Componentes especializados
import { SpiritualMetricsWidget } from './widgets/SpiritualMetricsWidget';
import { AIChat } from './widgets/AIChat';
import { NotificationCenter } from './widgets/NotificationCenter';
import { UserProfile } from './widgets/UserProfile';
import { CustomizationPanel } from './widgets/CustomizationPanel';
import { MetricsChart } from './widgets/MetricsChart';
import { GoalTracker } from './widgets/GoalTracker';
import { MeditationTimer } from './widgets/MeditationTimer';
import { InsightsPanel } from './widgets/InsightsPanel';
import { QuickActions } from './widgets/QuickActions';

// Configurações e constantes
const WIDGET_TYPES = {
  SPIRITUAL_METRICS: 'spiritual_metrics',
  AI_CHAT: 'ai_chat',
  NOTIFICATIONS: 'notifications',
  PROFILE: 'profile',
  CHARTS: 'charts',
  GOALS: 'goals',
  MEDITATION: 'meditation',
  INSIGHTS: 'insights',
  QUICK_ACTIONS: 'quick_actions',
  CALENDAR: 'calendar',
  WEATHER: 'weather',
  QUOTES: 'quotes',
  PROGRESS: 'progress'
};

const DEFAULT_LAYOUT = [
  { id: 'welcome', type: 'welcome', x: 0, y: 0, w: 12, h: 2 },
  { id: 'spiritual_metrics', type: WIDGET_TYPES.SPIRITUAL_METRICS, x: 0, y: 2, w: 6, h: 4 },
  { id: 'ai_chat', type: WIDGET_TYPES.AI_CHAT, x: 6, y: 2, w: 6, h: 4 },
  { id: 'charts', type: WIDGET_TYPES.CHARTS, x: 0, y: 6, w: 8, h: 4 },
  { id: 'notifications', type: WIDGET_TYPES.NOTIFICATIONS, x: 8, y: 6, w: 4, h: 4 },
  { id: 'goals', type: WIDGET_TYPES.GOALS, x: 0, y: 10, w: 4, h: 3 },
  { id: 'meditation', type: WIDGET_TYPES.MEDITATION, x: 4, y: 10, w: 4, h: 3 },
  { id: 'insights', type: WIDGET_TYPES.INSIGHTS, x: 8, y: 10, w: 4, h: 3 }
];

const THEMES = {
  light: {
    name: 'Claro',
    primary: '#6366f1',
    secondary: '#f1f5f9',
    background: '#ffffff',
    text: '#1e293b'
  },
  dark: {
    name: 'Escuro',
    primary: '#8b5cf6',
    secondary: '#1e293b',
    background: '#0f172a',
    text: '#f1f5f9'
  },
  spiritual: {
    name: 'Espiritual',
    primary: '#7c3aed',
    secondary: '#faf5ff',
    background: '#f8fafc',
    text: '#374151'
  },
  nature: {
    name: 'Natureza',
    primary: '#059669',
    secondary: '#ecfdf5',
    background: '#f0fdf4',
    text: '#065f46'
  }
};

export const DashboardComplete = () => {
  // Estados principais
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [theme, setTheme] = useState('spiritual');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados dos widgets
  const [widgetStates, setWidgetStates] = useState({});
  const [widgetSettings, setWidgetSettings] = useState({});
  
  // Estados da interface
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullscreenWidget, setFullscreenWidget] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Hooks personalizados
  const { user, isAuthenticated } = useAuth();
  const { notifications, markAsRead, clearAll } = useNotifications();
  const { metrics, updateMetric, getMetricsHistory } = useSpiritualMetrics();
  const { sendMessage, conversations, isTyping } = useAIChat();
  const { config, updateConfig, saveLayout } = useDashboardConfig();

  // Efeitos
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        refreshDashboardData();
      }
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [refreshing]);

  // Funções principais
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        metricsData,
        conversationsData,
        notificationsData,
        configData
      ] = await Promise.all([
        metricsService.getMetrics(),
        aiService.getConversations(),
        notificationService.getNotifications(),
        apiService.get('/dashboard/config')
      ]);

      setDashboardData({
        metrics: metricsData,
        conversations: conversationsData,
        notifications: notificationsData,
        config: configData
      });

      // Aplicar configurações salvas
      if (configData.layout) {
        setLayout(configData.layout);
      }
      if (configData.theme) {
        setTheme(configData.theme);
      }
      if (configData.widgetSettings) {
        setWidgetSettings(configData.widgetSettings);
      }

    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const updatedData = await Promise.all([
        metricsService.getMetrics(),
        notificationService.getNotifications()
      ]);

      setDashboardData(prev => ({
        ...prev,
        metrics: updatedData[0],
        notifications: updatedData[1]
      }));

    } catch (err) {
      console.error('Dashboard refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const saveLayoutChanges = async () => {
    try {
      await saveLayout(layout);
      await updateConfig({ 
        layout, 
        theme, 
        widgetSettings 
      });
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  const addWidget = (type, position = null) => {
    const newWidget = {
      id: `${type}_${Date.now()}`,
      type,
      x: position?.x || 0,
      y: position?.y || 0,
      w: getDefaultWidgetSize(type).w,
      h: getDefaultWidgetSize(type).h
    };

    setLayout(prev => [...prev, newWidget]);
  };

  const removeWidget = (widgetId) => {
    setLayout(prev => prev.filter(w => w.id !== widgetId));
  };

  const updateWidgetSettings = (widgetId, settings) => {
    setWidgetSettings(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], ...settings }
    }));
  };

  const getDefaultWidgetSize = (type) => {
    const sizes = {
      [WIDGET_TYPES.SPIRITUAL_METRICS]: { w: 6, h: 4 },
      [WIDGET_TYPES.AI_CHAT]: { w: 6, h: 6 },
      [WIDGET_TYPES.NOTIFICATIONS]: { w: 4, h: 4 },
      [WIDGET_TYPES.CHARTS]: { w: 8, h: 4 },
      [WIDGET_TYPES.GOALS]: { w: 4, h: 3 },
      [WIDGET_TYPES.MEDITATION]: { w: 4, h: 3 },
      [WIDGET_TYPES.INSIGHTS]: { w: 4, h: 3 },
      [WIDGET_TYPES.QUICK_ACTIONS]: { w: 3, h: 2 }
    };
    return sizes[type] || { w: 4, h: 3 };
  };

  // Renderização de widgets
  const renderWidget = (widget) => {
    const settings = widgetSettings[widget.id] || {};
    const isFullscreen = fullscreenWidget === widget.id;
    
    const widgetProps = {
      id: widget.id,
      settings,
      data: dashboardData,
      onUpdateSettings: (newSettings) => updateWidgetSettings(widget.id, newSettings),
      onRemove: () => removeWidget(widget.id),
      onFullscreen: () => setFullscreenWidget(isFullscreen ? null : widget.id),
      isFullscreen,
      theme: THEMES[theme]
    };

    const WidgetWrapper = ({ children, title, actions = [] }) => (
      <Card className={`h-full ${isFullscreen ? 'fixed inset-4 z-50' : ''} transition-all duration-300`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center space-x-1">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="h-8 w-8 p-0"
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenWidget(isFullscreen ? null : widget.id)}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {isCustomizing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeWidget(widget.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    );

    switch (widget.type) {
      case WIDGET_TYPES.SPIRITUAL_METRICS:
        return (
          <WidgetWrapper 
            title="Métricas Espirituais"
            actions={[
              { icon: RefreshCw, onClick: () => refreshDashboardData() },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <SpiritualMetricsWidget {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.AI_CHAT:
        return (
          <WidgetWrapper 
            title="Chat IA Espiritual"
            actions={[
              { icon: MessageCircle, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <AIChat {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.NOTIFICATIONS:
        return (
          <WidgetWrapper 
            title="Notificações"
            actions={[
              { icon: Bell, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <NotificationCenter {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.CHARTS:
        return (
          <WidgetWrapper 
            title="Gráficos de Progresso"
            actions={[
              { icon: BarChart3, onClick: () => {} },
              { icon: Download, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <MetricsChart {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.GOALS:
        return (
          <WidgetWrapper 
            title="Metas Espirituais"
            actions={[
              { icon: Target, onClick: () => {} },
              { icon: Plus, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <GoalTracker {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.MEDITATION:
        return (
          <WidgetWrapper 
            title="Timer de Meditação"
            actions={[
              { icon: Clock, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <MeditationTimer {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.INSIGHTS:
        return (
          <WidgetWrapper 
            title="Insights Personalizados"
            actions={[
              { icon: Brain, onClick: () => {} },
              { icon: RefreshCw, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <InsightsPanel {...widgetProps} />
          </WidgetWrapper>
        );

      case WIDGET_TYPES.QUICK_ACTIONS:
        return (
          <WidgetWrapper 
            title="Ações Rápidas"
            actions={[
              { icon: Zap, onClick: () => {} },
              { icon: Settings, onClick: () => setSelectedWidget(widget) }
            ]}
          >
            <QuickActions {...widgetProps} />
          </WidgetWrapper>
        );

      case 'welcome':
        return (
          <Card className="h-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Bem-vindo(a), {user?.username || 'Usuário'}! 🙏
                  </h1>
                  <p className="text-purple-100">
                    Sua jornada espiritual continua hoje. Que a luz guie seus passos.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-200">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-purple-300 mt-1">
                    Plano: {user?.plan?.name || 'Free'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="h-full">
            <CardContent className="p-4 flex items-center justify-center">
              <p className="text-muted-foreground">Widget não encontrado</p>
            </CardContent>
          </Card>
        );
    }
  };

  // Interface de customização
  const CustomizationInterface = () => (
    <div className="fixed inset-0 bg-black/50 z-40 flex">
      <div className="bg-white w-80 h-full shadow-xl overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Personalizar Dashboard</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCustomizing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Seleção de Tema */}
          <div>
            <h3 className="font-medium mb-3">Tema</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([key, themeData]) => (
                <Button
                  key={key}
                  variant={theme === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(key)}
                  className="justify-start"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: themeData.primary }}
                  />
                  {themeData.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Adicionar Widgets */}
          <div>
            <h3 className="font-medium mb-3">Adicionar Widgets</h3>
            <div className="space-y-2">
              {Object.entries(WIDGET_TYPES).map(([key, type]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addWidget(type)}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {key.replace(/_/g, ' ').toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Configurações Gerais */}
          <div>
            <h3 className="font-medium mb-3">Configurações</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto-refresh</label>
                <Switch 
                  checked={config?.autoRefresh !== false}
                  onCheckedChange={(checked) => updateConfig({ autoRefresh: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Notificações</label>
                <Switch 
                  checked={config?.notifications !== false}
                  onCheckedChange={(checked) => updateConfig({ notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Modo compacto</label>
                <Switch 
                  checked={config?.compactMode === true}
                  onCheckedChange={(checked) => updateConfig({ compactMode: checked })}
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-2">
            <Button 
              onClick={saveLayoutChanges}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLayout(DEFAULT_LAYOUT)}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Padrão
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div 
        className="min-h-screen p-4 transition-colors duration-300"
        style={{ 
          backgroundColor: THEMES[theme].background,
          color: THEMES[theme].text 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {refreshing && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Atualizando...
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDashboardData}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar dados</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomizing(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Personalizar dashboard</TooltipContent>
            </Tooltip>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Bell className="h-4 w-4" />
                {notifications?.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </div>

            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Grid de Widgets */}
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {layout.map((widget) => (
            <div
              key={widget.id}
              className={`col-span-${widget.w} row-span-${widget.h}`}
              style={{
                gridColumn: `span ${widget.w}`,
                minHeight: `${widget.h * 100}px`
              }}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </div>

        {/* Interface de Customização */}
        {isCustomizing && <CustomizationInterface />}

        {/* Sidebar de Notificações */}
        {sidebarOpen && (
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-30 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notificações</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <NotificationCenter 
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
            />
          </div>
        )}

        {/* Dialog de Configuração de Widget */}
        {selectedWidget && (
          <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Widget</DialogTitle>
              </DialogHeader>
              <CustomizationPanel
                widget={selectedWidget}
                settings={widgetSettings[selectedWidget.id] || {}}
                onUpdateSettings={(settings) => updateWidgetSettings(selectedWidget.id, settings)}
                onClose={() => setSelectedWidget(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

export default DashboardComplete;
