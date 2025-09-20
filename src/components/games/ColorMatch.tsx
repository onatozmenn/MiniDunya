import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface ColorMatchProps {
  volume: number;
  onBack: () => void;
}

const COLORS = [
  { id: 'red', name: 'Kırmızı', color: 'bg-red-400', emoji: '🔴' },
  { id: 'blue', name: 'Mavi', color: 'bg-blue-400', emoji: '🔵' },
  { id: 'green', name: 'Yeşil', color: 'bg-green-400', emoji: '🟢' },
  { id: 'yellow', name: 'Sarı', color: 'bg-yellow-400', emoji: '🟡' },
];

export function ColorMatch({ volume, onBack }: ColorMatchProps) {
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, []);

  const handleColorClick = useCallback((clickedColor: typeof COLORS[0]) => {
    if (!gameStarted) return;

    if (clickedColor.id === targetColor.id) {
      // Correct!
      setScore(prev => prev + 1);
      setShowSuccess(true);
      
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playSuccess();
      }

      setTimeout(() => {
        setShowSuccess(false);
        setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }, 1500);
    } else {
      // Wrong
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playError();
      }
    }
  }, [gameStarted, targetColor, volume]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-300 via-pink-200 to-blue-200 relative overflow-hidden flex flex-col">
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
            {/* Target Color */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-12"
            >
              <Card className="p-8 bg-white/90 rounded-3xl shadow-xl text-center">
                <div className="text-6xl mb-4">{targetColor.emoji}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {targetColor.name} Rengini Bul!
                </div>
              </Card>
            </motion.div>

            {/* Color Options */}
            <div className="grid grid-cols-2 gap-6">
              {COLORS.map((color) => (
                <motion.button
                  key={color.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleColorClick(color)}
                  className={`w-32 h-32 ${color.color} rounded-3xl shadow-xl border-4 border-white flex items-center justify-center text-6xl transition-transform`}
                >
                  {color.emoji}
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center bg-white/90 rounded-3xl shadow-xl max-w-md">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Renk Eşleştirme!</h2>
            <p className="text-gray-600 mb-6">
              Gösterilen rengi bul ve dokun!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-xl font-bold rounded-2xl"
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
              <div className="text-2xl font-bold text-green-600">Harika!</div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ColorMatch;