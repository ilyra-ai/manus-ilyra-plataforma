import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Button, Badge, Grid, Flex, ProgressBar, Metric, AreaChart, DonutChart, BarChart } from '@tremor/react';
import { RiVipCrownLine, RiStarLine, RiGiftLine, RiCoinLine, RiTrendingUpLine, RiShieldCheckLine } from 'remixicon-react';

const MonetizationHub = () => {
  const [currentPlan, setCurrentPlan] = useState('Essential');
  const [revenue, setRevenue] = useState(2847.50);
  const [subscribers, setSubscribers] = useState(156);
  const [conversionRate, setConversionRate] = useState(12.4);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'BRL',
      period: 'mês',
      description: 'Perfeito para começar sua jornada espiritual',
      features: [
        'Métricas básicas de espiritualidade',
        'Chat IA limitado (10 mensagens/dia)',
        '5 meditações guiadas',
        'Relatórios semanais básicos',
        'Comunidade de iniciantes'
      ],
      limitations: [
        'Sem acesso a métricas avançadas',
        'Sem coaching personalizado',
        'Sem relatórios personalizados'
      ],
      color: 'gray',
      icon: RiGiftLine,
      popular: false,
      savings: null
    },
    {
      id: 'essential',
      name: 'Essential',
      price: 29.90,
      currency: 'BRL',
      period: 'mês',
      description: 'Ideal para praticantes regulares',
      features: [
        'Todas as funcionalidades do Free',
        'Métricas avançadas de crescimento',
        'Chat IA ilimitado com insights',
        '50+ meditações premium',
        'Relatórios personalizados',
        'Coaching semanal por IA',
        'Comunidade premium',
        'Sincronização multi-dispositivo'
      ],
      limitations: [
        'Sem acesso a masterclasses exclusivas',
        'Sem mentoria 1:1'
      ],
      color: 'blue',
      icon: RiStarLine,
      popular: true,
      savings: 'Economize R$ 107,64/ano'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 59.90,
      currency: 'BRL',
      period: 'mês',
      description: 'Para mestres da espiritualidade',
      features: [
        'Todas as funcionalidades do Essential',
        'IA personalizada com seu perfil único',
        'Biblioteca completa (200+ conteúdos)',
        'Masterclasses exclusivas',
        'Mentoria 1:1 mensal',
        'Relatórios de progresso avançados',
        'Acesso antecipado a novos recursos',
        'Comunidade VIP',
        'Certificações espirituais',
        'API para desenvolvedores'
      ],
      limitations: [],
      color: 'purple',
      icon: RiVipCrownLine,
      popular: false,
      savings: 'Economize R$ 215,28/ano'
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 1200, subscribers: 45 },
    { month: 'Fev', revenue: 1580, subscribers: 62 },
    { month: 'Mar', revenue: 1890, subscribers: 78 },
    { month: 'Abr', revenue: 2100, subscribers: 89 },
    { month: 'Mai', revenue: 2350, subscribers: 112 },
    { month: 'Jun', revenue: 2650, subscribers: 134 },
    { month: 'Jul', revenue: 2847, subscribers: 156 }
  ];

  const planDistribution = [
    { name: 'Free', value: 45, color: '#6B7280' },
    { name: 'Essential', value: 78, color: '#3B82F6' },
    { name: 'Premium', value: 33, color: '#8B5CF6' }
  ];

  const conversionFunnel = [
    { stage: 'Visitantes', count: 2450, rate: 100 },
    { stage: 'Cadastros', count: 856, rate: 34.9 },
    { stage: 'Trial', count: 234, rate: 27.3 },
    { stage: 'Pagantes', count: 156, rate: 66.7 }
  ];

  const handleUpgrade = (planId) => {
    // Simular upgrade de plano
    setCurrentPlan(plans.find(p => p.id === planId)?.name || 'Essential');
    
    // Simular criação de sessão de pagamento
    const paymentData = {
      plan_id: planId,
      user_id: 'current_user',
      timestamp: new Date().toISOString()
    };
    
    console.log('Iniciando upgrade para:', planId, paymentData);
    
    // Aqui seria feita a integração real com as APIs de pagamento
    alert(`Redirecionando para pagamento do plano ${plans.find(p => p.id === planId)?.name}...`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Title className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Hub de Monetização iLyra
        </Title>
        <Text className="text-lg text-gray-600">
          Gerencie planos, receitas e crescimento da plataforma espiritual
        </Text>
      </div>

      {/* Métricas de Receita */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-green-600 font-medium">Receita Mensal</Text>
              <Metric className="text-green-700">{formatCurrency(revenue)}</Metric>
              <Text className="text-green-600 text-sm">+23.5% vs mês anterior</Text>
            </div>
            <RiCoinLine className="h-8 w-8 text-green-600" />
          </Flex>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-blue-600 font-medium">Assinantes Ativos</Text>
              <Metric className="text-blue-700">{subscribers}</Metric>
              <Text className="text-blue-600 text-sm">+18 novos esta semana</Text>
            </div>
            <RiStarLine className="h-8 w-8 text-blue-600" />
          </Flex>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-purple-600 font-medium">Taxa de Conversão</Text>
              <Metric className="text-purple-700">{conversionRate}%</Metric>
              <Text className="text-purple-600 text-sm">+2.1% vs mês anterior</Text>
            </div>
            <RiTrendingUpLine className="h-8 w-8 text-purple-600" />
          </Flex>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <Flex alignItems="start">
            <div>
              <Text className="text-orange-600 font-medium">LTV Médio</Text>
              <Metric className="text-orange-700">R$ 847</Metric>
              <Text className="text-orange-600 text-sm">Lifetime Value</Text>
            </div>
            <RiShieldCheckLine className="h-8 w-8 text-orange-600" />
          </Flex>
        </Card>
      </Grid>

      {/* Gráficos de Performance */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Crescimento de Receita e Assinantes</Title>
          <AreaChart
            className="h-72 mt-4"
            data={revenueData}
            index="month"
            categories={["revenue", "subscribers"]}
            colors={["emerald", "blue"]}
            valueFormatter={(value) => value > 100 ? formatCurrency(value) : `${value} usuários`}
          />
        </Card>

        <Card>
          <Title>Distribuição por Planos</Title>
          <DonutChart
            className="h-72 mt-4"
            data={planDistribution}
            category="value"
            index="name"
            colors={["gray", "blue", "purple"]}
            valueFormatter={(value) => `${value} usuários`}
          />
        </Card>
      </Grid>

      {/* Funil de Conversão */}
      <Card>
        <Title>Funil de Conversão</Title>
        <div className="mt-6 space-y-4">
          {conversionFunnel.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <Flex>
                <Text className="font-medium">{stage.stage}</Text>
                <Text className="text-gray-600">{stage.count.toLocaleString()} ({stage.rate}%)</Text>
              </Flex>
              <ProgressBar value={stage.rate} color={index === 0 ? "gray" : index === 1 ? "blue" : index === 2 ? "purple" : "green"} />
            </div>
          ))}
        </div>
      </Card>

      {/* Planos de Assinatura */}
      <div className="space-y-4">
        <Title className="text-2xl">Planos de Assinatura</Title>
        <Grid numItems={1} numItemsLg={3} className="gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${currentPlan === plan.name ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Mais Popular
                  </Badge>
                )}
                
                {currentPlan === plan.name && (
                  <Badge className="absolute -top-2 right-4 bg-green-500 text-white">
                    Plano Atual
                  </Badge>
                )}

                <div className="space-y-4">
                  <Flex alignItems="center" className="space-x-3">
                    <div className={`p-2 rounded-lg bg-${plan.color}-100`}>
                      <IconComponent className={`h-6 w-6 text-${plan.color}-600`} />
                    </div>
                    <div>
                      <Title className="text-xl">{plan.name}</Title>
                      <Text className="text-gray-600">{plan.description}</Text>
                    </div>
                  </Flex>

                  <div className="text-center py-4">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <Text className="text-green-600 text-sm font-medium mt-1">
                        {plan.savings}
                      </Text>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Text className="font-medium text-gray-900">Funcionalidades:</Text>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <RiShieldCheckLine className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <Text className="text-sm text-gray-700">{feature}</Text>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <div className="pt-2">
                        <Text className="font-medium text-gray-600 text-sm">Limitações:</Text>
                        <ul className="space-y-1 mt-1">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="text-xs text-gray-500">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    color={plan.color}
                    variant={currentPlan === plan.name ? "secondary" : "primary"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={currentPlan === plan.name}
                  >
                    {currentPlan === plan.name ? 'Plano Atual' : 
                     plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </Grid>
      </div>

      {/* Insights de Monetização */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <Title className="text-indigo-800">Insights de Monetização</Title>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Text className="font-medium text-indigo-700">Oportunidades de Crescimento:</Text>
            <ul className="space-y-1 text-sm text-indigo-600">
              <li>• 67% dos usuários Free podem ser convertidos para Essential</li>
              <li>• Implementar trial de 7 dias pode aumentar conversão em 34%</li>
              <li>• Usuários que completam onboarding têm 3x mais chance de assinar</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Text className="font-medium text-indigo-700">Recomendações:</Text>
            <ul className="space-y-1 text-sm text-indigo-600">
              <li>• Adicionar plano anual com 20% de desconto</li>
              <li>• Criar programa de afiliados para influencers espirituais</li>
              <li>• Implementar gamificação para aumentar engajamento</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonetizationHub;
