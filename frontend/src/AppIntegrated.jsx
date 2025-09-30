import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/providers/AuthProvider';
import { useAuth } from './hooks/useAPI';
import ProtectedRoute from './components/ProtectedRoute';
import SessionManager from './components/SessionManager';
import LandingPageIntegrated from './components/LandingPageIntegrated';
import DashboardIntegrated from './components/DashboardIntegrated';
import LoginRegister from './components/auth/LoginRegister';
import UserProfile from './components/UserProfile';
import NotificationSystem from './components/NotificationSystem';
import { Toaster } from './components/ui/toaster';
import './App.css';

// Componente de Loading
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
      <p className="text-gray-600 text-lg">Carregando iLyra...</p>
    </div>
  </div>
);

// Componente de Erro de Conexão
const ConnectionError = ({ onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
    <div className="text-center space-y-4 max-w-md mx-auto p-6">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900">Erro de Conexão</h2>
      <p className="text-gray-600">
        Não foi possível conectar com o servidor. Verifique sua conexão com a internet.
      </p>
      <button 
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

// Layout principal da aplicação
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sistema de notificações global */}
      <NotificationSystem />
      
      {/* Gerenciador de sessão */}
      <SessionManager />
      
      {/* Conteúdo principal */}
      <main className="relative">
        {children}
      </main>
      
      {/* Sistema de toasts */}
      <Toaster />
    </div>
  );
};

// Componente principal da aplicação
const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [connectionError, setConnectionError] = React.useState(false);

  // Verificar conexão com a API
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        // Aqui você pode fazer uma verificação de saúde da API
        // Por exemplo: await checkAPIHealth();
        setConnectionError(false);
      } catch (error) {
        setConnectionError(true);
      }
    };

    checkConnection();
  }, []);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return <LoadingSpinner />;
  }

  // Mostrar erro de conexão
  if (connectionError) {
    return (
      <ConnectionError 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Rota pública - Landing Page */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LandingPageIntegrated />
            } 
          />
          
          {/* Rota de autenticação */}
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginRegister />
            } 
          />
          
          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardIntegrated />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota para admin (se o usuário for admin) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota de configurações */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota de planos */}
          <Route 
            path="/plans" 
            element={
              <ProtectedRoute>
                <PlansPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota 404 */}
          <Route 
            path="*" 
            element={<NotFoundPage />} 
          />
        </Routes>
      </AppLayout>
    </Router>
  );
};

// Componente de Dashboard Admin (placeholder)
const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Administrativo</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Dashboard administrativo em desenvolvimento. Aqui você poderá:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Gerenciar usuários</li>
          <li>• Visualizar KPIs</li>
          <li>• Configurar o sistema</li>
          <li>• Monitorar analytics</li>
          <li>• Gerenciar planos e pagamentos</li>
        </ul>
      </div>
    </div>
  </div>
);

// Componente de Configurações do Usuário (placeholder)
const UserSettings = () => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Página de configurações em desenvolvimento. Aqui você poderá:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Alterar dados pessoais</li>
          <li>• Configurar notificações</li>
          <li>• Gerenciar privacidade (LGPD)</li>
          <li>• Exportar dados</li>
          <li>• Excluir conta</li>
        </ul>
      </div>
    </div>
  </div>
);

// Componente de Planos (placeholder)
const PlansPage = () => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gerenciar Plano</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Página de gerenciamento de planos em desenvolvimento. Aqui você poderá:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Ver plano atual</li>
          <li>• Fazer upgrade/downgrade</li>
          <li>• Histórico de pagamentos</li>
          <li>• Cancelar assinatura</li>
          <li>• Solicitar reembolso</li>
        </ul>
      </div>
    </div>
  </div>
);

// Componente de Página Não Encontrada
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
    <div className="text-center space-y-4 max-w-md mx-auto p-6">
      <div className="text-purple-600 text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-gray-900">Página Não Encontrada</h2>
      <p className="text-gray-600">
        A página que você está procurando não existe ou foi movida.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-2"
      >
        Voltar
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Ir para Início
      </button>
    </div>
  </div>
);

// Componente principal da aplicação com providers
const AppIntegrated = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppIntegrated;
