import React, { useState, lazy, Suspense } from 'react';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load toys
const MagicPainter = lazy(() => import('./toys/MagicPainter').then(m => ({ default: m.MagicPainter })));
const AnimalOrchestra = lazy(() => import('./toys/AnimalOrchestra').then(m => ({ default: m.AnimalOrchestra })));
const StarFactory = lazy(() => import('./toys/StarFactory').then(m => ({ default: m.StarFactory })));
const BalloonCircus = lazy(() => import('./toys/BalloonCircus').then(m => ({ default: m.BalloonCircus })));
const RainbowMaker = lazy(() => import('./toys/RainbowMaker').then(m => ({ default: m.RainbowMaker })));

// Loading component with magical animation
const ToyLoader = React.memo(() => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200">
    <motion.div
      className="w-24 h-24 rounded-full flex items-center justify-center text-6xl"
      style={{
        background: 'conic-gradient(from 0deg, #ff6b9d, #ff8e53, #ffd93d, #6bcf7f, #4d96ff, #9b59b6, #ff6b9d)'
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      ✨
    </motion.div>
  </div>
));

interface KidsGameHubProps {
  volume: number;
}

type ToyType = 'menu' | 'magicPainter' | 'animalOrchestra' | 'starFactory' | 'balloonCircus' | 'rainbowMaker';

const KIDS_TOYS = [
  {
    id: 'magicPainter',
    title: 'Sihirli Boyama',
    emoji: '🎨',
    secondaryEmoji: '✨',
    description: 'Dokun, renk çıkarsın!',
    colors: 'from-pink-400 via-purple-400 to-blue-400',
    background: 'from-pink-200/90 to-purple-200/90'
  },
  {
    id: 'animalOrchestra',
    title: 'Hayvan Orkestrası', 
    emoji: '🐱',
    secondaryEmoji: '🎵',
    description: 'Hayvanlara dokun, ses çıkarsın!',
    colors: 'from-green-400 via-yellow-400 to-orange-400',
    background: 'from-green-200/90 to-yellow-200/90'
  },
  {
    id: 'starFactory',
    title: 'Yıldız Fabrikası',
    emoji: '⭐',
    secondaryEmoji: '🌟',
    description: 'Dokun, yıldız yap!',
    colors: 'from-indigo-400 via-purple-400 to-pink-400',
    background: 'from-indigo-200/90 to-purple-200/90'
  },
  {
    id: 'balloonCircus',
    title: 'Balon Sirkisi',
    emoji: '🎈',
    secondaryEmoji: '🎪',
    description: 'Balonları patlat!',
    colors: 'from-sky-400 via-cyan-400 to-blue-400',
    background: 'from-sky-200/90 to-cyan-200/90'
  },
  {
    id: 'rainbowMaker',
    title: 'Gökkuşağı Yapıcı',
    emoji: '🌈',
    secondaryEmoji: '☀️',
    description: 'Sürükle, gökkuşağı çiz!',
    colors: 'from-yellow-400 via-orange-400 to-red-400',
    background: 'from-yellow-200/90 to-orange-200/90'
  }
];

export function KidsGameHub({ volume }: KidsGameHubProps) {
  const [currentToy, setCurrentToy] = useState<ToyType>('menu');

  const handleBackToMenu = () => {
    setCurrentToy('menu');
  };

  const handleToySelect = (toyId: string) => {
    setCurrentToy(toyId as ToyType);
  };

  // Render selected toy
  if (currentToy !== 'menu') {
    const toyComponents = {
      magicPainter: <MagicPainter volume={volume} onBack={handleBackToMenu} />,
      animalOrchestra: <AnimalOrchestra volume={volume} onBack={handleBackToMenu} />,
      starFactory: <StarFactory volume={volume} onBack={handleBackToMenu} />,
      balloonCircus: <BalloonCircus volume={volume} onBack={handleBackToMenu} />,
      rainbowMaker: <RainbowMaker volume={volume} onBack={handleBackToMenu} />
    };

    return (
      <Suspense fallback={<ToyLoader />}>
        <motion.div
          key={currentToy}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {toyComponents[currentToy as keyof typeof toyComponents]}
        </motion.div>
      </Suspense>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <motion.div 
          className="text-8xl mb-4"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🧸
        </motion.div>
        <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Sihirli Oyuncak Kutusu
        </div>
        <div className="text-lg opacity-90 text-white">
          Dokun, keşfet, eğlen! ✨
        </div>
      </motion.div>

      {/* Toys Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {KIDS_TOYS.map((toy, index) => (
          <motion.div
            key={toy.id}
            initial={{ scale: 0, rotate: -20, y: 50 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ 
              delay: index * 0.15,
              duration: 0.6,
              type: "spring",
              bounce: 0.7
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              rotate: [0, 1, -1, 0]
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              className={`
                p-8 border-0 shadow-2xl rounded-[2.5rem] cursor-pointer
                bg-gradient-to-br ${toy.background}
                backdrop-blur-lg border-4 border-white/40
                hover:shadow-3xl hover:border-white/60
                transition-all duration-300
                min-h-[200px] flex flex-col justify-center
                relative overflow-hidden
              `}
              onClick={() => handleToySelect(toy.id)}
            >
              {/* Sparkle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl opacity-30"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 25}%`
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.8
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-4 relative z-10">
                <div className="flex justify-center items-center gap-3">
                  <motion.span 
                    className="text-6xl"
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {toy.emoji}
                  </motion.span>
                  <motion.span 
                    className="text-4xl opacity-80"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  >
                    {toy.secondaryEmoji}
                  </motion.span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800 mb-2">
                    {toy.title}
                  </div>
                  <div className="text-base opacity-80 text-gray-700">
                    {toy.description}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 border-4 border-white/30 shadow-xl">
          <motion.div 
            className="text-4xl mb-3"
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            👆
          </motion.div>
          <div className="text-xl text-white/95 font-bold mb-2">
            Oynamak istediğin oyuncağa dokun!
          </div>
          <div className="text-base text-white/80">
            Her oyuncak farklı bir sürpriz! ✨
          </div>
        </div>
      </motion.div>

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {['🎵', '⭐', '🌈', '🎈', '✨', '🎨'][i]}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default KidsGameHub;