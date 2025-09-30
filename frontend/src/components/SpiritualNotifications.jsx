import React, { useState, useEffect } from 'react';
import { cx } from '../lib/utils.ts';
import { 
  RiNotificationLine,
  RiCloseLine,
  RiSparklingLine,
  RiHeartLine,
  RiSunLine,
  RiMoonLine,
  RiStarLine,
  RiLeafLine,
  RiTimeLine,
  RiTrophyLine,
  RiGiftLine,
  RiLightbulbLine
} from '@remixicon/react';

const SpiritualNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  // Tipos de notificações espirituais
  const notificationTypes = {
    achievement: {
      icon: RiTrophyLine,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-800 dark:text-yellow-200'
    },
    insight: {
      icon: RiLightbulbLine,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-800 dark:text-purple-200'
    },
    reminder: {
      icon: RiTimeLine,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-200'
    },
    blessing: {
      icon: RiSparklingLine,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-800 dark:text-emerald-200'
    },
    milestone: {
      icon: RiStarLine,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-800 dark:text-indigo-200'
    },
    gift: {
      icon: RiGiftLine,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-800 dark:text-pink-200'
    }
  };

  // Mensagens espirituais inspiradoras
  const spiritualMessages = [
    {
      type: 'achievement',
      title: '🏆 Conquista Desbloqueada!',
      message: 'Você completou 7 dias consecutivos de meditação! Sua disciplina espiritual está florescendo.',
      points: '+50 Pontos de Sabedoria'
    },
    {
      type: 'insight',
      title: '💡 Insight Espiritual',
      message: 'Sua energia de gratidão aumentou 15% esta semana. Continue cultivando pensamentos positivos.',
      points: '+25 Pontos de Luz'
    },
    {
      type: 'reminder',
      title: '⏰ Momento Sagrado',
      message: 'Hora da sua meditação vespertina. O universo está alinhado para sua prática.',
      points: 'Lembrete Amoroso'
    },
    {
      type: 'blessing',
      title: '✨ Bênção Cósmica',
      message: 'As energias planetárias estão favoráveis hoje. É um ótimo momento para manifestações.',
      points: '+100 Energia Vital'
    },
    {
      type: 'milestone',
      title: '⭐ Marco Espiritual',
      message: 'Parabéns! Você alcançou o nível "Buscador Iluminado" em sua jornada espiritual.',
      points: 'Novo Nível Desbloqueado'
    },
    {
      type: 'gift',
      title: '🎁 Presente do Universo',
      message: 'Você recebeu uma nova técnica de respiração! Acesse em Práticas Avançadas.',
      points: 'Conteúdo Exclusivo'
    }
  ];

  useEffect(() => {
    // Simular notificações chegando em intervalos
    const interval = setInterval(() => {
      if (notifications.length < 3) {
        const randomMessage = spiritualMessages[Math.floor(Math.random() * spiritualMessages.length)];
        const newNotification = {
          id: Date.now(),
          ...randomMessage,
          timestamp: new Date(),
          isNew: true
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        // Marcar como lida após 3 segundos
        setTimeout(() => {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === newNotification.id 
                ? { ...notif, isNew: false }
                : notif
            )
          );
        }, 3000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const NotificationCard = ({ notification }) => {
    const type = notificationTypes[notification.type];
    const IconComponent = type.icon;

    return (
      <div className={cx(
        "relative overflow-hidden rounded-xl shadow-lg border transition-all duration-500 transform",
        type.bgColor,
        "border-gray-200 dark:border-gray-700",
        notification.isNew 
          ? "animate-pulse scale-105 shadow-xl" 
          : "hover:scale-102 hover:shadow-lg"
      )}>
        {/* Gradient overlay */}
        <div className={cx(
          "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
          type.color
        )} />
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cx(
              "flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center shadow-lg",
              type.color
            )}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className={cx("font-semibold text-sm", type.textColor)}>
                  {notification.title}
                </h4>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RiCloseLine className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between mt-3">
                <span className={cx(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  type.bgColor,
                  type.textColor
                )}>
                  {notification.points}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Shine effect for new notifications */}
        {notification.isNew && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine" />
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RiNotificationLine className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Mensagens Espirituais
          </h3>
          {notifications.some(n => n.isNew) && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RiCloseLine className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Notifications */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <RiSparklingLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aguardando mensagens do universo...</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setNotifications([])}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Limpar todas as notificações
          </button>
        </div>
      )}
    </div>
  );
};

export default SpiritualNotifications;
