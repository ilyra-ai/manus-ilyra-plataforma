import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Button, Badge, Grid, Flex, ProgressBar, Metric, LineChart, BarChart, Textarea, Select, SelectItem } from '@tremor/react';
import { RiBrainLine, RiRobotLine, RiBookOpenLine, RiLightbulbLine, RiTargetLine, RiBarChartLine, RiSettings3Line, RiPlayLine } from 'remixicon-react';

const AITrainingCenter = () => {
  const [trainingProgress, setTrainingProgress] = useState(78);
  const [activeModel, setActiveModel] = useState('Gemini Pro Enhanced');
  const [trainingData, setTrainingData] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('spiritual_level');
  const [isTraining, setIsTraining] = useState(false);

  const spiritualMetrics = [
    {
      id: 'spiritual_level',
      name: 'Nível Espiritual',
      description: 'Medida geral do desenvolvimento espiritual do usuário',
      algorithm: 'Análise de padrões de meditação, gratidão e mindfulness',
      accuracy: 94.2,
      lastTrained: '2025-09-30',
      dataPoints: 15420
    },
    {
      id: 'meditation_quality',
      name: 'Qualidade da Meditação',
      description: 'Avalia a profundidade e efetividade das sessões de meditação',
      algorithm: 'Deep learning com análise temporal e biométrica',
      accuracy: 91.8,
      lastTrained: '2025-09-29',
      dataPoints: 8930
    },
    {
      id: 'gratitude_index',
      name: 'Índice de Gratidão',
      description: 'Mede a capacidade de reconhecer e expressar gratidão',
      algorithm: 'NLP avançado com análise de sentimentos',
      accuracy: 89.5,
      lastTrained: '2025-09-28',
      dataPoints: 12650
    },
    {
      id: 'mindfulness_score',
      name: 'Score de Mindfulness',
      description: 'Avalia a presença e consciência no momento presente',
      algorithm: 'Análise comportamental e padrões de atenção',
      accuracy: 92.7,
      lastTrained: '2025-09-30',
      dataPoints: 11200
    },
    {
      id: 'inner_peace',
      name: 'Paz Interior',
      description: 'Mede o estado de tranquilidade e equilíbrio interno',
      algorithm: 'Análise multimodal com dados fisiológicos',
      accuracy: 88.9,
      lastTrained: '2025-09-27',
      dataPoints: 9870
    },
    {
      id: 'compassion_level',
      name: 'Nível de Compaixão',
      description: 'Avalia a capacidade de empatia e amor incondicional',
      algorithm: 'Análise de interações sociais e respostas emocionais',
      accuracy: 90.3,
      lastTrained: '2025-09-29',
      dataPoints: 7650
    },
    {
      id: 'wisdom_points',
      name: 'Pontos de Sabedoria',
      description: 'Mede o acúmulo de conhecimento espiritual aplicado',
      algorithm: 'Sistema de pontuação baseado em ações e decisões',
      accuracy: 95.1,
      lastTrained: '2025-09-30',
      dataPoints: 18900
    },
    {
      id: 'energy_vibration',
      name: 'Vibração Energética',
      description: 'Avalia a frequência energética e vitalidade espiritual',
      algorithm: 'Análise de padrões circadianos e atividade',
      accuracy: 87.4,
      lastTrained: '2025-09-28',
      dataPoints: 13450
    }
  ];

  const trainingModules = [
    {
      id: 'pattern_recognition',
      name: 'Reconhecimento de Padrões',
      description: 'Ensina a IA a identificar padrões sutis no comportamento espiritual',
      status: 'completed',
      progress: 100,
      duration: '2h 30min',
      difficulty: 'Avançado'
    },
    {
      id: 'emotional_intelligence',
      name: 'Inteligência Emocional',
      description: 'Desenvolve a capacidade de compreender estados emocionais',
      status: 'in_progress',
      progress: 67,
      duration: '3h 15min',
      difficulty: 'Intermediário'
    },
    {
      id: 'spiritual_context',
      name: 'Contexto Espiritual',
      description: 'Treina compreensão de conceitos e práticas espirituais',
      status: 'pending',
      progress: 0,
      duration: '4h 45min',
      difficulty: 'Avançado'
    },
    {
      id: 'personalization',
      name: 'Personalização Adaptativa',
      description: 'Aprende a adaptar respostas ao perfil único de cada usuário',
      status: 'pending',
      progress: 0,
      duration: '2h 00min',
      difficulty: 'Especialista'
    }
  ];

  const performanceData = [
    { month: 'Jan', accuracy: 82.1, predictions: 1250 },
    { month: 'Fev', accuracy: 84.3, predictions: 1580 },
    { month: 'Mar', accuracy: 86.7, predictions: 1890 },
    { month: 'Abr', accuracy: 88.9, predictions: 2100 },
    { month: 'Mai', accuracy: 90.2, predictions: 2350 },
    { month: 'Jun', accuracy: 91.8, predictions: 2650 },
    { month: 'Jul', accuracy: 94.2, predictions: 2847 }
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    
    // Simular processo de treinamento
    setTimeout(() => {
      setTrainingProgress(prev => Math.min(prev + 5, 100));
      setIsTraining(false);
      alert('Treinamento concluído com sucesso! A IA foi atualizada com os novos dados.');
    }, 3000);
  };

  const handleCustomTraining = () => {
    if (!trainingData.trim()) {
      alert('Por favor, insira dados de treinamento válidos.');
      return;
    }
    
    setIsTraining(true);
    
    // Simular treinamento personalizado
    setTimeout(() => {
      setTrainingProgress(prev => Math.min(prev + 8, 100));
      setIsTraining(false);
      setTrainingData('');
      alert('Treinamento personalizado concluído! A IA aprendeu novos padrões.');
    }, 4000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Progresso';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Title className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Centro de Treinamento de IA
        </Title>
        <Text className="text-lg text-gray-600">
          Configure e treine a IA para métricas espirituais personalizadas
        </Text>
      </div>

      {/* Status da IA */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-purple-600 font-medium">Modelo Ativo</Text>
              <Metric className="text-purple-700 text-lg">{activeModel}</Metric>
              <Text className="text-purple-600 text-sm">Versão 3.2.1</Text>
            </div>
            <RiBrainLine className="h-8 w-8 text-purple-600" />
          </Flex>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-blue-600 font-medium">Progresso de Treinamento</Text>
              <Metric className="text-blue-700">{trainingProgress}%</Metric>
              <ProgressBar value={trainingProgress} color="blue" className="mt-2" />
            </div>
            <RiBarChartLine className="h-8 w-8 text-blue-600" />
          </Flex>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-green-600 font-medium">Precisão Média</Text>
              <Metric className="text-green-700">91.2%</Metric>
              <Text className="text-green-600 text-sm">+2.8% este mês</Text>
            </div>
            <RiTargetLine className="h-8 w-8 text-green-600" />
          </Flex>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-orange-600 font-medium">Dados Processados</Text>
              <Metric className="text-orange-700">127.8k</Metric>
              <Text className="text-orange-600 text-sm">Pontos de dados</Text>
            </div>
            <RiRobotLine className="h-8 w-8 text-orange-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Performance da IA */}
      <Card>
        <Title>Performance da IA ao Longo do Tempo</Title>
        <LineChart
          className="h-72 mt-4"
          data={performanceData}
          index="month"
          categories={["accuracy"]}
          colors={["purple"]}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
        />
      </Card>

      {/* Métricas Espirituais */}
      <div className="space-y-4">
        <Title className="text-2xl">Métricas Espirituais Treinadas</Title>
        <Grid numItems={1} numItemsLg={2} className="gap-6">
          {spiritualMetrics.map((metric) => (
            <Card key={metric.id} className="space-y-4">
              <Flex alignItems="start" justifyContent="between">
                <div className="space-y-1">
                  <Title className="text-lg">{metric.name}</Title>
                  <Text className="text-gray-600">{metric.description}</Text>
                </div>
                <Badge color={metric.accuracy > 90 ? 'green' : metric.accuracy > 85 ? 'blue' : 'orange'}>
                  {metric.accuracy}% precisão
                </Badge>
              </Flex>
              
              <div className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">Algoritmo:</Text>
                <Text className="text-sm text-gray-600">{metric.algorithm}</Text>
              </div>
              
              <Flex justifyContent="between" className="text-sm text-gray-500">
                <span>Último treino: {metric.lastTrained}</span>
                <span>{metric.dataPoints.toLocaleString()} dados</span>
              </Flex>
              
              <ProgressBar value={metric.accuracy} color={metric.accuracy > 90 ? 'green' : 'blue'} />
            </Card>
          ))}
        </Grid>
      </div>

      {/* Módulos de Treinamento */}
      <div className="space-y-4">
        <Title className="text-2xl">Módulos de Treinamento</Title>
        <Grid numItems={1} numItemsLg={2} className="gap-6">
          {trainingModules.map((module) => (
            <Card key={module.id} className="space-y-4">
              <Flex alignItems="start" justifyContent="between">
                <div className="space-y-1">
                  <Title className="text-lg">{module.name}</Title>
                  <Text className="text-gray-600">{module.description}</Text>
                </div>
                <Badge color={getStatusColor(module.status)}>
                  {getStatusText(module.status)}
                </Badge>
              </Flex>
              
              <Flex justifyContent="between" className="text-sm text-gray-500">
                <span>Duração: {module.duration}</span>
                <span>Dificuldade: {module.difficulty}</span>
              </Flex>
              
              <div className="space-y-2">
                <Flex justifyContent="between">
                  <Text className="text-sm font-medium">Progresso</Text>
                  <Text className="text-sm text-gray-600">{module.progress}%</Text>
                </Flex>
                <ProgressBar value={module.progress} color={getStatusColor(module.status)} />
              </div>
              
              <Button
                size="sm"
                color={module.status === 'completed' ? 'green' : 'blue'}
                variant={module.status === 'completed' ? 'secondary' : 'primary'}
                disabled={module.status === 'in_progress' || isTraining}
                onClick={handleStartTraining}
              >
                {module.status === 'completed' ? 'Retreinar' : 
                 module.status === 'in_progress' ? 'Em Progresso...' : 'Iniciar Treinamento'}
              </Button>
            </Card>
          ))}
        </Grid>
      </div>

      {/* Treinamento Personalizado */}
      <Card className="space-y-6">
        <Title className="text-2xl">Treinamento Personalizado</Title>
        
        <div className="space-y-4">
          <div>
            <Text className="font-medium mb-2">Selecionar Métrica para Treinar:</Text>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              {spiritualMetrics.map((metric) => (
                <SelectItem key={metric.id} value={metric.id}>
                  {metric.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div>
            <Text className="font-medium mb-2">Dados de Treinamento (JSON):</Text>
            <Textarea
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              placeholder={`{
  "user_id": "123",
  "meditation_duration": 20,
  "gratitude_entries": 3,
  "mindfulness_score": 8.5,
  "context": "Sessão matinal de meditação com foco na respiração",
  "expected_spiritual_level": 85
}`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          <Flex justifyContent="between" alignItems="center">
            <Text className="text-sm text-gray-600">
              Insira dados estruturados para treinar a IA com padrões específicos
            </Text>
            <Button
              onClick={handleCustomTraining}
              disabled={isTraining || !trainingData.trim()}
              color="purple"
            >
              {isTraining ? 'Treinando...' : 'Iniciar Treinamento Personalizado'}
            </Button>
          </Flex>
        </div>
      </Card>

      {/* Configurações Avançadas */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <Title className="text-indigo-800">Configurações Avançadas de IA</Title>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Text className="font-medium text-indigo-700">Parâmetros de Aprendizado:</Text>
            <div className="space-y-2 text-sm text-indigo-600">
              <div className="flex justify-between">
                <span>Taxa de Aprendizado:</span>
                <span className="font-mono">0.001</span>
              </div>
              <div className="flex justify-between">
                <span>Batch Size:</span>
                <span className="font-mono">32</span>
              </div>
              <div className="flex justify-between">
                <span>Épocas:</span>
                <span className="font-mono">100</span>
              </div>
              <div className="flex justify-between">
                <span>Regularização:</span>
                <span className="font-mono">L2 (0.01)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Text className="font-medium text-indigo-700">Métricas de Validação:</Text>
            <div className="space-y-2 text-sm text-indigo-600">
              <div className="flex justify-between">
                <span>Precisão de Validação:</span>
                <span className="font-mono">89.7%</span>
              </div>
              <div className="flex justify-between">
                <span>Recall:</span>
                <span className="font-mono">91.2%</span>
              </div>
              <div className="flex justify-between">
                <span>F1-Score:</span>
                <span className="font-mono">90.4%</span>
              </div>
              <div className="flex justify-between">
                <span>Loss:</span>
                <span className="font-mono">0.087</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <Button size="sm" color="indigo" variant="secondary">
            <RiSettings3Line className="h-4 w-4 mr-2" />
            Configurar Parâmetros
          </Button>
          <Button size="sm" color="indigo" variant="secondary">
            <RiPlayLine className="h-4 w-4 mr-2" />
            Executar Validação
          </Button>
          <Button size="sm" color="indigo" variant="secondary">
            <RiBookOpenLine className="h-4 w-4 mr-2" />
            Exportar Modelo
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AITrainingCenter;
