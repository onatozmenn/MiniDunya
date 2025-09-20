import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, RotateCcw, Timer } from 'lucide-react';
import { Button } from '../ui/button';

interface BalloonPopProps {
  volume: number;
  onBack: () => void;
}

interface Balloon {
  id: string;
  x: number;
  y: number;
  color: string;
  emoji: string;
  speed: number;
  hasNote: boolean;
  sound: number;
  popped: boolean;
  scale: number;
}

interface PopEffect {
  id: string;
  x: number;
  y: number;
  color: string;
}

const BALLOON_COLORS = [
  { color: 'from-red-300 to-red-500', sound: 261, emoji: '🎈' },
  { color: 'from-blue-300 to-blue-500', sound: 294, emoji: '🎈' },
  { color: 'from-green-300 to-green-500', sound: 329, emoji: '🎈' },
  { color: 'from-yellow-300 to-yellow-500', sound: 349, emoji: '🎈' },
  { color: 'from-purple-300 to-purple-500', sound: 392, emoji: '🎈' },
  { color: 'from-pink-300 to-pink-500', sound: 440, emoji: '🎈' }
];

const NOTE_EMOJIS = ['🎵', '🎶', '♪', '♫'];

export function BalloonPop({ volume, onBack }: BalloonPopProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [popEffects, setPopEffects] = useState<PopEffect[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBalloonId = useRef(0);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio system - using ref for stable reference
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const audioSystem = useMemo(() => {
    const getAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const playPopSound = (frequency: number) => {
      if (volumeRef.current === 0) return;
      
      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(volumeRef.current * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } catch (error) {
        console.log('Audio error:', error);
      }
    };

    const playComboSound = (comboCount: number) => {
      if (volumeRef.current === 0) return;
      
      const baseFreq = 523; // C5
      const frequency = baseFreq * (1 + comboCount * 0.1);
      
      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volumeRef.current * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      } catch (error) {
        console.log('Audio error:', error);
      }
    };

    const playGameEndSound = () => {
      if (volumeRef.current === 0) return;
      
      const notes = [523, 440, 392, 349]; // C, A, G, F - descending
      notes.forEach((freq, index) => {
        setTimeout(() => playPopSound(freq), index * 200);
      });
    };

    return { playPopSound, playComboSound, playGameEndSound };
  }, []); // Empty dependency array for stable reference

  // Create new balloon
  const createBalloon = useCallback(() => {
    const colorData = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const hasNote = Math.random() < 0.3; // 30% chance for musical note
    
    const newBalloon: Balloon = {
      id: `balloon-${nextBalloonId.current++}`,
      x: Math.random() * 300, // Random x position
      y: 650, // Start from bottom
      color: colorData.color,
      emoji: hasNote ? NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)] : colorData.emoji,
      speed: 1 + Math.random() * 2, // Random speed
      hasNote,
      sound: colorData.sound,
      popped: false,
      scale: 0.8 + Math.random() * 0.4 // Random size
    };
    
    setBalloons(prev => [...prev, newBalloon]);
  }, []);

  // Game loop - move balloons and create new ones
  const createBalloonRef = useRef(createBalloon);
  createBalloonRef.current = createBalloon;

  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const gameLoop = setInterval(() => {
      // Move balloons up
      setBalloons(prev => prev.map(balloon => ({
        ...balloon,
        y: balloon.y - balloon.speed
      })).filter(balloon => balloon.y > -100 && !balloon.popped)); // Remove balloons that went off screen

      // Create new balloons
      if (Math.random() < 0.4) { // 40% chance each frame
        createBalloonRef.current();
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameEnded]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          audioSystem.playGameEndSound();
          if (score > highScore) {
            setHighScore(score);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, score, highScore, audioSystem]);

  // Handle balloon pop
  const handleBalloonPop = useCallback((balloon: Balloon, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    
    if (balloon.popped) return;

    // Mark balloon as popped
    setBalloons(prev => prev.map(b => 
      b.id === balloon.id ? { ...b, popped: true } : b
    ));

    // Play sound
    audioSystem.playPopSound(balloon.sound);

    // Add pop effect
    const newPopEffect: PopEffect = {
      id: `pop-${Date.now()}`,
      x: balloon.x,
      y: balloon.y,
      color: balloon.color
    };
    setPopEffects(prev => [...prev, newPopEffect]);

    // Remove pop effect after animation
    setTimeout(() => {
      setPopEffects(prev => prev.filter(effect => effect.id !== newPopEffect.id));
    }, 500);

    // Update score and combo
    const points = balloon.hasNote ? 20 : 10;
    const comboMultiplier = Math.min(combo + 1, 5);
    const totalPoints = points * comboMultiplier;
    
    setScore(prev => prev + totalPoints);
    setCombo(prev => {
      const newCombo = prev + 1;
      if (newCombo > 1) {
        audioSystem.playComboSound(newCombo);
      }
      return newCombo;
    });

    // Reset combo timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(balloon.hasNote ? [50, 25, 50] : 50);
    }
  }, [audioSystem, combo]);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setBalloons([]);
    setPopEffects([]);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setBalloons([]);
    setPopEffects([]);
    
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        ref={gameAreaRef}
        className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-sky-300 via-sky-200 to-green-200"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Clouds */}
          <motion.div
            className="absolute top-8 left-4 text-3xl opacity-70"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            ☁️
          </motion.div>
          
          <motion.div
            className="absolute top-16 right-8 text-2xl opacity-60"
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            ☁️
          </motion.div>
          
          <motion.div
            className="absolute top-32 left-1/3 text-xl opacity-50"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          >
            ☁️
          </motion.div>

          {/* Sun */}
          <motion.div
            className="absolute top-4 right-4 text-4xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ☀️
          </motion.div>

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-400 to-green-300" />
        </div>

        {/* Game Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          {/* Home Button */}
          <Button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white/90 hover:bg-white border-2 border-white/50 shadow-lg"
            variant="ghost"
          >
            <Home className="w-6 h-6 text-gray-700" />
          </Button>

          {/* Score in Cloud */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-white/50"
            animate={score > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              <span className="font-bold text-xl text-sky-600">{score}</span>
            </div>
          </motion.div>

          {/* Timer in Sun */}
          <motion.div
            className="bg-yellow-200/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border-2 border-yellow-300/50"
            animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
          >
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-sm text-orange-600">{timeLeft}</span>
            </div>
          </motion.div>
        </div>

        {/* Combo Indicator */}
        <AnimatePresence>
          {combo > 1 && gameStarted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 z-25"
            >
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white/50">
                <span className="font-bold">Combo x{combo}!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balloons */}
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              className="absolute cursor-pointer z-10"
              style={{
                left: balloon.x,
                top: balloon.y,
                scale: balloon.scale,
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: balloon.popped ? 0 : balloon.scale,
                rotate: balloon.popped ? 180 : [0, 5, -5, 0]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.3 }
              }}
              onClick={(e) => handleBalloonPop(balloon, e)}
              onTouchStart={(e) => handleBalloonPop(balloon, e)}
              whileTap={{ scale: balloon.scale * 1.2 }}
            >
              <div className={`
                w-16 h-20 rounded-full shadow-lg
                bg-gradient-to-br ${balloon.color}
                border-3 border-white/50
                flex items-center justify-center
                relative overflow-hidden
              `}>
                {/* Balloon shine */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-white/60 rounded-full blur-sm" />
                
                {/* Balloon emoji/note */}
                <span className="text-2xl z-10">{balloon.emoji}</span>
                
                {/* String */}
                <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-gray-600 transform -translate-x-1/2" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pop Effects */}
        <AnimatePresence>
          {popEffects.map((effect) => (
            <motion.div
              key={effect.id}
              className="absolute pointer-events-none z-15"
              style={{ left: effect.x, top: effect.y }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl">💥</div>
              
              {/* Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xs"
                  style={{
                    left: Math.random() * 20,
                    top: Math.random() * 20,
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 60,
                    y: (Math.random() - 0.5) * 60
                  }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  ⭐
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Game Over Screen */}
        <AnimatePresence>
          {gameEnded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30"
            >
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl border-4 border-white/50"
              >
                <div className="text-6xl mb-4">🎈</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Oyun Bitti!
                </h2>
                <div className="text-lg text-gray-600 mb-4">
                  Toplam Puan: <span className="font-bold text-sky-600">{score}</span>
                </div>
                {score === highScore && score > 0 && (
                  <div className="text-lg text-yellow-600 font-bold mb-4">
                    🏆 Yeni Rekor!
                  </div>
                )}
                <div className="text-sm text-gray-500 mb-6">
                  En Yüksek: {highScore}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-2xl font-bold"
                  >
                    🔄 Tekrar Oyna
                  </Button>
                  <Button
                    onClick={onBack}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-2xl font-bold"
                  >
                    🏠 Ana Menü
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Game Screen */}
        {!gameStarted && !gameEnded && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl border-4 border-white/50"
            >
              <div className="text-6xl mb-4">🎈</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Balon Patlatma!
              </h2>
              <p className="text-gray-600 mb-6">
                Yukarı uçan balonları patlat! Müzik notası olanlar daha fazla puan!
              </p>
              {highScore > 0 && (
                <div className="text-sm text-gray-500 mb-4">
                  En Yüksek Puan: {highScore}
                </div>
              )}
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg"
              >
                🎮 Oyunu Başlat
              </Button>
            </motion.div>
          </div>
        )}

        {/* Bottom Restart */}
        {gameStarted && !gameEnded && (
          <div className="absolute bottom-4 right-4 z-20">
            <Button
              onClick={resetGame}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white border-2 border-white/50 shadow-lg"
              variant="ghost"
            >
              <RotateCcw className="w-5 h-5 text-gray-700" />
            </Button>
          </div>
        )}

        {/* Instructions */}
        {gameStarted && score === 0 && !gameEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-20 left-4 right-4 z-25"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg text-center border-2 border-white/50">
              <div className="text-sm font-bold text-gray-700">
                🎯 Balonlara dokun ve patlat! 🎵 = daha fazla puan!
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}