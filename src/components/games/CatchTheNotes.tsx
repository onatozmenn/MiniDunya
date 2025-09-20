import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface CatchTheNotesProps {
  volume: number;
  onBack: () => void;
}

interface FallingNote {
  id: string;
  color: string;
  x: number;
  y: number;
  targetKey: number;
  speed: number;
}

const NOTE_COLORS = [
  { color: 'bg-red-400', key: 0, sound: 'C' },
  { color: 'bg-yellow-400', key: 1, sound: 'D' },
  { color: 'bg-green-400', key: 2, sound: 'E' },
  { color: 'bg-blue-400', key: 3, sound: 'F' },
  { color: 'bg-purple-400', key: 4, sound: 'G' }
];

export function CatchTheNotes({ volume, onBack }: CatchTheNotesProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const gameRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const spawnRef = useRef<NodeJS.Timeout>();

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(60);
    setFallingNotes([]);
    setSparkles([]);
  }, []);

  // Spawn falling notes
  const spawnNote = useCallback(() => {
    if (!gameStarted || gameEnded) return;

    const noteType = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    const newNote: FallingNote = {
      id: Math.random().toString(36).substr(2, 9),
      color: noteType.color,
      x: Math.random() * 80 + 10, // 10-90% width
      y: -10,
      targetKey: noteType.key,
      speed: Math.random() * 2 + 3 // 3-5 speed
    };

    setFallingNotes(prev => [...prev, newNote]);
  }, [gameStarted, gameEnded]);

  // Game timer and note movement
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

      // Move notes down
      setFallingNotes(prev => 
        prev.map(note => ({ ...note, y: note.y + note.speed }))
          .filter(note => note.y < 100) // Remove notes that fell off screen
      );
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameStarted, gameEnded]);

  // Spawn notes periodically
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    spawnRef.current = setInterval(() => {
      spawnNote();
    }, 2000 + Math.random() * 1000); // Every 2-3 seconds

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameStarted, gameEnded, spawnNote]);

  // Handle piano key press
  const handleKeyPress = useCallback((keyIndex: number) => {
    if (!gameStarted || gameEnded) return;

    // Find notes near the piano (bottom 20% of screen) that match this key
    const catchableNotes = fallingNotes.filter(note => 
      note.y > 70 && note.y < 90 && note.targetKey === keyIndex
    );

    if (catchableNotes.length > 0) {
      // Success! Catch the note
      const caughtNote = catchableNotes[0];
      setScore(prev => prev + 1);
      
      // Add sparkle effect
      const sparkle = {
        id: Math.random().toString(36).substr(2, 9),
        x: caughtNote.x,
        y: caughtNote.y
      };
      setSparkles(prev => [...prev, sparkle]);
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
      }, 1000);

      // Remove caught note
      setFallingNotes(prev => prev.filter(note => note.id !== caughtNote.id));

      // Play success sound
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        const noteFreq = soundManager.getPianoFrequency(NOTE_COLORS[keyIndex].sound);
        soundManager.playNote(noteFreq, 0.3);
        soundManager.playSuccess();
      }
    }
  }, [gameStarted, gameEnded, fallingNotes, volume]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-cyan-100 dark:from-sky-800 dark:via-blue-900 dark:to-cyan-900 relative overflow-hidden">
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

      {/* Timer */}
      {gameStarted && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="px-4 py-2 bg-orange-400 text-white rounded-full shadow-lg">
            <div className="text-xl font-bold">⏰ {timeLeft}s</div>
          </Card>
        </div>
      )}

      {/* Game Area */}
      <div 
        ref={gameRef}
        className="absolute inset-0 pt-32 pb-32"
      >
        {/* Falling Notes */}
        <AnimatePresence>
          {fallingNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute w-16 h-16 ${note.color} rounded-full shadow-lg flex items-center justify-center text-2xl border-4 border-white`}
              style={{
                left: `${note.x}%`,
                top: `${note.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🎵
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Sparkle Effects */}
        <AnimatePresence>
          {sparkles.map(sparkle => (
            <motion.div
              key={sparkle.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-4xl"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              ✨
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Piano Keys */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
          {NOTE_COLORS.map((noteColor, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(index)}
              className={`h-20 ${noteColor.color} rounded-2xl shadow-lg text-white text-xl font-bold border-4 border-white flex items-center justify-center transition-all duration-200`}
              disabled={!gameStarted || gameEnded}
            >
              {noteColor.sound}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start Screen */}
      {!gameStarted && !gameEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
        >
          <Card className="p-8 text-center bg-white rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Notaları Yakala!</h2>
            <p className="text-gray-600 mb-6">
              Düşen renkli notaları doğru piyano tuşuna basarak yakala!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white text-xl font-bold rounded-2xl"
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
            <div className="text-4xl font-bold text-orange-500 mb-4">🌟 {score}</div>
            <p className="text-gray-600 mb-6">
              Harika iş çıkardın! {score} nota yakaladın!
            </p>
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white text-lg font-bold rounded-2xl"
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

export default CatchTheNotes;