import { useState, useEffect } from 'react';
import { insightsService } from '@/services/insights';

export const useInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsService.getInsights();
      setInsights(data);
    } catch (err) {
      setError('Erro ao carregar insights.');
      console.error('Fetch insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return { insights, loading, error, fetchInsights };
};
