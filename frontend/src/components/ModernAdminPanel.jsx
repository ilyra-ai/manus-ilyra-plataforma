import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiDashboardLine,
  RiUser3Line,
  RiSettings3Line,
  RiBarChartLine,
  RiNotificationLine,
  RiShieldLine,
  RiDatabase2Line,
  RiCloudLine,
  RiCpuLine,
  RiHardDriveLine,
  RiWifiLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiUploadLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiWarningLine,
  RiInformationLine,
  RiStarLine,
  RiHeartLine,
  RiFireLine,
  RiThunderstormsLine,
  RiSparklingLine,
  RiMagicLine,
  RiLightbulbLine,
  RiLeafLine
} from '@remixicon/react';

const ModernAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalSessions: 15634,
    avgSessionTime: '24m 32s',
    serverLoad: 67,
    memoryUsage: 78,
    diskUsage: 45,
    networkLatency: 23
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'Ana Silva', email: 'ana@email.com', status: 'active', level: 85, lastActive: '2 min ago', plan: 'Premium' },
    { id: 2, name: 'Carlos Santos', email: 'carlos@email.com', status: 'inactive', level: 67, lastActive: '1h ago', plan: 'Free' },
    { id: 3, name: 'Maria Oliveira', email: 'maria@email.com', status: 'active', level: 92, lastActive: 'Online', plan: 'Essential' },
    { id: 4, name: 'João Costa', email: 'joao@email.com', status: 'active', level: 78, lastActive: '5 min ago', plan: 'Premium' },
    { id: 5, name: 'Lucia Ferreira', email: 'lucia@email.com', status: 'banned', level: 34, lastActive: '2 days ago', plan: 'Free' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Novo usuário Premium registrado', time: '2 min ago', read: false },
    { id: 2, type: 'warning', message: 'Uso de CPU acima de 80%', time: '15 min ago', read: false },
    { id: 3, type: 'info', message: 'Backup automático concluído', time: '1h ago', read: true },
    { id: 4, type: 'error', message: 'Falha na sincronização de dados', time: '2h ago', read: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        serverLoad: Math.max(30, Math.min(100, prev.serverLoad + Math.floor(Math.random() * 10 - 5))),
        memoryUsage: Math.max(40, Math.min(95, prev.memoryUsage + Math.floor(Math.random() * 6 - 3))),
        networkLatency: Math.max(10, Math.min(100, prev.networkLatency + Math.floor(Math.random() * 8 - 4)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { id: 'users', label: 'Usuários', icon: RiUser3Line },
    { id: 'analytics', label: 'Analytics', icon: RiBarChartLine },
    { id: 'notifications', label: 'Notificações', icon: RiNotificationLine },
    { id: 'settings', label: 'Configurações', icon: RiSettings3Line },
    { id: 'security', label: 'Segurança', icon: RiShieldLine }
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend, suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        boxShadow: `0 20px 40px ${color}20`
      }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ 
              x: Math.random() * 300, 
              y: Math.random() * 200,
              opacity: 0 
            }}
            animate={{
              x: Math.random() * 300,
              y: Math.random() * 200,
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.6 }}
          >
            <Icon size={32} style={{ color }} />
          </motion.div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              <motion.div
                animate={{ y: trend > 0 ? [-2, 2, -2] : [2, -2, 2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {trend > 0 ? '↗' : '↘'}
              </motion.div>
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        
        <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
        
        <motion.div
          className="flex items-baseline"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-3xl font-bold text-white">{value}</span>
          <span className="text-white/60 ml-1">{suffix}</span>
        </motion.div>

        {/* Progress Bar for percentage values */}
        {typeof value === 'number' && value <= 100 && (
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );

  const UserRow = ({ user, index }) => (
    <motion.tr
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className="border-b border-white/10"
    >
      <td className="px-6 py-4">
        <motion.input
          type="checkbox"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          className="w-4 h-4 rounded border-white/30 bg-white/10"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
            }
          }}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 flex items-center justify-center"
          >
            <RiUser3Line size={20} className="text-purple-400" />
          </motion.div>
          <div>
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <motion.span
          whileHover={{ scale: 1.1 }}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.status === 'active' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : user.status === 'inactive'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {user.status}
        </motion.span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-white">{user.level}</span>
          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${user.level}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-white/70">{user.lastActive}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs ${
          user.plan === 'Premium' 
            ? 'bg-gold-500/20 text-yellow-400'
            : user.plan === 'Essential'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {user.plan}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <RiEyeLine size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          >
            <RiEditLine size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <RiDeleteBinLine size={16} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );

  const NotificationItem = ({ notification, index }) => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 10 }}
      className={`p-4 rounded-xl border transition-all duration-300 ${
        notification.read 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 360 }}
          transition={{ duration: 0.6 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            notification.type === 'success' 
              ? 'bg-green-500/20 text-green-400'
              : notification.type === 'warning'
              ? 'bg-yellow-500/20 text-yellow-400'
              : notification.type === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}
        >
          {notification.type === 'success' && <RiCheckLine size={16} />}
          {notification.type === 'warning' && <RiWarningLine size={16} />}
          {notification.type === 'error' && <RiCloseLine size={16} />}
          {notification.type === 'info' && <RiInformationLine size={16} />}
        </motion.div>
        
        <div className="flex-1">
          <p className={`font-medium ${notification.read ? 'text-white/60' : 'text-white'}`}>
            {notification.message}
          </p>
          <p className="text-white/50 text-sm mt-1">{notification.time}</p>
        </div>
        
        {!notification.read && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-blue-400 rounded-full"
          />
        )}
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Usuários"
                value={systemStats.totalUsers.toLocaleString()}
                icon={RiUser3Line}
                color="#3b82f6"
                trend={12}
              />
              <StatCard
                title="Usuários Ativos"
                value={systemStats.activeUsers}
                icon={RiWifiLine}
                color="#10b981"
                trend={8}
              />
              <StatCard
                title="Sessões Totais"
                value={systemStats.totalSessions.toLocaleString()}
                icon={RiBarChartLine}
                color="#f59e0b"
                trend={-3}
              />
              <StatCard
                title="Tempo Médio de Sessão"
                value={systemStats.avgSessionTime}
                icon={RiCloudLine}
                color="#8b5cf6"
                trend={5}
              />
            </div>

            {/* Server Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Carga do Servidor"
                value={systemStats.serverLoad}
                icon={RiCpuLine}
                color="#ef4444"
                suffix="%"
              />
              <StatCard
                title="Uso de Memória"
                value={systemStats.memoryUsage}
                icon={RiHardDriveLine}
                color="#f97316"
                suffix="%"
              />
              <StatCard
                title="Uso de Disco"
                value={systemStats.diskUsage}
                icon={RiDatabase2Line}
                color="#06b6d4"
                suffix="%"
              />
              <StatCard
                title="Latência de Rede"
                value={systemStats.networkLatency}
                icon={RiWifiLine}
                color="#84cc16"
                suffix="ms"
              />
            </div>
          </motion.div>
        );

      case 'users':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Management Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:border-purple-400/50 transition-colors flex items-center gap-2"
                >
                  <RiFilterLine size={16} />
                  Filtros
                </motion.button>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <RiAddLine size={16} />
                  Novo Usuário
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <RiDownloadLine size={16} />
                  Exportar
                </motion.button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10" />
                    </th>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">Usuário</th>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">Nível</th>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">Última Atividade</th>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">Plano</th>
                    <th className="px-6 py-4 text-left text-white/80 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => 
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user, index) => (
                      <UserRow key={user.id} user={user} index={index} />
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">Notificações do Sistema</h3>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <RiRefreshLine size={20} />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <NotificationItem key={notification.id} notification={notification} index={index} />
              ))}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RiSettings3Line size={64} className="text-white/50" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-2">Em Desenvolvimento</h3>
            <p className="text-white/70">Esta seção está sendo desenvolvida.</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 p-6"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <RiSparklingLine size={24} className="text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">iLyra Admin</h2>
              <p className="text-white/60 text-sm">Painel de Controle</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, x: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-2 h-2 bg-purple-400 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white capitalize">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h1>
                <p className="text-white/70 mt-1">
                  Gerencie e monitore sua plataforma espiritual
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-full"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-green-400 text-sm font-medium">Sistema Online</span>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-purple-400/50 transition-colors"
                >
                  <RiUser3Line size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminPanel;
