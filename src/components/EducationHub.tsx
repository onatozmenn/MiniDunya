import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { SongTutorial } from './SongTutorial';
import { RhythmPractice } from './RhythmPractice';
import { ChevronLeft } from 'lucide-react';

interface EducationHubProps {
  volume: number;
  onComplete: (songId: string) => void;
}

type EducationMode = 'selection' | 'songs' | 'rhythm';

export function EducationHub({ volume, onComplete }: EducationHubProps) {
  const [currentMode, setCurrentMode] = useState<EducationMode>('selection');

  if (currentMode === 'songs') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setCurrentMode('selection')}
          className="rounded-2xl border-0 bg-white/20 dark:bg-slate-700/50 text-white"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Geri
        </Button>
        <SongTutorial volume={volume} onComplete={onComplete} />
      </div>
    );
  }

  if (currentMode === 'rhythm') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setCurrentMode('selection')}
          className="rounded-2xl border-0 bg-white/20 dark:bg-slate-700/50 text-white"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Geri
        </Button>
        <RhythmPractice volume={volume} />
      </div>
    );
  }

  // Selection screen
  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <Card className="p-6 border-0 shadow-xl rounded-3xl bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 dark:from-purple-600/40 dark:via-pink-600/40 dark:to-red-600/40 dark:bg-slate-800/50">
          <div className="text-center space-y-3">
            <div className="text-6xl">📖</div>
            <div className="text-2xl">🎓 Öğrenme Merkezi 🎓</div>
            <div className="text-lg">📚 Ne öğrenmek istiyorsun? 📚</div>
          </div>
        </Card>
      </motion.div>

      {/* Education Options */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Song Learning */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.3,
            type: "spring",
            bounce: 0.6 
          }}
        >
          <Card 
            className="p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-600/30 dark:to-emerald-600/30 dark:bg-slate-800/50 hover:shadow-xl"
            onClick={() => setCurrentMode('songs')}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl">🎵</div>
              <div className="text-xl">Şarkı Öğren</div>
              <div className="text-base opacity-80">Hayvanlı piyanoda şarkıları çalmayı öğren</div>
              <div className="text-lg">⭐ 🐄 🐑 🎂 🔔 👨‍🌾</div>
              <Button 
                className="w-full rounded-2xl text-lg h-12 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg"
              >
                🎼 Şarkı Öğrenmeye Başla
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Rhythm Practice */}
        <motion.div
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.4,
            type: "spring",
            bounce: 0.6 
          }}
        >
          <Card 
            className="p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-600/30 dark:to-red-600/30 dark:bg-slate-800/50 hover:shadow-xl"
            onClick={() => setCurrentMode('rhythm')}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl">🥁</div>
              <div className="text-xl">Ritim Pratiği</div>
              <div className="text-base opacity-80">Düşen notalarla ritim öğren ve geliştir</div>
              <div className="text-lg">🐱 🐶 🐦 ⚡ 🎯</div>
              <Button 
                className="w-full rounded-2xl text-lg h-12 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-lg"
              >
                🎮 Ritim Pratiğine Başla
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Fun Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-4xl space-x-4 opacity-60"
      >
        🌟 ✨ 🎈 ✨ 🌟
      </motion.div>
    </div>
  );
}