import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface SpatialPuzzleProps {
  volume: number;
  onBack: () => void;
}

interface PuzzlePiece {
  id: number;
  shape: string;
  emoji: string;
  color: string;
  frequency: number;
  note: string;
  size: number;
  rotation: number;
  x: number;
  y: number;
  isPlaced: boolean;
  targetX: number;
  targetY: number;
  isDragging: boolean;
}

interface Slot {
  id: number;
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOccupied: boolean;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  velocity: { x: number; y: number };
}

const PUZZLE_SHAPES = [
  { shape: 'circle', emoji: '🟢', color: '#22C55E', frequency: 261.63, note: 'C4' },
  { shape: 'square', emoji: '🟦', color: '#3B82F6', frequency: 293.66, note: 'D4' },
  { shape: 'triangle', emoji: '🔺', color: '#EF4444', frequency: 329.63, note: 'E4' },
  { shape: 'diamond', emoji: '🔷', color: '#8B5CF6', frequency: 349.23, note: 'F4' },
  { shape: 'hexagon', emoji: '⬡', color: '#F59E0B', frequency: 392.00, note: 'G4' },
  { shape: 'star', emoji: '⭐', color: '#EC4899', frequency: 440.00, note: 'A4' },
];

const DIFFICULTY_LEVELS = [
  { level: 1, pieces: 3, gridSize: 2, name: 'Kolay' },
  { level: 2, pieces: 4, gridSize: 2, name: 'Orta' },
  { level: 3, pieces: 6, gridSize: 3, name: 'Zor' },
];

export function SpatialPuzzle({ volume, onBack }: SpatialPuzzleProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [completedPieces, setCompletedPieces] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  
  const audioContext = useRef<AudioContext | null>(null);
  const puzzleAreaRef = useRef<HTMLDivElement>(null);
  const pieceIdCounter = useRef(0);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    initializeLevel(0);
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.8, isSuccess: boolean = false) => {
    if (!audioContext.current) return;

    if (isSuccess) {
      // Success chord
      const frequencies = [frequency, frequency * 1.25, frequency * 1.5];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.current!.createOscillator();
          const gainNode = audioContext.current!.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.current!.destination);

          oscillator.frequency.setValueAtTime(freq, audioContext.current!.currentTime);
          oscillator.type = 'triangle';

          gainNode.gain.setValueAtTime(0, audioContext.current!.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.current!.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current!.currentTime + duration);

          oscillator.start(audioContext.current!.currentTime);
          oscillator.stop(audioContext.current!.currentTime + duration);
        }, index * 150);
      });
    } else {
      // Single note
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.current.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + duration);
    }
  };

  const createParticle = (x: number, y: number, emoji: string) => {
    const particleId = particleIdCounter.current++;
    const newParticle: Particle = {
      id: particleId,
      x,
      y,
      emoji,
      velocity: {
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * -8 - 2
      }
    };

    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 2000);
  };

  const initializeLevel = (levelIndex: number) => {
    const level = DIFFICULTY_LEVELS[levelIndex];
    const selectedShapes = PUZZLE_SHAPES.slice(0, level.pieces);
    
    // Create slots in a grid pattern
    const newSlots: Slot[] = [];
    const slotSize = 80;
    const padding = 20;
    const startX = 150;
    const startY = 100;

    selectedShapes.forEach((shape, index) => {
      const row = Math.floor(index / level.gridSize);
      const col = index % level.gridSize;
      
      newSlots.push({
        id: index,
        shape: shape.shape,
        x: startX + col * (slotSize + padding),
        y: startY + row * (slotSize + padding),
        width: slotSize,
        height: slotSize,
        isOccupied: false,
        color: shape.color
      });
    });

    // Create puzzle pieces (scattered around)
    const newPieces: PuzzlePiece[] = selectedShapes.map((shape, index) => ({
      id: pieceIdCounter.current++,
      shape: shape.shape,
      emoji: shape.emoji,
      color: shape.color,
      frequency: shape.frequency,
      note: shape.note,
      size: 60,
      rotation: Math.random() * 360,
      x: 50 + Math.random() * 300,
      y: 300 + Math.random() * 150,
      isPlaced: false,
      targetX: newSlots[index].x,
      targetY: newSlots[index].y,
      isDragging: false
    }));

    setSlots(newSlots);
    setPieces(newPieces);
    setCompletedPieces(0);
    setIsCompleted(false);
    setShowCelebration(false);
  };

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };

  const handlePiecePress = (pieceId: number, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setDraggedPiece(pieceId);
    
    setPieces(prev => prev.map(piece => 
      piece.id === pieceId ? { ...piece, isDragging: true } : piece
    ));

    const piece = pieces.find(p => p.id === pieceId);
    if (piece) {
      playNote(piece.frequency, 0.3);
    }
  };

  const handlePieceMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (draggedPiece === null || !puzzleAreaRef.current) return;

    event.preventDefault();
    const rect = puzzleAreaRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setPieces(prev => prev.map(piece => 
      piece.id === draggedPiece ? { ...piece, x: x - 30, y: y - 30 } : piece
    ));
  };

  const handlePieceRelease = () => {
    if (draggedPiece === null) return;

    const piece = pieces.find(p => p.id === draggedPiece);
    if (!piece) return;

    // Find the closest matching slot
    const matchingSlot = slots.find(slot => 
      slot.shape === piece.shape && !slot.isOccupied
    );

    if (matchingSlot) {
      const distance = getDistance(piece.x + 30, piece.y + 30, matchingSlot.x + 40, matchingSlot.y + 40);
      
      if (distance < 60) {
        // Snap to slot
        setPieces(prev => prev.map(p => 
          p.id === draggedPiece ? {
            ...p,
            x: matchingSlot.x + 10,
            y: matchingSlot.y + 10,
            isPlaced: true,
            isDragging: false,
            rotation: 0
          } : p
        ));

        setSlots(prev => prev.map(slot => 
          slot.id === matchingSlot.id ? { ...slot, isOccupied: true } : slot
        ));

        // Success effects
        playNote(piece.frequency, 1.2, true);
        createParticle(matchingSlot.x + 40, matchingSlot.y + 40, piece.emoji);
        createParticle(matchingSlot.x + 20, matchingSlot.y + 20, '✨');
        createParticle(matchingSlot.x + 60, matchingSlot.y + 60, '⭐');

        const newCompletedPieces = completedPieces + 1;
        setCompletedPieces(newCompletedPieces);
        setScore(prev => prev + (currentLevel + 1) * 100);

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        // Check level completion
        if (newCompletedPieces === DIFFICULTY_LEVELS[currentLevel].pieces) {
          setIsCompleted(true);
          setShowCelebration(true);
          
          setTimeout(() => {
            setShowCelebration(false);
            if (currentLevel < DIFFICULTY_LEVELS.length - 1) {
              // Next level
              setTimeout(() => {
                setCurrentLevel(prev => prev + 1);
                initializeLevel(currentLevel + 1);
              }, 1000);
            }
          }, 3000);
        }
      } else {
        // Snap back
        setPieces(prev => prev.map(p => 
          p.id === draggedPiece ? { ...p, isDragging: false } : p
        ));
      }
    } else {
      // Snap back
      setPieces(prev => prev.map(p => 
        p.id === draggedPiece ? { ...p, isDragging: false } : p
      ));
    }

    setDraggedPiece(null);
  };

  const restartLevel = () => {
    initializeLevel(currentLevel);
  };

  const nextLevel = () => {
    if (currentLevel < DIFFICULTY_LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      initializeLevel(currentLevel + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(prev => prev - 1);
      initializeLevel(currentLevel - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          ←
        </Button>
        
        <div className="text-center">
          <div className="text-6xl">🧩</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            3D Puzzle
          </div>
          <div className="text-sm opacity-80">
            {DIFFICULTY_LEVELS[currentLevel].name} | Puan: {score}
          </div>
        </div>
        
        <Button
          onClick={restartLevel}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🔄
        </Button>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-lg font-bold">
              İlerleme: {completedPieces}/{DIFFICULTY_LEVELS[currentLevel].pieces}
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: DIFFICULTY_LEVELS[currentLevel].pieces }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < completedPieces ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Puzzle Area */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-br from-violet-200/80 via-purple-200/80 to-fuchsia-200/80 dark:from-violet-800/40 dark:via-purple-800/40 dark:to-fuchsia-800/40 min-h-[500px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 via-purple-100/50 to-fuchsia-100/50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20 rounded-[2rem]" />
        
        {/* 3D Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 400 500">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div
          ref={puzzleAreaRef}
          className="relative w-full h-[500px]"
          onMouseMove={handlePieceMove}
          onMouseUp={handlePieceRelease}
          onTouchMove={handlePieceMove}
          onTouchEnd={handlePieceRelease}
        >
          {/* Slots */}
          {slots.map((slot) => (
            <motion.div
              key={slot.id}
              className="absolute border-4 border-dashed rounded-2xl flex items-center justify-center"
              style={{
                left: slot.x,
                top: slot.y,
                width: slot.width,
                height: slot.height,
                borderColor: slot.isOccupied ? 'transparent' : slot.color,
                backgroundColor: slot.isOccupied ? 'transparent' : `${slot.color}20`
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: slot.id * 0.1, duration: 0.6, type: "spring", bounce: 0.8 }}
            >
              {!slot.isOccupied && (
                <div className="text-4xl opacity-50">
                  {PUZZLE_SHAPES.find(s => s.shape === slot.shape)?.emoji}
                </div>
              )}
            </motion.div>
          ))}

          {/* Puzzle Pieces */}
          <AnimatePresence>
            {pieces.map((piece) => (
              <motion.div
                key={piece.id}
                className={`
                  absolute cursor-pointer select-none flex items-center justify-center
                  rounded-2xl border-4 border-white/70 shadow-xl
                  ${piece.isDragging ? 'z-50 scale-110' : 'z-10'}
                  ${piece.isPlaced ? 'cursor-default' : 'cursor-grab'}
                `}
                style={{
                  left: piece.x,
                  top: piece.y,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`
                }}
                initial={{ scale: 0, rotate: -360 }}
                animate={{ 
                  scale: piece.isDragging ? 1.2 : 1,
                  rotate: piece.isPlaced ? 0 : piece.rotation
                }}
                exit={{ scale: 0, rotate: 360 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.6 }}
                onMouseDown={(e) => !piece.isPlaced && handlePiecePress(piece.id, e)}
                onTouchStart={(e) => !piece.isPlaced && handlePiecePress(piece.id, e)}
                whileHover={{ scale: piece.isPlaced ? 1 : 1.1 }}
              >
                <div className="text-3xl drop-shadow-lg">
                  {piece.emoji}
                </div>
                
                {/* Glow effect for dragging */}
                {piece.isDragging && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-4 border-yellow-300"
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
                
                {/* Success sparkles */}
                {piece.isPlaced && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-2 -left-2 text-yellow-400 text-lg">✨</div>
                    <div className="absolute -top-1 -right-2 text-yellow-400 text-sm">⭐</div>
                    <div className="absolute -bottom-1 -left-1 text-yellow-400 text-sm">💫</div>
                    <div className="absolute -bottom-2 -right-1 text-yellow-400 text-lg">🌟</div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: particle.x - 10, top: particle.y - 10 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: particle.velocity.x * 50,
                  y: particle.velocity.y * 30
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {pieces.length > 0 && completedPieces === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-6xl">👆</div>
                <div className="text-xl font-bold">Şekilleri sürükle</div>
                <div className="text-lg">Doğru yerlere yerleştir! 🧩</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Level Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={prevLevel}
          disabled={currentLevel === 0}
          variant="outline"
          className="rounded-2xl px-6 py-3 text-lg"
        >
          ← Önceki Seviye
        </Button>
        
        <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 rounded-2xl px-4 py-2 backdrop-blur-sm">
          <span className="text-lg font-bold">
            Seviye {currentLevel + 1}
          </span>
        </div>
        
        <Button
          onClick={nextLevel}
          disabled={currentLevel === DIFFICULTY_LEVELS.length - 1 || !isCompleted}
          variant="outline"
          className="rounded-2xl px-6 py-3 text-lg"
        >
          Sonraki Seviye →
        </Button>
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <motion.div
              className="text-center space-y-4"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <div className="text-8xl">🎉</div>
              <div className="text-4xl font-bold text-violet-400 drop-shadow-lg">
                Tebrikler!
              </div>
              <div className="text-2xl text-white drop-shadow-lg">
                Seviye {currentLevel + 1} Tamamlandı!
              </div>
            </motion.div>
            
            {/* Confetti */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-50, 100, -50],
                  x: [-50, 50, -50],
                  rotate: [0, 360, 720],
                  scale: [0, 2, 0]
                }}
                transition={{
                  duration: 3,
                  ease: "easeOut"
                }}
              >
                {['🧩', '🎊', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-violet-200/80 to-purple-200/80 dark:from-violet-600/20 dark:to-purple-600/20 border-4 border-violet-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🧩</div>
            <div className="text-lg font-bold">3D Uzamsal Puzzle</div>
            <div className="text-sm opacity-80">
              Şekilleri doğru yerlerine sürükle! Her doğru yerleştirme müzik çalar! 🎵✨
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}