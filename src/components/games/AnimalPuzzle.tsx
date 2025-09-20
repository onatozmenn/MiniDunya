import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { getSoundManager } from '../utils/SoundManager';

interface AnimalPuzzleProps {
  volume: number;
  onBack: () => void;
}

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number | null;
  emoji: string;
  color: string;
}

interface Animal {
  name: string;
  pieces: string[];
  colors: string[];
  completedEmoji: string;
}

const ANIMALS: Animal[] = [
  {
    name: 'Kedi',
    pieces: ['🐱', '🔥', '💖', '⭐'],
    colors: ['bg-orange-200', 'bg-red-200', 'bg-pink-200', 'bg-yellow-200'],
    completedEmoji: '🐱'
  },
  {
    name: 'Köpek', 
    pieces: ['🐶', '🦴', '⚽', '🌟'],
    colors: ['bg-brown-200', 'bg-gray-200', 'bg-blue-200', 'bg-green-200'],
    completedEmoji: '🐶'
  },
  {
    name: 'Fil',
    pieces: ['🐘', '🥜', '💧', '🍃'],
    colors: ['bg-gray-200', 'bg-amber-200', 'bg-cyan-200', 'bg-emerald-200'],
    completedEmoji: '🐘'
  },
  {
    name: 'Aslan',
    pieces: ['🦁', '👑', '🔥', '⭐'],
    colors: ['bg-yellow-200', 'bg-purple-200', 'bg-red-200', 'bg-orange-200'],
    completedEmoji: '🦁'
  }
];

export function AnimalPuzzle({ volume, onBack }: AnimalPuzzleProps) {
  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);
  const [showHint, setShowHint] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number }>({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  // Initialize puzzle
  const initializePuzzle = useCallback(() => {
    const animal = ANIMALS[currentAnimal];
    const pieces: PuzzlePiece[] = animal.pieces.map((emoji, index) => ({
      id: index,
      correctPosition: index,
      currentPosition: null,
      emoji,
      color: animal.colors[index]
    }));
    
    // Shuffle pieces
    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
    setPuzzlePieces(shuffledPieces);
    setPuzzleCompleted(false);
    setProgress(0);
    setShowHint(false);
    setConfetti([]);
  }, [currentAnimal]);

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    initializePuzzle();
  }, [initializePuzzle]);

  // Handle drag start
  const handleDragStart = useCallback((pieceId: number, event: React.MouseEvent | React.TouchEvent) => {
    setDraggedPiece(pieceId);
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      offsetX: 0,
      offsetY: 0
    };
  }, []);

  // Handle drop on puzzle slot
  const handleDrop = useCallback((slotIndex: number, pieceId: number) => {
    if (!gameStarted || puzzleCompleted) return;

    const piece = puzzlePieces.find(p => p.id === pieceId);
    if (!piece) return;

    // Check if the slot is already occupied
    const slotOccupied = puzzlePieces.some(p => p.currentPosition === slotIndex);
    if (slotOccupied && piece.currentPosition !== slotIndex) return;

    // Update piece position
    setPuzzlePieces(prev => 
      prev.map(p => 
        p.id === pieceId 
          ? { ...p, currentPosition: slotIndex }
          : p
      )
    );

    // Check if piece is in correct position
    const isCorrect = piece.correctPosition === slotIndex;
    
    if (isCorrect && volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playNote(440, 0.2); // Short success note
    }

    // Update progress
    setTimeout(() => {
      const correctPieces = puzzlePieces.filter(p => p.currentPosition === p.correctPosition).length;
      const newProgress = ((correctPieces + (isCorrect ? 1 : 0)) / 4) * 100;
      setProgress(newProgress);

      // Check if puzzle is complete
      if (newProgress === 100) {
        setPuzzleCompleted(true);
        
        // Play completion success sound
        if (volume > 0) {
          const soundManager = getSoundManager(volume);
          soundManager.playSuccess();
        }
        
        // Add confetti
        const newConfetti = Array.from({ length: 30 }, (_, i) => ({
          id: `${Date.now()}-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: ['text-yellow-400', 'text-pink-400', 'text-blue-400', 'text-green-400'][Math.floor(Math.random() * 4)]
        }));
        setConfetti(newConfetti);
        
        setTimeout(() => setConfetti([]), 3000);
      }
    }, 100);

    setDraggedPiece(null);
  }, [gameStarted, puzzleCompleted, puzzlePieces, volume]);

  // Next puzzle
  const nextPuzzle = useCallback(() => {
    const nextAnimal = (currentAnimal + 1) % ANIMALS.length;
    setCurrentAnimal(nextAnimal);
    initializePuzzle();
  }, [currentAnimal, initializePuzzle]);

  // Show hint
  const toggleHint = useCallback(() => {
    setShowHint(prev => !prev);
  }, []);

  const animal = ANIMALS[currentAnimal];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-200 via-pink-100 to-orange-100 dark:from-purple-800 dark:via-pink-900 dark:to-orange-900 relative overflow-hidden">
      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Button
          onClick={toggleHint}
          className="w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-lg text-2xl"
          disabled={!gameStarted}
        >
          💡
        </Button>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🔄
        </Button>
      </div>

      {/* Progress Bar */}
      {gameStarted && (
        <div className="absolute top-24 left-4 right-4 z-20">
          <Card className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="text-center mb-2">
              <div className="text-lg font-bold text-gray-800">{animal.name} Puzzle</div>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="text-center mt-2 text-sm text-gray-600">
              {Math.round(progress)}% Tamamlandı
            </div>
          </Card>
        </div>
      )}

      {/* Puzzle Grid (2x2) */}
      {gameStarted && (
        <div className="absolute top-48 left-1/2 transform -translate-x-1/2 z-10">
          <div className="grid grid-cols-2 gap-4 w-80 h-80">
            {Array.from({ length: 4 }, (_, slotIndex) => {
              const piece = puzzlePieces.find(p => p.currentPosition === slotIndex);
              const isCorrectPosition = piece && piece.correctPosition === slotIndex;
              
              return (
                <motion.div
                  key={slotIndex}
                  className={`
                    w-36 h-36 border-4 border-dashed border-gray-400 rounded-3xl flex items-center justify-center
                    ${piece ? piece.color : 'bg-white/50'}
                    ${showHint && !piece ? 'bg-green-200 border-green-400' : ''}
                    ${isCorrectPosition ? 'border-green-500 shadow-lg' : ''}
                    transition-all duration-300
                  `}
                  whileHover={{ scale: 1.05 }}
                  onMouseUp={() => draggedPiece !== null && handleDrop(slotIndex, draggedPiece)}
                  onTouchEnd={() => draggedPiece !== null && handleDrop(slotIndex, draggedPiece)}
                >
                  {piece && (
                    <div className="text-6xl">
                      {piece.emoji}
                    </div>
                  )}
                  {showHint && !piece && (
                    <div className="text-6xl opacity-50">
                      {animal.pieces[slotIndex]}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Piece Pool */}
      {gameStarted && (
        <div className="absolute bottom-24 left-4 right-4 z-20">
          <div className="flex justify-center gap-4 flex-wrap">
            {puzzlePieces
              .filter(piece => piece.currentPosition === null)
              .map(piece => (
                <motion.div
                  key={piece.id}
                  className={`
                    w-20 h-20 ${piece.color} rounded-2xl border-4 border-white shadow-lg 
                    flex items-center justify-center cursor-grab active:cursor-grabbing
                    ${draggedPiece === piece.id ? 'scale-110 z-50' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseDown={(e) => handleDragStart(piece.id, e)}
                  onTouchStart={(e) => handleDragStart(piece.id, e)}
                  drag
                  dragMomentum={false}
                  onDragEnd={() => setDraggedPiece(null)}
                >
                  <div className="text-4xl">
                    {piece.emoji}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Confetti Effect */}
      <AnimatePresence>
        {confetti.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ scale: 0, y: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1.5, 1],
              y: [0, -100, 150],
              x: [0, Math.random() * 200 - 100],
              rotate: [0, 360, 720],
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className={`absolute text-3xl ${piece.color}`}
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
      {!gameStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
        >
          <Card className="p-8 text-center bg-white rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Hayvan Puzzle!</h2>
            <p className="text-gray-600 mb-6">
              Parçaları sürükleyerek 2x2 puzzle'ı tamamla!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-xl font-bold rounded-2xl"
            >
              Oyunu Başlat! 🎮
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Puzzle Complete Screen */}
      {puzzleCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
        >
          <Card className="p-8 text-center bg-white rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">{animal.completedEmoji}</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tebrikler!</h2>
            <p className="text-gray-600 mb-6">
              {animal.name} puzzle'ını tamamladın! Harika iş! 🎉
            </p>
            <div className="space-y-3">
              <Button
                onClick={nextPuzzle}
                className="w-full h-14 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-2xl"
              >
                Sonraki Puzzle! 🧩
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

export default AnimalPuzzle;