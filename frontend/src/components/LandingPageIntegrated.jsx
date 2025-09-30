import React, { useState, useEffect } from 'react';
import { usePlans, useAuth } from '../hooks/useAPI';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Sparkles, 
  Heart, 
  Brain, 
  Zap, 
  Star, 
  Check, 
  ArrowRight,
  MessageCircle,
  BarChart3,
  Shield,
  Infinity,
  Crown,
  Gift,
  Users,
  TrendingUp,
  Award,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const LandingPageIntegrated = () => {
  const { plans, loading: plansLoading } = usePlans();
  const { register, loading: authLoading } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Funcionalidades principais
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "IA Espiritual Avançada",
      description: "Chat inteligente com 15 modelos de IA especializados em espiritualidade, incluindo GPT-4, Claude e Gemini."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Métricas Espirituais",
      description: "Acompanhe mais de 50 métricas diferentes para monitorar seu crescimento espiritual de forma científica."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-yellow-600" />,
      title: "Insights Personalizados",
      description: "Receba insights diários e recomendações semanais baseadas em suas práticas e evolução pessoal."
    },
    {
      icon: <Award className="h-8 w-8 text-green-600" />,
      title: "Gamificação Completa",
      description: "Sistema de níveis, conquistas, missões diárias e ranking global para manter você motivado."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
      title: "Analytics Avançado",
      description: "Dashboards interativos com gráficos em tempo real para visualizar sua jornada espiritual."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Privacidade Total",
      description: "Seus dados são protegidos com criptografia de ponta e conformidade total com a LGPD."
    }
  ];

  // Depoimentos
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Praticante de Meditação",
      content: "O iLyra transformou minha prática espiritual. Os insights da IA são incrivelmente precisos e me ajudam a crescer todos os dias.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Terapeuta Holístico",
      content: "Como profissional, uso o iLyra para acompanhar meus clientes. As métricas detalhadas são um diferencial incrível.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Coach Espiritual",
      content: "A gamificação torna o crescimento espiritual divertido e envolvente. Meus alunos adoram o sistema de conquistas!",
      rating: 5
    }
  ];

  // Estatísticas
  const stats = [
    { number: "50+", label: "Métricas Espirituais" },
    { number: "15", label: "Modelos de IA" },
    { number: "10K+", label: "Usuários Ativos" },
    { number: "99.9%", label: "Uptime" }
  ];

  // Enviar formulário de contato
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // Aqui você integraria com o backend para enviar o email
    console.log('Formulário de contato enviado:', contactForm);
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setContactForm({ name: '', email: '', message: '' });
  };

  // Registrar usuário
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        plan_id: selectedPlan?.id
      });
      
      alert('Conta criada com sucesso! Verifique seu email para ativar a conta.');
      setShowRegisterForm(false);
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      alert('Erro ao criar conta: ' + error.message);
    }
  };

  // Selecionar plano
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowRegisterForm(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Sparkles className="h-16 w-16 text-yellow-400" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              iLyra
              <span className="block text-3xl md:text-4xl font-normal text-purple-300 mt-2">
                Sua Jornada Espiritual Inteligente
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Transforme sua vida espiritual com IA avançada, métricas científicas e 
              insights personalizados. O futuro do crescimento espiritual está aqui.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                onClick={() => setShowRegisterForm(true)}
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-purple-900 text-lg px-8 py-4"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Funcionalidades Revolucionárias
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como o iLyra combina tecnologia de ponta com sabedoria ancestral 
              para acelerar seu crescimento espiritual.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Escolha Seu Plano
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planos flexíveis para todos os níveis de prática espiritual. 
              Comece gratuitamente e evolua conforme sua jornada.
            </p>
          </div>
          
          {plansLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando planos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans && plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative border-2 transition-all hover:shadow-xl ${
                    plan.name === 'Premium' 
                      ? 'border-purple-500 shadow-lg scale-105' 
                      : 'border-gray-200'
                  }`}
                >
                  {plan.name === 'Premium' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-4 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="mb-4">
                      {plan.name === 'Gratuito' && <Gift className="h-12 w-12 text-green-600 mx-auto" />}
                      {plan.name === 'Premium' && <Crown className="h-12 w-12 text-purple-600 mx-auto" />}
                      {plan.name === 'Enterprise' && <Infinity className="h-12 w-12 text-blue-600 mx-auto" />}
                    </div>
                    
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">/mês</span>
                      )}
                    </div>
                    
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features && plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.name === 'Premium' 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : ''
                      }`}
                      variant={plan.name === 'Premium' ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {plan.name === 'Gratuito' ? 'Começar Grátis' : 'Escolher Plano'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              O Que Nossos Usuários Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de transformação espiritual
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600">
              Tem dúvidas? Nossa equipe está aqui para ajudar você
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informações de contato */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-600">contato@ilyra.com</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold">Telefone</div>
                  <div className="text-gray-600">+55 (11) 9999-9999</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <MapPin className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold">Endereço</div>
                  <div className="text-gray-600">São Paulo, SP - Brasil</div>
                </div>
              </div>
            </div>
            
            {/* Formulário de contato */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    placeholder="Seu nome"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                  
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                  
                  <Textarea
                    placeholder="Sua mensagem"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                  
                  <Button type="submit" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modal de Registro */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Criar Conta</CardTitle>
              <CardDescription>
                {selectedPlan ? `Plano selecionado: ${selectedPlan.name}` : 'Comece sua jornada espiritual'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  placeholder="Nome completo"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  required
                />
                
                <Input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  required
                />
                
                <Input
                  type="password"
                  placeholder="Senha"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  required
                />
                
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  required
                />
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Criando...' : 'Criar Conta'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRegisterForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold">iLyra</span>
              </div>
              <p className="text-gray-400">
                Transformando vidas através da tecnologia espiritual avançada.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Funcionalidades</li>
                <li>Planos</li>
                <li>API</li>
                <li>Segurança</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Status</li>
                <li>Comunidade</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 iLyra. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageIntegrated;
