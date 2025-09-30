import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiNotificationLine,
  RiCloseLine,
  RiCheckLine,
  RiInformationLine,
  RiWarningLine,
  RiErrorWarningLine,
  RiHeartLine,
  RiSparklingLine,
  RiStarLine,
  RiFireLine,
  RiThunderstormsLine,
  RiSunLine,
  RiMoonLine,
  RiLeafLine,
  RiFlowerLine,
  RiMagicLine,
  RiLightbulbLine,
  RiSettings3Line,
  RiVolumeUpLine,
  RiVolumeOffLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiEyeLine,
  RiEyeOffLine,
  RiTimeLine,
  RiCalendarLine,
  RiUser3Line,
  RiRobotLine
} from '@remixicon/react';

const ModernNotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    desktop: true,
    spiritual: true,
    achievements: true,
    reminders: true,
    ai: true,
    position: 'top-right',
    theme: 'spiritual'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Tipos de notificação com configurações visuais
  const notificationTypes = {
    success: {
      icon: RiCheckLine,
      color: '#10b981',
      bgColor: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      sound: '/sounds/success.mp3'
    },
    info: {
      icon: RiInformationLine,
      color: '#3b82f6',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      sound: '/sounds/info.mp3'
    },
    warning: {
      icon: RiWarningLine,
      color: '#f59e0b',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      sound: '/sounds/warning.mp3'
    },
    error: {
      icon: RiErrorWarningLine,
      color: '#ef4444',
      bgColor: 'from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-500/30',
      sound: '/sounds/error.mp3'
    },
    spiritual: {
      icon: RiSunLine,
      color: '#8b5cf6',
      bgColor: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      sound: '/sounds/spiritual.mp3'
    },
    achievement: {
      icon: RiStarLine,
      color: '#f59e0b',
      bgColor: 'from-yellow-500/20 to-amber-500/20',
      borderColor: 'border-yellow-500/30',
      sound: '/sounds/achievement.mp3'
    },
    reminder: {
      icon: RiTimeLine,
      color: '#06b6d4',
      bgColor: 'from-cyan-500/20 to-teal-500/20',
      borderColor: 'border-cyan-500/30',
      sound: '/sounds/reminder.mp3'
    },
    ai: {
      icon: RiRobotLine,
      color: '#8b5cf6',
      bgColor: 'from-purple-500/20 to-indigo-500/20',
      borderColor: 'border-purple-500/30',
      sound: '/sounds/ai.mp3'
    }
  };

  // Notificações espirituais predefinidas
  const spiritualNotifications = [
    {
      type: 'spiritual',
      title: 'Momento de Reflexão',
      message: 'Que tal uma pausa para respirar conscientemente e conectar-se com seu interior?',
      icon: RiLeafLine,
      duration: 8000
    },
    {
      type: 'spiritual',
      title: 'Gratidão Diária',
      message: 'Lembre-se de três coisas pelas quais você é grato hoje. A gratidão transforma nossa perspectiva.',
      icon: RiHeartLine,
      duration: 10000
    },
    {
      type: 'spiritual',
      title: 'Energia Positiva',
      message: 'Sua energia está radiante hoje! Continue espalhando luz por onde passar.',
      icon: RiSparklingLine,
      duration: 7000
    },
    {
      type: 'achievement',
      title: 'Conquista Desbloqueada!',
      message: 'Você completou 7 dias consecutivos de meditação. Sua dedicação é inspiradora!',
      icon: RiStarLine,
      duration: 12000
    },
    {
      type: 'reminder',
      title: 'Hora da Meditação',
      message: 'Seu momento de paz interior chegou. Que tal 10 minutos de meditação?',
      icon: RiMoonLine,
      duration: 15000
    }
  ];

  // Gera ID único para notificações
  const generateId = () => Date.now() + Math.random();

  // Adiciona nova notificação
  const addNotification = useCallback((notification) => {
    if (!settings.enabled) return;

    const newNotification = {
      id: generateId(),
      timestamp: new Date(),
      read: false,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Reproduz som se habilitado
    if (settings.sound && notificationTypes[notification.type]?.sound) {
      try {
        const audio = new Audio(notificationTypes[notification.type].sound);
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fallback para navegadores que bloqueiam autoplay
          console.log('Som de notificação bloqueado pelo navegador');
        });
      } catch (error) {
        console.log('Erro ao reproduzir som:', error);
      }
    }

    // Notificação desktop se habilitada e permitida
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/ilyra-icon.png',
        badge: '/icons/ilyra-badge.png',
        tag: newNotification.id,
        requireInteraction: false
      });
    }

    // Remove automaticamente após duração especificada
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, newNotification.duration);

  }, [settings]);

  // Remove notificação
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Marca notificação como lida
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Limpa todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Marca todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Solicita permissão para notificações desktop
  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({ ...prev, desktop: permission === 'granted' }));
    }
  }, []);

  // Simula notificações espirituais automáticas
  useEffect(() => {
    if (!settings.enabled || !settings.spiritual) return;

    const interval = setInterval(() => {
      const randomNotification = spiritualNotifications[
        Math.floor(Math.random() * spiritualNotifications.length)
      ];
      addNotification(randomNotification);
    }, 30000); // A cada 30 segundos para demonstração

    return () => clearInterval(interval);
  }, [settings.enabled, settings.spiritual, addNotification]);

  // Componente de notificação individual
  const NotificationItem = ({ notification, index }) => {
    const type = notificationTypes[notification.type] || notificationTypes.info;
    const IconComponent = notification.icon || type.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          delay: index * 0.1 
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`relative bg-gradient-to-r ${type.bgColor} backdrop-blur-lg rounded-2xl p-4 border ${type.borderColor} shadow-lg overflow-hidden cursor-pointer`}
        onClick={() => markAsRead(notification.id)}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: type.color }}
              initial={{ 
                x: Math.random() * 300, 
                y: Math.random() * 150,
                opacity: 0 
              }}
              animate={{
                x: Math.random() * 300,
                y: Math.random() * 150,
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${type.color}20`, border: `2px solid ${type.color}50` }}
              >
                <IconComponent size={20} style={{ color: type.color }} />
              </motion.div>
              <div>
                <h4 className="text-white font-semibold text-sm">
                  {notification.title}
                </h4>
                <p className="text-white/60 text-xs">
                  {notification.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!notification.read && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
              )}
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <RiCloseLine size={14} className="text-white/70" />
              </motion.button>
            </div>
          </div>

          {/* Message */}
          <p className="text-white/90 text-sm leading-relaxed mb-3">
            {notification.message}
          </p>

          {/* Actions */}
          {notification.actions && (
            <div className="flex gap-2">
              {notification.actions.map((action, actionIndex) => (
                <motion.button
                  key={actionIndex}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    action.primary
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
            style={{ backgroundColor: type.color }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: notification.duration / 1000, ease: "linear" }}
          />
        </div>

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{ 
            background: `radial-gradient(circle at center, ${type.color}15, transparent 70%)` 
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  // Painel de configurações
  const SettingsPanel = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className="absolute top-16 right-0 w-80 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl z-50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Configurações</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSettingsOpen(false)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <RiCloseLine size={16} className="text-white/70" />
        </motion.button>
      </div>

      <div className="space-y-4">
        {/* Toggle Geral */}
        <div className="flex items-center justify-between">
          <span className="text-white/80">Notificações</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.enabled ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: settings.enabled ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Som */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiVolumeUpLine size={16} className="text-white/60" />
            <span className="text-white/80">Som</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.sound ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: settings.sound ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Desktop */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiNotificationLine size={16} className="text-white/60" />
            <span className="text-white/80">Desktop</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!settings.desktop) {
                requestDesktopPermission();
              } else {
                setSettings(prev => ({ ...prev, desktop: false }));
              }
            }}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.desktop ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: settings.desktop ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Categorias */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-white/80 font-medium mb-3">Categorias</h4>
          
          {[
            { key: 'spiritual', label: 'Espirituais', icon: RiSunLine },
            { key: 'achievements', label: 'Conquistas', icon: RiStarLine },
            { key: 'reminders', label: 'Lembretes', icon: RiTimeLine },
            { key: 'ai', label: 'IA', icon: RiRobotLine }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-white/60" />
                <span className="text-white/80 text-sm">{label}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings[key] ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{ x: settings[key] ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={markAllAsRead}
            className="w-full py-2 px-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors text-sm"
          >
            Marcar Todas como Lidas
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearAll}
            className="w-full py-2 px-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors text-sm"
          >
            Limpar Todas
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-6 right-6 z-40">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <motion.div
              animate={{ rotate: notifications.length > 0 ? [0, 15, -15, 0] : 0 }}
              transition={{ duration: 0.5, repeat: notifications.length > 0 ? Infinity : 0, repeatDelay: 3 }}
            >
              <RiNotificationLine size={20} />
            </motion.div>
          </motion.button>

          {/* Unread Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {isSettingsOpen && <SettingsPanel />}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications Container */}
      <div className={`fixed z-30 pointer-events-none ${
        settings.position === 'top-right' ? 'top-20 right-6' :
        settings.position === 'top-left' ? 'top-20 left-6' :
        settings.position === 'bottom-right' ? 'bottom-6 right-6' :
        'bottom-6 left-6'
      }`}>
        <div className="w-80 space-y-3 pointer-events-auto">
          <AnimatePresence>
            {notifications.slice(0, 5).map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Test Buttons (for development) */}
      <div className="fixed bottom-6 left-6 space-y-2 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addNotification({
            type: 'spiritual',
            title: 'Momento de Paz',
            message: 'Respire fundo e conecte-se com sua essência interior.',
            icon: RiLeafLine
          })}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors text-sm"
        >
          Teste Espiritual
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addNotification({
            type: 'achievement',
            title: 'Conquista!',
            message: 'Você desbloqueou um novo nível de consciência!',
            icon: RiStarLine,
            actions: [
              { label: 'Ver Detalhes', primary: true, onClick: () => console.log('Ver detalhes') },
              { label: 'Compartilhar', onClick: () => console.log('Compartilhar') }
            ]
          })}
          className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-colors text-sm"
        >
          Teste Conquista
        </motion.button>
      </div>
    </>
  );
};

export default ModernNotificationSystem;
