import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { RefreshCw, Settings } from 'lucide-react';

const MetricsChart = ({ data, settings, onUpdateSettings, isFullscreen, theme }) => {
  const [selectedMetric, setSelectedMetric] = React.useState(settings.metric || 'meditation_frequency');
  const [chartType, setChartType] = React.useState(settings.chartType || 'line');

  React.useEffect(() => {
    onUpdateSettings?.({ metric: selectedMetric, chartType });
  }, [selectedMetric, chartType]);

  const chartData = data?.metrics?.history?.[selectedMetric] || [];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={theme.primary} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke={theme.primary} fill={theme.primary} fillOpacity={0.3} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="value" fill={theme.primary} />
          </BarChart>
        );
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={theme.primary} activeDot={{ r: 8 }} />
          </LineChart>
        );
    }
  };

  return (
    <div className="h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecionar Métrica" />
          </SelectTrigger>
          <SelectContent>
            {/* Exemplo de métricas, em produção viriam do backend */}
            <SelectItem value="meditation_frequency">Frequência de Meditação</SelectItem>
            <SelectItem value="gratitude_score">Pontuação de Gratidão</SelectItem>
            <SelectItem value="energy_level">Nível de Energia</SelectItem>
          </SelectContent>
        </Select>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tipo de Gráfico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Linha</SelectItem>
            <SelectItem value="area">Área</SelectItem>
            <SelectItem value="bar">Barra</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={isFullscreen ? '90%' : 300}>
        {chartData.length > 0 ? renderChart() : <p className="text-center text-gray-500">Nenhum dado disponível para esta métrica.</p>}
      </ResponsiveContainer>
    </div>
  );
};

export { MetricsChart };

