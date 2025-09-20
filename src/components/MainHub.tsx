import React from 'react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { useState } from 'react';
import { VoiceSettings } from './VoiceSettings';

interface MainHubProps {
  onNavigate: (page: 'piano' | 'songs' | 'games' | 'stories') => void;
}

export function MainHub({ onNavigate }: MainHubProps) {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  return (
    <div className="flex flex-col items-center relative overflow-hidden min-h-screen px-4 py-6 sm:py-8">
      {/* Ana Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="text-center mb-6 sm:mb-8"
      >
        <motion.div 
          className="mb-3 sm:mb-4"
          style={{ fontSize: 'clamp(48px, 12vw, 96px)' }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎼
        </motion.div>
        <h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
          MiniDünya
        </h1>
        <h3 className="opacity-70 mb-4">Çocuklar İçin Eğlence Dünyası</h3>
      </motion.div>

      {/* Ana Menü Butonları */}
      <div className="w-full max-w-sm sm:max-w-md px-3 space-y-5 sm:space-y-8">
        
        {/* Serbest Çalma */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={() => onNavigate('piano')}
            className="w-full rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 relative overflow-hidden"
            style={{ 
              height: 'var(--kids-button-height)',
              padding: 'var(--kids-button-padding)'
            }}
          >
            <div className="flex items-center justify-center w-full relative z-10" style={{ gap: 'var(--kids-button-gap)' }}>
              <motion.div 
                className="flex-shrink-0"
                style={{ fontSize: 'var(--kids-emoji-size)' }}
                animate={{ 
                  rotate: [0, -10, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎹
              </motion.div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-white font-bold leading-tight mb-1" style={{ fontSize: 'var(--text-kids-big)' }}>
                  Serbest Çalma
                </div>
                <div className="opacity-90 leading-tight" style={{ fontSize: 'var(--text-kids-medium)' }}>
                  İstediğin gibi çal! ✨
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300/30 to-transparent opacity-60" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full blur-sm" />
          </Button>
        </motion.div>

        {/* Şarkı Öğren */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={() => onNavigate('songs')}
            className="w-full rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 relative overflow-hidden"
            style={{ 
              height: 'var(--kids-button-height)',
              padding: 'var(--kids-button-padding)'
            }}
          >
            <div className="flex items-center justify-center w-full relative z-10" style={{ gap: 'var(--kids-button-gap)' }}>
              <motion.div 
                className="flex-shrink-0"
                style={{ fontSize: 'var(--kids-emoji-size)' }}
                animate={{ 
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⭐
              </motion.div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-white font-bold leading-tight mb-1" style={{ fontSize: 'var(--text-kids-big)' }}>
                  Şarkı Öğren
                </div>
                <div className="opacity-90 leading-tight" style={{ fontSize: 'var(--text-kids-medium)' }}>
                  Güzel şarkıları öğren! 🎵
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent opacity-60" />
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-white/20 rounded-full blur-sm" />
          </Button>
        </motion.div>

        {/* Oyunlar */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={() => onNavigate('games')}
            className="w-full rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 relative overflow-hidden"
            style={{ 
              height: 'var(--kids-button-height)',
              padding: 'var(--kids-button-padding)'
            }}
          >
            <div className="flex items-center justify-center w-full relative z-10" style={{ gap: 'var(--kids-button-gap)' }}>
              <motion.div 
                className="flex-shrink-0"
                style={{ fontSize: 'var(--kids-emoji-size)' }}
                animate={{ 
                  y: [0, -8, 0]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎮
              </motion.div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-white font-bold leading-tight mb-1" style={{ fontSize: 'var(--text-kids-big)' }}>
                  Oyunlar
                </div>
                <div className="opacity-90 leading-tight" style={{ fontSize: 'var(--text-kids-medium)' }}>
                  Eğlenceli oyunlar! 🌈
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-300/30 to-transparent opacity-60" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/20 rounded-full blur-sm" />
          </Button>
        </motion.div>

        {/* Hikayeler */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={() => onNavigate('stories')}
            className="w-full rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-pink-400 via-rose-500 to-purple-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 relative overflow-hidden"
            style={{ 
              height: 'var(--kids-button-height)',
              padding: 'var(--kids-button-padding)'
            }}
          >
            <div className="flex items-center justify-center w-full relative z-10" style={{ gap: 'var(--kids-button-gap)' }}>
              <motion.div 
                className="flex-shrink-0"
                style={{ fontSize: 'var(--kids-emoji-size)' }}
                animate={{ 
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📖
              </motion.div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-white font-bold leading-tight mb-1" style={{ fontSize: 'var(--text-kids-big)' }}>
                  Hikayeler
                </div>
                <div className="opacity-90 leading-tight" style={{ fontSize: 'var(--text-kids-medium)' }}>
                  Sesli masallar! 🦄
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-transparent opacity-60" />
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-white/20 rounded-full blur-sm" />
            <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-white/20 rounded-full blur-sm" />
          </Button>
        </motion.div>

      </div>

      {/* Ses Ayarları Butonu */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
        className="absolute top-6 right-6"
      >
        <Button
          onClick={() => setShowVoiceSettings(true)}
          variant="ghost"
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 w-14 h-14 p-0 rounded-full shadow-lg"
          style={{ fontSize: 'var(--text-kids-medium)' }}
        >
          🎤
        </Button>
      </motion.div>

      {/* Floating Animasyonlar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 text-4xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎵
        </motion.div>
        
        <motion.div
          className="absolute top-32 right-8 text-3xl"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 8, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          🌟
        </motion.div>
        
        <motion.div
          className="absolute bottom-40 left-16 text-3xl"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          🎶
        </motion.div>

        <motion.div
          className="absolute bottom-24 right-12 text-4xl"
          animate={{
            y: [0, -18, 0],
            rotate: [0, -12, 12, 0]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          💫
        </motion.div>
      </div>
    </div>
  );
}