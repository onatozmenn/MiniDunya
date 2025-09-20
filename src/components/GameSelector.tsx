import React from 'react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface Game {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  difficulty: 'Kolay' | 'Orta';
  ageGroup: string;
}

const GAMES: Game[] = [
  {
    id: 'bubbles',
    title: 'Balon Patlatma',
    emoji: '🫧',
    description: 'Renkli balonları patlat, ses çıkar!',
    color: 'from-blue-400 via-cyan-500 to-blue-600',
    difficulty: 'Kolay',
    ageGroup: '3-6 yaş'
  },
  {
    id: 'feeding',
    title: 'Alfabe Boyama',
    emoji: '🔤',
    description: 'Harfleri boyayarak öğren!',
    color: 'from-purple-400 via-violet-500 to-purple-600',
    difficulty: 'Kolay',
    ageGroup: '3-6 yaş'
  },
  {
    id: 'colors',
    title: 'Renk Karıştırma',
    emoji: '🎨',
    description: 'Renklerle oyna, yeni renkler keşfet!',
    color: 'from-purple-400 via-pink-500 to-red-500',
    difficulty: 'Orta',
    ageGroup: '4-6 yaş'
  }
];

interface GameSelectorProps {
  onSelectGame: (gameId: string) => void;
  onGoBack: () => void;
}

export function GameSelector({ onSelectGame, onGoBack }: GameSelectorProps) {
  return (
    <div 
      className="relative mx-auto overflow-hidden shadow-2xl w-full max-w-sm"
      style={{ 
        aspectRatio: '375 / 812',
        borderRadius: 'var(--radius-widget)',
        maxHeight: '85vh',
        minHeight: '600px',
        background: 'linear-gradient(to bottom, #E0E7FF, #F3E8FF, #FEF7CD)'
      }}
    >
      <div 
        className="flex flex-col items-center relative overflow-hidden h-full"
        style={{ padding: 'var(--mobile-padding)', gap: 'var(--mobile-gap)' }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          className="text-center"
          style={{ 
            marginBottom: 'var(--mobile-gap)',
            fontFamily: 'var(--font-display)'
          }}
        >
          <div style={{ 
            fontSize: 'var(--kids-emoji-size)', 
            marginBottom: 'var(--mobile-gap)' 
          }}>🎮</div>
          <div 
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent"
            style={{ 
              fontSize: 'var(--text-kids-big)', 
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Oyun Seç!
          </div>
          <div style={{ 
            fontSize: 'var(--text-kids-medium)', 
            opacity: 0.7, 
            marginBottom: 'var(--mobile-gap)' 
          }}>Hangi oyunu oynamak istiyorsun? 🌟</div>
          
          {/* Back Button */}
          <Button
            onClick={onGoBack}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl"
            style={{
              padding: 'var(--mobile-padding)',
              borderRadius: 'var(--radius-card)',
              fontSize: 'var(--text-kids-medium)',
              fontFamily: 'var(--font-text)'
            }}
          >
            🏠 Ana Sayfa
          </Button>
        </motion.div>

        {/* Games Grid */}
        <div className="w-full flex-1 overflow-y-auto scrollbar-hide">
          <div 
            className="grid grid-cols-1 gap-4"
            style={{ gap: 'var(--kids-button-gap)' }}
          >
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.4, 
                  type: "spring", 
                  bounce: 0.3 
                }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={() => onSelectGame(game.id)}
                  className={`w-full bg-gradient-to-br ${game.color} text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 relative overflow-hidden`}
                  style={{
                    height: 'var(--kids-button-height)',
                    padding: 0,
                    borderRadius: 'var(--radius-widget)'
                  }}
                >
                  {/* Content */}
                  <div 
                    className="relative z-10 flex items-center h-full w-full"
                    style={{ padding: 'var(--kids-button-padding)' }}
                  >
                    {/* Game Emoji */}
                    <motion.div
                      className="flex-shrink-0"
                      style={{ fontSize: 'var(--kids-emoji-size)' }}
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    >
                      {game.emoji}
                    </motion.div>
                    
                    <div className="flex-1 ml-4 min-w-0">
                      {/* Game Title */}
                      <div 
                        className="text-white leading-tight mb-1"
                        style={{ 
                          fontSize: 'var(--text-kids-large)', 
                          fontWeight: 'var(--font-weight-bold)',
                          fontFamily: 'var(--font-display)'
                        }}
                      >
                        {game.title}
                      </div>
                      
                      {/* Game Description */}
                      <div 
                        className="opacity-90 leading-tight mb-2"
                        style={{ 
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)'
                        }}
                      >
                        {game.description}
                      </div>
                      
                      {/* Game Info */}
                      <div className="flex gap-2">
                        <div 
                          className="bg-white/20 rounded-full"
                          style={{ 
                            padding: 'calc(var(--mobile-padding) / 4) calc(var(--mobile-padding) / 2)',
                            fontSize: 'var(--text-kids-small)'
                          }}
                        >
                          {game.difficulty}
                        </div>
                        <div 
                          className="bg-white/20 rounded-full"
                          style={{ 
                            padding: 'calc(var(--mobile-padding) / 4) calc(var(--mobile-padding) / 2)',
                            fontSize: 'var(--text-kids-small)'
                          }}
                        >
                          {game.ageGroup}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/30"></div>
                    <div className="absolute top-8 right-6 w-6 h-6 rounded-full bg-white/20"></div>
                    <div className="absolute bottom-6 left-8 w-4 h-4 rounded-full bg-white/25"></div>
                    <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/15"></div>
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/10 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute opacity-40"
            style={{ 
              top: 'calc(var(--mobile-padding) * 2)', 
              left: 'var(--mobile-padding)',
              fontSize: 'var(--kids-emoji-size)'
            }}
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
            🎲
          </motion.div>
          
          <motion.div
            className="absolute opacity-40"
            style={{ 
              top: 'calc(var(--mobile-padding) * 4)', 
              right: 'var(--mobile-padding)',
              fontSize: 'calc(var(--kids-emoji-size) * 0.8)'
            }}
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
            🏆
          </motion.div>
          
          <motion.div
            className="absolute opacity-40"
            style={{ 
              bottom: 'calc(var(--mobile-padding) * 6)', 
              left: 'calc(var(--mobile-padding) * 2)',
              fontSize: 'calc(var(--kids-emoji-size) * 0.8)'
            }}
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
            🎪
          </motion.div>

          <motion.div
            className="absolute opacity-40"
            style={{ 
              bottom: 'calc(var(--mobile-padding) * 3)', 
              right: 'calc(var(--mobile-padding) * 2)',
              fontSize: 'var(--kids-emoji-size)'
            }}
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
            🎊
          </motion.div>
        </div>
      </div>
    </div>
  );
}