import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface DancePartyProps {
  volume: number;
  onBack: () => void;
}

interface DanceMove {
  id: number;
  emoji: string;
  name: string;
  beat: number;
  color: string;
  frequency: number;
}

interface Dancer {
  id: number;
  emoji: string;
  x: number;
  y: number;
  isMoving: boolean;
  currentMove: string;
  color: string;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const DANCE_MOVES: DanceMove[] = [
  { id: 0, emoji: '👏', name: 'Alkış', beat: 1, color: '#FF6B9D', frequency: 261.63 },
  { id: 1, emoji: '🙌', name: 'Eller Yukarı', beat: 2, color: '#FF8E53', frequency: 293.66 },
  { id: 2, emoji: '👐', name: 'Açık Eller', beat: 1, color: '#FFD93D', frequency: 329.63 },
  { id: 3, emoji: '✋', name: 'Dur İşareti', beat: 2, color: '#6BCF7F', frequency: 349.23 },
  { id: 4, emoji: '👋', name: 'Sallamak', beat: 3, color: '#4D96FF', frequency: 392.00 },
  { id: 5, emoji: '🤚', name: 'Açık El', beat: 1, color: '#9B59B6', frequency: 440.00 },
];

const DANCE_EMOJIS = ['🐱', '🐶', '🦆', '🐸', '🐦', '🐭', '🦊', '🐼'];

export function DanceParty({ volume, onBack }: DancePartyProps) {
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tempo, setTempo] = useState(120); // BPM
  const [score, setScore] = useState(0);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [selectedMove, setSelectedMove] = useState(DANCE_MOVES[0]);
  
  const audioContext = useRef<AudioContext | null>(null);
  const danceFloorRef = useRef<HTMLDivElement>(null);
  const beatInterval = useRef<NodeJS.Timeout | null>(null);
  const dancerIdCounter = useRef(0);
  const fireworkIdCounter = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (beatInterval.current) {
        clearInterval(beatInterval.current);
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.3) => {
    if (!audioContext.current) return;

    // Create multiple oscillators for rich dance beat
    const kick = audioContext.current.createOscillator();
    const snare = audioContext.current.createOscillator();
    const hihat = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    kick.connect(gainNode);
    snare.connect(gainNode);
    hihat.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    // Kick drum (low frequency)
    kick.frequency.setValueAtTime(frequency * 0.5, audioContext.current.currentTime);
    kick.type = 'triangle';

    // Snare (mid frequency)
    snare.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    snare.type = 'square';

    // Hi-hat (high frequency)
    hihat.frequency.setValueAtTime(frequency * 2, audioContext.current.currentTime);
    hihat.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    kick.start(audioContext.current.currentTime);
    snare.start(audioContext.current.currentTime);
    hihat.start(audioContext.current.currentTime);
    kick.stop(audioContext.current.currentTime + duration);
    snare.stop(audioContext.current.currentTime + duration);
    hihat.stop(audioContext.current.currentTime + duration);
  };

  const addDancer = (event: React.MouseEvent) => {
    if (!danceFloorRef.current) return;
    
    const rect = danceFloorRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newDancer: Dancer = {
      id: dancerIdCounter.current++,
      emoji: DANCE_EMOJIS[Math.floor(Math.random() * DANCE_EMOJIS.length)],
      x,
      y,
      isMoving: false,
      currentMove: '🕺',
      color: DANCE_MOVES[Math.floor(Math.random() * DANCE_MOVES.length)].color
    };

    setDancers(prev => [...prev, newDancer]);
    createFirework(x, y, '✨');

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const createFirework = (x: number, y: number, emoji: string) => {
    const fireworkId = fireworkIdCounter.current++;
    const newFirework: Firework = {
      id: fireworkId,
      x,
      y,
      emoji
    };

    setFireworks(prev => [...prev, newFirework]);

    setTimeout(() => {
      setFireworks(prev => prev.filter(f => f.id !== fireworkId));
    }, 1000);
  };

  const startDanceParty = () => {
    if (dancers.length === 0) {
      // Add some default dancers
      const defaultDancers: Dancer[] = [
        { id: 0, emoji: '🐱', x: 150, y: 200, isMoving: false, currentMove: '🕺', color: '#FF6B9D' },
        { id: 1, emoji: '🐶', x: 350, y: 200, isMoving: false, currentMove: '🕺', color: '#FF8E53' },
        { id: 2, emoji: '🦆', x: 250, y: 150, isMoving: false, currentMove: '🕺', color: '#FFD93D' },
      ];
      setDancers(defaultDancers);
      dancerIdCounter.current = 3;
    }

    setIsPlaying(true);
    setCurrentBeat(0);
    
    const beatDuration = 60000 / tempo; // ms per beat
    
    beatInterval.current = setInterval(() => {
      setCurrentBeat(prev => {
        const newBeat = prev + 1;
        
        // Make dancers move
        setDancers(prevDancers => prevDancers.map(dancer => {
          const randomMove = DANCE_MOVES[Math.floor(Math.random() * DANCE_MOVES.length)];
          return {
            ...dancer,
            isMoving: true,
            currentMove: randomMove.emoji
          };
        }));

        // Play beat sound
        const randomMove = DANCE_MOVES[Math.floor(Math.random() * DANCE_MOVES.length)];
        playNote(randomMove.frequency);

        // Stop movement after beat
        setTimeout(() => {
          setDancers(prevDancers => prevDancers.map(dancer => ({
            ...dancer,
            isMoving: false
          })));
        }, beatDuration * 0.7);

        // Create random fireworks
        if (Math.random() > 0.7) {
          const x = Math.random() * 400 + 50;
          const y = Math.random() * 300 + 50;
          createFirework(x, y, ['🎉', '✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 5)]);
        }

        return newBeat;
      });
    }, beatDuration);
  };

  const stopDanceParty = () => {
    setIsPlaying(false);
    if (beatInterval.current) {
      clearInterval(beatInterval.current);
      beatInterval.current = null;
    }
    
    setDancers(prev => prev.map(dancer => ({
      ...dancer,
      isMoving: false,
      currentMove: '🕺'
    })));
  };

  const handleMoveClick = (move: DanceMove) => {
    if (!isPlaying) return;
    
    setSelectedMove(move);
    playNote(move.frequency);
    setScore(prev => prev + move.beat * 10);
    
    // Make all dancers do this move
    setDancers(prev => prev.map(dancer => ({
      ...dancer,
      currentMove: move.emoji,
      isMoving: true
    })));
    
    setTimeout(() => {
      setDancers(prev => prev.map(dancer => ({
        ...dancer,
        isMoving: false
      })));
    }, 500);

    // Create fireworks
    createFirework(200 + Math.random() * 200, 150 + Math.random() * 200, '🎊');
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(move.beat * 100);
    }
  };

  const clearDanceFloor = () => {
    setDancers([]);
    setFireworks([]);
    setScore(0);
    setCurrentBeat(0);
    stopDanceParty();
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
          <div className="text-6xl">💃</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Dans Partisi
          </div>
          <div className="text-sm opacity-80">Beat: {currentBeat} | Puan: {score}</div>
        </div>
        
        <Button
          onClick={clearDanceFloor}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Dance Floor */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-br from-purple-200/80 via-pink-200/80 to-orange-200/80 dark:from-purple-800/40 dark:via-pink-800/40 dark:to-orange-800/40 min-h-[400px] overflow-hidden">
        {/* Dance Floor Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-orange-100/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-[2rem]" />
        
        {/* Disco Ball */}
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 text-6xl"
          animate={isPlaying ? { rotate: [0, 360] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          🪩
        </motion.div>

        {/* Party Lights */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-12 h-12 rounded-full opacity-60"
                style={{
                  background: `radial-gradient(circle, ${DANCE_MOVES[i % DANCE_MOVES.length].color}, transparent)`,
                  top: `${(i % 4) * 25}%`,
                  left: `${Math.floor(i / 4) * 50}%`,
                }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* Dance Floor Interactive Area */}
        <div
          ref={danceFloorRef}
          className="relative w-full h-[400px] cursor-pointer"
          onClick={addDancer}
        >
          {/* Dancers */}
          <AnimatePresence>
            {dancers.map((dancer) => (
              <motion.div
                key={dancer.id}
                className="absolute cursor-pointer"
                style={{ 
                  left: dancer.x - 30, 
                  top: dancer.y - 30,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: dancer.isMoving ? [1, 1.4, 1] : 1,
                  rotate: dancer.isMoving ? [0, 15, -15, 0] : 0,
                  y: dancer.isMoving ? [-10, 10, -10] : 0
                }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ 
                  duration: dancer.isMoving ? 0.5 : 0.3,
                  type: "spring",
                  bounce: 0.6
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDancers(prev => prev.filter(d => d.id !== dancer.id));
                }}
              >
                {/* Dancer */}
                <div 
                  className="w-16 h-16 rounded-full border-4 border-white/70 shadow-xl flex flex-col items-center justify-center relative text-2xl"
                  style={{ backgroundColor: dancer.color }}
                >
                  {dancer.emoji}
                  
                  {/* Dance move */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl">
                    {dancer.currentMove}
                  </div>
                  
                  {/* Dancing indicator */}
                  {dancer.isMoving && (
                    <motion.div
                      className="absolute inset-0 border-4 border-yellow-300 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Fireworks */}
          <AnimatePresence>
            {fireworks.map((firework) => (
              <motion.div
                key={firework.id}
                className="absolute text-4xl pointer-events-none"
                style={{ left: firework.x - 20, top: firework.y - 20 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 2, 1.5, 0],
                  opacity: [1, 1, 0.8, 0],
                  rotate: [0, 180, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {firework.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {dancers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-8xl">🕺</div>
                <div className="text-xl">Dansçı eklemek için dokun</div>
                <div className="text-lg">Partiye başla! 💃</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={isPlaying ? stopDanceParty : startDanceParty}
          className="rounded-2xl px-8 py-4 text-lg bg-gradient-to-r from-pink-400 to-orange-500 hover:from-pink-500 hover:to-orange-600 text-white border-0 shadow-xl"
        >
          {isPlaying ? '⏸️ Durdur' : '▶️ Parti Başlasın!'}
        </Button>
        
        <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 rounded-2xl px-4 py-2">
          <span className="text-sm font-bold">Tempo:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTempo(Math.max(80, tempo - 20))}
            className="w-8 h-8 rounded-full"
          >
            -
          </Button>
          <span className="text-sm w-12 text-center">{tempo}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTempo(Math.min(180, tempo + 20))}
            className="w-8 h-8 rounded-full"
          >
            +
          </Button>
        </div>
      </div>

      {/* Dance Moves */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {DANCE_MOVES.map((move, index) => (
          <motion.div
            key={move.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.6,
              type: "spring",
              bounce: 0.8
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
          >
            <Button
              className={`
                w-full h-20 rounded-3xl border-4 shadow-xl relative overflow-hidden
                ${!isPlaying ? 'opacity-50' : 'opacity-100'}
                ${selectedMove.id === move.id ? 'border-yellow-300 ring-4 ring-yellow-200' : 'border-white/50'}
              `}
              style={{ backgroundColor: move.color }}
              onClick={() => handleMoveClick(move)}
              disabled={!isPlaying}
            >
              <div className="text-center space-y-1">
                <div className="text-3xl">{move.emoji}</div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {move.name}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-pink-200/80 to-orange-200/80 dark:from-pink-600/20 dark:to-orange-600/20 border-4 border-pink-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🕺</div>
            <div className="text-lg font-bold">Dans Partisi</div>
            <div className="text-sm opacity-80">
              Dansçı ekle, partiyi başlat ve ritimle dans et! Her hareket puan kazandırır! 💃🎵
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}