import { useState, useEffect } from 'react';
import { metricsService } from '@/services/metrics';

export const useSpiritualMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await metricsService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Erro ao carregar métricas espirituais.');
      console.error('Fetch metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (id, newValue) => {
    try {
      await metricsService.updateMetric(id, newValue);
      fetchMetrics(); // Recarrega as métricas após a atualização
    } catch (err) {
      console.error('Erro ao atualizar métrica:', err);
    }
  };

  const getMetricsHistory = async (metricName) => {
    try {
      const history = await metricsService.getMetricsHistory(metricName);
      return history;
    } catch (err) {
      console.error('Erro ao carregar histórico de métricas:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, error, fetchMetrics, updateMetric, getMetricsHistory };
};
