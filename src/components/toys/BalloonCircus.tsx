import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { getSoundManager } from '../utils/SoundManager';

interface BalloonCircusProps {
  volume: number;
  onBack: () => void;
}

interface Balloon {
  id: string;
  x: number;
  y: number;
  color: string;
  emoji: string;
  size: number;
  speed: number;
}

const BALLOON_COLORS = [
  'bg-red-400',
  'bg-blue-400', 
  'bg-green-400',
  'bg-yellow-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-cyan-400'
];

const BALLOON_EMOJIS = ['🎈', '🎊', '🎉', '🎁', '🌈', '⭐', '💖', '🎵'];

export function BalloonCircus({ volume, onBack }: BalloonCircusProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Create balloons automatically
  const createBalloon = useCallback(() => {
    if (!isActive) return;

    const newBalloon: Balloon = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 80 + 10, // 10-90%
      y: 110, // Start below screen
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      emoji: BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)],
      size: Math.random() * 40 + 60, // 60-100px
      speed: Math.random() * 2 + 1 // 1-3 speed
    };

    setBalloons(prev => [...prev, newBalloon]);
  }, [isActive]);

  // Pop balloon
  const popBalloon = useCallback((balloonId: string) => {
    setBalloons(prev => prev.filter(b => b.id !== balloonId));
    setPoppedCount(prev => prev + 1);

    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  // Auto-create balloons
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      createBalloon();
    }, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, [createBalloon, isActive]);

  // Move balloons up and remove when off-screen
  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons(prev => 
        prev
          .map(balloon => ({
            ...balloon,
            y: balloon.y - balloon.speed
          }))
          .filter(balloon => balloon.y > -20) // Remove balloons that are off-screen
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const toggleActivity = useCallback(() => {
    setIsActive(prev => !prev);
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }
  }, [volume]);

  const clearAllBalloons = useCallback(() => {
    setBalloons([]);
    setPoppedCount(0);
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-300 via-blue-200 to-cyan-100 relative overflow-hidden">
      {/* Floating Clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-40"
            style={{
              left: `${10 + i * 25}%`,
              top: `${5 + i * 15}%`
            }}
            animate={{
              x: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-white drop-shadow-lg mb-1">
            🎪 Balon Sirkisi
          </div>
          <div className="text-xl text-yellow-300 font-bold">
            💥 {poppedCount} Balon Patlattım!
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={toggleActivity}
            className={`
              w-16 h-16 rounded-full shadow-lg text-2xl transition-all
              ${isActive 
                ? 'bg-green-400 hover:bg-green-500' 
                : 'bg-red-400 hover:bg-red-500'
              }
            `}
          >
            {isActive ? '⏸️' : '▶️'}
          </Button>
          <Button
            onClick={clearAllBalloons}
            className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
          >
            🧹
          </Button>
        </div>
      </div>

      {/* Balloons */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.button
              key={balloon.id}
              initial={{ scale: 0, y: balloon.y }}
              animate={{ 
                scale: 1,
                y: balloon.y,
                rotate: [0, 5, -5, 0],
                x: [0, 10, -10, 0]
              }}
              exit={{ 
                scale: [1, 1.5, 0],
                rotate: [0, 180, 360],
                opacity: [1, 0]
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity },
                x: { duration: 3, repeat: Infinity },
                exit: { duration: 0.5 }
              }}
              onClick={() => popBalloon(balloon.id)}
              className={`
                absolute ${balloon.color} rounded-full shadow-xl border-4 border-white
                flex items-center justify-center cursor-pointer hover:scale-110 transition-transform
              `}
              style={{
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                width: `${balloon.size}px`,
                height: `${balloon.size}px`,
                fontSize: `${balloon.size * 0.4}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {balloon.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {balloons.length === 0 && isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl">
            <motion.div 
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            >
              🎈
            </motion.div>
            <div className="text-3xl font-bold text-gray-800 mb-3">
              Balonları Patlat!
            </div>
            <div className="text-lg text-gray-600">
              Uçan balonlara dokun ve patlat! 💥
            </div>
          </div>
        </motion.div>
      )}

      {/* Paused State */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">⏸️</div>
            <div className="text-2xl font-bold text-gray-800">
              Balon Sirkisi Durdu
            </div>
            <div className="text-lg text-gray-600 mt-2">
              Devam etmek için ▶️ tuşuna bas!
            </div>
          </div>
        </motion.div>
      )}

      {/* Circus Decorations */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
        <div className="flex justify-around items-end h-full text-4xl">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🎪
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎭
          </motion.div>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🎠
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎯
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default BalloonCircus;