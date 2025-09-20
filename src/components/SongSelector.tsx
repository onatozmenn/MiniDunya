import React from 'react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface Song {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  color: string;
  notes: number;
}

const AVAILABLE_SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Star',
    subtitle: '⭐ Yıldız',
    emoji: '⭐',
    difficulty: 'kolay',
    color: 'from-yellow-400 via-orange-500 to-red-500',
    notes: 42
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    subtitle: '🎂 Doğum Günü',
    emoji: '🎂',
    difficulty: 'orta',
    color: 'from-pink-400 via-purple-500 to-pink-600',
    notes: 24
  },
  {
    id: 'mary-lamb',
    title: 'Mary\'s Lamb',
    subtitle: '🐑 Kuzucuk',
    emoji: '🐑',
    difficulty: 'kolay',
    color: 'from-green-400 via-emerald-500 to-green-600',
    notes: 27
  },
  {
    id: 'old-macdonald',
    title: 'Old MacDonald',
    subtitle: '🚜 Çiftlik',
    emoji: '🚜',
    difficulty: 'orta',
    color: 'from-green-400 via-blue-500 to-emerald-600',
    notes: 25
  },
  {
    id: 'row-boat',
    title: 'Row Your Boat',
    subtitle: '🚣 Tekne',
    emoji: '🚣',
    difficulty: 'kolay',
    color: 'from-blue-400 via-cyan-500 to-blue-600',
    notes: 27
  },
  {
    id: 'wheels-bus',
    title: 'Wheels Bus',
    subtitle: '🚌 Otobüs',
    emoji: '🚌',
    difficulty: 'orta',
    color: 'from-orange-400 via-red-500 to-orange-600',
    notes: 24
  },
  {
    id: 'baa-sheep',
    title: 'Black Sheep',
    subtitle: '🐑 Siyah Koyun',
    emoji: '🐑',
    difficulty: 'orta',
    color: 'from-gray-400 via-purple-500 to-gray-600',
    notes: 31
  },
  {
    id: 'if-happy',
    title: 'If Happy',
    subtitle: '😊 Mutluluk',
    emoji: '😊',
    difficulty: 'zor',
    color: 'from-yellow-400 via-green-500 to-yellow-600',
    notes: 38
  },
  {
    id: 'london-bridge',
    title: 'London Bridge',
    subtitle: '🌉 Köprü',
    emoji: '🌉',
    difficulty: 'orta',
    color: 'from-red-400 via-orange-500 to-red-600',
    notes: 24
  },
  {
    id: 'humpty-dumpty',
    title: 'Humpty Dumpty',
    subtitle: '🥚 Yumurta',
    emoji: '🥚',
    difficulty: 'zor',
    color: 'from-yellow-400 via-red-500 to-orange-600',
    notes: 36
  },
  {
    id: 'five-ducks',
    title: 'Five Ducks',
    subtitle: '🦆 Ördekler',
    emoji: '🦆',
    difficulty: 'zor',
    color: 'from-blue-400 via-yellow-500 to-blue-600',
    notes: 34
  },
  {
    id: 'itsy-spider',
    title: 'Itsy Spider',
    subtitle: '🕷️ Örümcek',
    emoji: '🕷️',
    difficulty: 'zor',
    color: 'from-purple-400 via-pink-500 to-purple-600',
    notes: 47
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'kolay': return 'bg-green-500';
    case 'orta': return 'bg-yellow-500';
    case 'zor': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getDifficultyStars = (difficulty: string) => {
  switch (difficulty) {
    case 'kolay': return '⭐';
    case 'orta': return '⭐⭐';
    case 'zor': return '⭐⭐⭐';
    default: return '⭐';
  }
};

interface SongSelectorProps {
  onSelectSong: (songId: string) => void;
  onGoBack: () => void;
}

export function SongSelector({ onSelectSong, onGoBack }: SongSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-4 relative overflow-hidden min-h-screen">
      
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="text-center mb-4"
      >
        <div className="text-6xl mb-2">🎵</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Şarkı Seç!
        </div>
        <div className="text-base opacity-70 mb-4">Hangi şarkıyı öğrenmek istiyorsun? 🌟</div>
        
        {/* Geri Dön Butonu */}
        <Button
          onClick={onGoBack}
          className="mb-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg hover:shadow-xl"
        >
          🏠 Ana Menüye Dön
        </Button>
      </motion.div>

      {/* Şarkı Kartları */}
      <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {AVAILABLE_SONGS.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.4,
              type: "spring",
              bounce: 0.5
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onSelectSong(song.id)}
              className={`
                w-full h-full p-0 rounded-3xl shadow-2xl hover:shadow-3xl 
                transition-all duration-300 border-0 overflow-hidden
                bg-gradient-to-br ${song.color} aspect-square
                min-h-[140px] sm:min-h-[160px]
              `}
            >
              <div className="p-4 sm:p-6 text-white relative h-full flex flex-col justify-between">
                
                {/* Background Pattern - Minimal */}
                <div className="absolute inset-0 opacity-10">
                  <div className="h-full w-full bg-gradient-to-br from-white/30 to-transparent rounded-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  
                  {/* Top: Emoji ve Zorluk */}
                  <div className="flex justify-between items-start">
                    <div className="text-4xl sm:text-5xl">{song.emoji}</div>
                    <div className={`
                      ${getDifficultyColor(song.difficulty)} 
                      px-2 py-1 rounded-full text-xs font-bold text-white
                      flex items-center gap-1
                    `}>
                      {getDifficultyStars(song.difficulty)}
                    </div>
                  </div>

                  {/* Bottom: Başlık */}
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-bold leading-tight">{song.title}</div>
                  </div>

                  {/* Subtle Shine Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 rounded-3xl"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "linear"
                    }}
                  />

                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Alt Bilgi - Simplified */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-6 p-3 bg-white/5 rounded-2xl backdrop-blur-sm"
      >
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span className="opacity-70">Kolay</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐⭐</span>
            <span className="opacity-70">Orta</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐⭐⭐</span>
            <span className="opacity-70">Zor</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Müzik Notaları */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          >
            {['🎵', '🎶', '♪', '♫', '🎼'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

    </div>
  );
}