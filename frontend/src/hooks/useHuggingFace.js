import { useState, useEffect, useCallback, useRef } from 'react';
import huggingFaceService from '../services/huggingFaceService';

/**
 * Hook personalizado para integração com Hugging Face
 * Gerencia estado, modelos e conversação com IA
 */
export const useHuggingFace = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [modelStats, setModelStats] = useState(null);
  
  // Refs para controle de estado
  const abortControllerRef = useRef(null);
  const conversationRef = useRef(conversation);
  
  // Atualiza ref quando conversation muda
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  /**
   * Seleciona um modelo de IA
   */
  const selectModel = useCallback(async (model) => {
    try {
      setIsLoading(true);
      setError(null);
      setConnectionStatus('connecting');
      
      // Testa conexão com o modelo
      const testResult = await huggingFaceService.testModel(model.modelPath);
      
      if (testResult.success) {
        huggingFaceService.setActiveModel(model);
        setSelectedModel(model);
        setConnectionStatus('connected');
        
        // Adiciona mensagem de boas-vindas
        const welcomeMessage = getWelcomeMessage(model);
        setConversation([{
          id: Date.now(),
          type: 'ai',
          content: welcomeMessage,
          timestamp: new Date(),
          model: model.name
        }]);
        
        console.log(`Modelo ${model.name} conectado com sucesso`);
      } else {
        throw new Error(testResult.error);
      }
    } catch (err) {
      setError(`Erro ao conectar com o modelo: ${err.message}`);
      setConnectionStatus('error');
      console.error('Erro ao selecionar modelo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Gera mensagem de boas-vindas baseada no modelo
   */
  const getWelcomeMessage = (model) => {
    const welcomeMessages = {
      'krishna-saarthi-counselor': 'Namaste! Sou seu guia espiritual baseado nos ensinamentos do Bhagavad Gita. Como posso ajudá-lo em sua jornada de crescimento pessoal e espiritual hoje?',
      'mistral-trismegistus-7b': 'Saudações, buscador da sabedoria! Sou versado nos mistérios esotéricos e conhecimentos ocultos. Que segredos do universo você gostaria de explorar?',
      'buddhism-model': 'Que a paz esteja com você. Sou seu companheiro na jornada do despertar. Como posso ajudá-lo a cultivar mindfulness e sabedoria budista?',
      'default': `Olá! Sou ${model.name}, especializado em ${model.specialty}. Como posso ajudá-lo hoje?`
    };
    
    return welcomeMessages[model.id] || welcomeMessages.default;
  };

  /**
   * Envia mensagem para o modelo ativo
   */
  const sendMessage = useCallback(async (message, options = {}) => {
    if (!selectedModel) {
      setError('Nenhum modelo selecionado');
      return null;
    }

    if (!message.trim()) {
      setError('Mensagem não pode estar vazia');
      return null;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setIsTyping(true);
      setError(null);

      // Adiciona mensagem do usuário à conversa
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, userMessage]);

      // Envia mensagem para o serviço
      const response = await huggingFaceService.sendMessage(message, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      // Adiciona resposta da IA à conversa
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.text,
        timestamp: new Date(),
        model: response.model,
        error: response.error || false,
        errorMessage: response.errorMessage
      };

      setConversation(prev => [...prev, aiMessage]);
      
      return response;

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(`Erro ao enviar mensagem: ${err.message}`);
        console.error('Erro ao enviar mensagem:', err);
      }
      return null;
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [selectedModel]);

  /**
   * Cancela requisição em andamento
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  }, []);

  /**
   * Limpa a conversa
   */
  const clearConversation = useCallback(() => {
    setConversation([]);
    setError(null);
    
    // Adiciona nova mensagem de boas-vindas se há modelo selecionado
    if (selectedModel) {
      const welcomeMessage = getWelcomeMessage(selectedModel);
      setConversation([{
        id: Date.now(),
        type: 'ai',
        content: welcomeMessage,
        timestamp: new Date(),
        model: selectedModel.name
      }]);
    }
  }, [selectedModel]);

  /**
   * Desconecta do modelo atual
   */
  const disconnectModel = useCallback(() => {
    cancelRequest();
    setSelectedModel(null);
    setConversation([]);
    setError(null);
    setConnectionStatus('disconnected');
    huggingFaceService.setActiveModel(null);
  }, [cancelRequest]);

  /**
   * Obtém modelos disponíveis
   */
  const getAvailableModels = useCallback(() => {
    return huggingFaceService.getAvailableModels();
  }, []);

  /**
   * Atualiza estatísticas do serviço
   */
  const updateStats = useCallback(() => {
    const stats = huggingFaceService.getStats();
    setModelStats(stats);
  }, []);

  /**
   * Limpa cache do serviço
   */
  const clearCache = useCallback(() => {
    huggingFaceService.clearCache();
    updateStats();
  }, [updateStats]);

  /**
   * Exporta conversa como texto
   */
  const exportConversation = useCallback(() => {
    if (conversation.length === 0) {
      return '';
    }

    const exportText = conversation.map(message => {
      const timestamp = message.timestamp.toLocaleString('pt-BR');
      const sender = message.type === 'user' ? 'Você' : message.model || 'IA';
      return `[${timestamp}] ${sender}: ${message.content}`;
    }).join('\n\n');

    return `Conversa com ${selectedModel?.name || 'IA'}\n${'='.repeat(50)}\n\n${exportText}`;
  }, [conversation, selectedModel]);

  /**
   * Salva conversa como arquivo
   */
  const saveConversation = useCallback(() => {
    const exportText = exportConversation();
    if (!exportText) return;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-${selectedModel?.name || 'ia'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportConversation, selectedModel]);

  /**
   * Atualiza estatísticas periodicamente
   */
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, [updateStats]);

  /**
   * Cleanup ao desmontar componente
   */
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  return {
    // Estado
    selectedModel,
    isLoading,
    error,
    conversation,
    isTyping,
    connectionStatus,
    modelStats,
    
    // Ações
    selectModel,
    sendMessage,
    cancelRequest,
    clearConversation,
    disconnectModel,
    getAvailableModels,
    clearCache,
    exportConversation,
    saveConversation,
    updateStats,
    
    // Utilitários
    isConnected: connectionStatus === 'connected',
    hasError: !!error,
    hasConversation: conversation.length > 0
  };
};
