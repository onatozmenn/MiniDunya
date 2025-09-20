import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { getSoundManager } from '../utils/SoundManager';

interface EmotionFacesProps {
  volume: number;
}

const EMOTIONS = [
  {
    id: 'happy',
    name: 'Mutlu',
    emoji: '😊',
    color: 'from-yellow-400 to-orange-400',
    description: 'Çok sevinçli ve neşeli!',
    sound: 'success',
    animation: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
  },
  {
    id: 'sad',
    name: 'Üzgün',
    emoji: '😢',
    color: 'from-blue-400 to-blue-600',
    description: 'Biraz üzgün ve kederli.',
    sound: 'error',
    animation: { scale: [1, 0.9, 1], y: [0, 10, 0] }
  },
  {
    id: 'angry',
    name: 'Kızgın',
    emoji: '😠',
    color: 'from-red-400 to-red-600',
    description: 'Çok sinirli ve öfkeli!',
    sound: 'error',
    animation: { scale: [1, 1.1, 1], x: [-5, 5, -5, 0] }
  },
  {
    id: 'surprised',
    name: 'Şaşkın',
    emoji: '😲',
    color: 'from-purple-400 to-pink-400',
    description: 'Çok şaşırmış!',
    sound: 'pop',
    animation: { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }
  },
  {
    id: 'scared',
    name: 'Korkmuş',
    emoji: '😨',
    color: 'from-gray-400 to-gray-600',
    description: 'Biraz korkuyor.',
    sound: 'error',
    animation: { scale: [1, 0.8, 1], x: [0, -10, 10, 0] }
  },
  {
    id: 'excited',
    name: 'Heyecanlı',
    emoji: '🤩',
    color: 'from-pink-400 to-purple-400',
    description: 'Çok heyecanlı!',
    sound: 'success',
    animation: { scale: [1, 1.2, 1], y: [0, -15, 0] }
  },
  {
    id: 'sleepy',
    name: 'Uykulu',
    emoji: '😴',
    color: 'from-indigo-400 to-blue-400',
    description: 'Çok uykusu var.',
    sound: 'pop',
    animation: { scale: [1, 0.9, 1], rotate: [0, -5, 5, 0] }
  },
  {
    id: 'laughing',
    name: 'Gülen',
    emoji: '😂',
    color: 'from-green-400 to-yellow-400',
    description: 'Çok gülüyor!',
    sound: 'success',
    animation: { scale: [1, 1.1, 1.1, 1], rotate: [0, -10, 10, 0] }
  },
  {
    id: 'love',
    name: 'Aşık',
    emoji: '😍',
    color: 'from-pink-500 to-red-400',
    description: 'Çok âşık!',
    sound: 'pop',
    animation: { scale: [1, 1.2, 1], rotate: [0, 360] }
  },
  {
    id: 'confused',
    name: 'Şaşkın',
    emoji: '😕',
    color: 'from-yellow-400 to-gray-400',
    description: 'Biraz kafası karışık.',
    sound: 'error',
    animation: { rotate: [0, -15, 15, -15, 15, 0] }
  },
  {
    id: 'cool',
    name: 'Havalı',
    emoji: '😎',
    color: 'from-blue-500 to-purple-500',
    description: 'Çok havalı!',
    sound: 'success',
    animation: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
  },
  {
    id: 'silly',
    name: 'Saçma',
    emoji: '🤪',
    color: 'from-orange-400 to-pink-400',
    description: 'Çok saçma!',
    sound: 'pop',
    animation: { rotate: [0, 20, -20, 20, -20, 0], scale: [1, 1.1, 1] }
  }
];

const CHARACTERS = [
  { id: 'boy', emoji: '👦', name: 'Erkek Çocuk' },
  { id: 'girl', emoji: '👧', name: 'Kız Çocuk' },
  { id: 'cat', emoji: '🐱', name: 'Kedi' },
  { id: 'dog', emoji: '🐶', name: 'Köpek' },
  { id: 'bear', emoji: '🐻', name: 'Ayı' },
  { id: 'rabbit', emoji: '🐰', name: 'Tavşan' }
];

export function EmotionFaces({ volume }: EmotionFacesProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const playEmotion = useCallback((emotion: typeof EMOTIONS[0]) => {
    // Play sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      switch (emotion.sound) {
        case 'success':
          soundManager.playSuccess();
          break;
        case 'pop':
          soundManager.playPop();
          break;
        case 'error':
          soundManager.playError();
          break;
      }
    }

    setSelectedEmotion(emotion.id);
    setIsPlaying(emotion.id);

    // Clear selection after animation
    setTimeout(() => {
      setIsPlaying(null);
    }, 1500);
  }, [volume]);

  const selectCharacter = useCallback((character: typeof CHARACTERS[0]) => {
    setSelectedCharacter(character);
    setSelectedEmotion(null);
    
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  const currentEmotion = selectedEmotion ? EMOTIONS.find(e => e.id === selectedEmotion) : null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-25"
            style={{
              left: `${8 + i * 12}%`,
              top: `${12 + i * 9}%`
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7
            }}
          >
            {['💖', '✨', '🌟', '💫', '🎭', '🎪', '🌈', '⭐'][i]}
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
          <div className="text-6xl mb-3">😊</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Duygular ve Yüzler
          </h1>
          <p className="text-lg text-white/90 mt-2">
            Duygularını keşfet! 🎭
          </p>
        </motion.div>
      </div>

      {/* Character Selector */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 mb-2">👤 Karakterini Seç</h2>
        </motion.div>

        <div className="flex justify-center gap-3 flex-wrap max-w-lg mx-auto">
          {CHARACTERS.map((character, index) => (
            <motion.button
              key={character.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectCharacter(character)}
              className={`
                p-4 rounded-2xl shadow-lg border-4 transition-all
                ${selectedCharacter.id === character.id 
                  ? 'bg-yellow-400 border-yellow-300 scale-110' 
                  : 'bg-white/90 border-white/50'
                }
              `}
            >
              <div className="text-3xl mb-1">{character.emoji}</div>
              <div className="text-xs font-bold text-gray-800">{character.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Current Expression Display */}
      {selectedEmotion && currentEmotion && (
        <div className="px-6 mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-4 border-white/50"
          >
            <div className="text-center">
              <motion.div
                animate={isPlaying === currentEmotion.id ? currentEmotion.animation : {}}
                transition={{ duration: 1.5 }}
                className="text-8xl mb-4"
              >
                {selectedCharacter.emoji}
              </motion.div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentEmotion.name}
                </h3>
                <p className="text-lg text-gray-600">
                  {currentEmotion.description}
                </p>
              </div>

              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-4xl"
              >
                {currentEmotion.emoji}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Emotions Grid */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white/90 mb-2">🎭 Duygular</h2>
          <p className="text-white/70">Bir duygu seç ve dinle!</p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {EMOTIONS.map((emotion, index) => (
            <motion.button
              key={emotion.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playEmotion(emotion)}
              className={`
                relative group p-6 rounded-3xl bg-gradient-to-br ${emotion.color} 
                shadow-2xl border-4 border-white/30 transition-all duration-300
                ${selectedEmotion === emotion.id ? 'scale-110 shadow-3xl' : ''}
              `}
            >
              <motion.div
                animate={isPlaying === emotion.id ? emotion.animation : {}}
                transition={{ duration: 1.5 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl mb-3 filter drop-shadow-lg">
                  {emotion.emoji}
                </div>
                <div className="text-white font-bold text-sm md:text-base">
                  {emotion.name}
                </div>
              </motion.div>

              {/* Active Ring Effect */}
              {selectedEmotion === emotion.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 rounded-3xl bg-white/20 border-4 border-white/50"
                />
              )}

              {/* Sound Waves */}
              {isPlaying === emotion.id && (
                <div className="absolute -top-2 -right-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                      className="absolute w-8 h-8 rounded-full border-2 border-white/60"
                      style={{ right: i * 8, top: i * 8 }}
                    />
                  ))}
                  <div className="text-2xl">🔊</div>
                </div>
              )}

              {/* Emotion Particles */}
              {isPlaying === emotion.id && (
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1, 0], 
                        opacity: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 80],
                        y: [0, (Math.random() - 0.5) * 80]
                      }}
                      transition={{ delay: i * 0.1, duration: 1.2 }}
                      className="absolute text-xl"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {['💖', '✨', '⭐', '💫', '🌟', '💝'][i]}
                    </motion.div>
                  ))}
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
          transition={{ delay: 0.8 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎭</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Duyguları Öğren!</p>
              <p className="text-xs text-gray-600">
                Karakter: {selectedCharacter.name}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Emotion Helper */}
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
            <div className="text-4xl">{selectedCharacter.emoji}</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Duygu Öğretmeni</p>
              <p className="text-xs text-gray-600">
                {selectedEmotion 
                  ? `Şimdi ${currentEmotion?.name}!` 
                  : 'Bir duygu seç!'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <div className="fixed top-6 right-6 z-30">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-3 shadow-lg"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">😊</div>
            <p className="text-sm font-bold text-gray-800">Duygular</p>
            <p className="text-xs text-gray-600">{EMOTIONS.length} çeşit duygu</p>
          </div>
        </motion.div>
      </div>

      {/* Fun Fact */}
      {selectedEmotion && currentEmotion && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-4 shadow-lg border-4 border-white/50 max-w-xs">
            <div className="text-center">
              <div className="text-3xl mb-2">{currentEmotion.emoji}</div>
              <p className="text-sm font-bold text-gray-800 mb-1">
                "{currentEmotion.name}" duygusu
              </p>
              <p className="text-xs text-gray-600">
                {currentEmotion.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default EmotionFaces;