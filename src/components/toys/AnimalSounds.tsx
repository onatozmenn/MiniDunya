import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { getSoundManager } from '../utils/SoundManager';

interface AnimalSoundsProps {
  volume: number;
}

const ANIMALS = [
  { id: 'cat', emoji: '🐱', name: 'Kedi', sound: 'meow', color: 'from-pink-400 to-purple-400' },
  { id: 'dog', emoji: '🐶', name: 'Köpek', sound: 'woof', color: 'from-brown-400 to-orange-400' },
  { id: 'cow', emoji: '🐮', name: 'İnek', sound: 'moo', color: 'from-white to-gray-300' },
  { id: 'pig', emoji: '🐷', name: 'Domuz', sound: 'oink', color: 'from-pink-300 to-pink-500' },
  { id: 'horse', emoji: '🐴', name: 'At', sound: 'neigh', color: 'from-amber-600 to-brown-600' },
  { id: 'sheep', emoji: '🐑', name: 'Koyun', sound: 'baa', color: 'from-gray-100 to-gray-300' },
  { id: 'chicken', emoji: '🐔', name: 'Tavuk', sound: 'cluck', color: 'from-yellow-300 to-orange-400' },
  { id: 'duck', emoji: '🦆', name: 'Ördek', sound: 'quack', color: 'from-yellow-400 to-green-400' }
];

const OBJECTS = [
  { id: 'car', emoji: '🚗', name: 'Araba', sound: 'vroom', color: 'from-red-400 to-red-600' },
  { id: 'train', emoji: '🚂', name: 'Tren', sound: 'choo', color: 'from-blue-500 to-purple-500' },
  { id: 'plane', emoji: '✈️', name: 'Uçak', sound: 'whoosh', color: 'from-sky-400 to-blue-500' },
  { id: 'bell', emoji: '🔔', name: 'Zil', sound: 'ding', color: 'from-yellow-400 to-gold-500' },
  { id: 'drum', emoji: '🥁', name: 'Davul', sound: 'boom', color: 'from-red-500 to-orange-500' },
  { id: 'guitar', emoji: '🎸', name: 'Gitar', sound: 'strum', color: 'from-wood-400 to-brown-500' },
  { id: 'phone', emoji: '📱', name: 'Telefon', sound: 'ring', color: 'from-gray-700 to-black' },
  { id: 'clock', emoji: '⏰', name: 'Saat', sound: 'tick', color: 'from-blue-400 to-indigo-500' }
];

export function AnimalSounds({ volume }: AnimalSoundsProps) {
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null);
  const [activeObject, setActiveObject] = useState<string | null>(null);

  const playAnimalSound = useCallback((animal: typeof ANIMALS[0]) => {
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      
      // Play different sounds based on animal
      switch (animal.id) {
        case 'cat':
          soundManager.playSuccess(); // Meow approximation
          break;
        case 'dog':
          soundManager.playPop(); // Woof approximation
          break;
        case 'cow':
          soundManager.playError(); // Moo approximation
          break;
        default:
          soundManager.playSuccess();
      }
    }

    setActiveAnimal(animal.id);
    setTimeout(() => setActiveAnimal(null), 600);
  }, [volume]);

  const playObjectSound = useCallback((object: typeof OBJECTS[0]) => {
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      
      // Play different sounds based on object
      switch (object.id) {
        case 'car':
        case 'train':
        case 'plane':
          soundManager.playPop(); // Vehicle sounds
          break;
        case 'bell':
        case 'phone':
          soundManager.playSuccess(); // Bell/ring sounds
          break;
        case 'drum':
          soundManager.playError(); // Drum sound
          break;
        default:
          soundManager.playSuccess();
      }
    }

    setActiveObject(object.id);
    setTimeout(() => setActiveObject(null), 600);
  }, [volume]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-30"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + i * 12}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            {['🎵', '🔊', '🎶', '✨', '🌟', '🎭'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 p-6 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="text-6xl mb-3">🔊</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Sesli Dünya
          </h1>
          <p className="text-lg text-white/90 mt-2">
            Dokunup sesleri keşfet! 🎵
          </p>
        </motion.div>
      </div>

      {/* Animals Section */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 text-center mb-2">🐾 Hayvanlar</h2>
          <p className="text-center text-white/70">Hayvanların seslerini dinle!</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {ANIMALS.map((animal, index) => (
            <motion.button
              key={animal.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playAnimalSound(animal)}
              className={`
                relative group p-6 rounded-3xl bg-gradient-to-br ${animal.color} 
                shadow-2xl border-4 border-white/30 transition-all duration-300
                ${activeAnimal === animal.id ? 'scale-110 shadow-3xl' : ''}
              `}
            >
              <motion.div
                animate={activeAnimal === animal.id ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl mb-2 filter drop-shadow-lg">
                  {animal.emoji}
                </div>
                <div className="text-white font-bold text-sm md:text-base">
                  {animal.name}
                </div>
              </motion.div>

              {/* Active Animation */}
              {activeAnimal === animal.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-3xl bg-white/20 border-4 border-white/50"
                />
              )}

              {/* Sound Waves */}
              {activeAnimal === animal.id && (
                <div className="absolute -top-2 -right-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="absolute w-8 h-8 rounded-full border-2 border-white/60"
                      style={{ right: i * 8, top: i * 8 }}
                    />
                  ))}
                  <div className="text-2xl">🎵</div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Objects Section */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 text-center mb-2">🚗 Nesneler</h2>
          <p className="text-center text-white/70">Eşyaların seslerini keşfet!</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {OBJECTS.map((object, index) => (
            <motion.button
              key={object.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playObjectSound(object)}
              className={`
                relative group p-6 rounded-3xl bg-gradient-to-br ${object.color} 
                shadow-2xl border-4 border-white/30 transition-all duration-300
                ${activeObject === object.id ? 'scale-110 shadow-3xl' : ''}
              `}
            >
              <motion.div
                animate={activeObject === object.id ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl mb-2 filter drop-shadow-lg">
                  {object.emoji}
                </div>
                <div className="text-white font-bold text-sm md:text-base">
                  {object.name}
                </div>
              </motion.div>

              {/* Active Animation */}
              {activeObject === object.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-3xl bg-white/20 border-4 border-white/50"
                />
              )}

              {/* Sound Waves */}
              {activeObject === object.id && (
                <div className="absolute -top-2 -right-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="absolute w-8 h-8 rounded-full border-2 border-white/60"
                      style={{ right: i * 8, top: i * 8 }}
                    />
                  ))}
                  <div className="text-2xl">🔊</div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-6 left-6 z-30">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">👂</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Dokunup Dinle!</p>
              <p className="text-xs text-gray-600">Her şeyin farklı sesi var!</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Character Helper */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎭</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ses Ustası</p>
              <p className="text-xs text-gray-600">Sesleri keşfet!</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AnimalSounds;