import React from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  ScrollArea,
  Badge
} from '@/components/ui';

const NotificationCenter = ({ notifications, markAsRead, clearAll, onRemove, isFullscreen, theme }) => {
  const unreadNotifications = notifications.filter(n => !n.read);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notificações</span>
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadNotifications.length}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bell className="h-12 w-12 mb-2" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 ${notification.read ? 'bg-gray-50' : 'bg-white hover:bg-gray-100'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-grow">
                    <p className={`text-sm font-medium ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs ${notification.read ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-1 text-blue-500 hover:text-blue-600"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};


export { NotificationCenter };

