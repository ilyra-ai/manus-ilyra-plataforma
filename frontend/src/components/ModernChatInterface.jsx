import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiSendPlaneLine, 
  RiMicLine, 
  RiStopLine,
  RiSparklingLine,
  RiHeartLine,
  RiUser3Line,
  RiRobotLine,
  RiMagicLine,
  RiLightbulbLine,
  RiLeafLine,
  RiSunLine,
  RiMoonLine,
  RiStarLine,
  RiFlowerLine,
  RiFireLine,
  RiThunderstormsLine,
  RiRainbowLine,
  RiDeleteBinLine,
  RiVolumeUpLine,
  RiDownloadLine
} from '@remixicon/react';

const ModernChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Olá! Sou sua guia espiritual IA. Como posso ajudá-lo em sua jornada de crescimento pessoal hoje?',
      timestamp: new Date(),
      mood: 'welcoming'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiMood, setAiMood] = useState('peaceful');
  const [chatTheme, setChatTheme] = useState('spiritual');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const spiritualPrompts = [
    "Como posso encontrar mais paz interior?",
    "Quais práticas de meditação você recomenda?",
    "Como cultivar gratidão no dia a dia?",
    "Ajude-me a desenvolver mindfulness",
    "Como lidar com ansiedade espiritual?"
  ];

  const aiPersonalities = {
    peaceful: { icon: RiLeafLine, color: '#10b981', name: 'Serenidade' },
    wise: { icon: RiLightbulbLine, color: '#f59e0b', name: 'Sabedoria' },
    loving: { icon: RiHeartLine, color: '#ef4444', name: 'Amor' },
    mystical: { icon: RiMagicLine, color: '#8b5cf6', name: 'Místico' },
    enlightened: { icon: RiSunLine, color: '#3b82f6', name: 'Iluminação' }
  };

  const floatingElements = [
    { icon: RiStarLine, delay: 0, x: 50, y: 30 },
    { icon: RiFlowerLine, delay: 1, x: 150, y: 80 },
    { icon: RiSparklingLine, delay: 2, x: 250, y: 50 },
    { icon: RiRainbowLine, delay: 3, x: 100, y: 120 },
    { icon: RiThunderstormsLine, delay: 4, x: 200, y: 100 }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simular mudanças de humor da IA
    const interval = setInterval(() => {
      const moods = Object.keys(aiPersonalities);
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setAiMood(randomMood);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponses = [
        "Que pergunta profunda! A paz interior começa com a aceitação do momento presente. Pratique respiração consciente por 5 minutos diários.",
        "Sua jornada espiritual é única e sagrada. Lembre-se: cada passo, mesmo o menor, é um progresso significativo.",
        "A gratidão é como um jardim - quanto mais você cultiva, mais flores de felicidade brotam em sua vida.",
        "O mindfulness é a arte de estar presente. Comece observando sua respiração, sem julgamentos, apenas observando.",
        "A ansiedade é um convite para voltar ao centro. Respire fundo e lembre-se: você é mais forte do que imagina."
      ];

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        mood: aiMood
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Aqui implementaria a funcionalidade de gravação de voz
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: 'ai',
      content: 'Chat limpo! Como posso ajudá-lo em sua nova jornada espiritual?',
      timestamp: new Date(),
      mood: 'welcoming'
    }]);
  };

  const MessageBubble = ({ message, index }) => {
    const isAI = message.type === 'ai';
    const personality = aiPersonalities[message.mood] || aiPersonalities.peaceful;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.1,
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-6`}
      >
        <div className={`flex items-end gap-3 max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isAI 
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50'
                : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/50'
            }`}
          >
            {isAI ? (
              <personality.icon size={20} style={{ color: personality.color }} />
            ) : (
              <RiUser3Line size={20} className="text-blue-400" />
            )}
          </motion.div>

          {/* Message Bubble */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative px-4 py-3 rounded-2xl backdrop-blur-lg border ${
              isAI
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white'
                : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30 text-white'
            }`}
          >
            {/* Message Content */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm leading-relaxed"
            >
              {message.content}
            </motion.p>

            {/* Timestamp */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between mt-2 text-xs text-white/50"
            >
              <span>{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              {isAI && (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="hover:text-white/80 transition-colors"
                  >
                    <RiVolumeUpLine size={12} />
                  </motion.button>
                  <span className="text-xs" style={{ color: personality.color }}>
                    {personality.name}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Message Tail */}
            <div
              className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                isAI
                  ? '-left-1.5 bg-white/10 border-l border-b border-white/20'
                  : '-right-1.5 bg-blue-500/20 border-r border-b border-blue-400/30'
              }`}
            />

            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(45deg, ${personality.color}20, transparent, ${personality.color}20)`,
                opacity: 0
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-6"
    >
      <div className="flex items-end gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 flex items-center justify-center"
        >
          <RiRobotLine size={20} className="text-purple-400" />
        </motion.div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/20">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0">
        {floatingElements.map(({ icon: Icon, delay, x, y }, index) => (
          <motion.div
            key={index}
            className="absolute text-white/10"
            initial={{ opacity: 0, scale: 0, x, y }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              x: x + Math.sin(Date.now() * 0.001 + index) * 30,
              y: y + Math.cos(Date.now() * 0.001 + index) * 30
            }}
            transition={{
              duration: 6,
              delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <Icon size={24} />
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 flex items-center justify-center"
              >
                <RiSparklingLine size={24} className="text-purple-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold text-white">Guia Espiritual IA</h2>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-white/70"
                >
                  Modo: {aiPersonalities[aiMood]?.name} • Online
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearChat}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <RiDeleteBinLine size={20} className="text-white/70" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <RiDownloadLine size={20} className="text-white/70" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {spiritualPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInputMessage(prompt)}
                className="flex-shrink-0 px-3 py-2 bg-white/10 backdrop-blur-lg rounded-full text-sm text-white/80 border border-white/20 hover:border-purple-400/50 transition-all duration-300"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <motion.textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta espiritual..."
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 resize-none focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                whileFocus={{ scale: 1.02 }}
              />
              
              {/* Character Count */}
              <motion.div
                className="absolute bottom-2 right-12 text-xs text-white/40"
                animate={{ opacity: inputMessage.length > 100 ? 1 : 0 }}
              >
                {inputMessage.length}/500
              </motion.div>
            </div>

            {/* Voice Recording Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500/20 border border-red-400/50 text-red-400'
                  : 'bg-white/10 border border-white/20 text-white/70 hover:border-purple-400/50'
              }`}
            >
              <motion.div
                animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
              >
                {isRecording ? <RiStopLine size={20} /> : <RiMicLine size={20} />}
              </motion.div>
            </motion.button>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className={`p-3 rounded-full transition-all duration-300 ${
                inputMessage.trim()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
                  : 'bg-white/10 border border-white/20 text-white/40'
              }`}
            >
              <RiSendPlaneLine size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernChatInterface;
