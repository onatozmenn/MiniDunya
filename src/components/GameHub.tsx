import React from 'react';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface GameHubProps {
  volume: number;
}

export function GameHub({ volume }: GameHubProps) {
  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <Card className="p-6 border-0 shadow-xl rounded-3xl bg-gradient-to-r from-orange-200 via-red-200 to-pink-200 dark:from-orange-600/40 dark:via-red-600/40 dark:to-pink-600/40 dark:bg-slate-800/50">
          <div className="text-center space-y-3">
            <div className="text-5xl">🎮</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              Oyun Merkezi
            </div>
            <div className="text-base text-gray-600 dark:text-gray-300">
              Çok yakında yeni oyunlar!
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Card className="p-6 border-0 shadow-lg rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20">
          <div className="text-4xl mb-3">🚧</div>
          <div className="text-lg text-white mb-2">
            Oyunlar Geliştiriliyor!
          </div>
          <div className="text-sm text-white/80">
            Şimdilik piyano ile eğlenin! 🎹
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default GameHub;