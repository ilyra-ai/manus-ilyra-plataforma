import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Progress,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';
import { useGoals } from '@/hooks/useGoals'; // Supondo um hook para gerenciar metas

const GoalTracker = ({ onRemove, isFullscreen, theme }) => {
  const { goals, addGoal, updateGoal, deleteGoal, loading, error } = useGoals();
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_value: 0,
    current_value: 0,
    due_date: ''
  });

  useEffect(() => {
    if (editingGoal) {
      setNewGoal({
        title: editingGoal.title,
        description: editingGoal.description,
        target_value: editingGoal.target_value,
        current_value: editingGoal.current_value,
        due_date: editingGoal.due_date ? new Date(editingGoal.due_date).toISOString().split('T')[0] : ''
      });
      setShowAddGoalDialog(true);
    } else {
      setNewGoal({
        title: '',
        description: '',
        target_value: 0,
        current_value: 0,
        due_date: ''
      });
    }
  }, [editingGoal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: name === 'target_value' || name === 'current_value' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingGoal) {
      await updateGoal(editingGoal.id, newGoal);
    } else {
      await addGoal(newGoal);
    }
    setShowAddGoalDialog(false);
    setEditingGoal(null);
  };

  const getProgress = (goal) => {
    if (goal.target_value === 0) return 0;
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Metas Espirituais</span>
        </CardTitle>
        <Button size="sm" onClick={() => setShowAddGoalDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Meta
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-600">Carregando metas...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && goals.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma meta definida ainda. Comece adicionando uma!</p>
          </div>
        )}
        <div className="space-y-4">
          {goals.map(goal => (
            <Card key={goal.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingGoal(goal)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Progresso: {goal.current_value} / {goal.target_value}</span>
                {goal.due_date && (
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Até: {new Date(goal.due_date).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
              <Progress value={getProgress(goal)} className="w-full" />
              {getProgress(goal) === 100 && (
                <div className="flex items-center text-green-600 text-sm mt-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Meta Concluída!</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>

      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Editar Meta' : 'Adicionar Nova Meta'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={newGoal.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={newGoal.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="target_value">Valor Alvo</Label>
              <Input
                id="target_value"
                name="target_value"
                type="number"
                value={newGoal.target_value}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="current_value">Valor Atual</Label>
              <Input
                id="current_value"
                name="current_value"
                type="number"
                value={newGoal.current_value}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="due_date">Data Limite</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={newGoal.due_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowAddGoalDialog(false);
                setEditingGoal(null);
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingGoal ? 'Salvar Alterações' : 'Adicionar Meta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export { GoalTracker };

