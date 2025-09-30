import { apiService } from './api';

export const aiService = {
  getConversations: async () => {
    // Simulação de dados
    return [
      { id: 1, role: 'ai', text: 'Olá! Como posso ajudar na sua jornada espiritual hoje?' },
      { id: 2, role: 'user', text: 'Gostaria de meditar, mas não sei por onde começar.' },
      { id: 3, role: 'ai', text: 'Que tal começarmos com uma meditação guiada de 5 minutos para iniciantes?' },
    ];
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get('/ai/conversations');
    // return response.data;
  },

  sendMessage: async (message, model) => {
    console.log(`Enviando mensagem para IA (modelo: ${model}): ${message}`);
    // Simulação de resposta da IA
    const aiResponse = `Olá! Você disse: "${message}". Estou usando o modelo ${model}. Como posso ajudar espiritualmente?`;
    return { role: 'ai', text: aiResponse };
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.post('/ai/chat', { message, model });
    // return response.data;
  },

  getAvailableModels: async () => {
    // Simulação de modelos disponíveis
    return [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus' },
    ];
    // Em um ambiente real, você faria uma chamada à API:
    // const response = await apiService.get('/ai/models');
    // return response.data;
  },
};

