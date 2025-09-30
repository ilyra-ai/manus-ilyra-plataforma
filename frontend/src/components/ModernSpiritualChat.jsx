import React, { useState, useEffect, useRef } from 'react';
import { cx } from '../lib/utils.ts';
import { 
  RiSendPlaneLine, 
  RiMicLine, 
  RiStopLine,
  RiSparklingLine,
  RiHeartLine,
  RiUser3Line,
  RiRobotLine
} from '@remixicon/react';

// Componente de Chat Espiritual Moderno com IA
const ModernSpiritualChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Olá! Sou sua guia espiritual IA. Como posso ajudar em sua jornada hoje?',
      timestamp: new Date(),
      mood: 'peaceful'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateSpiritualResponse(inputMessage),
        timestamp: new Date(),
        mood: 'enlightened'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateSpiritualResponse = (userMessage) => {
    const responses = [
      "Sua energia está em harmonia hoje. Continue praticando a gratidão para elevar ainda mais sua vibração espiritual.",
      "Percebo que você está buscando paz interior. Que tal dedicar 10 minutos à meditação mindfulness?",
      "Sua jornada espiritual está florescendo. Lembre-se: cada momento de consciência é um passo em direção à iluminação.",
      "Sinto uma bela evolução em sua aura. Sua prática de compaixão está gerando frutos maravilhosos.",
      "O universo está conspirando a seu favor. Mantenha-se aberto às sincronicidades que surgirão hoje."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implementar gravação de voz aqui
  };

  const MessageBubble = ({ message }) => {
    const isAI = message.type === 'ai';
    
    return (
      <div className={cx(
        "flex items-start gap-3 mb-4",
        isAI ? "justify-start" : "justify-end"
      )}>
        {isAI && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <RiRobotLine className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className={cx(
          "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg",
          isAI 
            ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-gray-800 dark:text-gray-200" 
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        )}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {isAI && message.mood && (
              <div className="flex items-center gap-1">
                <RiSparklingLine className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 dark:text-purple-400 capitalize">
                  {message.mood}
                </span>
              </div>
            )}
          </div>
        </div>

        {!isAI && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <RiUser3Line className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
        <RiRobotLine className="w-4 h-4 text-white" />
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-4 py-3 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <RiSparklingLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Guia Espiritual IA</h3>
            <p className="text-purple-100 text-sm">Sempre aqui para sua jornada</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Compartilhe seus pensamentos espirituais..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={handleVoiceRecord}
              className={cx(
                "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200",
                isRecording 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              )}
            >
              {isRecording ? (
                <RiStopLine className="w-4 h-4" />
              ) : (
                <RiMicLine className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <RiSendPlaneLine className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">Ações rápidas:</span>
          <button className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
            Meditação
          </button>
          <button className="px-3 py-1 text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors">
            Gratidão
          </button>
          <button className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            Energia
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernSpiritualChat;
