import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard';

export const useDashboardConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardConfig();
      setConfig(data);
    } catch (err) {
      setError('Erro ao carregar configuração do dashboard.');
      console.error('Fetch dashboard config error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const updated = await dashboardService.updateDashboardConfig(newConfig);
      setConfig(updated);
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar configuração do dashboard:', err);
      throw err;
    }
  };

  const saveLayout = async (newLayout) => {
    try {
      await dashboardService.saveDashboardLayout(newLayout);
      setConfig(prev => ({ ...prev, layout: newLayout }));
    } catch (err) {
      console.error('Erro ao salvar layout do dashboard:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return { config, loading, error, fetchConfig, updateConfig, saveLayout };
};
