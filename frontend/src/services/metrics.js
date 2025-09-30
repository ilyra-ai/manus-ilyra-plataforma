import { apiService } from './api';

export const metricsService = {
  getMetrics: async () => {
    // Simulação de dados
    return {
      meditation_frequency: 5, // vezes por semana
      gratitude_score: 8.5, // de 0 a 10
      energy_level: 7, // de 0 a 10
      mindfulness_score: 7.8,
      compassion_level: 8.2,
      spiritual_connection: 9.1,
      history: {
        meditation_frequency: [
          { date: '2025-09-01', value: 3 },
          { date: '2025-09-08', value: 4 },
          { date: '2025-09-15', value: 5 },
          { date: '2025-09-22', value: 5 },
          { date: '2025-09-29', value: 6 },
        ],
        gratitude_score: [
          { date: '2025-09-01', value: 7.0 },
          { date: '2025-09-08', value: 7.5 },
          { date: '2025-09-15', value: 8.0 },
          { date: '2025-09-22', value: 8.5 },
          { date: '2025-09-29', value: 8.8 },
        ],
        energy_level: [
          { date: '2025-09-01', value: 6 },
          { date: '2025-09-08', value: 6.5 },
          { date: '2025-09-15', value: 7 },
          { date: '2025-09-22', value: 7.2 },
          { date: '2025-09-29', value: 7.5 },
        ],
      },
    };
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get(
    //   '/spiritual-metrics'
    // );
    // return response.data;
  },

  updateMetric: async (id, newValue) => {
    console.log(`Atualizando métrica ${id} para ${newValue}`);
    // await apiService.put(`/spiritual-metrics/${id}`, { value: newValue });
  },

  getMetricsHistory: async (metricName) => {
    console.log(`Buscando histórico para a métrica: ${metricName}`);
    // Simulação de dados históricos
    const historyData = {
      meditation_frequency: [
        { date: '2025-09-01', value: 3 },
        { date: '2025-09-08', value: 4 },
        { date: '2025-09-15', value: 5 },
        { date: '2025-09-22', value: 5 },
        { date: '2025-09-29', value: 6 },
      ],
      gratitude_score: [
        { date: '2025-09-01', value: 7.0 },
        { date: '2025-09-08', value: 7.5 },
        { date: '2025-09-15', value: 8.0 },
        { date: '2025-09-22', value: 8.5 },
        { date: '2025-09-29', value: 8.8 },
      ],
      energy_level: [
        { date: '2025-09-01', value: 6 },
        { date: '2025-09-08', value: 6.5 },
        { date: '2025-09-15', value: 7 },
        { date: '2025-09-22', value: 7.2 },
        { date: '2025-09-29', value: 7.5 },
      ],
    };
    return historyData[metricName] || [];
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get(`/spiritual-metrics/${metricName}/history`);
    // return response.data;
  },
};

