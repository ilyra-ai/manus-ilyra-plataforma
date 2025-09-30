import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiRobotLine,
  RiStarLine,
  RiDownloadLine,
  RiHeartLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
  RiMagicLine,
  RiLightbulbLine,
  RiLeafLine,
  RiSunLine,
  RiMoonLine,
  RiFireLine,
  RiThunderstormsLine,
  RiFlowerLine,
  RiRainbowLine,
  RiSettings3Line,
  RiPlayLine,
  RiPauseLine,
  RiStopLine,
  RiVolumeUpLine,
  RiMicLine,
  RiCpuLine,
  RiDatabase2Line,
  RiCloudLine
} from '@remixicon/react';

const HuggingFaceModelSelector = ({ onModelSelect, selectedModel }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('spiritual');
  const [isOpen, setIsOpen] = useState(false);

  // Modelos pré-definidos para aplicações espirituais
  const spiritualModels = [
    {
      id: 'krishna-saarthi-counselor',
      name: 'Krishna Saarthi Counselor',
      author: 'debadtman26',
      description: 'Modelo especializado em orientação espiritual baseada no Bhagavad Gita',
      downloads: '15K',
      likes: 15,
      tags: ['spiritual-guidance', 'counseling', 'bhagavad-gita', 'krishna'],
      size: '5B',
      type: 'Conversational AI',
      specialty: 'Orientação Espiritual Hindu',
      icon: RiSunLine,
      color: '#f59e0b',
      modelPath: 'debadtman26/krishna-saarthi-counselor'
    },
    {
      id: 'mistral-trismegistus-7b',
      name: 'Mistral Trismegistus 7B',
      author: 'teknium',
      description: 'Modelo especializado em conhecimento esotérico, oculto e espiritual',
      downloads: '36K',
      likes: 227,
      tags: ['occult', 'esoteric', 'spiritual', 'mystical'],
      size: '7B',
      type: 'Text Generation',
      specialty: 'Conhecimento Esotérico',
      icon: RiMagicLine,
      color: '#8b5cf6',
      modelPath: 'teknium/Mistral-Trismegistus-7B'
    },
    {
      id: 'buddhism-model',
      name: 'Buddhism Model',
      author: 'KnutJaegersberg',
      description: 'Modelo especializado em ensinamentos budistas e mindfulness',
      downloads: '8K',
      likes: 42,
      tags: ['buddhism', 'mindfulness', 'meditation', 'spiritual-guidance'],
      size: '3B',
      type: 'Conversational AI',
      specialty: 'Budismo e Mindfulness',
      icon: RiLeafLine,
      color: '#10b981',
      modelPath: 'KnutJaegersberg/BuddhismModel'
    },
    {
      id: 'gemma-bhagavad-gita',
      name: 'Gemma Bhagavad Gita',
      author: 'abagade',
      description: 'Modelo baseado no Gemma treinado com textos do Bhagavad Gita',
      downloads: '12K',
      likes: 33,
      tags: ['bhagavad-gita', 'spiritual', 'hindu', 'philosophy'],
      size: '1B',
      type: 'Text Generation',
      specialty: 'Filosofia Hindu',
      icon: RiFlowerLine,
      color: '#ef4444',
      modelPath: 'abagade/gemma-3-1b-bhagavad-gita-v1'
    }
  ];

  // Modelos populares de conversação
  const conversationalModels = [
    {
      id: 'qwen2.5-7b-instruct',
      name: 'Qwen 2.5 7B Instruct',
      author: 'Qwen',
      description: 'Modelo conversacional avançado com excelente performance',
      downloads: '7.2M',
      likes: 806,
      tags: ['conversational', 'chat', 'instruct'],
      size: '7B',
      type: 'Conversational AI',
      specialty: 'Conversação Geral',
      icon: RiRobotLine,
      color: '#3b82f6',
      modelPath: 'Qwen/Qwen2.5-7B-Instruct'
    },
    {
      id: 'llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B Instruct',
      author: 'meta-llama',
      description: 'Modelo Meta Llama otimizado para conversação',
      downloads: '7.2M',
      likes: 4690,
      tags: ['conversational', 'llama', 'meta'],
      size: '8B',
      type: 'Conversational AI',
      specialty: 'Conversação Avançada',
      icon: RiThunderstormsLine,
      color: '#06b6d4',
      modelPath: 'meta-llama/Llama-3.1-8B-Instruct'
    },
    {
      id: 'gemma-3-1b-it',
      name: 'Gemma 3 1B IT',
      author: 'google',
      description: 'Modelo Google Gemma para conversação inteligente',
      downloads: '5.6M',
      likes: 633,
      tags: ['conversational', 'google', 'gemma'],
      size: '1B',
      type: 'Conversational AI',
      specialty: 'Conversação Eficiente',
      icon: RiSparklingLine,
      color: '#f97316',
      modelPath: 'google/gemma-3-1b-it'
    }
  ];

  const categories = [
    { id: 'spiritual', label: 'Espirituais', icon: RiSunLine, models: spiritualModels },
    { id: 'conversational', label: 'Conversacionais', icon: RiRobotLine, models: conversationalModels }
  ];

  const currentModels = categories.find(cat => cat.id === selectedCategory)?.models || [];

  const filteredModels = currentModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ModelCard = ({ model, index }) => {
    const isSelected = selectedModel?.id === model.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
        whileHover={{ 
          scale: 1.02, 
          y: -5,
          boxShadow: `0 20px 40px ${model.color}20`
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onModelSelect(model)}
        className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border cursor-pointer transition-all duration-300 overflow-hidden ${
          isSelected 
            ? 'border-purple-400/50 bg-purple-500/20' 
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: model.color }}
              initial={{ 
                x: Math.random() * 400, 
                y: Math.random() * 300,
                opacity: 0 
              }}
              animate={{
                x: Math.random() * 400,
                y: Math.random() * 300,
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${model.color}20`, border: `2px solid ${model.color}50` }}
              >
                <model.icon size={24} style={{ color: model.color }} />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                <p className="text-white/60 text-sm">por {model.author}</p>
              </div>
            </div>
            
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <RiCheckLine size={16} className="text-white" />
              </motion.div>
            )}
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            {model.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <RiDownloadLine size={14} />
              {model.downloads}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <RiHeartLine size={14} />
              {model.likes}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <RiCpuLine size={14} />
              {model.size}
            </div>
          </div>

          {/* Specialty */}
          <div className="mb-4">
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${model.color}20`, 
                color: model.color,
                border: `1px solid ${model.color}30`
              }}
            >
              {model.specialty}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {model.tags.slice(0, 3).map((tag, tagIndex) => (
              <motion.span
                key={tagIndex}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70"
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-2 rounded-xl font-medium transition-all duration-300 ${
              isSelected
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/10 text-white border border-white/20 hover:border-purple-400/50'
            }`}
          >
            {isSelected ? 'Modelo Selecionado' : 'Selecionar Modelo'}
          </motion.button>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{ 
            background: `radial-gradient(circle at center, ${model.color}15, transparent 70%)` 
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/50 flex items-center justify-center"
          >
            <RiRobotLine size={24} className="text-purple-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Seleção de Modelo IA</h2>
            <p className="text-white/70">Escolha o modelo de IA do Hugging Face para sua jornada espiritual</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLoading(true)}
          className="p-3 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
        >
          <RiRefreshLine size={20} />
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-400/50'
                  : 'bg-white/10 text-white/70 border border-white/20 hover:border-white/40'
              }`}
            >
              <category.icon size={16} />
              {category.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Selected Model Info */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selectedModel.color}20`, border: `2px solid ${selectedModel.color}50` }}
              >
                <selectedModel.icon size={32} style={{ color: selectedModel.color }} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">
                  Modelo Ativo: {selectedModel.name}
                </h3>
                <p className="text-green-400 text-sm mb-2">
                  {selectedModel.specialty} • {selectedModel.size} parâmetros
                </p>
                <p className="text-white/70 text-sm">
                  {selectedModel.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-400 rounded-full"
                />
                <span className="text-green-400 font-medium">Conectado</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Models Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredModels.map((model, index) => (
            <ModelCard key={model.id} model={model} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredModels.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <RiSearchLine size={48} className="text-white/30" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum modelo encontrado</h3>
          <p className="text-white/60">Tente ajustar os filtros ou termo de busca</p>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <RiRefreshLine size={48} className="text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">Atualizando Modelos</h3>
              <p className="text-white/70">Buscando os modelos mais recentes...</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLoading(false)}
                className="mt-4 px-6 py-2 bg-purple-500/20 text-purple-400 border border-purple-400/50 rounded-xl hover:bg-purple-500/30 transition-colors"
              >
                Cancelar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HuggingFaceModelSelector;
