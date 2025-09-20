import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface MusicalMemoryProps {
  volume: number;
  onBack: () => void;
}

interface SequenceNote {
  id: number;
  color: string;
  emoji: string;
  frequency: number;
  note: string;
}

const MEMORY_NOTES: SequenceNote[] = [
  { id: 0, color: '#FF6B9D', emoji: '🐱', frequency: 261.63, note: 'C4' },
  { id: 1, color: '#FF8E53', emoji: '🐶', frequency: 293.66, note: 'D4' },
  { id: 2, color: '#FFD93D', emoji: '🦆', frequency: 329.63, note: 'E4' },
  { id: 3, color: '#6BCF7F', emoji: '🐸', frequency: 349.23, note: 'F4' },
  { id: 4, color: '#4D96FF', emoji: '🐦', frequency: 392.00, note: 'G4' },
  { id: 5, color: '#9B59B6', emoji: '🐭', frequency: 440.00, note: 'A4' },
];

export function MusicalMemory({ volume, onBack }: MusicalMemoryProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);
  const playbackTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (playbackTimeout.current) {
        clearTimeout(playbackTimeout.current);
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.6) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, audioContext.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const startGame = () => {
    setSequence([Math.floor(Math.random() * MEMORY_NOTES.length)]);
    setPlayerSequence([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      playSequence([Math.floor(Math.random() * MEMORY_NOTES.length)]);
    }, 1000);
  };

  const playSequence = (seq: number[]) => {
    setIsPlaying(true);
    setIsPlayerTurn(false);
    
    seq.forEach((noteId, index) => {
      setTimeout(() => {
        setActiveNote(noteId);
        playNote(MEMORY_NOTES[noteId].frequency);
        
        setTimeout(() => {
          setActiveNote(null);
          if (index === seq.length - 1) {
            setTimeout(() => {
              setIsPlaying(false);
              setIsPlayerTurn(true);
            }, 500);
          }
        }, 400);
      }, index * 800);
    });
  };

  const handleNoteClick = (noteId: number) => {
    if (!isPlayerTurn || isPlaying || gameOver) return;

    playNote(MEMORY_NOTES[noteId].frequency);
    setActiveNote(noteId);
    
    setTimeout(() => setActiveNote(null), 300);

    const newPlayerSequence = [...playerSequence, noteId];
    setPlayerSequence(newPlayerSequence);

    // Check if correct
    if (noteId !== sequence[newPlayerSequence.length - 1]) {
      // Wrong note - game over
      setGameOver(true);
      setIsPlayerTurn(false);
      
      // Play error sound
      setTimeout(() => {
        playNote(150, 0.8); // Low error tone
      }, 300);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      return;
    }

    // Check if sequence completed
    if (newPlayerSequence.length === sequence.length) {
      // Success! Add new note to sequence
      setScore(prev => prev + sequence.length * 10);
      setLevel(prev => prev + 1);
      setShowCelebration(true);
      
      setTimeout(() => setShowCelebration(false), 1500);
      
      // Play success sound
      setTimeout(() => {
        playNote(523.25, 0.3); // C5 
        setTimeout(() => playNote(659.25, 0.3), 150); // E5
        setTimeout(() => playNote(783.99, 0.5), 300); // G5
      }, 300);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      // Generate new sequence
      const newSequence = [...sequence, Math.floor(Math.random() * MEMORY_NOTES.length)];
      setSequence(newSequence);
      setPlayerSequence([]);
      
      setTimeout(() => {
        playSequence(newSequence);
      }, 2000);
    }
  };

  const resetGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(false);
    setIsPlayerTurn(false);
    setActiveNote(null);
    setShowCelebration(false);
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
          <div className="text-6xl">🧠</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Hafıza Oyunu
          </div>
          <div className="text-sm opacity-80">Seviye: {level} | Puan: {score}</div>
        </div>
        
        <Button
          onClick={resetGame}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🔄
        </Button>
      </motion.div>

      {/* Game Status */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="text-lg font-bold">
            {!sequence.length ? (
              <span className="text-blue-600">🎮 Oyuna hazır mısın?</span>
            ) : isPlaying ? (
              <span className="text-orange-600">👀 Sırayı izle ve hatırla!</span>
            ) : isPlayerTurn ? (
              <span className="text-green-600">🎯 Şimdi sen tekrarla!</span>
            ) : gameOver ? (
              <span className="text-red-600">😢 Yanlış! Tekrar dene?</span>
            ) : (
              <span className="text-purple-600">🌟 Harika! Yeni seviye!</span>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Game Notes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
        {MEMORY_NOTES.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.6,
              type: "spring",
              bounce: 0.8
            }}
            whileHover={{ scale: isPlayerTurn ? 1.1 : 1.05 }}
            whileTap={{ scale: isPlayerTurn ? 0.9 : 0.95 }}
          >
            <Button
              className={`
                w-full h-32 rounded-3xl border-4 shadow-2xl relative overflow-hidden
                transition-all duration-300 
                ${activeNote === note.id ? 'scale-110 shadow-[0_0_40px_rgba(255,255,255,0.8)] border-white' : 'border-white/50'}
                ${!isPlayerTurn && !isPlaying ? 'opacity-60' : 'opacity-100'}
                ${isPlayerTurn ? 'hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''}
              `}
              style={{ backgroundColor: note.color }}
              onClick={() => handleNoteClick(note.id)}
              disabled={!isPlayerTurn || isPlaying || gameOver}
            >
              <div className="text-center space-y-2">
                <motion.div 
                  className="text-5xl"
                  animate={activeNote === note.id ? {
                    scale: [1, 1.4, 1],
                    rotate: [0, 15, -15, 0]
                  } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {note.emoji}
                </motion.div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {note.note}
                </div>
              </div>
              
              {/* Pulse effect when active */}
              {activeNote === note.id && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 0.4 }}
                />
              )}
              
              {/* Sparkle effects when clicked */}
              {activeNote === note.id && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-2 text-yellow-300 text-2xl">✨</div>
                  <div className="absolute top-3 right-3 text-yellow-300 text-xl">⭐</div>
                  <div className="absolute bottom-2 left-3 text-yellow-300 text-xl">💫</div>
                  <div className="absolute bottom-3 right-2 text-yellow-300 text-2xl">🌟</div>
                </div>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        {!sequence.length ? (
          <Button
            onClick={startGame}
            className="rounded-2xl px-8 py-4 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0 shadow-xl"
          >
            🎮 Oyunu Başlat
          </Button>
        ) : gameOver ? (
          <div className="flex space-x-4">
            <Button
              onClick={startGame}
              className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0"
            >
              🔄 Tekrar Oyna
            </Button>
            <Button
              onClick={() => playSequence(sequence)}
              disabled={isPlaying}
              className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white border-0"
            >
              🔁 Sırayı Tekrar Dinle
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => playSequence(sequence)}
            disabled={isPlaying || !isPlayerTurn}
            className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white border-0"
          >
            🔁 Sırayı Tekrar Dinle
          </Button>
        )}
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
              transition={{ duration: 0.5 }}
            >
              <div className="text-8xl">🎉</div>
              <div className="text-4xl font-bold text-yellow-400 drop-shadow-lg">
                Harika!
              </div>
              <div className="text-2xl text-white drop-shadow-lg">
                Seviye {level}!
              </div>
            </motion.div>
            
            {/* Confetti */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-50, 50, -50],
                  x: [-30, 30, -30],
                  rotate: [0, 360],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut"
                }}
              >
                {['🎊', '🎉', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
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
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-purple-200/80 to-pink-200/80 dark:from-purple-600/20 dark:to-pink-600/20 border-4 border-purple-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🧠</div>
            <div className="text-lg font-bold">Hafıza Oyunu</div>
            <div className="text-sm opacity-80">
              Sırayı dinle, hatırla ve aynısını tekrarla! Her seviyede bir nota daha eklenir! 🎵✨
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}