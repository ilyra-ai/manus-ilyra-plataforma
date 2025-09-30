import { apiService } from './api';

export const notificationService = {
  getNotifications: async () => {
    // Simulação de dados
    return [
      { id: 1, title: 'Nova Métrica Espiritual', message: 'Sua métrica de gratidão aumentou em 10%.', type: 'success', read: false, timestamp: new Date().toISOString() },
      { id: 2, title: 'Lembrete de Meditação', message: 'Não se esqueça de sua meditação diária hoje!', type: 'info', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, title: 'Atualização do Sistema', message: 'Novos modelos de IA disponíveis.', type: 'info', read: true, timestamp: new Date(Date.now() - 7200000).toISOString() },
    ];
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get('/notifications');
    // return response.data;
  },

  markAsRead: async (id) => {
    console.log(`Notificação ${id} marcada como lida.`);
    // await apiService.put(`/notifications/${id}/read`);
  },

  clearAllNotifications: async () => {
    console.log('Todas as notificações foram limpas.');
    // await apiService.delete('/notifications');
  },
};

