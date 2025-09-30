import React, { useState, useEffect } from 'react';
import { cx } from '../lib/utils.ts';
import { 
  RiTrophyLine,
  RiStarLine,
  RiFireLine,
  RiSwordLine,
  RiShieldLine,
  RiMagicLine,
  RiHeartLine,
  RiLeafLine,
  RiSunLine,
  RiMoonLine,
  RiSparklingLine,
  RiCrownLine,
  RiGemLine,
  RiFlashLine,
  RiEyeLine,
  RiHandHeartLine
} from '@remixicon/react';

const SpiritualGamification = () => {
  const [userLevel, setUserLevel] = useState(12);
  const [experience, setExperience] = useState(2847);
  const [nextLevelExp, setNextLevelExp] = useState(3000);
  const [streak, setStreak] = useState(23);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Níveis espirituais
  const spiritualLevels = [
    { level: 1, title: "Despertar", color: "from-gray-400 to-gray-600" },
    { level: 5, title: "Buscador", color: "from-blue-400 to-blue-600" },
    { level: 10, title: "Praticante", color: "from-green-400 to-green-600" },
    { level: 15, title: "Iluminado", color: "from-yellow-400 to-yellow-600" },
    { level: 20, title: "Sábio", color: "from-purple-400 to-purple-600" },
    { level: 25, title: "Mestre", color: "from-pink-400 to-pink-600" },
    { level: 30, title: "Ascendido", color: "from-indigo-400 to-indigo-600" },
    { level: 50, title: "Avatar", color: "from-gradient-rainbow" }
  ];

  // Conquistas espirituais
  const achievements = [
    {
      id: 1,
      title: "Primeiro Despertar",
      description: "Complete sua primeira meditação",
      icon: RiSunLine,
      rarity: "common",
      unlocked: true,
      progress: 100,
      reward: "+10 XP, +5 Energia Vital"
    },
    {
      id: 2,
      title: "Guardião da Chama",
      description: "Mantenha uma sequência de 7 dias",
      icon: RiFireLine,
      rarity: "uncommon",
      unlocked: true,
      progress: 100,
      reward: "+25 XP, Título: Guardião"
    },
    {
      id: 3,
      title: "Coração Compassivo",
      description: "Pratique 50 exercícios de compaixão",
      icon: RiHeartLine,
      rarity: "rare",
      unlocked: true,
      progress: 100,
      reward: "+50 XP, Habilidade: Cura Emocional"
    },
    {
      id: 4,
      title: "Mestre da Gratidão",
      description: "Registre 100 momentos de gratidão",
      icon: RiHandHeartLine,
      rarity: "epic",
      unlocked: true,
      progress: 87,
      reward: "+100 XP, Aura Dourada"
    },
    {
      id: 5,
      title: "Visionário Cósmico",
      description: "Alcance 30 dias de prática consecutiva",
      icon: RiEyeLine,
      rarity: "legendary",
      unlocked: false,
      progress: 76,
      reward: "+200 XP, Visão Espiritual"
    },
    {
      id: 6,
      title: "Avatar da Luz",
      description: "Atinja o nível 50 de iluminação",
      icon: RiCrownLine,
      rarity: "mythic",
      unlocked: false,
      progress: 24,
      reward: "+500 XP, Transformação Completa"
    }
  ];

  // Habilidades espirituais
  const spiritualSkills = [
    {
      name: "Meditação",
      level: 15,
      maxLevel: 20,
      icon: RiMoonLine,
      color: "from-blue-500 to-purple-500",
      description: "Capacidade de aquietar a mente"
    },
    {
      name: "Compaixão",
      level: 12,
      maxLevel: 20,
      icon: RiHeartLine,
      color: "from-pink-500 to-red-500",
      description: "Amor incondicional por todos os seres"
    },
    {
      name: "Intuição",
      level: 8,
      maxLevel: 20,
      icon: RiEyeLine,
      color: "from-purple-500 to-indigo-500",
      description: "Percepção além dos sentidos físicos"
    },
    {
      name: "Energia Vital",
      level: 18,
      maxLevel: 20,
      icon: RiFlashLine,
      color: "from-yellow-500 to-orange-500",
      description: "Força vital e vitalidade espiritual"
    }
  ];

  const getRarityColor = (rarity) => {
    const colors = {
      common: "from-gray-400 to-gray-600",
      uncommon: "from-green-400 to-green-600",
      rare: "from-blue-400 to-blue-600",
      epic: "from-purple-400 to-purple-600",
      legendary: "from-yellow-400 to-orange-500",
      mythic: "from-pink-500 to-purple-600"
    };
    return colors[rarity] || colors.common;
  };

  const getCurrentLevel = () => {
    return spiritualLevels.reverse().find(level => userLevel >= level.level) || spiritualLevels[0];
  };

  const AchievementCard = ({ achievement }) => {
    const IconComponent = achievement.icon;
    const isUnlocked = achievement.unlocked;
    
    return (
      <div 
        className={cx(
          "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105",
          isUnlocked 
            ? "bg-white dark:bg-gray-800 border-transparent shadow-lg hover:shadow-xl" 
            : "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-75"
        )}
        onClick={() => setSelectedAchievement(achievement)}
      >
        {/* Rarity border */}
        <div className={cx(
          "absolute inset-0 rounded-xl bg-gradient-to-r opacity-20",
          getRarityColor(achievement.rarity)
        )} />
        
        {/* Icon */}
        <div className={cx(
          "w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center mb-3 shadow-lg",
          getRarityColor(achievement.rarity)
        )}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <h4 className={cx(
          "font-semibold text-sm mb-1",
          isUnlocked ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
        )}>
          {achievement.title}
        </h4>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {achievement.description}
        </p>
        
        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className={cx(
              "font-medium",
              isUnlocked ? "text-green-600" : "text-gray-600 dark:text-gray-400"
            )}>
              {achievement.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={cx(
                "h-2 rounded-full bg-gradient-to-r transition-all duration-500",
                getRarityColor(achievement.rarity)
              )}
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
        </div>
        
        {/* Rarity badge */}
        <div className={cx(
          "inline-block px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r",
          getRarityColor(achievement.rarity)
        )}>
          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
        </div>
        
        {/* Unlock indicator */}
        {isUnlocked && (
          <div className="absolute top-2 right-2">
            <RiTrophyLine className="w-5 h-5 text-yellow-500" />
          </div>
        )}
      </div>
    );
  };

  const SkillBar = ({ skill }) => {
    const IconComponent = skill.icon;
    const percentage = (skill.level / skill.maxLevel) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className={cx(
            "w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center shadow-lg",
            skill.color
          )}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {skill.name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {skill.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {skill.level}
            </div>
            <div className="text-xs text-gray-500">
              /{skill.maxLevel}
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={cx(
              "h-3 rounded-full bg-gradient-to-r transition-all duration-500",
              skill.color
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const currentLevel = getCurrentLevel();
  const expPercentage = (experience / nextLevelExp) * 100;

  return (
    <div className="space-y-6">
      {/* Level and Experience */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Nível {userLevel}</h2>
            <p className="text-purple-100">{currentLevel.title}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <RiFireLine className="w-5 h-5 text-orange-300" />
              <span className="text-lg font-semibold">{streak} dias</span>
            </div>
            <p className="text-purple-100 text-sm">Sequência atual</p>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Experiência</span>
            <span>{experience} / {nextLevelExp} XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <RiMagicLine className="w-6 h-6 text-purple-600" />
          Habilidades Espirituais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spiritualSkills.map((skill, index) => (
            <SkillBar key={index} skill={skill} />
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <RiTrophyLine className="w-6 h-6 text-yellow-600" />
          Conquistas Espirituais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Achievement Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className={cx(
                "w-16 h-16 rounded-full bg-gradient-to-r flex items-center justify-center mx-auto mb-4 shadow-lg",
                getRarityColor(selectedAchievement.rarity)
              )}>
                <selectedAchievement.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedAchievement.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedAchievement.description}
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Recompensa: {selectedAchievement.reward}
                </p>
              </div>
              
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpiritualGamification;
