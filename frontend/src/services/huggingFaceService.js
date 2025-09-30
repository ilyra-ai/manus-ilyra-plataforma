/**
 * Serviço de Integração com Hugging Face
 * Gerencia a comunicação com modelos de IA do Hugging Face Hub
 */

class HuggingFaceService {
  constructor() {
    this.baseURL = 'https://api-inference.huggingface.co/models';
    this.apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY || '';
    this.currentModel = null;
    this.requestQueue = [];
    this.isProcessing = false;
    
    // Cache para respostas
    this.responseCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    
    // Configurações de retry
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    // Rate limiting
    this.requestsPerMinute = 30;
    this.requestTimestamps = [];
  }

  /**
   * Define o modelo ativo para conversação
   */
  setActiveModel(model) {
    this.currentModel = model;
    console.log(`Modelo ativo definido: ${model.name} (${model.modelPath})`);
  }

  /**
   * Verifica se há rate limiting ativo
   */
  checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove timestamps antigos
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    return this.requestTimestamps.length >= this.requestsPerMinute;
  }

  /**
   * Adiciona timestamp da requisição para rate limiting
   */
  addRequestTimestamp() {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Gera uma chave de cache baseada no input
   */
  generateCacheKey(modelPath, input, options = {}) {
    return `${modelPath}:${JSON.stringify(input)}:${JSON.stringify(options)}`;
  }

  /**
   * Verifica se há resposta em cache
   */
  getCachedResponse(cacheKey) {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    return null;
  }

  /**
   * Armazena resposta em cache
   */
  setCachedResponse(cacheKey, response) {
    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Faz requisição para o modelo com retry automático
   */
  async makeRequest(modelPath, payload, retryCount = 0) {
    try {
      // Verifica rate limiting
      if (this.checkRateLimit()) {
        throw new Error('Rate limit excedido. Tente novamente em alguns segundos.');
      }

      this.addRequestTimestamp();

      const response = await fetch(`${this.baseURL}/${modelPath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Modelo está carregando. Tente novamente em alguns segundos.');
        }
        if (response.status === 429) {
          throw new Error('Muitas requisições. Aguarde alguns segundos.');
        }
        if (response.status === 401) {
          throw new Error('Token de API inválido ou não fornecido.');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (retryCount < this.maxRetries && 
          (error.message.includes('carregando') || 
           error.message.includes('503') ||
           error.message.includes('429'))) {
        
        console.log(`Tentativa ${retryCount + 1}/${this.maxRetries} falhou. Tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest(modelPath, payload, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Envia mensagem para o modelo ativo
   */
  async sendMessage(message, options = {}) {
    if (!this.currentModel) {
      throw new Error('Nenhum modelo ativo selecionado');
    }

    const cacheKey = this.generateCacheKey(this.currentModel.modelPath, message, options);
    const cachedResponse = this.getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      console.log('Resposta obtida do cache');
      return cachedResponse;
    }

    try {
      let payload;
      let response;

      // Configura payload baseado no tipo de modelo
      if (this.currentModel.id === 'krishna-saarthi-counselor') {
        payload = {
          inputs: `USER: ${message}\nASSISTANT:`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            repetition_penalty: 1.1,
            return_full_text: false
          }
        };
      } else if (this.currentModel.id === 'mistral-trismegistus-7b') {
        payload = {
          inputs: `USER: ${message}\nASSISTANT:`,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.8,
            do_sample: true,
            top_p: 0.95,
            repetition_penalty: 1.05,
            return_full_text: false
          }
        };
      } else {
        // Configuração padrão para outros modelos
        payload = {
          inputs: message,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            return_full_text: false,
            ...options
          }
        };
      }

      response = await this.makeRequest(this.currentModel.modelPath, payload);

      // Processa a resposta baseado no formato retornado
      let processedResponse;
      if (Array.isArray(response) && response.length > 0) {
        processedResponse = {
          text: response[0].generated_text || response[0].text || '',
          model: this.currentModel.name,
          timestamp: new Date().toISOString()
        };
      } else if (response.generated_text) {
        processedResponse = {
          text: response.generated_text,
          model: this.currentModel.name,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Formato de resposta inesperado');
      }

      // Limpa a resposta removendo o prompt original se presente
      if (processedResponse.text.includes('ASSISTANT:')) {
        processedResponse.text = processedResponse.text.split('ASSISTANT:')[1]?.trim() || processedResponse.text;
      }

      // Armazena em cache
      this.setCachedResponse(cacheKey, processedResponse);

      return processedResponse;

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Retorna resposta de fallback em caso de erro
      return {
        text: this.getFallbackResponse(message, error.message),
        model: this.currentModel.name,
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: error.message
      };
    }
  }

  /**
   * Gera resposta de fallback em caso de erro
   */
  getFallbackResponse(message, errorMessage) {
    const fallbackResponses = {
      'krishna-saarthi-counselor': [
        'Peço desculpas, mas estou temporariamente indisponível. Lembre-se de que a paz interior vem da aceitação do momento presente.',
        'Embora eu não possa responder agora, reflita sobre esta sabedoria: "Você tem o direito de realizar suas ações prescritas, mas nunca aos frutos da ação." - Bhagavad Gita',
        'Estou enfrentando dificuldades técnicas. Enquanto isso, pratique a respiração consciente e encontre serenidade no silêncio.'
      ],
      'mistral-trismegistus-7b': [
        'Os mistérios às vezes se ocultam quando a energia não flui adequadamente. Tente novamente quando as estrelas estiverem mais alinhadas.',
        'Como Hermes Trismegisto ensinou: "Como é em cima, é embaixo." Às vezes, as dificuldades técnicas refletem a necessidade de paciência espiritual.',
        'O conhecimento esotérico requer o momento certo para se manifestar. Aguarde e tente novamente.'
      ],
      'default': [
        'Desculpe, estou enfrentando dificuldades técnicas no momento. Tente novamente em alguns instantes.',
        'Parece que há um problema de conexão. Por favor, aguarde um momento e tente novamente.',
        'Estou temporariamente indisponível. Sua paciência é apreciada.'
      ]
    };

    const responses = fallbackResponses[this.currentModel?.id] || fallbackResponses.default;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${randomResponse}\n\n*Erro técnico: ${errorMessage}*`;
  }

  /**
   * Obtém informações sobre o modelo ativo
   */
  getModelInfo() {
    return this.currentModel;
  }

  /**
   * Lista modelos disponíveis (dados estáticos para demonstração)
   */
  getAvailableModels() {
    return [
      {
        id: 'krishna-saarthi-counselor',
        name: 'Krishna Saarthi Counselor',
        author: 'debadtman26',
        description: 'Modelo especializado em orientação espiritual baseada no Bhagavad Gita',
        modelPath: 'debadtman26/krishna-saarthi-counselor',
        specialty: 'Orientação Espiritual Hindu',
        tags: ['spiritual-guidance', 'counseling', 'bhagavad-gita']
      },
      {
        id: 'mistral-trismegistus-7b',
        name: 'Mistral Trismegistus 7B',
        author: 'teknium',
        description: 'Modelo especializado em conhecimento esotérico, oculto e espiritual',
        modelPath: 'teknium/Mistral-Trismegistus-7B',
        specialty: 'Conhecimento Esotérico',
        tags: ['occult', 'esoteric', 'spiritual']
      }
    ];
  }

  /**
   * Testa conexão com um modelo
   */
  async testModel(modelPath) {
    try {
      const response = await this.makeRequest(modelPath, {
        inputs: 'Hello, how are you?',
        parameters: { max_new_tokens: 50 }
      });
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Limpa cache de respostas
   */
  clearCache() {
    this.responseCache.clear();
    console.log('Cache de respostas limpo');
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats() {
    return {
      currentModel: this.currentModel?.name || 'Nenhum',
      cacheSize: this.responseCache.size,
      requestsInLastMinute: this.requestTimestamps.length,
      rateLimitActive: this.checkRateLimit()
    };
  }
}

// Instância singleton do serviço
const huggingFaceService = new HuggingFaceService();

export default huggingFaceService;
