import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Erro ao carregar notificações.');
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Erro ao limpar todas as notificações:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, error, fetchNotifications, markAsRead, clearAll };
};
