import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  Bell,
  Palette,
  Globe,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Simular carregamento de dados (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: '1',
        username: 'usuario_espiritual',
        email: 'usuario@ilyra.com',
        fullName: 'Maria Silva Santos',
        phone: '+55 11 99999-9999',
        birthDate: '1990-05-15',
        location: 'São Paulo, SP',
        bio: 'Buscadora da verdade espiritual, praticante de meditação há 5 anos.',
        avatar: '/images/avatar-placeholder.jpg',
        joinDate: '2024-01-15',
        plan: 'Premium',
        level: 42,
        points: 15420,
        achievements: 23,
        preferences: {
          notifications: {
            email: true,
            push: true,
            meditation: true,
            achievements: true
          },
          privacy: {
            profilePublic: false,
            showProgress: true,
            allowMessages: true
          },
          appearance: {
            theme: 'auto',
            language: 'pt-BR'
          }
        },
        stats: {
          meditationMinutes: 2340,
          daysStreak: 45,
          completedChallenges: 12,
          aiConversations: 156
        }
      };
      
      setUser(userData);
      setEditForm(userData);
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...user });
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Simular salvamento (substituir por API real)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser({ ...editForm });
    setIsEditing(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category, field, value) => {
    setEditForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [field]: value
        }
      }
    }));
  };

  const exportUserData = () => {
    const dataToExport = {
      profile: user,
      exportDate: new Date().toISOString(),
      format: 'JSON'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilyra-dados-usuario-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      // Implementar exclusão de conta
      console.log('Excluir conta');
    }
  };

  if (loading && !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferências', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'stats', label: 'Estatísticas', icon: TrendingUp }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header do Perfil */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={user?.avatar || '/images/avatar-placeholder.jpg'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                <p className="text-purple-100">@{user?.username}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Nível {user?.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{user?.achievements} conquistas</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-purple-100">Plano {user?.plan}</div>
              <div className="text-lg font-semibold">{user?.points?.toLocaleString()} pontos</div>
              <div className="text-sm text-purple-100">
                Membro desde {new Date(user?.joinDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Informações Pessoais
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{user?.fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-mail
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{user?.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{user?.phone || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Nascimento
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.birthDate || ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{user?.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localização
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{user?.location || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Conte um pouco sobre sua jornada espiritual..."
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {user?.bio || 'Nenhuma biografia adicionada.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Suas Estatísticas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Minutos de Meditação</p>
                      <p className="text-2xl font-bold">{user?.stats?.meditationMinutes?.toLocaleString()}</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Sequência de Dias</p>
                      <p className="text-2xl font-bold">{user?.stats?.daysStreak}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Desafios Concluídos</p>
                      <p className="text-2xl font-bold">{user?.stats?.completedChallenges}</p>
                    </div>
                    <Award className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100">Conversas com IA</p>
                      <p className="text-2xl font-bold">{user?.stats?.aiConversations}</p>
                    </div>
                    <User className="w-8 h-8 text-pink-200" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações de Conta */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ações da Conta
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportUserData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Dados</span>
              </button>
              
              <button
                onClick={deleteAccount}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
