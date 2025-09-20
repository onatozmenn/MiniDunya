import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { getSoundManager } from '../utils/SoundManager';

interface AnimalRacingProps {
  volume: number;
  onGoBack: () => void;
}

interface Animal {
  id: string;
  emoji: string;
  name: string;
  sound: string;
  color: string;
  position: number; // 0 to 100 (finish line)
  speed: number;
  isSelected: boolean;
  lane: number;
  energy: number;
  encouragementBoost: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  color: string;
  emoji: string;
  life: number;
}

// Racing animals with unique characteristics
const ANIMALS_TEMPLATE: Omit<Animal, 'position' | 'speed' | 'isSelected' | 'energy' | 'encouragementBoost'>[] = [
  {
    id: 'rabbit',
    emoji: '🐰',
    name: 'Tavşan',
    sound: 'Hop hop!',
    color: '#10B981',
    lane: 0
  },
  {
    id: 'turtle',
    emoji: '🐢',
    name: 'Kaplumbağa', 
    sound: 'Yavaş ama emin!',
    color: '#059669',
    lane: 1
  },
  {
    id: 'horse',
    emoji: '🐴',
    name: 'At',
    sound: 'Hızlıyım!',
    color: '#DC2626',
    lane: 2
  },
  {
    id: 'dog',
    emoji: '🐶',
    name: 'Köpek',
    sound: 'Hav hav!',
    color: '#2563EB',
    lane: 3
  }
];

export function AnimalRacing({ volume, onGoBack }: AnimalRacingProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [raceCount, setRaceCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  const textIdCounter = useRef(0);
  const confettiIdCounter = useRef(0);
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize animals
  useEffect(() => {
    const initialAnimals: Animal[] = ANIMALS_TEMPLATE.map(template => ({
      ...template,
      position: 0,
      speed: Math.random() * 0.3 + 0.2, // Random base speed
      isSelected: false,
      energy: 50 + Math.random() * 50, // Random energy 50-100
      encouragementBoost: 0
    }));
    setAnimals(initialAnimals);
  }, []);

  // Confetti animation
  useEffect(() => {
    const animateConfetti = () => {
      setConfetti(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.5, // gravity
        rotation: particle.rotation + 5,
        life: particle.life - 1
      })).filter(particle => particle.life > 0));
      
      animationFrameRef.current = requestAnimationFrame(animateConfetti);
    };
    
    animateConfetti();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Sound system
  const playSound = useCallback((frequency: number, duration: number = 300) => {
    if (!isSoundOn || volume === 0) return;
    const soundManager = getSoundManager(volume);
    soundManager.playNote(frequency, duration / 1000);
  }, [isSoundOn, volume]);

  // Create floating text
  const createFloatingText = useCallback((text: string, x: number, y: number, color: string = '#10B981') => {
    const newText: FloatingText = {
      id: textIdCounter.current++,
      text,
      x,
      y,
      color
    };
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
  }, []);

  // Create confetti explosion
  const createConfetti = useCallback((x: number, y: number) => {
    const newConfetti: Confetti[] = [];
    const emojis = ['🎉', '⭐', '🏆', '🎊', '✨'];
    const colors = ['#FFD700', '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    for (let i = 0; i < 15; i++) {
      newConfetti.push({
        id: confettiIdCounter.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * -10 - 5,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        life: 100
      });
    }
    setConfetti(prev => [...prev, ...newConfetti]);
  }, []);

  // Handle animal encouragement
  const encourageAnimal = useCallback((animalId: string) => {
    if (!isRacing) return;

    setAnimals(prev => prev.map(animal => {
      if (animal.id === animalId) {
        const boost = 0.2; // Speed boost from encouragement
        const newEncouragement = Math.min(animal.encouragementBoost + boost, 1.0);
        
        // Visual feedback
        createFloatingText('💪 Hadi!', 50 + animal.lane * 80, 200 + animal.lane * 80, animal.color);
        playSound(440 + animal.lane * 110, 200);
        
        return {
          ...animal,
          encouragementBoost: newEncouragement,
          isSelected: true
        };
      }
      return { ...animal, isSelected: false };
    }));

    setSelectedAnimal(animalId);
    
    // Reset selection after animation
    setTimeout(() => {
      setAnimals(prev => prev.map(animal => ({ ...animal, isSelected: false })));
      setSelectedAnimal(null);
    }, 500);
  }, [isRacing, createFloatingText, playSound]);

  // Start countdown and race
  const startRace = useCallback(() => {
    if (isRacing) return;

    // Reset positions and boost
    setAnimals(prev => prev.map(animal => ({
      ...animal,
      position: 0,
      speed: Math.random() * 0.3 + 0.2, // New random speed
      encouragementBoost: 0,
      isSelected: false,
      energy: 50 + Math.random() * 50 // New random energy
    })));

    setWinner(null);
    setCountdown(3);

    // Countdown sequence
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsRacing(true);
          playSound(523.25, 500); // Start race sound
          return 0;
        }
        playSound(330, 200); // Countdown beep
        return prev - 1;
      });
    }, 1000);
  }, [isRacing, playSound]);

  // Race logic - animal movement
  useEffect(() => {
    if (!isRacing) return;

    const raceInterval = setInterval(() => {
      setAnimals(prev => {
        const newAnimals = prev.map(animal => {
          if (animal.position >= 100) return animal;

          // Calculate movement based on base speed, energy, and encouragement
          const energyFactor = animal.energy / 100;
          const encouragementFactor = 1 + animal.encouragementBoost;
          const randomFactor = Math.random() * 0.5 + 0.75; // Add some randomness
          
          const movement = animal.speed * energyFactor * encouragementFactor * randomFactor;
          const newPosition = Math.min(animal.position + movement, 100);

          // Gradually decrease encouragement boost
          const newEncouragement = Math.max(animal.encouragementBoost - 0.02, 0);

          return {
            ...animal,
            position: newPosition,
            encouragementBoost: newEncouragement
          };
        });

        // Check for winner
        const finishedAnimal = newAnimals.find(animal => animal.position >= 100 && !winner);
        if (finishedAnimal) {
          setWinner(finishedAnimal.id);
          setIsRacing(false);
          setRaceCount(prev => prev + 1);
          
          // Victory effects
          playSound(659.25, 800); // Victory fanfare
          createFloatingText(`🏆 ${finishedAnimal.name} Kazandı! 🏆`, 150, 100, '#FFD700');
          createConfetti(200, 150);
          
          // Auto-restart race after celebration
          setTimeout(() => {
            startRace();
          }, 4000);
        }

        return newAnimals;
      });
    }, 50); // Smooth 20fps updates

    raceIntervalRef.current = raceInterval;
    return () => clearInterval(raceInterval);
  }, [isRacing, winner, startRace, playSound, createFloatingText, createConfetti]);

  // Auto-start first race
  useEffect(() => {
    if (animals.length > 0 && raceCount === 0) {
      setTimeout(() => startRace(), 1000);
    }
  }, [animals, raceCount, startRace]);

  return (
    <div 
      className="relative mx-auto overflow-hidden shadow-2xl w-full max-w-sm"
      style={{ 
        aspectRatio: '375 / 812',
        borderRadius: 'var(--radius-widget)',
        maxHeight: '85vh',
        minHeight: '600px',
        background: 'linear-gradient(to bottom, #87CEEB, #98FB98, #F0E68C)'
      }}
    >
      {/* Header */}
      <div 
        className="absolute flex justify-between items-center z-30"
        style={{ 
          top: 'calc(var(--mobile-padding) / 2)', 
          left: 'var(--mobile-padding)', 
          right: 'var(--mobile-padding)' 
        }}
      >
        {/* Race Count */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          style={{ 
            borderRadius: 'var(--radius-card)',
            padding: 'calc(var(--mobile-padding) * 0.6)',
            fontFamily: 'var(--font-text)'
          }}
        >
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 'var(--text-kids-large)' }}>🏁</span>
            <span style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(34, 197, 94)'
            }}>{raceCount}</span>
          </div>
        </motion.div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'calc(var(--mobile-gap) * 0.7)' }}>
          {/* Start Race Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={startRace}
            disabled={isRacing || countdown > 0}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-50"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.8)',
              height: 'calc(var(--kids-emoji-size) * 0.8)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span style={{ fontSize: 'var(--text-kids-small)' }}>
              {isRacing || countdown > 0 ? '⏸️' : '▶️'}
            </span>
          </motion.button>

          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onGoBack}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.8)',
              height: 'calc(var(--kids-emoji-size) * 0.8)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span style={{ fontSize: 'var(--text-kids-small)' }}>🏠</span>
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.8)',
              height: 'calc(var(--kids-emoji-size) * 0.8)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            {isSoundOn ? (
              <Volume2 className="w-5 h-5 text-blue-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Game Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
        style={{ 
          paddingTop: 'calc(var(--kids-emoji-size) + var(--mobile-padding))',
          paddingBottom: 'calc(var(--mobile-padding) * 0.5)',
          fontFamily: 'var(--font-display)'
        }}
      >
        <div style={{ 
          fontSize: 'var(--text-kids-large)', 
          fontWeight: 'var(--font-weight-bold)',
          color: 'rgb(21, 128, 61)',
          marginBottom: 'calc(var(--mobile-gap) * 0.5)'
        }}>
          🏁 Hayvan Yarışı 🏆
        </div>
      </motion.div>

      {/* Countdown Display */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/20"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-full shadow-2xl flex items-center justify-center"
              style={{
                width: 'calc(var(--kids-emoji-size) * 2)',
                height: 'calc(var(--kids-emoji-size) * 2)'
              }}
            >
              <span style={{ 
                fontSize: 'calc(var(--kids-emoji-size) * 1.2)', 
                fontWeight: 'var(--font-weight-bold)',
                color: '#DC2626'
              }}>
                {countdown}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Race Area */}
      <div 
        ref={containerRef}
        className="relative h-full"
        style={{ 
          padding: 'var(--mobile-padding)',
          paddingTop: 'calc(var(--mobile-padding) * 2)'
        }}
      >
        {/* Race Track */}
        <div className="relative h-full">
          {/* Finish Line */}
          <div 
            className="absolute right-4 top-20 bottom-32 w-2 bg-gradient-to-b from-red-500 to-red-600 z-10"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <motion.div
              className="absolute -top-4 -left-2 text-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span style={{ fontSize: 'var(--text-kids-medium)' }}>🏁</span>
            </motion.div>
          </div>

          {/* Racing Lanes */}
          {animals.map((animal, index) => (
            <div key={animal.id} className="relative mb-4">
              {/* Lane Track */}
              <div 
                className="relative h-16 bg-gradient-to-r from-green-200 to-green-300 border-2 border-green-400"
                style={{ 
                  borderRadius: 'var(--radius-card)',
                  marginBottom: 'var(--mobile-gap)'
                }}
              >
                {/* Lane Lines */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                {/* Animal */}
                <motion.div
                  className="absolute top-1/2 transform -translate-y-1/2 cursor-pointer"
                  style={{ 
                    left: `${animal.position}%`,
                    fontSize: 'var(--kids-emoji-size)',
                    zIndex: animal.isSelected ? 20 : 10
                  }}
                  animate={{
                    scale: animal.isSelected ? [1, 1.3, 1] : isRacing ? [1, 1.05, 1] : 1,
                    y: isRacing ? [0, -5, 0] : 0
                  }}
                  transition={{
                    scale: { duration: 0.5 },
                    y: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                  }}
                  onClick={() => encourageAnimal(animal.id)}
                  whileTap={{ scale: 1.2 }}
                >
                  {animal.emoji}
                  
                  {/* Encouragement boost indicator */}
                  {animal.encouragementBoost > 0 && (
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, y: [0, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <span style={{ fontSize: 'var(--text-kids-small)' }}>💨</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Animal Name & Progress */}
                <div 
                  className="absolute -bottom-8 left-0"
                  style={{ fontSize: 'var(--text-kids-small)', fontFamily: 'var(--font-text)' }}
                >
                  <span style={{ 
                    color: animal.color,
                    fontWeight: 'var(--font-weight-bold)'
                  }}>
                    {animal.name}
                  </span>
                  
                  {/* Progress bar */}
                  <div 
                    className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden"
                    style={{ width: '100px' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: animal.color }}
                      animate={{ width: `${animal.position}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Winner Celebration */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-30 bg-black/10"
            >
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center shadow-2xl"
                style={{
                  borderRadius: 'var(--radius-widget)',
                  padding: 'var(--kids-button-padding)',
                  fontFamily: 'var(--font-display)'
                }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div style={{ 
                  fontSize: 'calc(var(--kids-emoji-size) * 1.5)', 
                  marginBottom: 'var(--mobile-gap)' 
                }}>
                  {animals.find(a => a.id === winner)?.emoji}
                </div>
                <div style={{ 
                  fontSize: 'var(--text-kids-big)', 
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--mobile-gap)'
                }}>
                  🏆 Kazanan! 🏆
                </div>
                <div style={{ 
                  fontSize: 'var(--text-kids-medium)',
                  marginBottom: 'var(--mobile-gap)'
                }}>
                  {animals.find(a => a.id === winner)?.name}
                </div>
                <div style={{ 
                  fontSize: 'var(--text-kids-small)',
                  opacity: 0.8
                }}>
                  Yeni yarış başlıyor...
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute text-center"
          style={{
            bottom: 'var(--mobile-padding)',
            left: 'var(--mobile-padding)',
            right: 'var(--mobile-padding)'
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-sm shadow-lg text-center"
            style={{
              borderRadius: 'var(--radius-card)',
              padding: 'var(--kids-button-padding)'
            }}
          >
            <div style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(75, 85, 99)',
              fontFamily: 'var(--font-text)',
              marginBottom: 'calc(var(--mobile-gap) / 2)'
            }}>
              🏃‍♂️ Hayvanları Teşvik Et! 🏃‍♂️
            </div>
            <div style={{ 
              fontSize: 'var(--text-kids-small)',
              color: 'rgb(107, 114, 128)',
              fontFamily: 'var(--font-text)'
            }}>
              Hayvanlara dokun ve "Hadi!" diye bağır!
            </div>
          </div>
        </motion.div>

        {/* Confetti */}
        <AnimatePresence>
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none z-50"
              style={{
                left: particle.x,
                top: particle.y,
                fontSize: 'var(--text-kids-medium)',
                color: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                opacity: particle.life / 100
              }}
            >
              {particle.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map((text) => (
            <motion.div
              key={text.id}
              className="absolute pointer-events-none z-30 font-bold"
              style={{
                left: text.x,
                top: text.y,
                color: text.color,
                fontSize: 'var(--text-kids-medium)',
                fontFamily: 'var(--font-text)'
              }}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: -40 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5, 
                y: -80 
              }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              {text.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Grass */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-400/50 to-transparent"></div>
          
          {/* Clouds */}
          <motion.div
            className="absolute opacity-40"
            style={{ 
              top: '10%', 
              left: '10%',
              fontSize: 'var(--text-kids-large)'
            }}
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            ☁️
          </motion.div>
          
          <motion.div
            className="absolute opacity-40"
            style={{ 
              top: '15%', 
              right: '15%',
              fontSize: 'var(--text-kids-medium)'
            }}
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            ☁️
          </motion.div>

          {/* Cheering crowd */}
          <div className="absolute top-32 left-2 opacity-60">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              style={{ fontSize: 'var(--text-kids-small)' }}
            >
              👑
            </motion.div>
          </div>

          <div className="absolute top-40 right-2 opacity-60">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              style={{ fontSize: 'var(--text-kids-small)' }}
            >
              🎪
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}