import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface CountingFunProps {
  volume: number;
  onBack: () => void;
}

const OBJECTS = [
  { emoji: '🍎', name: 'elma' },
  { emoji: '🐱', name: 'kedi' },
  { emoji: '⭐', name: 'yıldız' },
  { emoji: '🚗', name: 'araba' },
  { emoji: '🎈', name: 'balon' },
  { emoji: '🦋', name: 'kelebek' }
];

export function CountingFun({ volume, onBack }: CountingFunProps) {
  const [currentObject, setCurrentObject] = useState(OBJECTS[0]);
  const [objectCount, setObjectCount] = useState(3);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const generateQuestion = useCallback(() => {
    const randomObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    const randomCount = Math.floor(Math.random() * 5) + 1; // 1-5 objects
    setCurrentObject(randomObject);
    setObjectCount(randomCount);
    setSelectedAnswer(null);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswerClick = useCallback((answer: number) => {
    if (!gameStarted || selectedAnswer !== null) return;

    setSelectedAnswer(answer);

    if (answer === objectCount) {
      // Correct!
      setScore(prev => prev + 1);
      setShowSuccess(true);
      
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playSuccess();
      }

      setTimeout(() => {
        setShowSuccess(false);
        generateQuestion();
      }, 2000);
    } else {
      // Wrong
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playError();
      }
      
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 1500);
    }
  }, [gameStarted, objectCount, volume, generateQuestion, selectedAnswer]);

  const getAnswerOptions = () => {
    const options = [objectCount];
    while (options.length < 4) {
      const randomNum = Math.floor(Math.random() * 5) + 1;
      if (!options.includes(randomNum)) {
        options.push(randomNum);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-yellow-300 via-orange-200 to-pink-200 relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Card className="px-6 py-3 bg-white/90 rounded-full shadow-lg">
          <div className="text-2xl font-bold text-gray-800">🌟 {score}</div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🎮
        </Button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        {gameStarted ? (
          <>
            {/* Question */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-8"
            >
              <Card className="p-6 bg-white/90 rounded-3xl shadow-xl text-center">
                <div className="text-xl font-bold text-gray-800 mb-4">
                  Kaç tane {currentObject.name} var?
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {Array.from({ length: objectCount }, (_, i) => (
                    <motion.div
                      key={i}
                      className="text-5xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {currentObject.emoji}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {getAnswerOptions().map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswerClick(option)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-24 h-24 rounded-3xl shadow-xl border-4 border-white text-4xl font-bold transition-all
                    ${selectedAnswer === option 
                      ? option === objectCount 
                        ? 'bg-green-400 text-white' 
                        : 'bg-red-400 text-white'
                      : 'bg-blue-400 hover:bg-blue-500 text-white'
                    }
                    ${selectedAnswer !== null ? 'opacity-60' : ''}
                  `}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Show correct answer */}
            {selectedAnswer !== null && selectedAnswer !== objectCount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-6"
              >
                <Card className="p-4 bg-white/90 rounded-2xl shadow-lg text-center">
                  <div className="text-lg font-bold text-gray-800">
                    Doğru cevap: {objectCount} ✨
                  </div>
                </Card>
              </motion.div>
            )}
          </>
        ) : (
          <Card className="p-8 text-center bg-white/90 rounded-3xl shadow-xl max-w-md">
            <div className="text-6xl mb-6">🔢</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Sayma Oyunu!</h2>
            <p className="text-gray-600 mb-6">
              Nesneleri say ve doğru sayıyı bul!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white text-xl font-bold rounded-2xl"
            >
              Başla! 🎮
            </Button>
          </Card>
        )}
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 z-50"
          >
            <Card className="p-8 bg-white rounded-3xl shadow-2xl text-center">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-2xl font-bold text-green-600">Doğru!</div>
              <div className="text-lg text-gray-600">Harika sayma! ⭐</div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CountingFun;