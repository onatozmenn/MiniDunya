import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSoundManager } from '../utils/SoundManager';

interface InteractiveStoryProps {
  volume: number;
}

type StoryScene = {
  id: string;
  background: string;
  title: string;
  description: string;
  character: string;
  interactiveElements: {
    id: string;
    emoji: string;
    name: string;
    x: number;
    y: number;
    action: string;
    sound: 'success' | 'pop' | 'error';
  }[];
  nextScene?: string;
};

const STORIES: Record<string, StoryScene> = {
  forest: {
    id: 'forest',
    background: 'from-green-300 via-emerald-200 to-blue-200',
    title: 'Orman Macerası',
    description: 'Küçük tavşan ormanda geziniyor. Ona yardım et!',
    character: '🐰',
    interactiveElements: [
      { id: 'carrot', emoji: '🥕', name: 'Havuç', x: 20, y: 60, action: 'Tavşan havucu yedi! Çok mutlu!', sound: 'success' },
      { id: 'butterfly', emoji: '🦋', name: 'Kelebek', x: 70, y: 30, action: 'Kelebek uçtu! Tavşan kelebeği izledi!', sound: 'pop' },
      { id: 'flower', emoji: '🌸', name: 'Çiçek', x: 50, y: 70, action: 'Tavşan çiçeği kokladı! Çok güzel koktu!', sound: 'success' },
      { id: 'tree', emoji: '🌳', name: 'Ağaç', x: 80, y: 50, action: 'Tavşan ağacın altında dinlendi!', sound: 'pop' }
    ],
    nextScene: 'garden'
  },
  garden: {
    id: 'garden',
    background: 'from-pink-300 via-purple-200 to-yellow-200',
    title: 'Bahçe Keşfi',
    description: 'Tavşan güzel bir bahçe buldu. Neler var acaba?',
    character: '🐰',
    interactiveElements: [
      { id: 'apple', emoji: '🍎', name: 'Elma', x: 30, y: 40, action: 'Tavşan elmayı yedi! Çok lezzetliydi!', sound: 'success' },
      { id: 'bee', emoji: '🐝', name: 'Arı', x: 60, y: 25, action: 'Arı vızıldayarak uçtu! Tavşan dikkatli oldu!', sound: 'error' },
      { id: 'sunflower', emoji: '🌻', name: 'Ayçiçeği', x: 75, y: 55, action: 'Ayçiçeği güneşe bakıyor! Tavşan da baktı!', sound: 'pop' },
      { id: 'watering', emoji: '💧', name: 'Su', x: 45, y: 75, action: 'Tavşan suyu içti! Çok serinledi!', sound: 'success' }
    ],
    nextScene: 'home'
  },
  home: {
    id: 'home',
    background: 'from-orange-300 via-red-200 to-pink-200',
    title: 'Eve Dönüş',
    description: 'Tavşan evine döndü. Ailesi onu bekliyor!',
    character: '🐰',
    interactiveElements: [
      { id: 'family', emoji: '👨‍👩‍👧‍👦', name: 'Aile', x: 40, y: 50, action: 'Aile tavşanı karşıladı! Çok sevindiler!', sound: 'success' },
      { id: 'home', emoji: '🏠', name: 'Ev', x: 65, y: 45, action: 'Tavşan evinin kapısını açtı!', sound: 'pop' },
      { id: 'heart', emoji: '💖', name: 'Sevgi', x: 25, y: 30, action: 'Herkes birbirini çok seviyor!', sound: 'success' },
      { id: 'food', emoji: '🥗', name: 'Yemek', x: 70, y: 70, action: 'Anne tavşan güzel bir yemek hazırladı!', sound: 'pop' }
    ],
    nextScene: 'forest'
  },
  ocean: {
    id: 'ocean',
    background: 'from-blue-400 via-cyan-300 to-teal-200',
    title: 'Okyanus Keşfi',
    description: 'Küçük balık okyanusta yüzüyor. Arkadaşlarını bul!',
    character: '🐠',
    interactiveElements: [
      { id: 'coral', emoji: '🪸', name: 'Mercan', x: 25, y: 65, action: 'Balık mercanların arasında saklandı!', sound: 'pop' },
      { id: 'starfish', emoji: '⭐', name: 'Deniz Yıldızı', x: 70, y: 75, action: 'Deniz yıldızı merhaba dedi!', sound: 'success' },
      { id: 'seahorse', emoji: '🐴', name: 'Deniz Atı', x: 50, y: 40, action: 'Deniz atı balıkla dans etti!', sound: 'pop' },
      { id: 'shell', emoji: '🐚', name: 'Midye', x: 80, y: 55, action: 'Midye güzel bir ses çıkardı!', sound: 'success' }
    ],
    nextScene: 'space'
  },
  space: {
    id: 'space',
    background: 'from-purple-500 via-indigo-400 to-blue-600',
    title: 'Uzay Macerası',
    description: 'Küçük astronot uzayda keşif yapıyor!',
    character: '👨‍🚀',
    interactiveElements: [
      { id: 'rocket', emoji: '🚀', name: 'Roket', x: 30, y: 50, action: 'Roket hızla uçtu! Vınnnn!', sound: 'error' },
      { id: 'planet', emoji: '🪐', name: 'Gezegen', x: 65, y: 35, action: 'Gezegen çok güzel görünüyor!', sound: 'pop' },
      { id: 'star', emoji: '⭐', name: 'Yıldız', x: 20, y: 25, action: 'Yıldız parlıyor! Çok güzel!', sound: 'success' },
      { id: 'alien', emoji: '👽', name: 'Uzaylı', x: 75, y: 65, action: 'Uzaylı merhaba dedi! Dostça el salladı!', sound: 'pop' }
    ],
    nextScene: 'forest'
  }
};

export function InteractiveStory({ volume }: InteractiveStoryProps) {
  const [currentScene, setCurrentScene] = useState<string>('forest');
  const [clickedElements, setClickedElements] = useState<Set<string>>(new Set());
  const [currentAction, setCurrentAction] = useState<string>('');
  const [characterPosition, setCharacterPosition] = useState({ x: 40, y: 60 });

  const scene = STORIES[currentScene];

  const handleElementClick = useCallback((element: StoryScene['interactiveElements'][0]) => {
    // Play sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      switch (element.sound) {
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

    // Show action
    setCurrentAction(element.action);
    setClickedElements(prev => new Set([...prev, element.id]));

    // Move character towards element
    setCharacterPosition({
      x: element.x + (Math.random() - 0.5) * 10,
      y: element.y + (Math.random() - 0.5) * 10
    });

    // Clear action after delay
    setTimeout(() => {
      setCurrentAction('');
    }, 3000);
  }, [volume]);

  const nextScene = useCallback(() => {
    if (scene.nextScene) {
      setCurrentScene(scene.nextScene);
      setClickedElements(new Set());
      setCurrentAction('');
      setCharacterPosition({ x: 40, y: 60 });
      
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playSuccess();
      }
    }
  }, [scene.nextScene, volume]);

  const resetStory = useCallback(() => {
    setCurrentScene('forest');
    setClickedElements(new Set());
    setCurrentAction('');
    setCharacterPosition({ x: 40, y: 60 });
    
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  return (
    <div className={`w-full min-h-screen bg-gradient-to-br ${scene.background} relative overflow-hidden`}>
      {/* Floating Story Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-20"
            style={{
              left: `${10 + i * 11}%`,
              top: `${8 + i * 10}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6
            }}
          >
            {['📚', '✨', '🌟', '💫', '🎭', '🎪', '🎨', '🌈'][i]}
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
          <div className="text-6xl mb-3">📖</div>
          <h1 className="text-3xl font-bold text-white/95 mb-2">
            {scene.title}
          </h1>
          <p className="text-lg text-white/80">
            {scene.description}
          </p>
        </motion.div>
      </div>

      {/* Story Scene */}
      <div className="relative w-full h-96 mx-auto max-w-4xl px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm border-4 border-white/20 shadow-2xl">
          
          {/* Main Character */}
          <motion.div
            key={`character-${currentScene}`}
            initial={{ scale: 0, x: '40%', y: '60%' }}
            animate={{ 
              scale: 1,
              x: `${characterPosition.x}%`,
              y: `${characterPosition.y}%`
            }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="absolute text-6xl transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <motion.div
              animate={{
                rotate: [0, -5, 5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {scene.character}
            </motion.div>
          </motion.div>

          {/* Interactive Elements */}
          {scene.interactiveElements.map((element, index) => (
            <motion.button
              key={element.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleElementClick(element)}
              className={`
                absolute text-4xl transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                ${clickedElements.has(element.id) ? 'scale-125 drop-shadow-lg' : ''}
              `}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`
              }}
            >
              <motion.div
                animate={clickedElements.has(element.id) ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0]
                } : {
                  y: [0, -5, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  scale: { duration: 0.6 },
                  rotate: { duration: 0.6 },
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {element.emoji}
              </motion.div>

              {/* Click Effect */}
              {clickedElements.has(element.id) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-full bg-white/30 border-4 border-white/50"
                />
              )}

              {/* Sparkles for clicked elements */}
              {clickedElements.has(element.id) && (
                <div className="absolute inset-0">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1, 0], 
                        opacity: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 60],
                        y: [0, (Math.random() - 0.5) * 60]
                      }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="absolute text-xl"
                      style={{
                        left: '50%',
                        top: '50%'
                      }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Display */}
      <AnimatePresence>
        {currentAction && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border-4 border-white/50 max-w-md mx-auto">
              <p className="text-lg font-bold text-gray-800 text-center">
                {currentAction}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex gap-4">
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextScene}
            className="px-8 py-4 rounded-2xl bg-green-400 border-4 border-green-300 text-white shadow-lg font-bold"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">➡️</span>
              <span>Sonraki Sahne</span>
            </div>
          </motion.button>

          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetStory}
            className="px-8 py-4 rounded-2xl bg-blue-400 border-4 border-blue-300 text-white shadow-lg font-bold"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <span>Baştan Başla</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Element Guide */}
      <div className="fixed bottom-6 left-6 z-30">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg max-w-xs"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">👆</div>
            <p className="text-sm font-bold text-gray-800">Dokunup Keşfet!</p>
            <p className="text-xs text-gray-600">
              Tıkladığın: {clickedElements.size}/{scene.interactiveElements.length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Character Guide */}
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
            <div className="text-4xl">📚</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Hikaye Arkadaşı</p>
              <p className="text-xs text-gray-600">
                {clickedElements.size === scene.interactiveElements.length 
                  ? 'Hepsini buldun! 🎉' 
                  : 'Daha çok keşfet! ✨'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scene Indicator */}
      <div className="fixed top-6 right-6 z-30">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="text-2xl">{scene.character}</div>
            <div>
              <p className="text-sm font-bold text-gray-800">{scene.title}</p>
              <p className="text-xs text-gray-600">Sahne {Object.keys(STORIES).indexOf(currentScene) + 1}/5</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default InteractiveStory;