import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Label,
  Textarea,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Progress
} from '@/components/ui';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Upload,
  Download,
  Lock,
  Unlock,
  Shield,
  Star,
  Zap,
  Heart,
  Brain,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Gift,
  Infinity,
  RefreshCw,
  Bell,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { apiService } from '@/services/api';
import { metricsService } from '@/services/metrics';
import { pdfExportService } from '@/services/pdfExportService';

const UserProfile = ({ onRemove, isFullscreen, theme }) => {
  const { user, isAuthenticated, logout, updateUser: updateAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profile_picture: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [spiritualMetrics, setSpiritualMetrics] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        profile_picture: user.profile_picture || ''
      });
      fetchSpiritualMetrics();
    }
  }, [user]);

  const fetchSpiritualMetrics = async () => {
    try {
      const metrics = await metricsService.getMetrics();
      setSpiritualMetrics(metrics);
    } catch (err) {
      console.error('Erro ao carregar métricas espirituais:', err);
      setError('Não foi possível carregar as métricas espirituais.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      setUploadProgress(0);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simular upload de arquivo
        await new Promise(resolve => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

        // Em um ambiente real, você enviaria para o backend e obteria a URL
        const imageUrl = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=User'; // Simulação
        setFormData(prev => ({ ...prev, profile_picture: imageUrl }));
        setSuccess('Foto de perfil atualizada com sucesso!');
      } catch (err) {
        setError('Erro ao fazer upload da imagem.');
        console.error('Upload error:', err);
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await apiService.put(`/users/${user.id}`, formData);
      updateAuthUser(updatedUser); // Atualiza o contexto de autenticação
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userData = await apiService.get(`/users/${user.id}/data`);
      pdfExportService.exportUserData(userData, `ilyra_data_${user.id}.pdf`);
      setSuccess('Seus dados foram exportados com sucesso!');
    } catch (err) {
      setError('Erro ao exportar dados.');
      console.error('Export data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
      return;
    }
    setLoading(true);
    try {
      await apiService.delete(`/users/${user.id}`);
      logout(); // Desloga o usuário após exclusão
      setSuccess('Sua conta foi excluída com sucesso.');
    } catch (err) {
      setError('Erro ao excluir conta. Tente novamente.');
      console.error('Delete account error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <CardTitle>Faça login para ver seu perfil</CardTitle>
          <p className="text-gray-500 mt-2">Acesse sua conta para gerenciar suas informações e progresso.</p>
          {/* Adicionar botão de login/registro aqui */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <UserIcon className="h-5 w-5" />
          <span>Meu Perfil</span>
        </CardTitle>
        <div className="flex space-x-2">
          {isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={loading}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSubmit} disabled={loading || !isEditing}>
            {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Salvar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.profile_picture || user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Avatar" />
              <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700">
                <Upload className="h-4 w-4" />
                <input
                  id="profile-picture-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
            )}
          </div>
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full max-w-[200px]">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-center text-sm text-gray-500 mt-1">Upload: {uploadProgress}%</p>
            </div>
          )}
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
        </div>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing || loading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={true} // Email geralmente não é editável diretamente
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing || loading}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing || loading}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing || loading}
              rows={4}
            />
          </div>
        </form>

        <Separator />

        <div>
          <h4 className="text-lg font-semibold mb-4">Métricas Espirituais (Resumo)</h4>
          {spiritualMetrics ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(spiritualMetrics).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Badge variant="secondary">{key.replace(/_/g, ' ').toUpperCase()}</Badge>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma métrica disponível.</p>
          )}
          <Button variant="outline" className="mt-4" onClick={fetchSpiritualMetrics} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Métricas
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Gerenciamento da Conta</h4>
          <Button variant="outline" onClick={handleExportData} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Meus Dados (PDF)
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Minha Conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { UserProfile };

