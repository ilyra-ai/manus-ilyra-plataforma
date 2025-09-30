import { useState, useEffect } from 'react';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulação de carregamento inicial
    setGoals([
      { id: 1, title: 'Meditar 10 minutos por dia', description: 'Usar o timer de meditação', target_value: 30, current_value: 15, due_date: '2025-10-31' },
      { id: 2, title: 'Praticar gratidão diariamente', description: 'Escrever 3 coisas pelas quais sou grato', target_value: 30, current_value: 25, due_date: '2025-10-31' },
    ]);
  }, []);

  const addGoal = async (newGoal) => {
    setLoading(true);
    try {
      // Simulação de adição
      const goalWithId = { ...newGoal, id: Date.now() };
      setGoals(prev => [...prev, goalWithId]);
    } catch (err) {
      setError('Erro ao adicionar meta.');
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id, updatedGoal) => {
    setLoading(true);
    try {
      // Simulação de atualização
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g));
    } catch (err) {
      setError('Erro ao atualizar meta.');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    setLoading(true);
    try {
      // Simulação de exclusão
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      setError('Erro ao excluir meta.');
    } finally {
      setLoading(false);
    }
  };

  return { goals, loading, error, addGoal, updateGoal, deleteGoal };
};
