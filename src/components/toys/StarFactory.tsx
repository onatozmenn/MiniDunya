import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { getSoundManager } from '../utils/SoundManager';

interface StarFactoryProps {
  volume: number;
  onBack: () => void;
}

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  type: string;
}

const STAR_TYPES = ['⭐', '🌟', '✨', '💫', '🌠', '💖', '🎇', '🎆'];
const STAR_COLORS = [
  'text-yellow-400',
  'text-pink-400', 
  'text-purple-400',
  'text-blue-400',
  'text-green-400',
  'text-red-400',
  'text-orange-400',
  'text-cyan-400'
];

export function StarFactory({ volume, onBack }: StarFactoryProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [starCount, setStarCount] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const createStar = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Create multiple stars at once for more magic!
    const numStars = Math.floor(Math.random() * 3) + 2; // 2-4 stars
    const newStars: Star[] = [];

    for (let i = 0; i < numStars; i++) {
      const offsetX = (Math.random() - 0.5) * 8; // Random offset
      const offsetY = (Math.random() - 0.5) * 8;
      
      const newStar: Star = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.max(5, Math.min(95, x + offsetX)),
        y: Math.max(5, Math.min(95, y + offsetY)),
        size: Math.random() * 40 + 30,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        type: STAR_TYPES[Math.floor(Math.random() * STAR_TYPES.length)]
      };
      newStars.push(newStar);
    }

    setStars(prev => [...prev, ...newStars]);
    setStarCount(prev => prev + newStars.length);

    // Play magical sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }

    // Remove stars after 6 seconds
    setTimeout(() => {
      setStars(prev => prev.filter(star => !newStars.some(ns => ns.id === star.id)));
    }, 6000);
  }, [volume]);

  const clearStars = useCallback(() => {
    setStars([]);
    setStarCount(0);
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 relative overflow-hidden">
      {/* Twinkling Background Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            ✨
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
            ⭐ Yıldız Fabrikası
          </div>
          <div className="text-xl text-yellow-300 font-bold">
            🌟 {starCount} Yıldız Ürettim!
          </div>
        </div>

        <Button
          onClick={clearStars}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🌙
        </Button>
      </div>

      {/* Star Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer"
        onMouseDown={createStar}
        onTouchStart={createStar}
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence>
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ 
                scale: 0, 
                rotate: -180, 
                opacity: 0,
                y: 50
              }}
              animate={{ 
                scale: [0, 1.2, 1], 
                rotate: [0, 360, 720],
                opacity: [0, 1, 0.8],
                y: [50, 0, -20, 0]
              }}
              exit={{ 
                scale: 0, 
                opacity: 0, 
                rotate: 360,
                y: -100
              }}
              transition={{
                duration: 2,
                ease: "easeOut"
              }}
              className={`
                absolute ${star.color} pointer-events-none drop-shadow-lg
              `}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                fontSize: `${star.size}px`,
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 0 10px currentColor)'
              }}
            >
              {star.type}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Instructions */}
        {stars.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl border border-white/20">
              <motion.div 
                className="text-8xl mb-4"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⭐
              </motion.div>
              <div className="text-3xl font-bold text-white mb-3">
                Dokun ve Yıldız Üret!
              </div>
              <div className="text-lg text-white/80">
                Ekrana dokunarak sihirli yıldızlar yarat ✨
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Magical Sparkles */}
      {stars.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${20 + i * 10}%`,
                top: `${15 + i * 8}%`
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            >
              💫
            </motion.div>
          ))}
        </div>
      )}

      {/* Constellation Effect */}
      {stars.length > 5 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute top-1/4 left-1/4 text-6xl">🌌</div>
          <div className="absolute top-1/3 right-1/4 text-5xl">🪐</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl">🚀</div>
        </motion.div>
      )}
    </div>
  );
}

export default StarFactory;