import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface SimplePopProps {
  volume: number;
  onBack: () => void;
}

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  emoji: string;
}

const BUBBLE_EMOJIS = ['🎈', '⭐', '🌟', '✨', '🎁', '🍎', '🐱', '🌈'];
const BUBBLE_COLORS = [
  'bg-red-400',
  'bg-blue-400', 
  'bg-green-400',
  'bg-yellow-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-cyan-400'
];

export function SimplePop({ volume, onBack }: SimplePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const spawnRef = useRef<NodeJS.Timeout>();

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
  }, []);

  const createBubble = useCallback(() => {
    if (!gameStarted || gameEnded) return;

    const newBubble: Bubble = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 80 + 5, // 5-85% from left
      y: Math.random() * 70 + 15, // 15-85% from top
      size: Math.random() * 30 + 50, // 50-80px
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      emoji: BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)]
    };

    setBubbles(prev => {
      // Limit bubbles to 8
      const filtered = prev.length >= 8 ? prev.slice(1) : prev;
      return [...filtered, newBubble];
    });

    // Auto remove bubble after 4 seconds
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, 4000);
  }, [gameStarted, gameEnded]);

  const popBubble = useCallback((bubbleId: string) => {
    if (!gameStarted || gameEnded) return;

    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    setScore(prev => prev + 1);

    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [gameStarted, gameEnded, volume]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameStarted, gameEnded]);

  // Spawn bubbles
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    spawnRef.current = setInterval(() => {
      createBubble();
    }, 1500); // Every 1.5 seconds

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameStarted, gameEnded, createBubble]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-300 via-blue-200 to-cyan-200 relative overflow-hidden">
      {/* Floating clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-10 left-10 text-4xl opacity-40"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ x: [100, 50, 100] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-10 text-5xl opacity-30"
        >
          ☁️
        </motion.div>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Card className="px-6 py-3 bg-white/90 rounded-full shadow-lg flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">🌟 {score}</div>
            <div className="text-xs text-gray-600">Puan</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-500">⏰ {timeLeft}s</div>
            <div className="text-xs text-gray-600">Süre</div>
          </div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🎮
        </Button>
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 pt-24">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: 1,
                rotate: [0, 5, -5, 0],
                y: [0, -10, 0]
              }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                rotate: { duration: 3, repeat: Infinity },
                y: { duration: 2, repeat: Infinity }
              }}
              onClick={() => popBubble(bubble.id)}
              className={`
                absolute ${bubble.color} rounded-full shadow-xl border-4 border-white
                flex items-center justify-center text-white hover:scale-110 
                transition-transform duration-200 cursor-pointer
              `}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                fontSize: `${bubble.size * 0.4}px`
              }}
            >
              {bubble.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Start Screen */}
      {!gameStarted && !gameEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
        >
          <Card className="p-8 text-center bg-white/90 rounded-3xl shadow-xl max-w-md mx-4">
            <div className="text-6xl mb-6">🎈</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Baloncuk Patlatma!</h2>
            <p className="text-gray-600 mb-6">
              Beliren baloncukları patlatarak puan kazan!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500 text-white text-xl font-bold rounded-2xl"
            >
              Başla! 🎮
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Game End Screen */}
      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
        >
          <Card className="p-8 text-center bg-white/90 rounded-3xl shadow-xl max-w-md mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Oyun Bitti!</h2>
            <div className="text-4xl font-bold text-sky-500 mb-4">🎈 {score}</div>
            <p className="text-gray-600 mb-6">
              {score >= 20 ? 'Süper!' : score >= 10 ? 'Harika!' : 'İyi iş!'} 
              {' '}{score} baloncuk patlattın!
            </p>
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-sky-400 to-blue-400 text-white font-bold rounded-2xl"
              >
                Yeniden Oyna! 🎮
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default SimplePop;