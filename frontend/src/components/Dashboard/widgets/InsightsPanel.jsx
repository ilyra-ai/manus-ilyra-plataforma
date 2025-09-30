import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  ScrollArea,
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui';
import {
  Lightbulb, RefreshCw, Filter, Search, ChevronDown, ChevronUp, Star, Heart, Brain, Zap
} from 'lucide-react';
import { useInsights } from '@/hooks/useInsights'; // Supondo um hook para gerenciar insights

const INSIGHT_TYPES = {
  spiritual_growth: { icon: Brain, color: 'text-purple-500', name: 'Crescimento Espiritual' },
  emotional_wellbeing: { icon: Heart, color: 'text-red-500', name: 'Bem-Estar Emocional' },
  personal_development: { icon: Star, color: 'text-yellow-500', name: 'Desenvolvimento Pessoal' },
  manifestation: { icon: Zap, color: 'text-orange-500', name: 'Manifestação' },
};

const InsightsPanel = ({ onRemove, isFullscreen, theme }) => {
  const { insights, loading, error, fetchInsights } = useInsights();
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInsights = insights.filter(insight => {
    const matchesType = filterType === 'all' || insight.type === filterType;
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          insight.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Lightbulb className="h-5 w-5" />
          <span>Insights Personalizados</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-600">Carregando insights...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && filteredInsights.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum insight encontrado. Tente ajustar os filtros.</p>
          </div>
        )}
        <div className="flex space-x-2 mb-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {Object.entries(INSIGHT_TYPES).map(([key, type]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                    <span>{type.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar insights..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-full max-h-[calc(100%-100px)]">
          <div className="space-y-4">
            {filteredInsights.map(insight => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {INSIGHT_TYPES[insight.type] && (() => {
                      const IconComponent = INSIGHT_TYPES[insight.type].icon;
                      return <IconComponent className={`h-5 w-5 ${INSIGHT_TYPES[insight.type].color}`} />;
                    })()}
                    <h3 className="font-semibold text-lg">{insight.title}</h3>
                  </div>
                  <Badge variant="secondary">{INSIGHT_TYPES[insight.type]?.name || insight.type}</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{insight.content}</p>
                <p className="text-xs text-gray-500">Gerado em: {new Date(insight.timestamp).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export { InsightsPanel };

