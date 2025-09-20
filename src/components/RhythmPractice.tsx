import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface Tile {
  id: string;
  lane: 'left' | 'center' | 'right';
  position: number; // 0 to 100 (percentage from top)
  isActive: boolean;
  isMissed: boolean;
  isGhost: boolean;
  timestamp: number;
}

interface Lane {
  id: 'left' | 'center' | 'right';
  color: string;
  animal: string;
  emoji: string;
  sound: number; // frequency
}

const LANES: Lane[] = [
  { id: 'left', color: 'bg-pink-400', animal: 'Kedi', emoji: '🐱', sound: 261.63 },
  { id: 'center', color: 'bg-green-400', animal: 'Köpek', emoji: '🐶', sound: 329.63 },
  { id: 'right', color: 'bg-blue-400', animal: 'Kuş', emoji: '🐦', sound: 392.00 }
];

interface RhythmPracticeProps {
  volume: number;
}

export function RhythmPractice({ volume }: RhythmPracticeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(70); // BPM
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [guideEnabled, setGuideEnabled] = useState(true);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [feedback, setFeedback] = useState<{ lane: string; type: 'correct' | 'miss' } | null>(null);
  
  // Correction states - simplified
  const [showingGhost, setShowingGhost] = useState(false);
  const [highlightedLane, setHighlightedLane] = useState<string | null>(null);
  
  const audioContext = useRef<AudioContext | null>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tileIdCounter = useRef(0);
  const lastTileTime = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, []);

  const playSound = (frequency: number, duration: number = 0.3) => {
    if (!audioContext.current || !soundEnabled) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const generateTilePattern = () => {
    // Simpler patterns for continuous flow
    const patterns = [
      ['left'],
      ['center'], 
      ['right'],
      ['left', 'center'],
      ['center', 'right'],
      ['left', 'right']
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  const createTile = (lane: 'left' | 'center' | 'right', isGhost: boolean = false): Tile => {
    return {
      id: `tile-${tileIdCounter.current++}`,
      lane,
      position: 0,
      isActive: false,
      isMissed: false,
      isGhost,
      timestamp: Date.now()
    };
  };

  const startGame = () => {
    setIsPlaying(true);
    setTiles([]);
    setFeedback(null);
    setShowingGhost(false);
    setHighlightedLane(null);
    
    startGameLoop();
  };

  const startGameLoop = () => {
    const interval = 60000 / tempo; // milliseconds per beat
    
    gameIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastTileTime.current > interval * 2) { // Slower spawn rate
        const pattern = generateTilePattern();
        
        setTiles(prev => [
          ...prev,
          ...pattern.map(lane => createTile(lane as 'left' | 'center' | 'right'))
        ]);
        
        lastTileTime.current = now;
      }
    }, 50);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
  };

  const updateTiles = useCallback(() => {
    if (!isPlaying) return;
    
    setTiles(prev => {
      const speed = showingGhost ? 0.5 : 1.2; // Slower when showing ghost correction
      
      return prev
        .map(tile => ({
          ...tile,
          position: tile.position + (1.5 * speed),
          isActive: tile.position >= 75 && tile.position <= 85
        }))
        .filter(tile => {
          if (tile.position > 100 && !tile.isMissed && !tile.isGhost) {
            // Tile missed! Show ghost correction
            handleTileMissed(tile);
            return false;
          }
          return tile.position <= 105;
        });
    });
  }, [isPlaying, showingGhost]);

  useEffect(() => {
    const animationFrame = setInterval(updateTiles, 50);
    return () => clearInterval(animationFrame);
  }, [updateTiles]);

  const handleTileMissed = (tile: Tile) => {
    // Show miss feedback
    setFeedback({ lane: tile.lane, type: 'miss' });
    setTimeout(() => setFeedback(null), 800);
    
    // Create ghost tile for correction
    setShowingGhost(true);
    setHighlightedLane(tile.lane);
    
    const ghostTile = createTile(tile.lane, true);
    setTiles(prev => [...prev, ghostTile]);
    
    // Reset after ghost tile passes
    setTimeout(() => {
      setShowingGhost(false);
      setHighlightedLane(null);
    }, 4000);
  };

  const handleLaneTap = (laneId: 'left' | 'center' | 'right') => {
    const activeTiles = tiles.filter(tile => tile.isActive && tile.lane === laneId && !tile.isGhost);
    const ghostTiles = tiles.filter(tile => tile.isActive && tile.lane === laneId && tile.isGhost);
    
    if (activeTiles.length > 0 || ghostTiles.length > 0) {
      // Correct hit!
      const hitTile = activeTiles[0] || ghostTiles[0];
      const lane = LANES.find(l => l.id === laneId)!;
      
      playSound(lane.sound);
      
      // Remove the hit tile
      setTiles(prev => prev.filter(tile => tile.id !== hitTile.id));
      
      // Show success feedback
      setFeedback({ lane: laneId, type: 'correct' });
      setTimeout(() => setFeedback(null), 300);
      
      // If it was a ghost tile, clear correction state
      if (hitTile.isGhost) {
        setShowingGhost(false);
        setHighlightedLane(null);
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const resetGame = () => {
    stopGame();
    setTiles([]);
    setFeedback(null);
    setShowingGhost(false);
    setHighlightedLane(null);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 space-y-4">
      {/* Metronome/Tempo Display */}
      <Card className="p-4 border-0 shadow-lg rounded-3xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-600/30 dark:to-pink-600/30 dark:bg-slate-800/50">
        <div className="text-center space-y-2">
          <div className="text-4xl">🎵</div>
          <div className="text-lg">Ritim Pratiği</div>
          <div className="text-sm opacity-80">{tempo} BPM</div>
        </div>
      </Card>

      {/* Piano Tiles Game Area */}
      <Card className="p-2 border-0 shadow-lg rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 h-[500px] relative overflow-hidden">
        {/* 3 Lanes */}
        <div className="grid grid-cols-3 gap-3 h-full">
          {LANES.map((lane, index) => (
            <motion.div
              key={lane.id}
              className={`
                ${lane.color} rounded-2xl relative overflow-hidden cursor-pointer
                ${highlightedLane === lane.id ? 'ring-4 ring-yellow-300 animate-pulse' : ''}
                ${feedback?.lane === lane.id && feedback.type === 'correct' ? 'ring-4 ring-green-300' : ''}
                ${feedback?.lane === lane.id && feedback.type === 'miss' ? 'opacity-50' : ''}
                transition-all duration-300
              `}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLaneTap(lane.id)}
              animate={feedback?.lane === lane.id && feedback.type === 'correct' ? 
                { scale: [1, 1.05, 1] } : {}
              }
              transition={{ duration: 0.3 }}
            >
              {/* Lane Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-gradient-to-b from-white/30 via-transparent to-white/30" />
              </div>
              
              {/* Lane Animal Icon */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-3xl drop-shadow-lg">
                {lane.emoji}
              </div>
              
              {/* Hit Zone */}
              <div className="absolute bottom-14 left-2 right-2 h-6 bg-white/40 dark:bg-white/20 border border-white/60 rounded-xl" />
              
              {/* Guide Trail */}
              {guideEnabled && highlightedLane === lane.id && (
                <motion.div
                  className="absolute inset-x-1 top-0 bottom-20"
                  animate={{
                    background: [
                      'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* Success Flash */}
              {feedback?.lane === lane.id && feedback.type === 'correct' && (
                <motion.div
                  className="absolute inset-0 bg-green-300 rounded-2xl"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Falling Tiles */}
        <AnimatePresence>
          {tiles.map((tile) => {
            const laneIndex = LANES.findIndex(l => l.id === tile.lane);
            const lane = LANES[laneIndex];
            
            return (
              <motion.div
                key={tile.id}
                className={`
                  absolute rounded-xl flex items-center justify-center text-2xl shadow-lg
                  ${tile.isGhost ? 
                    `bg-white/80 dark:bg-slate-600/80 border-2 border-dashed border-gray-400` : 
                    `${lane.color} shadow-xl`
                  }
                  ${tile.isActive ? 'ring-2 ring-yellow-400' : ''}
                `}
                style={{
                  left: `${(laneIndex * 33.33) + 2}%`,
                  width: '29.33%',
                  height: '60px',
                  top: `${tile.position}%`,
                }}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ 
                  scale: 1, 
                  opacity: tile.isGhost ? 0.7 : 1,
                  y: tile.isGhost ? [0, 5, 0] : 0
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ 
                  scale: { duration: 0.15 },
                  y: { duration: 1.5, repeat: Infinity }
                }}
              >
                {tile.isGhost ? '👻' : lane.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Card>

      {/* Big Play/Pause Button */}
      <div className="flex justify-center">
        <Button
          onClick={isPlaying ? stopGame : startGame}
          size="lg"
          className="rounded-full w-20 h-20 text-4xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white shadow-xl"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
      </div>

      {/* Controls */}
      <Card className="p-4 border-0 shadow-lg rounded-3xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50">
        <div className="space-y-4">
          {/* Tempo Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">🥁</span>
              <span className="text-sm">{tempo} BPM</span>
              <span className="text-sm">🏃‍♂️</span>
            </div>
            <Slider
              value={[tempo]}
              onValueChange={(value) => setTempo(value[0])}
              min={60}
              max={90}
              step={5}
              className="w-full"
              disabled={isPlaying}
            />
          </div>

          {/* Sound and Guide Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-2xl border-0 bg-white/60 dark:bg-slate-600/60 w-12 h-12"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setGuideEnabled(!guideEnabled)}
              className="rounded-2xl border-0 bg-white/60 dark:bg-slate-600/60 w-12 h-12"
            >
              {guideEnabled ? '👁️' : '👁️‍🗨️'}
            </Button>
            
            <Button
              onClick={resetGame}
              variant="outline"
              className="rounded-2xl border-0 bg-white/60 dark:bg-slate-600/60 w-12 h-12"
            >
              🔄
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}