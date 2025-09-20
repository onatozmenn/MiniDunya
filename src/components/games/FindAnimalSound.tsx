import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface FindAnimalSoundProps {
  volume: number;
  onBack: () => void;
}

interface Animal {
  id: string;
  name: string;
  emoji: string;
  sound: string;
  color: string;
}

const ANIMALS: Animal[] = [
  { id: 'dog', name: 'Köpek', emoji: '🐶', sound: 'Hav hav!', color: 'bg-yellow-300' },
  { id: 'cat', name: 'Kedi', emoji: '🐱', sound: 'Miyav!', color: 'bg-orange-300' },
  { id: 'cow', name: 'İnek', emoji: '🐮', sound: 'Möö!', color: 'bg-pink-300' },
  { id: 'bird', name: 'Kuş', emoji: '🐦', sound: 'Cik cik!', color: 'bg-blue-300' },
  { id: 'sheep', name: 'Koyun', emoji: '🐑', sound: 'Bee!', color: 'bg-green-300' },
  { id: 'pig', name: 'Domuz', emoji: '🐷', sound: 'Oink!', color: 'bg-purple-300' },
  { id: 'duck', name: 'Ördek', emoji: '🦆', sound: 'Vak vak!', color: 'bg-cyan-300' },
  { id: 'horse', name: 'At', emoji: '🐴', sound: 'Kişne!', color: 'bg-amber-300' }
];

export function FindAnimalSound({ volume, onBack }: FindAnimalSoundProps) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);

  const totalRounds = 10;

  // Start new game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setRound(0);
    setSelectedAnimal(null);
    setShowResult(false);
    setConfetti([]);
    startNewRound();
  }, []);

  // Start a new round
  const startNewRound = useCallback(() => {
    const shuffledAnimals = [...ANIMALS].sort(() => Math.random() - 0.5);
    const correctAnimal = shuffledAnimals[0];
    const wrongAnimals = shuffledAnimals.slice(1, 4);
    const roundOptions = [correctAnimal, ...wrongAnimals].sort(() => Math.random() - 0.5);
    
    setCurrentAnimal(correctAnimal);
    setOptions(roundOptions);
    setSelectedAnimal(null);
    setShowResult(false);
    setRound(prev => prev + 1);
  }, []);

  // Play animal sound
  const playSound = useCallback(() => {
    if (!currentAnimal || volume === 0) return;
    
    const soundManager = getSoundManager(volume);
    soundManager.playAnimalSound(currentAnimal.id);
  }, [currentAnimal, volume]);

  // Handle animal selection
  const handleAnimalSelect = useCallback((animal: Animal) => {
    if (selectedAnimal || showResult) return;

    setSelectedAnimal(animal.id);
    const correct = animal.id === currentAnimal?.id;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + 1);
      
      // Play success sound
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playSuccess();
      }
      
      // Add confetti effect
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['text-yellow-400', 'text-pink-400', 'text-blue-400', 'text-green-400'][Math.floor(Math.random() * 4)]
      }));
      setConfetti(newConfetti);
      
      setTimeout(() => setConfetti([]), 2000);
    } else {
      // Play error sound
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playError();
      }
    }

    // Continue to next round after delay
    setTimeout(() => {
      if (round >= totalRounds) {
        setGameEnded(true);
        setGameStarted(false);
      } else {
        startNewRound();
      }
    }, 2000);
  }, [selectedAnimal, showResult, currentAnimal, round, totalRounds, startNewRound]);

  // Auto-start first round when game starts
  useEffect(() => {
    if (gameStarted && round === 0) {
      startNewRound();
    }
  }, [gameStarted, round, startNewRound]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-200 via-emerald-100 to-teal-100 dark:from-green-800 dark:via-emerald-900 dark:to-teal-900 relative overflow-hidden">
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
            <div className="text-2xl font-bold text-gray-800">🌟 {score}/{totalRounds}</div>
            <div className="text-sm text-gray-600">Puan</div>
          </div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🔄
        </Button>
      </div>

      {/* Round Progress */}
      {gameStarted && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="px-4 py-2 bg-blue-400 text-white rounded-full shadow-lg">
            <div className="text-lg font-bold">Round {round}/{totalRounds}</div>
          </Card>
        </div>
      )}

      {/* Play Sound Button */}
      {gameStarted && currentAnimal && !showResult && (
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playSound}
            className="w-24 h-24 bg-red-400 hover:bg-red-500 rounded-full shadow-lg text-4xl flex items-center justify-center"
          >
            🔊
          </motion.button>
          <div className="text-center mt-2 text-white font-bold">
            Sesi Dinle!
          </div>
        </div>
      )}

      {/* Animal Options */}
      {gameStarted && options.length > 0 && (
        <div className="absolute bottom-32 left-4 right-4 z-20">
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {options.map((animal) => (
              <motion.div
                key={animal.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnimalSelect(animal)}
                className={`
                  ${animal.color} rounded-3xl shadow-lg p-6 cursor-pointer border-4 border-white
                  ${selectedAnimal === animal.id ? 'ring-4 ring-blue-400' : ''}
                  ${showResult && selectedAnimal === animal.id && isCorrect ? 'bg-green-400' : ''}
                  ${showResult && selectedAnimal === animal.id && !isCorrect ? 'bg-red-400' : ''}
                  ${showResult && animal.id === currentAnimal?.id ? 'ring-4 ring-green-500' : ''}
                  transition-all duration-300
                `}
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">{animal.emoji}</div>
                  <div className="text-lg font-bold text-gray-800">{animal.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Result Feedback */}
      {showResult && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
        >
          <Card className="p-6 bg-white rounded-3xl shadow-2xl text-center">
            <div className="text-4xl mb-2">
              {isCorrect ? '🎉' : '🤗'}
            </div>
            <div className="text-xl font-bold text-gray-800">
              {isCorrect ? 'Harika!' : 'Tekrar dene!'}
            </div>
            {!isCorrect && currentAnimal && (
              <div className="text-sm text-gray-600 mt-2">
                Doğru cevap: {currentAnimal.name} {currentAnimal.emoji}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Confetti Effect */}
      <AnimatePresence>
        {confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ scale: 0, y: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1.5, 1],
              y: [0, -100, 100],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={`absolute text-2xl ${piece.color}`}
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
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
            <div className="text-6xl mb-4">🐮</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Hayvan Sesini Bul!</h2>
            <p className="text-gray-600 mb-6">
              Hayvan seslerini dinle ve doğru hayvanı seç!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white text-xl font-bold rounded-2xl"
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
            <div className="text-4xl font-bold text-emerald-500 mb-4">🌟 {score}/{totalRounds}</div>
            <p className="text-gray-600 mb-6">
              {score >= 8 ? 'Mükemmel!' : score >= 6 ? 'Çok iyi!' : score >= 4 ? 'İyi!' : 'Tekrar dene!'} 
              {' '}{score} doğru cevap verdin!
            </p>
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-bold rounded-2xl"
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

export default FindAnimalSound;