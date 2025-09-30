/**
 * Widget de Chat IA Espiritual - iLyra Platform
 * Componente completo para conversas com IA especializada em espiritualidade
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Alert,
  AlertDescription,
  Switch,
  Slider,
  Progress
} from '@/components/ui';

import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Smile,
  Paperclip,
  MoreHorizontal,
  Settings,
  Trash2,
  Copy,
  Download,
  RefreshCw,
  Zap,
  Brain,
  Heart,
  Star,
  Sparkles,
  Eye,
  Shield,
  Compass,
  Infinity,
  Sun,
  Moon,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  User,
  Bot,
  Lightbulb,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Bookmark,
  Share2,
  ExternalLink
} from 'lucide-react';

// Tipos de conversa espiritual
const CONVERSATION_TYPES = {
  meditation: {
    name: 'Meditação',
    icon: Brain,
    color: '#7c3aed',
    description: 'Orientação sobre práticas meditativas',
    prompts: [
      'Como posso melhorar minha meditação?',
      'Qual técnica é melhor para iniciantes?',
      'Como lidar com pensamentos durante a meditação?'
    ]
  },
  chakras: {
    name: 'Chakras',
    icon: Sparkles,
    color: '#ec4899',
    description: 'Equilíbrio e ativação dos chakras',
    prompts: [
      'Como equilibrar meus chakras?',
      'Sinto bloqueio no chakra do coração',
      'Exercícios para ativar o terceiro olho'
    ]
  },
  consciousness: {
    name: 'Consciência',
    icon: Eye,
    color: '#6366f1',
    description: 'Expansão da consciência e despertar',
    prompts: [
      'Como expandir minha consciência?',
      'O que é despertar espiritual?',
      'Sinais de evolução da consciência'
    ]
  },
  starseed: {
    name: 'Starseed',
    icon: Star,
    color: '#8b5cf6',
    description: 'Orientação para starseeds e missão de vida',
    prompts: [
      'Como saber se sou um starseed?',
      'Qual é minha missão de vida?',
      'Ativação de códigos estelares'
    ]
  },
  healing: {
    name: 'Cura Energética',
    icon: Heart,
    color: '#10b981',
    description: 'Técnicas de cura e limpeza energética',
    prompts: [
      'Como fazer limpeza energética?',
      'Técnicas de autocura',
      'Proteção contra energias negativas'
    ]
  },
  manifestation: {
    name: 'Manifestação',
    icon: Zap,
    color: '#f59e0b',
    description: 'Lei da atração e manifestação consciente',
    prompts: [
      'Como manifestar meus desejos?',
      'Técnicas de visualização',
      'Bloqueios na manifestação'
    ]
  },
  past_lives: {
    name: 'Vidas Passadas',
    icon: Infinity,
    color: '#06b6d4',
    description: 'Exploração de vidas passadas e karma',
    prompts: [
      'Como acessar memórias de vidas passadas?',
      'Padrões kármicos em relacionamentos',
      'Cura de traumas de vidas passadas'
    ]
  },
  general: {
    name: 'Geral',
    icon: Compass,
    color: '#64748b',
    description: 'Orientação espiritual geral',
    prompts: [
      'Preciso de orientação espiritual',
      'Como encontrar meu propósito?',
      'Dicas para crescimento espiritual'
    ]
  }
};

const AI_MODELS = {
  'gemini-spiritual': {
    name: 'Gemini Espiritual',
    description: 'Especializado em questões espirituais',
    icon: Sparkles,
    color: '#8b5cf6'
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    description: 'Modelo avançado para conversas gerais',
    icon: Brain,
    color: '#3b82f6'
  }
};

const AIChat = ({ 
  id, 
  settings = {}, 
  data = {}, 
  onUpdateSettings, 
  isFullscreen = false,
  theme 
}) => {
  // Estados principais
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedType, setSelectedType] = useState(settings.conversationType || 'general');
  const [selectedModel, setSelectedModel] = useState(settings.aiModel || 'gemini-spiritual');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Estados de configuração
  const [showSettings, setShowSettings] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(settings.autoSpeak || false);
  const [temperature, setTemperature] = useState(settings.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens || 1000);
  
  // Estados da interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Efeitos
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  useEffect(() => {
    // Salvar configurações quando mudarem
    onUpdateSettings?.({
      conversationType: selectedType,
      aiModel: selectedModel,
      autoSpeak,
      temperature,
      maxTokens
    });
  }, [selectedType, selectedModel, autoSpeak, temperature, maxTokens]);

  // Funções principais
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    try {
      // Simular carregamento do histórico
      // Em produção, carregar do backend
      const mockHistory = [
        {
          id: 1,
          role: 'assistant',
          content: 'Olá! Sou seu guia espiritual IA. Como posso ajudá-lo em sua jornada hoje? 🙏',
          timestamp: new Date(Date.now() - 60000),
          type: 'general'
        }
      ];
      setMessages(mockHistory);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const sendMessage = async (content = inputMessage, type = selectedType) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setLoading(true);

    try {
      // Simular resposta da IA
      // Em produção, fazer chamada para API
      const response = await simulateAIResponse(content, type);
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type,
        model: selectedModel
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-falar se habilitado
      if (autoSpeak) {
        speakMessage(response);
      }

      // Atualizar métricas do dashboard baseado na conversa
      updateDashboardMetrics(content, response, type);

    } catch (err) {
      setError('Erro ao enviar mensagem. Tente novamente.');
      console.error('Erro no chat:', err);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const simulateAIResponse = async (userMessage, type) => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = {
      meditation: [
        'A meditação é uma jornada interior profunda. Comece com 5-10 minutos diários, focando na respiração. Permita que os pensamentos venham e vão como nuvens no céu, sem julgamento.',
        'Para aprofundar sua prática meditativa, experimente diferentes técnicas: mindfulness, visualização, mantras. Cada alma ressoa com métodos únicos. Qual desperta mais sua essência?',
        'A consistência é mais valiosa que a duração. Melhor meditar 10 minutos todos os dias do que 1 hora esporadicamente. Sua mente agradecerá pela regularidade amorosa.'
      ],
      chakras: [
        'Seus chakras são centros de energia vital. Para equilibrá-los, pratique visualizações com cores correspondentes, use cristais específicos e trabalhe questões emocionais de cada centro.',
        'O chakra do coração, quando bloqueado, pode gerar dificuldades no amor próprio e relacionamentos. Pratique perdão, gratidão e visualize uma luz verde emanando do peito.',
        'Para ativar o terceiro olho, medite focando no ponto entre as sobrancelhas, use ametista, pratique sonhos lúcidos e confie mais em sua intuição natural.'
      ],
      consciousness: [
        'A expansão da consciência é um processo gradual de despertar. Observe seus padrões mentais, questione crenças limitantes e cultive presença no momento atual.',
        'O despertar espiritual pode trazer sintomas como sensibilidade aumentada, mudanças no sono, sincronicidades. É sua alma se alinhando com frequências mais elevadas.',
        'Sinais de evolução incluem maior compaixão, desapego de dramas, busca por propósito maior e conexão com a natureza. Você está no caminho certo!'
      ],
      starseed: [
        'Starseeds frequentemente sentem não pertencer completamente à Terra, têm fascínio pelo cosmos e missão de elevar a consciência planetária. Ressoa com você?',
        'Sua missão de vida está conectada aos seus dons únicos e paixões profundas. Observe o que faz seu coração vibrar e como pode servir ao bem maior.',
        'Para ativar códigos estelares, medite sob as estrelas, trabalhe com cristais de alta vibração como moldavita, e conecte-se com sua origem cósmica através da intuição.'
      ],
      healing: [
        'A limpeza energética pode ser feita com banhos de sal grosso, defumação com sálvia, visualização de luz dourada envolvendo seu corpo e intenção clara de purificação.',
        'Para autocura, combine respiração consciente, imposição de mãos, cristais terapêuticos e principalmente amor próprio. Você é seu próprio curador mais poderoso.',
        'Proteção energética: visualize uma bolha de luz branca ao seu redor, use amuletos como turmalina negra, evite ambientes pesados e cultive pensamentos elevados.'
      ],
      manifestation: [
        'A manifestação funciona através do alinhamento entre pensamento, emoção e ação. Visualize claramente, sinta a gratidão antecipada e tome passos práticos em direção aos objetivos.',
        'Técnicas poderosas incluem: quadro de visão, afirmações positivas, meditação de manifestação e principalmente elevar sua vibração através da alegria e gratidão.',
        'Bloqueios comuns são crenças limitantes sobre merecimento, medo do sucesso e falta de clareza nos desejos. Trabalhe essas questões com amor e paciência.'
      ],
      past_lives: [
        'Memórias de vidas passadas podem emergir através de meditação regressiva, sonhos vívidos, déjà vu intenso ou terapia especializada. Aborde com mente aberta e coração protegido.',
        'Padrões kármicos se repetem até serem compreendidos e curados. Observe relacionamentos recorrentes e lições que se apresentam repetidamente em sua vida.',
        'Cura de traumas passados envolve perdão (próprio e outros), compreensão das lições, rituais de liberação e principalmente amor incondicional por toda sua jornada da alma.'
      ],
      general: [
        'Sua jornada espiritual é única e sagrada. Confie em sua intuição, seja gentil consigo mesmo e lembre-se: você é um ser de luz tendo uma experiência humana.',
        'O propósito de vida está onde seus dons encontram as necessidades do mundo. Observe o que você faz naturalmente bem e como isso pode servir aos outros.',
        'Crescimento espiritual acontece através da prática diária: meditação, gratidão, compaixão, estudo e principalmente vivendo com consciência e amor.'
      ]
    };

    const typeResponses = responses[type] || responses.general;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  };

  const updateDashboardMetrics = (userMessage, aiResponse, type) => {
    // Analisar a conversa e sugerir atualizações de métricas
    const suggestions = [];

    // Detectar temas na conversa
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('medita') || type === 'meditation') {
      suggestions.push({
        metric: 'meditation_frequency',
        suggestion: 'Considere atualizar sua frequência de meditação',
        value: null
      });
    }

    if (lowerMessage.includes('chakra') || type === 'chakras') {
      suggestions.push({
        metric: 'energy_level',
        suggestion: 'Que tal avaliar seu nível de energia após trabalhar os chakras?',
        value: null
      });
    }

    if (lowerMessage.includes('gratidão') || lowerMessage.includes('grato')) {
      suggestions.push({
        metric: 'gratitude_practice',
        suggestion: 'Sua prática de gratidão parece ativa! Atualize sua métrica.',
        value: null
      });
    }

    // Enviar sugestões para o dashboard (implementar callback)
    if (suggestions.length > 0) {
      // onSuggestMetricUpdates?.(suggestions);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Aqui você enviaria o áudio para transcrição
        // const transcription = await transcribeAudio(audioBlob);
        
        // Simulação
        setInputMessage('Mensagem transcrita do áudio...');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Erro ao acessar microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Mostrar toast de sucesso
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: 'Chat limpo! Como posso ajudá-lo agora? 🙏',
      timestamp: new Date(),
      type: 'general'
    }]);
  };

  // Componentes
  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const conversationType = CONVERSATION_TYPES[message.type] || CONVERSATION_TYPES.general;

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Avatar className="w-8 h-8">
            {isUser ? (
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            ) : (
              <AvatarFallback style={{ backgroundColor: conversationType.color + '20' }}>
                <conversationType.icon className="w-4 h-4" style={{ color: conversationType.color }} />
              </AvatarFallback>
            )}
          </Avatar>
          <div className={`px-4 py-2 rounded-lg ${isUser ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
            <p>{message.content}</p>
            <div className="text-xs mt-1 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsDialog = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Modelo de IA</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AI_MODELS).map(([key, model]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <model.icon className="w-4 h-4" style={{ color: model.color }} />
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Conversa</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONVERSATION_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4" style={{ color: type.color }} />
                      <span>{type.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Falar respostas automaticamente</label>
            <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
          </div>

          <div>
            <label className="text-sm font-medium">Criatividade (Temperature)</label>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              max={1}
              min={0}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Conservador</span>
              <span>{temperature}</span>
              <span>Criativo</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tamanho máximo da resposta</label>
            <Slider
              value={[maxTokens]}
              onValueChange={(value) => setMaxTokens(value[0])}
              max={2000}
              min={100}
              step={100}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Curta</span>
              <span>{maxTokens} tokens</span>
              <span>Longa</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Chat
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {React.createElement(CONVERSATION_TYPES[selectedType].icon, {
              className: "w-4 h-4",
              style: { color: CONVERSATION_TYPES[selectedType].color }
            })}
            <span className="text-sm font-medium">
              {CONVERSATION_TYPES[selectedType].name}
            </span>
          </div>
          
          {isTyping && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Digitando...
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configurações</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-grow p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        {showPrompts && (
          <div className="mb-2 flex flex-wrap gap-2">
            {CONVERSATION_TYPES[selectedType].prompts.map((prompt, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => sendMessage(prompt, selectedType)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}

        <div className="relative">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Digite sua mensagem ou use os prompts..."
            className="pr-24"
            rows={1}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={isRecording ? stopRecording : startRecording}>
                  {isRecording ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isRecording ? 'Parar Gravação' : 'Gravar Áudio'}</TooltipContent>
            </Tooltip>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || loading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <SettingsDialog />
    </div>
  );
};

export { AIChat };

