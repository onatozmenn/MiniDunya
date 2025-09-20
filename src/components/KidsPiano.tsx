import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface PianoKey {
  note: string;
  frequency: number;
  isBlack: boolean;
  color: string;
  animal: string;
  emoji: string;
  habitat: string;
  food: string;
  funFact: string;
  sound: string;
  tocaColor: string; // Toca Boca style vibrant colors
  tocaStyle: string; // Additional Toca styling
}

const KIDS_PIANO_KEYS: PianoKey[] = [
  // White Keys (Natural Notes)
  { 
    note: 'C4', frequency: 261.63, isBlack: false, color: 'bg-red-400', 
    animal: 'Kedi', emoji: '🐱',
    habitat: 'Evlerde ve sokaklarda yaşar',
    food: 'Balık, et ve mama yer',
    funFact: 'Kediler 16 saat uyuyabilir!',
    sound: 'Miyav miyav diye ses çıkarır'
  },
  { 
    note: 'D4', frequency: 293.66, isBlack: false, color: 'bg-orange-400', 
    animal: 'Köpek', emoji: '🐶',
    habitat: 'İnsanlarla birlikte yaşar',
    food: 'Kemik, et ve mama yer',
    funFact: 'Köpekler 10.000 farklı koku tanır!',
    sound: 'Hav hav diye havlar'
  },
  { 
    note: 'E4', frequency: 329.63, isBlack: false, color: 'bg-yellow-400', 
    animal: 'Ördek', emoji: '🦆',
    habitat: 'Göllerde ve nehirlerde yaşar',
    food: 'Balık, böcek ve bitki yer',
    funFact: 'Ördeklerin ayakları soğuktan etkilenmez!',
    sound: 'Vak vak diye ses çıkarır'
  },
  { 
    note: 'F4', frequency: 349.23, isBlack: false, color: 'bg-green-400', 
    animal: 'Kurbağa', emoji: '🐸',
    habitat: 'Gölet ve bataklıklarda yaşar',
    food: 'Böcek ve sinek yer',
    funFact: 'Kurbağalar dillerini çok hızlı çıkarır!',
    sound: 'Vırak vırak diye ses çıkarır'
  },
  { 
    note: 'G4', frequency: 392.00, isBlack: false, color: 'bg-blue-400', 
    animal: 'Kuş', emoji: '🐦',
    habitat: 'Ağaçlarda ve gökyüzünde yaşar',
    food: 'Tohum, meyve ve böcek yer',
    funFact: 'Bazı kuşlar 200 km/saat hızla uçabilir!',
    sound: 'Cik cik diye ötüş yapar'
  },
  { 
    note: 'A4', frequency: 440.00, isBlack: false, color: 'bg-purple-400', 
    animal: 'Fare', emoji: '🐭',
    habitat: 'Evlerde ve depolarda yaşar',
    food: 'Peynir, tahıl ve meyve yer',
    funFact: 'Fareler çok iyi yüzücüdür!',
    sound: 'Cit cit diye ses çıkarır'
  },
  { 
    note: 'B4', frequency: 493.88, isBlack: false, color: 'bg-pink-400', 
    animal: 'Tavşan', emoji: '🐰',
    habitat: 'Çayırlarda ve ormanlarda yaşar',
    food: 'Havuç, marul ve ot yer',
    funFact: 'Tavşanlar çok yükseğe zıplayabilir!',
    sound: 'Sessizce hareket eder'
  },
  { 
    note: 'C5', frequency: 523.25, isBlack: false, color: 'bg-indigo-400', 
    animal: 'Aslan', emoji: '🦁',
    habitat: 'Afrika savanlarında yaşar',
    food: 'Et yer, avcılık yapar',
    funFact: 'Aslan kükremeleri 8 km uzaktan duyulur!',
    sound: 'Kükrer ve hırlar'
  },
  // Black Keys (Sharp/Flat Notes)
  { 
    note: 'C#4', frequency: 277.18, isBlack: true, color: 'bg-slate-700', 
    animal: 'Panda', emoji: '🐼',
    habitat: 'Bambu ormanlarında yaşar',
    food: 'Bambu yer',
    funFact: 'Pandalar günde 14 saat bambu yer!',
    sound: 'Yumuşak sesler çıkarır'
  },
  { 
    note: 'D#4', frequency: 311.13, isBlack: true, color: 'bg-slate-700', 
    animal: 'Tilki', emoji: '🦊',
    habitat: 'Ormanlarda ve çayırlarda yaşar',
    food: 'Et, meyve ve böcek yer',
    funFact: 'Tilkiler çok zeki hayvanlardır!',
    sound: 'Hırıltılı sesler çıkarır'
  },
  { 
    note: 'F#4', frequency: 369.99, isBlack: true, color: 'bg-slate-700', 
    animal: 'Kaplan', emoji: '🐯',
    habitat: 'Tropik ormanlarda yaşar',
    food: 'Et yer, avcılık yapar',
    funFact: 'Kaplanlar çok iyi yüzücüdür!',
    sound: 'Hırlar ve kükreyabilir'
  },
  { 
    note: 'G#4', frequency: 415.30, isBlack: true, color: 'bg-slate-700', 
    animal: 'Ayı', emoji: '🐻',
    habitat: 'Ormanlarda ve dağlarda yaşar',
    food: 'Balık, meyve ve et yer',
    funFact: 'Ayılar kış uykusuna yatar!',
    sound: 'Homurdanır'
  },
  { 
    note: 'A#4', frequency: 466.16, isBlack: true, color: 'bg-slate-700', 
    animal: 'Kurt', emoji: '🐺',
    habitat: 'Ormanlarda sürüler halinde yaşar',
    food: 'Et yer, avcılık yapar',
    funFact: 'Kurtlar çok güçlü sosyal bağlara sahiptir!',
    sound: 'Ulur'
  },
  // Extra Higher Notes
  { 
    note: 'D5', frequency: 587.33, isBlack: false, color: 'bg-teal-400', 
    animal: 'Zürafa', emoji: '🦒',
    habitat: 'Afrika savanlarında yaşar',
    food: 'Yaprak ve dallar yer',
    funFact: 'Zürafalar 6 metre boyunda olabilir!',
    sound: 'Yumuşak sesler çıkarır'
  },
  { 
    note: 'E5', frequency: 659.25, isBlack: false, color: 'bg-cyan-400', 
    animal: 'Fil', emoji: '🐘',
    habitat: 'Afrika ve Asya ormanlarında yaşar',
    food: 'Yaprak, meyve ve ot yer',
    funFact: 'Filler çok iyi hafızaya sahiptir!',
    sound: 'Trompet sesi çıkarır'
  },
  { 
    note: 'F5', frequency: 698.46, isBlack: false, color: 'bg-amber-400', 
    animal: 'Gergedan', emoji: '🦏',
    habitat: 'Afrika savanlarında yaşar',
    food: 'Ot ve yaprak yer',
    funFact: 'Gergedanlar çok hızlı koşabilir!',
    sound: 'Hırıltılı sesler çıkarır'
  },
];

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  emoji: string;
}

function Particle({ x, y, color, emoji }: ParticleProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      initial={{ x, y, scale: 0, opacity: 1 }}
      animate={{ 
        x: x + (Math.random() - 0.5) * 100,
        y: y - 50 - Math.random() * 100,
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0]
      }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <div className="text-2xl">{emoji}</div>
    </motion.div>
  );
}

interface KidsPianoProps {
  volume: number;
  onNotePlay?: () => void;
  onNoteChange?: (note: string) => void;
  highlightedNote?: string | null;
}

export function KidsPiano({ volume, onNotePlay, onNoteChange, highlightedNote }: KidsPianoProps) {
  const audioContext = useRef<AudioContext | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<PianoKey | null>(null);
  const [showAnimalInfo, setShowAnimalInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.5) => {
    if (!audioContext.current) return;

    // Create a more fun, kid-friendly sound
    const oscillator1 = audioContext.current.createOscillator();
    const oscillator2 = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    // Main tone
    oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator1.type = 'triangle';
    
    // Harmonic for richer sound
    oscillator2.frequency.setValueAtTime(frequency * 2, audioContext.current.currentTime);
    oscillator2.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator2.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    oscillator2.stop(audioContext.current.currentTime + duration);
  };

  const createParticle = (key: PianoKey, rect: DOMRect) => {
    const newParticle: ParticleProps = {
      x: rect.left + rect.width / 2,
      y: rect.top,
      color: key.color,
      emoji: key.emoji || '⭐'
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p !== newParticle));
    }, 1500);
  };

  const handleKeyPress = (key: PianoKey, event: React.MouseEvent | React.TouchEvent) => {
    setActiveKeys(prev => new Set(prev).add(key.note));
    playNote(key.frequency);
    setPlayedNotes(prev => [...prev.slice(-6), key.note]);
    onNotePlay?.(); // Notify parent component
    onNoteChange?.(key.note); // Notify parent component about the note change

    // Create particle effect
    const rect = event.currentTarget.getBoundingClientRect();
    createParticle(key, rect);
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.note);
        return newSet;
      });
    }, 200);
  };

  const handleAnimalInfoClick = (key: PianoKey, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAnimal(key);
    setShowAnimalInfo(true);
  };

  const playAnimalSound = (frequency: number) => {
    playNote(frequency);
  };

  const congratulationMessages = [
    "Harika! 🎉", "Süper! ⭐", "Muhteşem! 🌟", "Bravo! 👏", "Güzel! 🎵"
  ];

  const getRandomCongrats = () => {
    return congratulationMessages[Math.floor(Math.random() * congratulationMessages.length)];
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 p-4 relative overflow-hidden">

      {/* Piano Keys - Full Screen 4x4 Grid Layout */}
      <div className="w-full">
        {/* Büyük grid düzeni - ekranı tam kullan */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {KIDS_PIANO_KEYS.map((key) => (
            <motion.div
              key={key.note}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full aspect-square"
            >
              <Button
                variant="outline"
                className={`
                  ${key.color} hover:opacity-90 border-0
                  w-full h-full rounded-2xl sm:rounded-3xl relative
                  ${activeKeys.has(key.note) ? 'scale-95 shadow-inner' : 'shadow-xl'}
                  ${highlightedNote === key.note ? 'ring-4 ring-yellow-300 ring-opacity-75 animate-pulse scale-105' : ''}
                  transition-all duration-150 overflow-hidden
                  flex flex-col items-center justify-center gap-2 sm:gap-3
                  dark:shadow-2xl dark:shadow-black/50
                  min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px]
                `}
                onMouseDown={(e) => handleKeyPress(key, e)}
                onTouchStart={(e) => handleKeyPress(key, e)}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                  {key.emoji}
                </div>
                
                {/* Note Name - Bigger text */}
                <div className="text-sm sm:text-base md:text-lg font-semibold text-white/90 dark:text-white/90 bg-black/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  {key.note}
                </div>
                
                {/* Highlight indicator */}
                {highlightedNote === key.note && (
                  <motion.div
                    className="absolute inset-0 border-4 border-yellow-300 rounded-2xl sm:rounded-3xl pointer-events-none"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }}
                  animate={activeKeys.has(key.note) ? { x: '200%' } : { x: '-100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Particle Effects */}
      {particles.map((particle, index) => (
        <Particle
          key={index}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          emoji={particle.emoji}
        />
      ))}
    </div>
  );
}