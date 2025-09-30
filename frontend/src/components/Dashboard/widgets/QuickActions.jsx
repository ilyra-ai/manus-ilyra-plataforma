import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import {
  Plus, MessageCircle, TrendingUp, Target, Heart, Brain, Zap, Bell
} from 'lucide-react';

const QuickActions = ({ onRemove, isFullscreen, theme }) => {
  const actions = [
    { icon: MessageCircle, label: 'Novo Chat IA', onClick: () => console.log('Novo Chat IA') },
    { icon: TrendingUp, label: 'Registrar Métrica', onClick: () => console.log('Registrar Métrica') },
    { icon: Target, label: 'Adicionar Meta', onClick: () => console.log('Adicionar Meta') },
    { icon: Bell, label: 'Ver Notificações', onClick: () => console.log('Ver Notificações') },
    { icon: Heart, label: 'Iniciar Meditação', onClick: () => console.log('Iniciar Meditação') },
    { icon: Brain, label: 'Gerar Insight', onClick: () => console.log('Gerar Insight') },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Ações Rápidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col h-auto py-4"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export { QuickActions };

