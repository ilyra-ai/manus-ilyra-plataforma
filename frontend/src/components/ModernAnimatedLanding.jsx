import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  RiStarLine, 
  RiHeartLine, 
  RiLeafLine, 
  RiSunLine,
  RiMoonLine,
  RiSparklingLine,
  RiFlowerLine,
  RiMagicLine,
  RiLightbulbLine,
  RiFireLine
} from '@remixicon/react';

const ModernAnimatedLanding = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const spiritualQuotes = [
    "Desperte sua consciência espiritual",
    "Encontre paz interior através da meditação",
    "Transforme sua vida com gratidão",
    "Conecte-se com sua essência divina",
    "Cultive mindfulness em cada momento"
  ];

  const floatingIcons = [
    { Icon: RiStarLine, delay: 0, x: 100, y: 50 },
    { Icon: RiHeartLine, delay: 0.5, x: 200, y: 100 },
    { Icon: RiLeafLine, delay: 1, x: 300, y: 80 },
    { Icon: RiSunLine, delay: 1.5, x: 150, y: 150 },
    { Icon: RiMoonLine, delay: 2, x: 250, y: 200 },
    { Icon: RiSparklingLine, delay: 2.5, x: 350, y: 120 },
    { Icon: RiFlowerLine, delay: 3, x: 80, y: 180 },
    { Icon: RiMagicLine, delay: 3.5, x: 320, y: 160 },
    { Icon: RiLightbulbLine, delay: 4, x: 180, y: 220 },
    { Icon: RiFireLine, delay: 4.5, x: 280, y: 60 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % spiritualQuotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
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

      {/* Magnetic Cursor Effect */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      />

      {/* Floating Spiritual Icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute text-white/20"
          initial={{ opacity: 0, scale: 0, x, y }}
          animate={{ 
            opacity: [0.2, 0.6, 0.2], 
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            x: x + Math.sin(Date.now() * 0.001 + index) * 20,
            y: y + Math.cos(Date.now() * 0.001 + index) * 20
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Icon size={32} />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1
          }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 border-4 border-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center"
            >
              <RiSparklingLine size={48} className="text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-lg"
            />
          </div>
        </motion.div>

        {/* Title Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold text-center mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
        >
          iLyra
        </motion.h1>

        {/* Subtitle Animation */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xl md:text-2xl text-center text-white/80 mb-8 max-w-2xl"
        >
          Sua jornada de crescimento espiritual começa aqui
        </motion.p>

        {/* Rotating Quotes */}
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
          transition={{ duration: 0.6 }}
          className="text-lg md:text-xl text-center text-purple-200 mb-12 h-16 flex items-center justify-center"
        >
          "{spiritualQuotes[currentQuote]}"
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)",
              background: "linear-gradient(45deg, #ec4899, #8b5cf6)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Começar Jornada Espiritual
          </motion.button>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              borderColor: "#ec4899",
              color: "#ec4899"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
          >
            Explorar Recursos
          </motion.button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {[
            {
              icon: RiHeartLine,
              title: "Meditação Guiada",
              description: "Práticas personalizadas para sua jornada interior"
            },
            {
              icon: RiStarLine,
              title: "Métricas Espirituais",
              description: "Acompanhe seu crescimento com IA avançada"
            },
            {
              icon: RiSunLine,
              title: "Comunidade Consciente",
              description: "Conecte-se com almas em evolução"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }}
              whileHover={{ 
                y: -10, 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
              }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:border-purple-400/50 transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-4"
              >
                <feature.icon size={48} className="text-purple-300" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/70">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 pointer-events-none" />
    </div>
  );
};

export default ModernAnimatedLanding;
