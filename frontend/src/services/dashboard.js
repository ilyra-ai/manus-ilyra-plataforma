import { apiService } from './api';

export const dashboardService = {
  getDashboardConfig: async () => {
    // Simulação de dados
    return {
      layout: [],
      theme: 'spiritual',
      widgetSettings: {},
    };
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get('/dashboard/config');
    // return response.data;
  },

  updateDashboardConfig: async (config) => {
    console.log('Atualizando configuração do dashboard:', config);
    return config; // Simulação
    // await apiService.put('/dashboard/config', config);
  },

  saveDashboardLayout: async (layout) => {
    console.log('Salvando layout do dashboard:', layout);
    return layout; // Simulação
    // await apiService.post('/dashboard/layout', { layout });
  },
};

