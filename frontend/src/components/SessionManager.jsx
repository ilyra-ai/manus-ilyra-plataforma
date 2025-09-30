import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './providers/AuthProvider';

const SessionManager = ({ children }) => {
  const { user, logout, refreshToken, isAuthenticated } = useAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Configurações de sessão
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes do timeout
  const REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh a cada 5 minutos

  // Gerenciar atividade do usuário
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setSessionWarning(false);
  }, []);

  // Eventos que indicam atividade do usuário
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  useEffect(() => {
    if (!isAuthenticated) return;

    // Adicionar listeners de atividade
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Verificar sessão periodicamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;

      if (timeSinceActivity >= SESSION_TIMEOUT) {
        // Sessão expirou
        logout();
        return;
      }

      if (timeUntilTimeout <= WARNING_TIME && !sessionWarning) {
        // Mostrar aviso de expiração
        setSessionWarning(true);
        setTimeLeft(Math.ceil(timeUntilTimeout / 1000));
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, sessionWarning, logout]);

  // Atualizar contador de tempo restante
  useEffect(() => {
    if (!sessionWarning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;
      const secondsLeft = Math.ceil(timeUntilTimeout / 1000);

      if (secondsLeft <= 0) {
        logout();
        return;
      }

      setTimeLeft(secondsLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionWarning, lastActivity, logout]);

  // Refresh automático do token
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoRefresh = async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Erro ao renovar token:', error);
        logout();
      }
    };

    const interval = setInterval(autoRefresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken, logout]);

  // Estender sessão
  const extendSession = () => {
    updateActivity();
    setSessionWarning(false);
  };

  // Formatar tempo restante
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      {/* Modal de aviso de sessão */}
      {sessionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sessão Expirando
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sua sessão expirará em <span className="font-bold text-orange-600 dark:text-orange-400">{formatTime(timeLeft)}</span>.
                Deseja continuar?
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={extendSession}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continuar Sessão
                </button>
                
                <button
                  onClick={logout}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Hook para monitorar status da sessão
export const useSession = () => {
  const { user, isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState({
    isActive: false,
    lastActivity: null,
    timeRemaining: null
  });

  useEffect(() => {
    if (isAuthenticated) {
      setSessionInfo({
        isActive: true,
        lastActivity: new Date(),
        timeRemaining: 30 * 60 // 30 minutos em segundos
      });
    } else {
      setSessionInfo({
        isActive: false,
        lastActivity: null,
        timeRemaining: null
      });
    }
  }, [isAuthenticated]);

  return sessionInfo;
};

// Componente para exibir informações da sessão
export const SessionInfo = () => {
  const { user } = useAuth();
  const sessionInfo = useSession();

  if (!sessionInfo.isActive) return null;

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      <div>Usuário: {user?.username}</div>
      <div>Última atividade: {sessionInfo.lastActivity?.toLocaleTimeString('pt-BR')}</div>
    </div>
  );
};

// Componente para logout automático em caso de inatividade
export const IdleTimer = ({ 
  timeout = 30 * 60 * 1000, // 30 minutos
  onIdle = () => {},
  children 
}) => {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setIsIdle(false);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    const interval = setInterval(() => {
      if (Date.now() - lastActivity >= timeout) {
        setIsIdle(true);
        onIdle();
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      clearInterval(interval);
    };
  }, [lastActivity, timeout, onIdle, resetTimer]);

  return children;
};

export default SessionManager;
