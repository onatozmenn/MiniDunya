import { useState } from 'react';
import { motion } from 'motion/react';
import AIVoiceSettings from './AIVoiceSettings';

interface Story {
  id: string;
  title: string;
  emoji: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium';
  bookColor: string;
}

interface StorySelectorProps {
  onSelectStory: (storyId: string) => void;
  onGoBack: () => void;
}

const STORIES: Story[] = [
  {
    id: 'three-little-pigs',
    title: 'Üç Küçük Domuz',
    emoji: '🐷🏠',
    description: 'Evlerini kurtan koruyan akıllı domuzlar',
    duration: '8-12 dk',
    difficulty: 'easy',
    bookColor: 'from-pink-400 via-rose-500 to-pink-600'
  },
  {
    id: 'goldilocks',
    title: 'Goldilocks',
    emoji: '👧🐻',
    description: 'Ayıların evindeki meraklı kız',
    duration: '6-10 dk',
    difficulty: 'easy',
    bookColor: 'from-amber-400 via-orange-500 to-yellow-500'
  },
  {
    id: 'ugly-duckling',
    title: 'Çirkin Ördek Yavrusu',
    emoji: '🐣🦢',
    description: 'Kendini bulan güzel kuğu hikayesi',
    duration: '10-15 dk',
    difficulty: 'medium',
    bookColor: 'from-blue-400 via-cyan-500 to-teal-500'
  },
  {
    id: 'tortoise-and-hare',
    title: 'Kaplumbağa ile Tavşan',
    emoji: '🐢🐰',
    description: 'Sabrın zafer getirdiği ders',
    duration: '5-8 dk',
    difficulty: 'easy',
    bookColor: 'from-green-400 via-emerald-500 to-green-600'
  },
  {
    id: 'red-riding-hood',
    title: 'Kırmızı Başlıklı',
    emoji: '🔴wolf',
    description: 'Ormanda dostluk kurma hikayesi',
    duration: '7-10 dk', 
    difficulty: 'easy',
    bookColor: 'from-red-400 via-rose-500 to-red-600'
  },
  {
    id: 'jack-and-beanstalk',
    title: 'Jack ve Fasulye Sırığı',
    emoji: '👦🌱',
    description: 'Göklere uzanan sihirli fasulye',
    duration: '12-18 dk',
    difficulty: 'medium',
    bookColor: 'from-green-500 via-lime-500 to-green-400'
  },
  {
    id: 'ant-and-grasshopper',
    title: 'Karınca ile Ağustos Böceği',
    emoji: '🐜🦗',
    description: 'Çalışkanlığın değeri hikayesi',
    duration: '4-7 dk',
    difficulty: 'easy',
    bookColor: 'from-purple-400 via-violet-500 to-purple-600'
  },
  {
    id: 'cinderella',
    title: 'Külkedisi',
    emoji: '👗✨',
    description: 'Sihirli ayakkabı ile prenses olmak',
    duration: '15-20 dk',
    difficulty: 'medium',
    bookColor: 'from-indigo-400 via-blue-500 to-purple-500'
  }
];

export default function StorySelector({ onSelectStory, onGoBack }: StorySelectorProps) {
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [hoveredBook, setHoveredBook] = useState<string>('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  return (
    <div className="relative w-full max-w-md mx-auto h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Magical Library Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Books */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-15"
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${10 + (i * 12)}%`,
              fontSize: 'clamp(14px, 3.5vw, 24px)'
            }}
            animate={{
              y: [-5, 8, -5],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 5 + (i * 0.3),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            📚
          </motion.div>
        ))}
        
        {/* Magical Sparkles - Reduced */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute opacity-25"
            style={{
              right: `${8 + (i * 12)}%`,
              top: `${15 + (i * 10)}%`,
              fontSize: 'clamp(10px, 2.5vw, 18px)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.25, 0.6, 0.25],
              rotate: [0, 120, 240, 360],
            }}
            transition={{
              duration: 4 + (i * 0.2),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* Safe Area Top Padding + Header */}
      <div className="pt-safe-top">
        {/* Back Button */}
        <div className="flex items-center justify-start p-4 z-30 relative">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onGoBack}
            className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(44px, 11vw, 52px)',
              height: 'clamp(44px, 11vw, 52px)',
            }}
          >
            <span style={{ fontSize: 'clamp(18px, 4.5vw, 22px)' }}>🏠</span>
          </motion.button>
        </div>
      </div>

      {/* Story Books Grid */}
      <div className="px-4 pb-20 h-full overflow-y-auto scrollbar-hide">
        {/* Content Container with proper spacing */}
        <div className="max-w-sm mx-auto" style={{ paddingTop: 'var(--mobile-gap)' }}>
          <div className="grid grid-cols-2 max-w-sm mx-auto" style={{ gap: 'var(--mobile-gap)' }}>
            {STORIES.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ scale: 0, rotateY: -90, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.6
                }}
                className="perspective-1000"
                style={{ 
                  minHeight: 'clamp(140px, 25vw, 200px)',
                }}
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: -3,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedStory(story.id);
                    setTimeout(() => onSelectStory(story.id), 500);
                  }}
                  onMouseEnter={() => setHoveredBook(story.id)}
                  onMouseLeave={() => setHoveredBook('')}
                  className={`
                    relative w-full h-full rounded-xl shadow-xl overflow-hidden border-0 
                    transition-all duration-300 transform-gpu
                    ${selectedStory === story.id ? 'ring-3 ring-yellow-400' : ''}
                  `}
                  style={{
                    background: `linear-gradient(135deg, ${story.bookColor.replace('from-', '').replace('via-', ', ').replace('to-', ', ')})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Book Spine Shadow */}
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/15 transform translate-x-0.5" />
                  
                  {/* Book Cover Content */}
                  <div className="relative h-full flex flex-col items-center justify-center text-white p-3">
                    
                    {/* Main Character Emoji */}
                    <motion.div
                      animate={hoveredBook === story.id ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 8, -8, 0],
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className="mb-2"
                      style={{ fontSize: 'clamp(28px, 7vw, 42px)' }}
                    >
                      {story.emoji}
                    </motion.div>
                    
                    {/* Book Title */}
                    <h3 
                      className="font-bold text-center mb-2 leading-tight text-white drop-shadow-md"
                      style={{ 
                        fontSize: 'var(--text-kids-medium)',
                        fontFamily: 'var(--font-display)'
                      }}
                    >
                      {story.title}
                    </h3>
                    
                    {/* Story Duration */}
                    <div className="flex items-center justify-center">
                      <span 
                        className="bg-white/20 backdrop-blur-sm rounded-full flex items-center text-white/90 px-2 py-1"
                        style={{ 
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)',
                          gap: 'clamp(3px, 1vw, 5px)'
                        }}
                      >
                        ⏱️ {story.duration}
                      </span>
                    </div>
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-2 right-2">
                      <span 
                        className="bg-white/25 backdrop-blur-sm rounded-full text-white/90 flex items-center justify-center"
                        style={{ 
                          width: 'clamp(20px, 5vw, 28px)',
                          height: 'clamp(20px, 5vw, 28px)',
                          fontSize: 'clamp(10px, 2.5vw, 14px)'
                        }}
                      >
                        {story.difficulty === 'easy' ? '😊' : '🤔'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Book Pages Effect */}
                  <div className="absolute right-0.5 top-1 bottom-1 w-0.5 bg-white/30 rounded-r-sm" />
                  <div className="absolute right-1 top-1.5 bottom-1.5 w-px bg-white/15" />
                  
                  {/* Magic Shimmer */}
                  {(hoveredBook === story.id || selectedStory === story.id) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
                    />
                  )}
                  
                  {/* Selection Glow */}
                  {selectedStory === story.id && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
                      animate={{ 
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom Safe Area */}
        <div style={{ height: 'var(--mobile-gap)' }} />
      </div>

      {/* AI Voice Settings - Fixed Position */}
      <motion.button
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowVoiceSettings(true)}
        className="fixed bottom-6 right-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center z-30 border border-white/15"
        style={{ 
          width: 'clamp(52px, 13vw, 64px)',
          height: 'clamp(52px, 13vw, 64px)',
        }}
      >
        <motion.span
          animate={{ 
            rotate: [0, 4, -4, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ fontSize: 'clamp(22px, 5.5vw, 28px)' }}
        >
          🎭
        </motion.span>
        
        {/* Book Pages */}
        <div className="absolute right-0.5 top-2 bottom-2 w-0.5 bg-white/25 rounded-r-sm" />
      </motion.button>

      {/* AI Voice Settings Modal */}
      <AIVoiceSettings 
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </div>
  );
}