import { useState, useEffect } from 'react';

export const useAIChat = () => {
  const [conversations, setConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message, model) => {
    setIsTyping(true);
    setError(null);
    try {
      // Simulação de resposta da IA
      const aiResponse = `Olá! Você disse: "${message}". Estou usando o modelo ${model}. Como posso ajudar espiritualmente?`;
      setConversations(prev => [...prev, { role: 'user', text: message }, { role: 'ai', text: aiResponse }]);
    } catch (err) {
      setError('Erro ao enviar mensagem para a IA.');
      console.error('AI chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Em um ambiente real, você buscaria conversas existentes do backend
  useEffect(() => {
    // aiService.getConversations().then(data => setConversations(data));
  }, []);

  return { conversations, isTyping, error, sendMessage };
};
