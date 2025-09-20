import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { getSoundManager } from './utils/SoundManager';

interface PianoKey {
  note: string;
  frequency: number;
  animal: string;
  emoji: string;
  color: string;
  tocaColor: string;
  tocaStyle: string;
  sound: string;
}



const TOCA_PIANO_KEYS: PianoKey[] = [
  { 
    note: 'C4', frequency: 261.63,
    animal: 'Kedi', emoji: '🐱',
    color: 'bg-gradient-to-br from-pink-400 via-pink-300 to-pink-500',
    tocaColor: 'from-pink-400 via-rose-300 to-pink-500',
    tocaStyle: 'shadow-2xl shadow-pink-300/40 border-4 border-pink-200/80',
    sound: 'Miyav miyav!'
  },
  { 
    note: 'D4', frequency: 293.66,
    animal: 'Köpek', emoji: '🐶',
    color: 'bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500',
    tocaColor: 'from-orange-400 via-amber-300 to-orange-500',
    tocaStyle: 'shadow-2xl shadow-orange-300/40 border-4 border-orange-200/80',
    sound: 'Hav hav!'
  },
  { 
    note: 'E4', frequency: 329.63,
    animal: 'Ördek', emoji: '🦆',
    color: 'bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500',
    tocaColor: 'from-yellow-400 via-yellow-300 to-amber-400',
    tocaStyle: 'shadow-2xl shadow-yellow-300/40 border-4 border-yellow-200/80',
    sound: 'Vak vak!'
  },
  { 
    note: 'F4', frequency: 349.23,
    animal: 'Kurbağa', emoji: '🐸',
    color: 'bg-gradient-to-br from-green-400 via-green-300 to-green-500',
    tocaColor: 'from-green-400 via-emerald-300 to-green-500',
    tocaStyle: 'shadow-2xl shadow-green-300/40 border-4 border-green-200/80',
    sound: 'Vırak vırak!'
  },
  { 
    note: 'G4', frequency: 392.00,
    animal: 'Kuş', emoji: '🐦',
    color: 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500',
    tocaColor: 'from-blue-400 via-sky-300 to-blue-500',
    tocaStyle: 'shadow-2xl shadow-blue-300/40 border-4 border-blue-200/80',
    sound: 'Cik cik!'
  },
  { 
    note: 'A4', frequency: 440.00,
    animal: 'Fare', emoji: '🐭',
    color: 'bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500',
    tocaColor: 'from-purple-400 via-violet-300 to-purple-500',
    tocaStyle: 'shadow-2xl shadow-purple-300/40 border-4 border-purple-200/80',
    sound: 'Cit cit!'
  },
  { 
    note: 'B4', frequency: 493.88,
    animal: 'Tavşan', emoji: '🐰',
    color: 'bg-gradient-to-br from-rose-400 via-rose-300 to-rose-500',
    tocaColor: 'from-rose-400 via-pink-300 to-rose-500',
    tocaStyle: 'shadow-2xl shadow-rose-300/40 border-4 border-rose-200/80',
    sound: 'Hop hop!'
  },
  { 
    note: 'C5', frequency: 523.25,
    animal: 'Aslan', emoji: '🦁',
    color: 'bg-gradient-to-br from-indigo-400 via-indigo-300 to-indigo-500',
    tocaColor: 'from-indigo-400 via-violet-300 to-indigo-500',
    tocaStyle: 'shadow-2xl shadow-indigo-300/40 border-4 border-indigo-200/80',
    sound: 'Kükreee!'
  },
  { 
    note: 'C#4', frequency: 277.18,
    animal: 'Panda', emoji: '🐼',
    color: 'bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-700',
    tocaColor: 'from-cyan-600 via-teal-500 to-cyan-700',
    tocaStyle: 'shadow-2xl shadow-cyan-400/30 border-4 border-cyan-300/60',
    sound: 'Mmmmm!'
  },
  { 
    note: 'D#4', frequency: 311.13,
    animal: 'Tilki', emoji: '🦊',
    color: 'bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-700',
    tocaColor: 'from-emerald-600 via-green-500 to-emerald-700',
    tocaStyle: 'shadow-2xl shadow-emerald-400/30 border-4 border-emerald-300/60',
    sound: 'Hırr!'
  },
  { 
    note: 'F#4', frequency: 369.99,
    animal: 'Kaplan', emoji: '🐯',
    color: 'bg-gradient-to-br from-red-600 via-rose-500 to-red-700',
    tocaColor: 'from-red-600 via-rose-500 to-red-700',
    tocaStyle: 'shadow-2xl shadow-red-400/30 border-4 border-red-300/60',
    sound: 'Hırrrr!'
  },
  { 
    note: 'G#4', frequency: 415.30,
    animal: 'Ayı', emoji: '🐻',
    color: 'bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700',
    tocaColor: 'from-amber-600 via-orange-500 to-amber-700',
    tocaStyle: 'shadow-2xl shadow-amber-400/30 border-4 border-amber-300/60',
    sound: 'Hommm!'
  },
  { 
    note: 'A#4', frequency: 466.16,
    animal: 'Kurt', emoji: '🐺',
    color: 'bg-gradient-to-br from-violet-600 via-purple-500 to-violet-700',
    tocaColor: 'from-violet-600 via-purple-500 to-violet-700',
    tocaStyle: 'shadow-2xl shadow-violet-400/30 border-4 border-violet-300/60',
    sound: 'Auuuu!'
  },
  { 
    note: 'D5', frequency: 587.33,
    animal: 'Zürafa', emoji: '🦒',
    color: 'bg-gradient-to-br from-teal-400 via-cyan-300 to-teal-500',
    tocaColor: 'from-teal-400 via-cyan-300 to-teal-500',
    tocaStyle: 'shadow-2xl shadow-teal-300/40 border-4 border-teal-200/80',
    sound: 'Mmmeee!'
  },
  { 
    note: 'E5', frequency: 659.25,
    animal: 'Fil', emoji: '🐘',
    color: 'bg-gradient-to-br from-cyan-400 via-blue-300 to-cyan-500',
    tocaColor: 'from-cyan-400 via-blue-300 to-cyan-500',
    tocaStyle: 'shadow-2xl shadow-cyan-300/40 border-4 border-cyan-200/80',
    sound: 'Tööööt!'
  },
  { 
    note: 'F5', frequency: 698.46,
    animal: 'Gergedan', emoji: '🦏',
    color: 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500',
    tocaColor: 'from-amber-400 via-yellow-300 to-amber-500',
    tocaStyle: 'shadow-2xl shadow-amber-300/40 border-4 border-amber-200/80',
    sound: 'Hrrrrr!'
  },
];

interface TocaParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  color: string;
}

interface SoundBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface TocaPianoProps {
  volume: number;
  onNotePlay?: () => void;
  onNoteChange?: (note: string) => void;
  highlightedNote?: string | null;
  onGoToLearning?: () => void;
}

export function TocaPiano({ volume, onNotePlay, onNoteChange, highlightedNote, onGoToLearning }: TocaPianoProps) {
  const audioContext = useRef<AudioContext | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<TocaParticle[]>([]);
  const [soundBubbles, setSoundBubbles] = useState<SoundBubble[]>([]);
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const particleIdRef = useRef(0);
  const bubbleIdRef = useRef(0);



  // Memoized piano keys for performance
  const pianoKeys = useMemo(() => TOCA_PIANO_KEYS, []);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.8) => {
    if (volume === 0) return;

    // Use the new sound manager for consistent audio
    const soundManager = getSoundManager(volume);
    soundManager.playNote(frequency, duration);
  };

  // Optimized particle creation with reduced DOM manipulations
  const createParticle = useCallback((key: PianoKey, rect: DOMRect) => {
    const particleId = particleIdRef.current++;
    const newParticle: TocaParticle = {
      id: particleId,
      x: rect.left + rect.width / 2,
      y: rect.top,
      emoji: key.emoji,
      color: key.tocaColor
    };
    
    setParticles(prev => {
      // Limit particles to prevent memory issues
      const filtered = prev.length > 10 ? prev.slice(-5) : prev;
      return [...filtered, newParticle];
    });
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 1500); // Reduced duration
  }, []);

  const createSoundBubble = useCallback((key: PianoKey, rect: DOMRect) => {
    const bubbleId = bubbleIdRef.current++;
    const newBubble: SoundBubble = {
      id: bubbleId,
      x: rect.left + rect.width / 2,
      y: rect.top - 20,
      text: key.sound,
      color: key.tocaColor
    };
    
    setSoundBubbles(prev => {
      // Limit bubbles 
      const filtered = prev.length > 5 ? prev.slice(-3) : prev;
      return [...filtered, newBubble];
    });
    
    setTimeout(() => {
      setSoundBubbles(prev => prev.filter(b => b.id !== bubbleId));
    }, 1200); // Reduced duration
  }, []);

  const handleKeyPress = (key: PianoKey, event: React.MouseEvent | React.TouchEvent) => {
    setActiveKeys(prev => new Set(prev).add(key.note));
    playNote(key.frequency);
    setPlayedNotes(prev => [...prev.slice(-4), key.note]);
    onNotePlay?.();
    onNoteChange?.(key.note);

    // Toca Boca style effects
    const rect = event.currentTarget.getBoundingClientRect();
    createParticle(key, rect);
    createSoundBubble(key, rect);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.note);
        return newSet;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 relative overflow-hidden min-h-screen">
      {/* Toca Boca Style Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="text-center mb-4"
      >
        <div className="text-6xl mb-2">🎹</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          SevSaMut
        </div>
        <div className="text-base opacity-70 mb-4">Sevgi • Saygı • Mutluluk</div>
        
        {/* Learning Mode Button */}
        {onGoToLearning && (
          <Button
            onClick={onGoToLearning}
            className="px-6 py-3 rounded-2xl text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
⭐ Şarkı Öğren!
          </Button>
        )}
      </motion.div>



      {/* Last Played Melody Display */}
      {playedNotes.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex gap-2 mb-4"
        >
          {playedNotes.slice(-5).map((note, index) => {
            const key = TOCA_PIANO_KEYS.find(k => k.note === note);
            return (
              <motion.div
                key={`${note}-${index}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-2xl"
              >
                {key?.emoji}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Toca Style 4x4 Piano Grid - Optimized */}
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {pianoKeys.map((key, index) => (
            <motion.div
              key={key.note}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.03, // Faster loading
                duration: 0.4, // Reduced duration
                type: "spring",
                bounce: 0.5 // Less bounce for performance
              }}
              whileHover={{ scale: 1.03 }} // Reduced scale
              whileTap={{ scale: 0.96 }}
              className="w-full aspect-square hardware-accelerated"
            >
              <Button
                variant="outline"
                className={`
                  ${key.color} hover:opacity-95 border-0
                  ${key.tocaStyle}
                  w-full h-full rounded-3xl sm:rounded-[2rem] relative
                  ${activeKeys.has(key.note) ? 'scale-95 shadow-inner' : 'shadow-xl'}
                  ${highlightedNote === key.note ? 'ring-4 ring-yellow-300 ring-opacity-75 scale-105' : ''}
                  transition-all duration-150 overflow-hidden
                  flex flex-col items-center justify-center gap-2 sm:gap-3
                  min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px]
                  hardware-accelerated
                `}
                onMouseDown={(e) => handleKeyPress(key, e)}
                onTouchStart={(e) => handleKeyPress(key, e)}
              >
                {/* Toca style background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-3xl" />
                  {/* Fun polka dots pattern */}
                  <div className="absolute inset-4 bg-white/10 rounded-full opacity-30" />
                  <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 bg-white/20 rounded-full" />
                </div>
                
                {/* Big bouncy emoji - Optimized */}
                <motion.div 
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                  animate={activeKeys.has(key.note) ? {
                    scale: [1, 1.2, 1], // Reduced scale for performance
                    rotate: [0, 5, -5, 0] // Reduced rotation
                  } : {}}
                  transition={{ duration: 0.2 }} // Faster transition
                >
                  {key.emoji}
                </motion.div>
                
                {/* Animal name - Toca style */}
                <div className="text-xs sm:text-sm md:text-base font-bold text-white bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  {key.animal}
                </div>
                
                {/* Highlight pulse */}
                {highlightedNote === key.note && (
                  <motion.div
                    className="absolute inset-0 border-8 border-yellow-400 rounded-3xl pointer-events-none"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                {/* Optimized shine effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 rounded-3xl"
                  initial={{ x: '-100%' }}
                  animate={activeKeys.has(key.note) ? { x: '200%' } : { x: '-100%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }} // Faster shine
                />
                


                {/* Simplified sparkles - Better performance */}
                {activeKeys.has(key.note) && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-2 text-yellow-300 text-lg">✨</div>
                    <div className="absolute bottom-2 right-2 text-yellow-300 text-lg">🌟</div>
                  </div>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Toca Style Particle Effects */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none z-50 hardware-accelerated"
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              scale: 0, 
              opacity: 1
            }}
            animate={{ 
              x: particle.x + (Math.random() - 0.5) * 150, // Reduced range
              y: particle.y - 100 - Math.random() * 50, // Reduced range
              scale: [0, 1.5, 0], // Simplified animation
              opacity: [1, 0.8, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 1.5, // Faster
              ease: "easeOut"
            }}
          >
            <div className="text-3xl">{particle.emoji}</div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Toca Style Sound Bubbles */}
      <AnimatePresence>
        {soundBubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute pointer-events-none z-40"
            style={{ left: bubble.x - 50, top: bubble.y }}
            initial={{ 
              scale: 0, 
              opacity: 0,
              y: 20
            }}
            animate={{ 
              scale: [0, 1.2, 1],
              opacity: [0, 1, 1, 0],
              y: [20, -40, -60]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut"
            }}
          >
            <div className={`
              bg-gradient-to-r ${bubble.color} text-white text-sm font-bold
              px-3 py-2 rounded-full shadow-lg border-2 border-white/50
              backdrop-blur-sm relative
            `}>
              {bubble.text}
              {/* Speech bubble tail */}
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white/50" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>


    </div>
  );
}