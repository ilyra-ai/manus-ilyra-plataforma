import React, { useState, useEffect } from 'react';
import { 
  useSpiritualMetrics, 
  useAIChat, 
  useGamification, 
  useNotifications,
  useUserProfile 
} from '../hooks/useAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Heart, 
  Brain, 
  Zap, 
  Star, 
  Trophy, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  Target,
  Award,
  Bell,
  Plus,
  Send,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

const DashboardIntegrated = () => {
  // Hooks para dados da API
  const { metrics, loading: metricsLoading, createMetric, getAIAnalysis } = useSpiritualMetrics();
  const { 
    currentConversation, 
    dailyInsights, 
    sendMessage, 
    loading: aiLoading 
  } = useAIChat();
  const { 
    userGamification, 
    achievements, 
    dailyMissions, 
    completeMission 
  } = useGamification();
  const { notifications, unreadCount } = useNotifications();
  const { profile } = useUserProfile();

  // Estados locais
  const [newMetric, setNewMetric] = useState({ name: '', value: 5, description: '' });
  const [chatMessage, setChatMessage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Cores para gráficos
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  // Processar dados das métricas para gráficos
  const processMetricsData = () => {
    if (!metrics || metrics.length === 0) return [];
    
    const groupedByDate = metrics.reduce((acc, metric) => {
      const date = new Date(metric.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += metric.value;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(groupedByDate).map(item => ({
      ...item,
      average: Math.round(item.total / item.count)
    })).slice(-7); // Últimos 7 dias
  };

  // Processar dados por categoria
  const processMetricsByCategory = () => {
    if (!metrics || metrics.length === 0) return [];
    
    const categories = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = { name: metric.name, value: 0, count: 0 };
      }
      acc[metric.name].value += metric.value;
      acc[metric.name].count += 1;
      return acc;
    }, {});

    return Object.values(categories).map(cat => ({
      ...cat,
      value: Math.round(cat.value / cat.count)
    }));
  };

  // Enviar mensagem para IA
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      await sendMessage(chatMessage, { metrics_summary: metrics });
      setChatMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Criar nova métrica
  const handleCreateMetric = async () => {
    if (!newMetric.name.trim()) return;
    
    try {
      await createMetric(newMetric);
      setNewMetric({ name: '', value: 5, description: '' });
    } catch (error) {
      console.error('Erro ao criar métrica:', error);
    }
  };

  // Completar missão
  const handleCompleteMission = async (missionId) => {
    try {
      await completeMission(missionId);
    } catch (error) {
      console.error('Erro ao completar missão:', error);
    }
  };

  const chartData = processMetricsData();
  const categoryData = processMetricsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {profile?.name || 'Usuário'}! ✨
            </h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo ao seu espaço de crescimento espiritual
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <div className="relative">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* Nível de gamificação */}
            {userGamification && (
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Nível {userGamification.level}</span>
                <Badge variant="secondary">{userGamification.points} pts</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Insights Diários */}
        {dailyInsights && (
          <Alert className="border-purple-200 bg-purple-50">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Insight do Dia:</strong> {dailyInsights.daily_insight?.substring(0, 200)}...
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="ai-chat">Chat IA</TabsTrigger>
            <TabsTrigger value="gamification">Gamificação</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cards de estatísticas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Métricas Registradas</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{metrics?.filter(m => 
                      new Date(m.created_at) > new Date(Date.now() - 7*24*60*60*1000)
                    ).length || 0} esta semana
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversas com IA</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentConversation?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Sessão atual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{achievements?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Desbloqueadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Missões Diárias</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dailyMissions?.filter(m => m.completed).length || 0}/
                    {dailyMissions?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Concluídas hoje
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de evolução */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução das Métricas</CardTitle>
                <CardDescription>
                  Média diária das suas métricas espirituais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    Adicione algumas métricas para ver sua evolução
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Métricas */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Adicionar nova métrica */}
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Nova Métrica</CardTitle>
                  <CardDescription>
                    Registre como você está se sentindo espiritualmente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nome da métrica (ex: Gratidão, Paz Interior)"
                    value={newMetric.name}
                    onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Valor: {newMetric.value}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({...newMetric, value: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Descrição opcional"
                    value={newMetric.description}
                    onChange={(e) => setNewMetric({...newMetric, description: e.target.value})}
                  />
                  
                  <Button onClick={handleCreateMetric} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Métrica
                  </Button>
                </CardContent>
              </Card>

              {/* Gráfico por categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição das suas métricas espirituais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, value}) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Nenhuma métrica registrada ainda
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lista de métricas recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="text-center py-8">Carregando métricas...</div>
                ) : metrics && metrics.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.slice(0, 10).map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(metric.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {metric.value}/10
                          </div>
                          <Progress value={metric.value * 10} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma métrica registrada ainda. Comece adicionando uma!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat IA */}
          <TabsContent value="ai-chat" className="space-y-6">
            <Card className="h-96">
              <CardHeader>
                <CardTitle>Chat com IA Espiritual</CardTitle>
                <CardDescription>
                  Converse com nossa IA especializada em espiritualidade
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                {/* Área de conversa */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {currentConversation.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Inicie uma conversa! Pergunte sobre suas métricas, peça insights ou orientação espiritual.
                    </div>
                  ) : (
                    currentConversation.map((msg, index) => (
                      <div key={index} className="space-y-2">
                        {/* Mensagem do usuário */}
                        <div className="flex justify-end">
                          <div className="bg-purple-600 text-white p-3 rounded-lg max-w-xs">
                            {msg.user_message}
                          </div>
                        </div>
                        
                        {/* Resposta da IA */}
                        <div className="flex justify-start">
                          <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                            {msg.ai_response}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input de mensagem */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={aiLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gamificação */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progresso do usuário */}
              {userGamification && (
                <Card>
                  <CardHeader>
                    <CardTitle>Seu Progresso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Nível {userGamification.level}</span>
                      <Badge variant="secondary">{userGamification.points} pontos</Badge>
                    </div>
                    
                    <Progress 
                      value={(userGamification.points % 1000) / 10} 
                      className="w-full" 
                    />
                    
                    <p className="text-sm text-gray-600">
                      {1000 - (userGamification.points % 1000)} pontos para o próximo nível
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Missões diárias */}
              <Card>
                <CardHeader>
                  <CardTitle>Missões Diárias</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyMissions && dailyMissions.length > 0 ? (
                    <div className="space-y-3">
                      {dailyMissions.map((mission) => (
                        <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{mission.title}</h4>
                            <p className="text-sm text-gray-600">{mission.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={mission.completed ? "default" : "secondary"}>
                              {mission.completed ? "Concluída" : "Pendente"}
                            </Badge>
                            {!mission.completed && (
                              <Button 
                                size="sm" 
                                onClick={() => handleCompleteMission(mission.id)}
                              >
                                Completar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma missão disponível hoje
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 border rounded-lg text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <Badge className="mt-2">
                          {achievement.points} pontos
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Continue praticando para desbloquear conquistas!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de barras por categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Dados insuficientes para análise
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estatísticas gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics && metrics.length > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span>Média Geral:</span>
                        <span className="font-bold">
                          {(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length).toFixed(1)}/10
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Maior Valor:</span>
                        <span className="font-bold text-green-600">
                          {Math.max(...metrics.map(m => m.value))}/10
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Menor Valor:</span>
                        <span className="font-bold text-red-600">
                          {Math.min(...metrics.map(m => m.value))}/10
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Total de Registros:</span>
                        <span className="font-bold">{metrics.length}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Adicione métricas para ver estatísticas
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardIntegrated;
