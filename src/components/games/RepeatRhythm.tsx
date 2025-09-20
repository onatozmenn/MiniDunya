import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { getSoundManager } from '../utils/SoundManager';

interface RepeatRhythmProps {
  volume: number;
  onBack: () => void;
}

interface DrumPad {
  id: number;
  color: string;
  sound: string;
  emoji: string;
}

const DRUM_PADS: DrumPad[] = [
  { id: 0, color: 'bg-red-400', sound: 'kick', emoji: '🥁' },
  { id: 1, color: 'bg-blue-400', sound: 'snare', emoji: '🪘' },
  { id: 2, color: 'bg-green-400', sound: 'hihat', emoji: '🔔' },
  { id: 3, color: 'bg-yellow-400', sound: 'cymbal', emoji: '✨' }
];

export function RepeatRhythm({ volume, onBack }: RepeatRhythmProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Generate new sequence
  const generateSequence = useCallback((length: number) => {
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setUserSequence([]);
    setCurrentStep(0);
    setFeedback(null);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setLevel(1);
    setIsListening(false);
    setIsPlaying(false);
    setFeedback(null);
    setSparkles([]);
    generateSequence(2); // Start with 2-step sequence
  }, [generateSequence]);

  // Play sequence
  const playSequence = useCallback(async () => {
    if (isPlaying || !gameStarted) return;
    
    setIsPlaying(true);
    setIsListening(false);
    setUserSequence([]);
    setCurrentStep(0);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(() => {
          setActivePad(sequence[i]);
          
          // Play drum sound
          if (volume > 0) {
            const soundManager = getSoundManager(volume);
            soundManager.playDrum(DRUM_PADS[sequence[i]].sound as 'kick' | 'snare' | 'hihat' | 'cymbal');
          }
          
          setTimeout(() => {
            setActivePad(null);
            resolve(undefined);
          }, 300);
        }, i * 800);
      });
    }

    setIsPlaying(false);
    setIsListening(true);
  }, [sequence, isPlaying, gameStarted, volume]);

  // Handle pad press
  const handlePadPress = useCallback((padId: number) => {
    if (!isListening || isPlaying || gameEnded) return;

    setActivePad(padId);
    setTimeout(() => setActivePad(null), 200);

    // Play drum sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playDrum(DRUM_PADS[padId].sound as 'kick' | 'snare' | 'hihat' | 'cymbal');
    }

    const newUserSequence = [...userSequence, padId];
    setUserSequence(newUserSequence);

    // Check if the step is correct
    if (padId === sequence[currentStep]) {
      setCurrentStep(prev => prev + 1);

      // Check if sequence is complete
      if (newUserSequence.length === sequence.length) {
        // Correct sequence completed!
        setFeedback('correct');
        setScore(prev => prev + 1);
        
        // Play success sound
        if (volume > 0) {
          const soundManager = getSoundManager(volume);
          soundManager.playSuccess();
        }
        
        // Add sparkles
        const newSparkles = Array.from({ length: 15 }, (_, i) => ({
          id: `${Date.now()}-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100
        }));
        setSparkles(newSparkles);
        setTimeout(() => setSparkles([]), 2000);

        // Progress to next level
        setTimeout(() => {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          const sequenceLength = Math.min(2 + Math.floor(nextLevel / 2), 6); // Max 6 steps
          generateSequence(sequenceLength);
          setFeedback(null);
        }, 2000);
      }
    } else {
      // Incorrect step
      setFeedback('incorrect');
      setIsListening(false);
      
      // Play error sound
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playError();
      }
      
      // Reset and try again after delay
      setTimeout(() => {
        setFeedback(null);
        playSequence();
      }, 1500);
    }
  }, [isListening, isPlaying, gameEnded, userSequence, currentStep, sequence, level, volume, generateSequence, playSequence]);

  // Auto-play sequence when generated
  useEffect(() => {
    if (sequence.length > 0 && gameStarted && !gameEnded) {
      const timer = setTimeout(() => {
        playSequence();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sequence, gameStarted, gameEnded, playSequence]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-200 via-purple-100 to-pink-100 dark:from-indigo-800 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden">
      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Card className="px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">🌟 {score}</div>
            <div className="text-sm text-gray-600">Level {level}</div>
          </div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🔄
        </Button>
      </div>

      {/* Progress & Status */}
      {gameStarted && (
        <div className="absolute top-24 left-4 right-4 z-20">
          <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="text-center mb-2">
              <div className="text-lg font-bold text-gray-800">
                {isPlaying ? '🎵 Dinle...' : isListening ? '🎹 Tekrarla!' : '⏳ Hazırlan...'}
              </div>
            </div>
            <Progress value={(currentStep / sequence.length) * 100} className="h-3" />
            <div className="text-center mt-2 text-sm text-gray-600">
              {currentStep}/{sequence.length} adım
            </div>
          </Card>
        </div>
      )}

      {/* Drum Pads */}
      {gameStarted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="grid grid-cols-2 gap-6 w-80 h-80">
            {DRUM_PADS.map((pad) => (
              <motion.button
                key={pad.id}
                whileHover={!isPlaying ? { scale: 1.05 } : {}}
                whileTap={!isPlaying ? { scale: 0.95 } : {}}
                onClick={() => handlePadPress(pad.id)}
                disabled={isPlaying || !isListening}
                className={`
                  w-32 h-32 ${pad.color} rounded-full shadow-lg border-4 border-white
                  flex items-center justify-center text-4xl font-bold
                  ${activePad === pad.id ? 'scale-110 brightness-125 shadow-2xl' : ''}
                  ${!isListening ? 'opacity-60' : 'hover:brightness-110'}
                  transition-all duration-200
                  disabled:cursor-not-allowed
                `}
              >
                {pad.emoji}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Listen Button */}
      {gameStarted && !isPlaying && !isListening && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <Button
            onClick={playSequence}
            className="w-32 h-16 bg-purple-400 hover:bg-purple-500 text-white text-lg font-bold rounded-2xl shadow-lg"
          >
            🎵 Dinle
          </Button>
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <Card className="p-6 bg-white rounded-3xl shadow-2xl text-center">
              <div className="text-4xl mb-2">
                {feedback === 'correct' ? '🎉' : '🤗'}
              </div>
              <div className="text-xl font-bold text-gray-800">
                {feedback === 'correct' ? 'Harika!' : 'Tekrar dene!'}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle Effects */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            initial={{ scale: 0, y: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1.5, 1],
              y: [0, -50, -100],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute text-2xl text-yellow-400"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
          >
            ⭐
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Start Screen */}
      {!gameStarted && !gameEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
        >
          <Card className="p-8 text-center bg-white rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">🥁</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Ritmi Tekrarla!</h2>
            <p className="text-gray-600 mb-6">
              Ritmi dinle ve aynı sırayla davulları çal! Her seviyede ritim daha uzun olur.
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white text-xl font-bold rounded-2xl"
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
            <div className="text-4xl font-bold text-purple-500 mb-4">🥁 Level {level}</div>
            <p className="text-gray-600 mb-6">
              Harika! {score} ritim doğru tekrarladın! 
              {score >= 10 ? ' Müzik yeteneğin süper!' : score >= 5 ? ' Çok iyi!' : ' Tekrar dene!'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white text-lg font-bold rounded-2xl"
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

export default RepeatRhythm;