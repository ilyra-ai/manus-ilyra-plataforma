import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Switch,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea
} from '@/components/ui';
import {
  Palette,
  LayoutDashboard,
  Grid,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';

const WIDGET_TYPES = {
  SPIRITUAL_METRICS: 'spiritual_metrics',
  AI_CHAT: 'ai_chat',
  NOTIFICATIONS: 'notifications',
  PROFILE: 'profile',
  CHARTS: 'charts',
  GOALS: 'goals',
  MEDITATION: 'meditation',
  INSIGHTS: 'insights',
  QUICK_ACTIONS: 'quick_actions',
  CALENDAR: 'calendar',
  WEATHER: 'weather',
  QUOTES: 'quotes',
  PROGRESS: 'progress'
};

const WIDGET_OPTIONS = [
  { value: WIDGET_TYPES.SPIRITUAL_METRICS, label: 'Métricas Espirituais' },
  { value: WIDGET_TYPES.AI_CHAT, label: 'Chat IA Espiritual' },
  { value: WIDGET_TYPES.NOTIFICATIONS, label: 'Notificações' },
  { value: WIDGET_TYPES.PROFILE, label: 'Meu Perfil' },
  { value: WIDGET_TYPES.CHARTS, label: 'Gráficos de Progresso' },
  { value: WIDGET_TYPES.GOALS, label: 'Metas Espirituais' },
  { value: WIDGET_TYPES.MEDITATION, label: 'Temporizador de Meditação' },
  { value: WIDGET_TYPES.INSIGHTS, label: 'Insights Personalizados' },
  { value: WIDGET_TYPES.QUICK_ACTIONS, label: 'Ações Rápidas' },
  { value: WIDGET_TYPES.CALENDAR, label: 'Calendário' },
  { value: WIDGET_TYPES.WEATHER, label: 'Clima' },
  { value: WIDGET_TYPES.QUOTES, label: 'Citações Diárias' },
  { value: WIDGET_TYPES.PROGRESS, label: 'Barra de Progresso' },
];

const THEMES = {
  light: {
    name: 'Claro',
    primary: '#6366f1',
    secondary: '#f1f5f9',
    background: '#ffffff',
    text: '#1e293b'
  },
  dark: {
    name: 'Escuro',
    primary: '#8b5cf6',
    secondary: '#1e293b',
    background: '#0f172a',
    text: '#f1f5f9'
  },
  spiritual: {
    name: 'Espiritual',
    primary: '#7c3aed',
    secondary: '#faf5ff',
    background: '#f8fafc',
    text: '#374151'
  },
  nature: {
    name: 'Natureza',
    primary: '#059669',
    secondary: '#ecfdf5',
    background: '#f0fdf4',
    text: '#065f46'
  }
};

const CustomizationPanel = ({
  isOpen,
  onClose,
  layout,
  onLayoutChange,
  theme,
  onThemeChange,
  onAddWidget,
  onRemoveWidget,
  onSaveLayout,
  isCustomizing,
  onToggleCustomizing
}) => {
  const handleAddWidget = (type) => {
    onAddWidget(type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Personalizar Dashboard</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="theme-select" className="text-right">
                Tema
              </Label>
              <Select value={theme} onValueChange={onThemeChange}>
                <SelectTrigger id="theme-select" className="col-span-2">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(THEMES).map(([key, t]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }}></div>
                        <span>{t.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="customize-toggle" className="text-right">
                Modo de Edição
              </Label>
              <Switch
                id="customize-toggle"
                checked={isCustomizing}
                onCheckedChange={onToggleCustomizing}
                className="col-span-2"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="add-widget-select" className="text-right">
                Adicionar Widget
              </Label>
              <Select onValueChange={handleAddWidget}>
                <SelectTrigger id="add-widget-select" className="col-span-2">
                  <SelectValue placeholder="Selecione um widget" />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_OPTIONS.map((widget) => (
                    <SelectItem key={widget.value} value={widget.value}>
                      {widget.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-right">Widgets Ativos</Label>
              <div className="col-span-3 space-y-2">
                {layout.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between rounded-md border p-2">
                    <span>{WIDGET_OPTIONS.find(opt => opt.value === widget.type)?.label || widget.type}</span>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveWidget(widget.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onSaveLayout}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CustomizationPanel };

