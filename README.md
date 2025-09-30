# 🌟 iLyra - Plataforma Espiritual com IA

Uma plataforma revolucionária que combina inteligência artificial avançada com práticas espirituais para promover crescimento pessoal, bem-estar e conexão interior.

## ✨ Características Principais

### 🤖 **Integração com IA Avançada**
- **Modelos Especializados**: Integração com Hugging Face Hub
- **Krishna Saarthi Counselor**: Orientação baseada no Bhagavad Gita
- **Mistral Trismegistus 7B**: Conhecimento esotérico e oculto
- **Buddhism Model**: Ensinamentos budistas e mindfulness
- **Seleção Dinâmica**: Interface para escolha de modelos em tempo real

### 📊 **Analytics Espiritual Avançado**
- **10 Métricas Especializadas**: Crescimento espiritual, meditação, humor, gratidão
- **Visualizações Interativas**: Gráficos animados e responsivos
- **Dados em Tempo Real**: Atualizações automáticas e dinâmicas
- **Múltiplos Períodos**: Análise de 24h, 7d, 30d, 90d
- **Tendências Inteligentes**: Indicadores visuais de progresso

### 🔔 **Sistema de Notificações Push**
- **Notificações Espirituais**: Lembretes personalizados para práticas
- **Conquistas Gamificadas**: Sistema de recompensas e marcos
- **Notificações Desktop**: Integração nativa com o sistema
- **Configurações Avançadas**: Controle total sobre tipos e frequência
- **Sons Personalizados**: Áudio específico para cada categoria

### 🎨 **Interface Moderna e Empolgante**
- **Motion.dev**: Animações fluidas e performáticas
- **Design Responsivo**: Otimizado para todos os dispositivos
- **Tema Espiritual**: Cores e elementos inspiradores
- **Micro-interações**: Feedback visual imediato
- **Gradientes Dinâmicos**: Efeitos visuais envolventes

### 👥 **Painel Administrativo**
- **Gestão de Usuários**: Controle completo de perfis e permissões
- **Estatísticas do Sistema**: Monitoramento em tempo real
- **Analytics de Uso**: Métricas detalhadas de engajamento
- **Configurações Globais**: Personalização da plataforma

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- **React 19**: Framework JavaScript mais recente
- **Motion.dev**: Biblioteca de animações moderna
- **Tailwind CSS 3.4**: Framework CSS utilitário
- **Remix Icons**: Ícones modernos e consistentes
- **Vite 6.0**: Build tool otimizado

### **Backend**
- **Flask 3.1.2**: Framework Python minimalista
- **Hugging Face Hub**: Integração com modelos de IA
- **SQLAlchemy**: ORM para banco de dados
- **JWT**: Autenticação segura
- **WebSockets**: Comunicação em tempo real

### **Integrações**
- **Hugging Face API**: Modelos de IA especializados
- **Stripe/PayPal**: Processamento de pagamentos
- **Push Notifications**: Notificações nativas
- **Analytics**: Métricas avançadas de uso

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**
- Node.js 22.13.0+
- Python 3.11+
- Git

### **Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### **Variáveis de Ambiente**
```env
# Frontend (.env)
REACT_APP_HUGGINGFACE_API_KEY=your_hf_token
REACT_APP_API_URL=http://localhost:5000

# Backend (.env)
HUGGINGFACE_API_KEY=your_hf_token
DATABASE_URL=sqlite:///ilyra.db
SECRET_KEY=your_secret_key
```

## 📱 **Funcionalidades Implementadas**

### ✅ **Concluídas**
- [x] Sistema de autenticação completo
- [x] Dashboard espiritual interativo
- [x] Chat com IA integrado
- [x] Seletor de modelos Hugging Face
- [x] Sistema de notificações push
- [x] Analytics avançado com 10 métricas
- [x] Painel administrativo
- [x] Interface moderna com animações
- [x] Sistema de gamificação
- [x] Métricas de bem-estar
- [x] Integração com múltiplos modelos de IA
- [x] Configurações personalizáveis
- [x] Exportação de dados
- [x] Sistema de conquistas

### 🔄 **Em Desenvolvimento**
- [ ] Sistema de planos e monetização
- [ ] Relatórios PDF personalizados
- [ ] Integração com wearables
- [ ] Modo offline
- [ ] Aplicativo móvel nativo

## 🎯 **Métricas Espirituais**

1. **Crescimento Espiritual** - Desenvolvimento pessoal geral
2. **Tempo de Meditação** - Minutos diários de prática
3. **Pontuação de Humor** - Estado emocional diário
4. **Entradas de Gratidão** - Reflexões de agradecimento
5. **Momentos Mindful** - Instantes de presença plena
6. **Nível de Energia** - Vitalidade física e mental
7. **Insights de Sabedoria** - Momentos de compreensão
8. **Conexão Espiritual** - Ligação com o divino
9. **Índice de Paz** - Tranquilidade interior
10. **Atos de Compaixão** - Gestos de bondade

## 🤖 **Modelos de IA Disponíveis**

### **Espirituais**
- **Krishna Saarthi Counselor**: Orientação baseada no Bhagavad Gita
- **Mistral Trismegistus 7B**: Conhecimento esotérico e oculto
- **Buddhism Model**: Ensinamentos budistas e mindfulness
- **Gemma Bhagavad Gita**: Filosofia hindu especializada

### **Conversacionais**
- **Qwen 2.5 7B Instruct**: Conversação avançada
- **Llama 3.1 8B Instruct**: Modelo Meta otimizado
- **Gemma 3 1B IT**: Google Gemma eficiente

## 📊 **Arquitetura do Sistema**

```
iLyra Platform
├── Frontend (React 19)
│   ├── Components/
│   │   ├── ModernAnimatedLanding.jsx
│   │   ├── ModernChatInterfaceIntegrated.jsx
│   │   ├── HuggingFaceModelSelector.jsx
│   │   ├── ModernAnalyticsDashboard.jsx
│   │   ├── ModernNotificationSystem.jsx
│   │   └── ModernAdminPanel.jsx
│   ├── Services/
│   │   └── huggingFaceService.js
│   └── Hooks/
│       └── useHuggingFace.js
├── Backend (Flask 3.1.2)
│   ├── Models/
│   ├── Routes/
│   ├── Services/
│   └── Utils/
└── Database (SQLite/PostgreSQL)
```

## 🔐 **Segurança**

- **Autenticação JWT**: Tokens seguros para sessões
- **Validação de Entrada**: Sanitização de dados
- **Rate Limiting**: Proteção contra abuso de API
- **HTTPS**: Comunicação criptografada
- **Permissões Granulares**: Controle de acesso detalhado

## 🌍 **Implantação**

### **Desenvolvimento**
```bash
# Frontend
npm run dev

# Backend
python app.py
```

### **Produção**
```bash
# Build Frontend
npm run build

# Deploy Backend
gunicorn app:app
```

## 📈 **Roadmap**

### **Q1 2025**
- [ ] Sistema de planos Premium
- [ ] Relatórios PDF avançados
- [ ] Integração com Apple Health/Google Fit
- [ ] Modo offline completo

### **Q2 2025**
- [ ] Aplicativo móvel (React Native)
- [ ] Integração com smartwatches
- [ ] Comunidade de usuários
- [ ] Marketplace de práticas

### **Q3 2025**
- [ ] IA personalizada por usuário
- [ ] Realidade aumentada para meditação
- [ ] Integração com IoT
- [ ] Análise preditiva de bem-estar

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 **Equipe**

- **Desenvolvimento**: Equipe iLyra
- **Design**: Especialistas em UX/UI
- **IA**: Engenheiros de Machine Learning
- **Espiritualidade**: Consultores especializados

## 📞 **Contato**

- **Website**: [ilyra.ai](https://ilyra.ai)
- **Email**: contato@ilyra.ai
- **GitHub**: [ilyra-ai](https://github.com/ilyra-ai)

---

**iLyra** - Transformando vidas através da tecnologia e espiritualidade 🌟

*"A tecnologia a serviço da evolução espiritual"*
