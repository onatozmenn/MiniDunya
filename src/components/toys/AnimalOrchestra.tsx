import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { getSoundManager } from '../utils/SoundManager';

interface AnimalOrchestraProps {
  volume: number;
  onBack: () => void;
}

const ANIMALS = [
  { id: 'cat', emoji: '🐱', sound: 'miyav', size: 'large' },
  { id: 'dog', emoji: '🐶', sound: 'hav hav', size: 'large' },
  { id: 'cow', emoji: '🐄', sound: 'möö', size: 'large' },
  { id: 'pig', emoji: '🐷', sound: 'öf öf', size: 'medium' },
  { id: 'duck', emoji: '🦆', sound: 'vak vak', size: 'medium' },
  { id: 'lion', emoji: '🦁', sound: 'kükreee', size: 'large' },
  { id: 'elephant', emoji: '🐘', sound: 'töröö', size: 'large' },
  { id: 'bird', emoji: '🐦', sound: 'cik cik', size: 'small' },
  { id: 'frog', emoji: '🐸', sound: 'vrak vrak', size: 'small' },
  { id: 'horse', emoji: '🐴', sound: 'iiii-haha', size: 'large' },
  { id: 'sheep', emoji: '🐑', sound: 'meee', size: 'medium' },
  { id: 'chicken', emoji: '🐔', sound: 'gıt gıt', size: 'medium' },
];

export function AnimalOrchestra({ volume, onBack }: AnimalOrchestraProps) {
  const [activeAnimals, setActiveAnimals] = useState<string[]>([]);

  const playAnimalSound = useCallback((animalId: string) => {
    // Add to active animals
    setActiveAnimals(prev => [...prev.filter(id => id !== animalId), animalId]);

    // Play actual animal sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playAnimalSound(animalId);
    }

    // Remove from active after animation
    setTimeout(() => {
      setActiveAnimals(prev => prev.filter(id => id !== animalId));
    }, 1000);
  }, [volume]);

  const getAnimalSize = (size: string) => {
    switch (size) {
      case 'large': return 'w-24 h-24 text-6xl';
      case 'medium': return 'w-20 h-20 text-5xl';
      case 'small': return 'w-16 h-16 text-4xl';
      default: return 'w-20 h-20 text-5xl';
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-green-300 via-yellow-200 to-orange-200 relative overflow-hidden">
      {/* Floating Music Notes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${10 + i * 10}%`,
              top: `${5 + i * 8}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            🎵
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
        
        <div className="text-4xl font-bold text-white drop-shadow-lg">
          🎺 Hayvan Orkestrası
        </div>

        <div className="w-16 h-16"></div>
      </div>

      {/* Instructions */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
          <div className="text-3xl mb-2">👆</div>
          <div className="text-lg font-bold text-gray-800">
            Hayvanlara dokun, ses çıkarsın!
          </div>
        </div>
      </div>

      {/* Animals Grid */}
      <div className="absolute inset-0 pt-40 pb-20 px-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 max-w-4xl mx-auto h-full place-items-center">
          {ANIMALS.map((animal) => (
            <motion.button
              key={animal.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => playAnimalSound(animal.id)}
              className={`
                ${getAnimalSize(animal.size)} 
                bg-white/90 rounded-3xl shadow-xl border-4 border-white
                flex items-center justify-center transition-all duration-200
                hover:shadow-2xl hover:bg-white
                ${activeAnimals.includes(animal.id) ? 'animate-bounce bg-yellow-200 scale-110' : ''}
              `}
              animate={activeAnimals.includes(animal.id) ? {
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
                backgroundColor: ['rgba(255,255,255,0.9)', 'rgba(255,235,59,0.9)', 'rgba(255,255,255,0.9)']
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {animal.emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sound Waves Effect */}
      {activeAnimals.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}

      {/* Dancing Trees */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 text-6xl"
            style={{ left: `${i * 18}%` }}
            animate={{
              rotate: activeAnimals.length > 0 ? [-2, 2, -2] : [0],
              scale: activeAnimals.length > 0 ? [1, 1.05, 1] : [1]
            }}
            transition={{ duration: 1, repeat: activeAnimals.length > 0 ? Infinity : 0 }}
          >
            🌳
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AnimalOrchestra;