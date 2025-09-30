import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageCircle, 
  Minimize2, 
  Maximize2,
  Download,
  Trash2,
  Copy,
  Check
} from 'lucide-react';

const AIChat = ({ isMinimized = false, onToggleMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [copied, setCopied] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mensagem de boas-vindas
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      type: 'ai',
      content: 'Olá! Sou sua assistente espiritual com IA. Estou aqui para ajudá-lo em sua jornada de autoconhecimento e evolução espiritual. Como posso ajudá-lo hoje?',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Como posso melhorar minha meditação?',
        'Qual é o significado dos meus sonhos?',
        'Como equilibrar meus chakras?',
        'Preciso de orientação espiritual'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focar no input quando não minimizado
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simular resposta da IA (substituir por API real)
      const aiResponse = await generateAIResponse(messageText);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simular resposta da IA (substituir por integração real)
  const generateAIResponse = async (userMessage) => {
    const responses = {
      'meditação': 'A meditação é uma prática fundamental para o desenvolvimento espiritual. Recomendo começar com 10-15 minutos diários, focando na respiração. Gradualmente, você pode aumentar o tempo e explorar diferentes técnicas como mindfulness, meditação transcendental ou visualizações guiadas.',
      'chakras': 'Os chakras são centros energéticos que regulam diferentes aspectos da nossa vida. Para equilibrá-los, você pode usar cristais, mantras, visualizações coloridas e exercícios específicos. Cada chakra tem sua cor e frequência vibracional única.',
      'sonhos': 'Os sonhos são mensagens do seu subconsciente e podem conter orientações espirituais importantes. Mantenha um diário dos sonhos, anote os símbolos recorrentes e suas emoções. Muitas vezes, os sonhos refletem nossos medos, desejos e orientações espirituais.',
      'default': 'Essa é uma pergunta muito interessante sobre espiritualidade. Cada jornada é única e pessoal. Recomendo que você se conecte com sua intuição e busque práticas que ressoem com seu coração. A meditação, a gratidão e o autoconhecimento são sempre bons pontos de partida.'
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return responses.default;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(content);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar mensagem:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const exportChat = () => {
    const chatText = messages
      .map(msg => `[${msg.type.toUpperCase()}] ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-espiritual-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-[600px] max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Assistente Espiritual IA
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Online • Sempre disponível
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Exportar conversa"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Limpar conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMinimize}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'ai' && (
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(suggestion)}
                          className="block w-full text-left text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'ai' && (
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Copiar mensagem"
                  >
                    {copied === message.content ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta espiritual..."
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              inputMessage.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
