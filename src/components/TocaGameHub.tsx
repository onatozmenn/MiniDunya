import React from 'react';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface TocaGameHubProps {
  volume: number;
}

const PLANNED_GAMES = [
  {
    id: 'color-mixer',
    title: 'Renk Karıştırıcı',
    emoji: '🎨',
    secondaryEmoji: '✨',
    description: 'Çok yakında...',
    colors: 'from-pink-400 via-red-400 to-orange-400',
    background: 'from-pink-100/80 to-red-100/80 dark:from-pink-600/20 dark:to-red-600/20'
  },
  {
    id: 'sound-painter',
    title: 'Ses Boyacısı',
    emoji: '🖌️',
    secondaryEmoji: '🎵',
    description: 'Çok yakında...',
    colors: 'from-blue-400 via-cyan-400 to-green-400',
    background: 'from-blue-100/80 to-cyan-100/80 dark:from-blue-600/20 dark:to-cyan-600/20'
  },
  {
    id: 'musical-garden',
    title: 'Müzikal Bahçe',
    emoji: '🌻',
    secondaryEmoji: '🎶',
    description: 'Çok yakında...',
    colors: 'from-green-400 via-emerald-400 to-yellow-400',
    background: 'from-green-100/80 to-emerald-100/80 dark:from-green-600/20 dark:to-emerald-600/20'
  },
  {
    id: 'animal-band',
    title: 'Hayvan Bandosu',
    emoji: '🦁',
    secondaryEmoji: '🎺',
    description: 'Çok yakında...',
    colors: 'from-purple-400 via-pink-400 to-red-400',
    background: 'from-purple-100/80 to-pink-100/80 dark:from-purple-600/20 dark:to-pink-600/20'
  }
];

export function TocaGameHub({ volume }: TocaGameHubProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="text-center"
      >
        <div className="text-7xl mb-4">🎪</div>
        <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Toca Oyun Dünyası
        </div>
        <div className="text-xl opacity-80 text-white">
          Hayal gücünü konuşturan oyunlar geliştiriliyor! 🌈
        </div>
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANNED_GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.15,
              duration: 0.6,
              type: "spring",
              bounce: 0.7
            }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card 
              className={`
                p-6 border-0 shadow-xl rounded-[2rem] cursor-not-allowed
                bg-gradient-to-br ${game.background}
                backdrop-blur-sm border-4 border-white/30
                opacity-70 hover:opacity-80
                transition-all duration-300
                min-h-[200px] flex flex-col justify-center
              `}
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center gap-2">
                  <span className="text-6xl">{game.emoji}</span>
                  <span className="text-4xl opacity-80">{game.secondaryEmoji}</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    {game.title}
                  </div>
                  <div className="text-sm opacity-80 text-gray-600 dark:text-gray-300">
                    {game.description}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20">
          <div className="text-5xl mb-4">🛠️</div>
          <div className="text-2xl text-white mb-3">
            Toca Tarzı Oyunlar Geliştiriliyor!
          </div>
          <div className="text-lg text-white/80">
            Yaratıcılığınızı konuşturacak, sınırsız keşif imkanı sunan oyunlar çok yakında! 
            Şimdilik piyano ile müzikal yolculuğunuza başlayın! 🎹✨
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TocaGameHub;