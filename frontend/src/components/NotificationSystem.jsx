import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Star,
  Gift,
  Zap,
  Heart
} from 'lucide-react';

// Context para gerenciar notificações globalmente
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

// Provider de notificações
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remover notificações toast após 5 segundos
    if (notification.type === 'toast') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Componente de notificação individual
const NotificationItem = ({ notification, onClose, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.category) {
      case 'spiritual':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'achievement':
        return <Gift className="w-5 h-5 text-yellow-500" />;
      case 'energy':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'meditation':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.category) {
      case 'spiritual':
        return 'border-l-purple-500';
      case 'achievement':
        return 'border-l-yellow-500';
      case 'energy':
        return 'border-l-blue-500';
      case 'meditation':
        return 'border-l-pink-500';
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-orange-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 border-l-4 ${getBorderColor()} 
      rounded-lg shadow-md p-4 mb-3 transition-all duration-300
      ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Marcar como lida"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onClose(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                title="Remover notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(notification.timestamp).toLocaleString('pt-BR')}
            </span>
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de toast para notificações temporárias
const ToastNotification = ({ notification, onClose }) => {
  const getToastStyle = () => {
    switch (notification.category) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className={`
      ${getToastStyle()} rounded-lg shadow-lg p-4 mb-2 
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {notification.category === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.category === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {notification.category === 'error' && <XCircle className="w-5 h-5" />}
            {!['success', 'warning', 'error'].includes(notification.category) && <Info className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
        </div>
        
        <button
          onClick={() => onClose(notification.id)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Componente principal do sistema de notificações
const NotificationSystem = () => {
  const { 
    notifications, 
    removeNotification, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    unreadCount 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Separar toasts das notificações normais
  const toastNotifications = notifications.filter(n => n.type === 'toast');
  const regularNotifications = filteredNotifications.filter(n => n.type !== 'toast');

  return (
    <>
      {/* Botão de notificações */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown de notificações */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notificações
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Limpar todas
                  </button>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex space-x-2 mt-3">
                {['all', 'unread', 'read'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filter === filterType
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filterType === 'all' ? 'Todas' : filterType === 'unread' ? 'Não lidas' : 'Lidas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de notificações */}
            <div className="max-h-96 overflow-y-auto p-4">
              {regularNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma notificação encontrada
                  </p>
                </div>
              ) : (
                regularNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={removeNotification}
                    onMarkAsRead={markAsRead}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Container de toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationSystem;
