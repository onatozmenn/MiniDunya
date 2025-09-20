import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface PopTheBalloonsProps {
  volume: number;
  onBack: () => void;
}

interface Balloon {
  id: string;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
}

interface StarBurst {
  id: string;
  x: number;
  y: number;
}

const BALLOON_COLORS = [
  'bg-red-400',
  'bg-blue-400', 
  'bg-yellow-400',
  'bg-pink-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-orange-400'
];

export function PopTheBalloons({ volume, onBack }: PopTheBalloonsProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [starBursts, setStarBursts] = useState<StarBurst[]>([]);
  const [scoreFloats, setScoreFloats] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const gameRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const spawnRef = useRef<NodeJS.Timeout>();

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(60);
    setBalloons([]);
    setStarBursts([]);
    setScoreFloats([]);
  }, []);

  // Spawn balloons
  const spawnBalloon = useCallback(() => {
    if (!gameStarted || gameEnded) return;

    const newBalloon: Balloon = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 85 + 5, // 5-90% width
      y: 105, // Start below screen
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      speed: Math.random() * 2 + 1.5, // 1.5-3.5 speed
      size: Math.random() * 20 + 60 // 60-80px size
    };

    setBalloons(prev => [...prev, newBalloon]);
  }, [gameStarted, gameEnded]);

  // Game timer and balloon movement
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    intervalRef.current = setInterval(() => {
      // Update timer
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });

      // Move balloons up
      setBalloons(prev => 
        prev.map(balloon => ({ ...balloon, y: balloon.y - balloon.speed }))
          .filter(balloon => balloon.y > -20) // Remove balloons that floated off screen
      );
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameStarted, gameEnded]);

  // Spawn balloons periodically
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    spawnRef.current = setInterval(() => {
      spawnBalloon();
    }, 1000 + Math.random() * 1000); // Every 1-2 seconds

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameStarted, gameEnded, spawnBalloon]);

  // Handle balloon pop
  const handleBalloonPop = useCallback((balloon: Balloon, event: React.MouseEvent) => {
    if (!gameStarted || gameEnded) return;

    // Prevent event bubbling
    event.stopPropagation();

    // Remove balloon
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    
    // Add score
    setScore(prev => prev + 1);

    // Add star burst effect
    const starBurst: StarBurst = {
      id: Math.random().toString(36).substr(2, 9),
      x: balloon.x,
      y: balloon.y
    };
    setStarBursts(prev => [...prev, starBurst]);
    setTimeout(() => {
      setStarBursts(prev => prev.filter(s => s.id !== starBurst.id));
    }, 1000);

    // Add floating score
    const scoreFloat = {
      id: Math.random().toString(36).substr(2, 9),
      x: balloon.x,
      y: balloon.y
    };
    setScoreFloats(prev => [...prev, scoreFloat]);
    setTimeout(() => {
      setScoreFloats(prev => prev.filter(s => s.id !== scoreFloat.id));
    }, 2000);

    // Play pop sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [gameStarted, gameEnded, volume]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-orange-200 via-pink-100 to-purple-100 dark:from-orange-800 dark:via-pink-900 dark:to-purple-900 relative overflow-hidden">
      {/* Floating clouds background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 text-6xl opacity-30"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ x: [100, 0, 100] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 text-5xl opacity-20"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-32 left-1/3 text-4xl opacity-25"
        >
          ☁️
        </motion.div>
      </div>

      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Card className="px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">🌟 {score}</div>
            <div className="text-sm text-gray-600">Puan</div>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">☀️ {timeLeft}s</div>
            <div className="text-sm text-gray-600">Süre</div>
          </div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🔄
        </Button>
      </div>

      {/* Game Area */}
      <div 
        ref={gameRef}
        className="absolute inset-0 pt-24 cursor-crosshair"
      >
        {/* Floating Balloons */}
        <AnimatePresence>
          {balloons.map(balloon => (
            <motion.button
              key={balloon.id}
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                rotate: [0, 5, -5, 0],
              }}
              exit={{ scale: 0 }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              onClick={(e) => handleBalloonPop(balloon, e)}
              className={`absolute ${balloon.color} rounded-full shadow-lg border-4 border-white hover:scale-110 transition-transform duration-200 flex items-center justify-center text-white font-bold`}
              style={{
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                width: `${balloon.size}px`,
                height: `${balloon.size}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🎈
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Star Burst Effects */}
        <AnimatePresence>
          {starBursts.map(burst => (
            <motion.div
              key={burst.id}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 2, 1], rotate: 360 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-4xl"
              style={{
                left: `${burst.x}%`,
                top: `${burst.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              💥
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Score */}
        <AnimatePresence>
          {scoreFloats.map(scoreFloat => (
            <motion.div
              key={scoreFloat.id}
              initial={{ scale: 0.8, opacity: 0, y: 0 }}
              animate={{ scale: 1.2, opacity: 1, y: -50 }}
              exit={{ scale: 0.8, opacity: 0, y: -100 }}
              transition={{ duration: 2 }}
              className="absolute text-2xl font-bold text-yellow-500"
              style={{
                left: `${scoreFloat.x}%`,
                top: `${scoreFloat.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              +1 ⭐
            </motion.div>
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
          <Card className="p-8 text-center bg-white rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">🎈</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Balon Patlatma!</h2>
            <p className="text-gray-600 mb-6">
              Uçan balonları patlatarak puan kazan! Hızlı ol, balonlar kaçıyor!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white text-xl font-bold rounded-2xl"
            >
              Oyunu Başlat! 🎮
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
          <Card className="p-8 text-center bg-white rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Oyun Bitti!</h2>
            <div className="text-4xl font-bold text-pink-500 mb-4">🎈 {score}</div>
            <p className="text-gray-600 mb-6">
              Harika! {score} balon patlattın! 
              {score >= 50 ? ' Süper hızlısın!' : score >= 30 ? ' Çok iyi!' : score >= 15 ? ' İyi iş!' : ' Tekrar dene!'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl"
              >
                Tekrar Oyna! 🎮
              </Button>
              <Button
                onClick={onBack}
                className="w-full h-14 bg-gray-400 hover:bg-gray-500 text-white text-lg font-bold rounded-2xl"
              >
                Ana Menü 🏠
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default PopTheBalloons;