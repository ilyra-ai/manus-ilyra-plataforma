import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireRole = null, 
  redirectTo = '/login',
  fallback = null 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Verificando autenticação...</p>
          </div>
        </div>
      )
    );
  }

  // Se requer autenticação mas usuário não está logado
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Se não requer autenticação mas usuário está logado (ex: página de login)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Verificar role específica se necessário
  if (requireRole && user?.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Você não tem permissão para acessar esta página. 
            {requireRole && ` É necessário ter o papel de "${requireRole}".`}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Se chegou até aqui, pode renderizar o componente
  return children;
};

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.role === role);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const canAccess = (requiredRole) => {
    if (!requiredRole) return true;
    return hasRole(requiredRole);
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isUser,
    canAccess,
    userRole: user?.role
  };
};

// Componente para renderização condicional baseada em permissões
export const ConditionalRender = ({ 
  children, 
  requireRole = null, 
  requireAuth = true,
  fallback = null 
}) => {
  const { isAuthenticated, user } = useAuth();
  const { canAccess } = usePermissions();

  // Se requer autenticação mas não está autenticado
  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  // Se requer role específica mas não tem permissão
  if (requireRole && !canAccess(requireRole)) {
    return fallback;
  }

  return children;
};

// HOC para proteger componentes
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// HOC para proteger componentes com role
export const withRole = (Component, requiredRole) => {
  return function RoleProtectedComponent(props) {
    return (
      <ProtectedRoute requireRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;
