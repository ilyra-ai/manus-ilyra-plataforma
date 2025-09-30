import { apiService } from './api';

export const insightsService = {
  getInsights: async () => {
    // Simulação de dados
    return [
      {
        id: 1,
        title: 'Foco na Gratidão',
        content: 'Percebemos que sua pontuação de gratidão aumentou significativamente. Continue praticando a gratidão diariamente para fortalecer essa métrica.',
        type: 'spiritual_growth',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        title: 'Consistência na Meditação',
        content: 'Sua frequência de meditação tem sido consistente. Isso é ótimo para o bem-estar emocional. Tente aumentar a duração em 5 minutos esta semana.',
        type: 'emotional_wellbeing',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 3,
        title: 'Desafio de Conexão Espiritual',
        content: 'Sua conexão espiritual está em alta! Que tal explorar novas práticas como o diário espiritual ou a leitura de textos sagrados?',
        type: 'personal_development',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get('/insights');
    // return response.data;
  },
};

