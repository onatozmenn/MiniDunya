import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface MagicPianoTilesProps {
  volume: number;
  onBack: () => void;
}

interface Tile {
  id: number;
  column: number;
  y: number;
  color: string;
  emoji: string;
  frequency: number;
  note: string;
  speed: number;
  isPressed: boolean;
  isSpecial: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  velocity: { x: number; y: number };
}

const COLUMNS = 4;
const TILE_HEIGHT = 100;
const GAME_HEIGHT = 500;

const TILE_TYPES = [
  { color: '#FF6B9D', emoji: '🐱', frequency: 261.63, note: 'C4' },
  { color: '#FF8E53', emoji: '🐶', frequency: 293.66, note: 'D4' },
  { color: '#FFD93D', emoji: '🦆', frequency: 329.63, note: 'E4' },
  { color: '#6BCF7F', emoji: '🐸', frequency: 349.23, note: 'F4' },
  { color: '#4D96FF', emoji: '🐦', frequency: 392.00, note: 'G4' },
  { color: '#9B59B6', emoji: '🐭', frequency: 440.00, note: 'A4' },
];

const SPECIAL_TILES = [
  { color: '#FFD700', emoji: '⭐', frequency: 523.25, note: '⭐' },
  { color: '#FF69B4', emoji: '💎', frequency: 587.33, note: '💎' },
  { color: '#00CED1', emoji: '✨', frequency: 659.25, note: '✨' },
];

export function MagicPianoTiles({ volume, onBack }: MagicPianoTilesProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(2);
  const [missedTiles, setMissedTiles] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  
  const audioContext = useRef<AudioContext | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number>();
  const tileIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const lastTileSpawn = useRef(0);
  const spawnRate = useRef(1200); // ms between tiles

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const playNote = (frequency: number, isSpecial: boolean = false) => {
    if (!audioContext.current) return;

    const oscillator1 = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator1.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    if (isSpecial) {
      // Special tile sound - more magical
      const oscillator2 = audioContext.current.createOscillator();
      const oscillator3 = audioContext.current.createOscillator();
      
      oscillator2.connect(gainNode);
      oscillator3.connect(gainNode);
      
      oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
      oscillator2.frequency.setValueAtTime(frequency * 1.5, audioContext.current.currentTime);
      oscillator3.frequency.setValueAtTime(frequency * 2, audioContext.current.currentTime);
      
      oscillator1.type = 'triangle';
      oscillator2.type = 'sine';
      oscillator3.type = 'square';
      
      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, audioContext.current.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 1.2);

      oscillator1.start(audioContext.current.currentTime);
      oscillator2.start(audioContext.current.currentTime);
      oscillator3.start(audioContext.current.currentTime);
      oscillator1.stop(audioContext.current.currentTime + 1.2);
      oscillator2.stop(audioContext.current.currentTime + 1.2);
      oscillator3.stop(audioContext.current.currentTime + 1.2);
    } else {
      // Normal tile sound
      oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
      oscillator1.type = 'triangle';

      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, audioContext.current.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.6);

      oscillator1.start(audioContext.current.currentTime);
      oscillator1.stop(audioContext.current.currentTime + 0.6);
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

  const spawnTile = useCallback(() => {
    const now = Date.now();
    if (now - lastTileSpawn.current < spawnRate.current) return;
    
    lastTileSpawn.current = now;
    
    const column = Math.floor(Math.random() * COLUMNS);
    const isSpecial = Math.random() < 0.1; // 10% chance for special tile
    
    let tileData;
    if (isSpecial) {
      tileData = SPECIAL_TILES[Math.floor(Math.random() * SPECIAL_TILES.length)];
    } else {
      tileData = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
    }

    const newTile: Tile = {
      id: tileIdCounter.current++,
      column,
      y: -TILE_HEIGHT,
      color: tileData.color,
      emoji: tileData.emoji,
      frequency: tileData.frequency,
      note: tileData.note,
      speed: gameSpeed,
      isPressed: false,
      isSpecial
    };

    setTiles(prev => [...prev, newTile]);
  }, [gameSpeed]);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    // Spawn new tiles
    spawnTile();

    // Update tile positions
    setTiles(prev => {
      const updatedTiles = prev.map(tile => ({
        ...tile,
        y: tile.y + tile.speed
      }));

      // Remove tiles that went off screen and count as missed
      const visibleTiles = updatedTiles.filter(tile => {
        if (tile.y > GAME_HEIGHT && !tile.isPressed) {
          setMissedTiles(miss => {
            const newMissed = miss + 1;
            if (newMissed >= 3) {
              setGameOver(true);
              setIsPlaying(false);
            }
            return newMissed;
          });
          setCombo(0); // Reset combo on miss
          return false;
        }
        return tile.y <= GAME_HEIGHT + TILE_HEIGHT;
      });

      return visibleTiles;
    });

    // Update particles
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.velocity.x,
      y: particle.y + particle.velocity.y,
      velocity: {
        x: particle.velocity.x * 0.98,
        y: particle.velocity.y + 0.5 // gravity
      }
    })));

    animationFrame.current = requestAnimationFrame(updateGame);
  }, [isPlaying, spawnTile]);

  useEffect(() => {
    if (isPlaying) {
      animationFrame.current = requestAnimationFrame(updateGame);
    } else if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isPlaying, updateGame]);

  const handleColumnPress = (column: number) => {
    if (!isPlaying || gameOver) return;

    // Find the bottom-most tile in this column
    const columnTiles = tiles
      .filter(tile => tile.column === column && !tile.isPressed)
      .sort((a, b) => b.y - a.y);

    if (columnTiles.length === 0) {
      // Pressed empty column - penalty
      setCombo(0);
      setMissedTiles(prev => {
        const newMissed = prev + 1;
        if (newMissed >= 3) {
          setGameOver(true);
          setIsPlaying(false);
        }
        return newMissed;
      });
      return;
    }

    const tile = columnTiles[0];
    
    // Check if tile is in the hit zone (bottom area)
    const hitZoneTop = GAME_HEIGHT - 120;
    if (tile.y < hitZoneTop) {
      // Pressed too early - penalty
      setCombo(0);
      setMissedTiles(prev => {
        const newMissed = prev + 1;
        if (newMissed >= 3) {
          setGameOver(true);
          setIsPlaying(false);
        }
        return newMissed;
      });
      return;
    }

    // Successful hit!
    setTiles(prev => prev.map(t => 
      t.id === tile.id ? { ...t, isPressed: true } : t
    ));

    playNote(tile.frequency, tile.isSpecial);
    
    const baseScore = tile.isSpecial ? 50 : 10;
    const comboBonus = combo * 2;
    const totalScore = baseScore + comboBonus;
    
    setScore(prev => prev + totalScore);
    setCombo(prev => prev + 1);

    // Create particles
    const columnWidth = 100; // Approximate column width
    const x = column * columnWidth + columnWidth / 2;
    createParticle(x, tile.y, tile.emoji);
    
    if (tile.isSpecial) {
      // Extra particles for special tiles
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          createParticle(x + (Math.random() - 0.5) * 50, tile.y, ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]);
        }, i * 100);
      }
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(tile.isSpecial ? [100, 50, 100] : 80);
    }

    // Level progression
    if (score > 0 && score % 500 === 0) {
      setLevel(prev => prev + 1);
      setGameSpeed(prev => Math.min(prev + 0.5, 8));
      spawnRate.current = Math.max(spawnRate.current - 100, 400);
    }
  };

  const startGame = () => {
    setTiles([]);
    setParticles([]);
    setScore(0);
    setCombo(0);
    setMissedTiles(0);
    setGameOver(false);
    setLevel(1);
    setGameSpeed(2);
    setIsPlaying(true);
    spawnRate.current = 1200;
    lastTileSpawn.current = 0;
    tileIdCounter.current = 0;
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const resumeGame = () => {
    if (!gameOver) {
      setIsPlaying(true);
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
          <div className="text-6xl">✨</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Sihirli Fayanslar
          </div>
          <div className="text-sm opacity-80">Seviye: {level} | Combo: {combo}x</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold">{score}</div>
          <div className="text-xs opacity-80">Puan</div>
        </div>
      </motion.div>

      {/* Game Status */}
      <div className="flex justify-center space-x-4">
        <Card className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-green-600 font-bold">✓ Kombo</div>
            <div className="text-lg">{combo}</div>
          </div>
        </Card>
        
        <Card className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-red-600 font-bold">✗ Kaçan</div>
            <div className="text-lg">{missedTiles}/3</div>
          </div>
        </Card>
        
        <Card className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-blue-600 font-bold">⚡ Hız</div>
            <div className="text-lg">{gameSpeed.toFixed(1)}x</div>
          </div>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="relative p-0 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-b from-slate-900 via-purple-900 to-blue-900 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 overflow-hidden">
        <div
          ref={gameAreaRef}
          className="relative w-full bg-gradient-to-b from-transparent via-purple-900/20 to-blue-900/40"
          style={{ height: `${GAME_HEIGHT}px` }}
        >
          {/* Column separators */}
          {Array.from({ length: COLUMNS - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5 bg-white/20"
              style={{ left: `${((i + 1) / COLUMNS) * 100}%` }}
            />
          ))}

          {/* Hit zone indicator */}
          <div 
            className="absolute left-0 right-0 h-20 bg-gradient-to-t from-white/20 to-transparent"
            style={{ bottom: 0 }}
          />
          
          {/* Tiles */}
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile.id}
                className={`
                  absolute rounded-2xl border-4 border-white/50 shadow-xl flex items-center justify-center
                  ${tile.isPressed ? 'scale-110 opacity-50' : ''}
                  ${tile.isSpecial ? 'shadow-[0_0_20px_rgba(255,255,255,0.8)]' : ''}
                `}
                style={{
                  left: `${(tile.column / COLUMNS) * 100}%`,
                  width: `${100 / COLUMNS}%`,
                  height: `${TILE_HEIGHT}px`,
                  top: `${tile.y}px`,
                  backgroundColor: tile.color,
                  padding: '4px'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: tile.isPressed ? 1.2 : 1, opacity: tile.isPressed ? 0 : 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className={`${tile.isSpecial ? 'text-5xl' : 'text-4xl'}`}>
                    {tile.emoji}
                  </div>
                  {tile.isSpecial && (
                    <div className="text-xs font-bold text-white mt-1">
                      {tile.note}
                    </div>
                  )}
                </div>
                
                {/* Special tile aura */}
                {tile.isSpecial && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-yellow-300"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
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
                style={{ left: particle.x, top: particle.y }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 0.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Game Over Overlay */}
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center"
            >
              <div className="text-center space-y-4 text-white">
                <div className="text-6xl">😢</div>
                <div className="text-3xl font-bold">Oyun Bitti!</div>
                <div className="text-xl">Final Puanın: {score}</div>
                <div className="text-lg">Seviye: {level}</div>
                <Button
                  onClick={startGame}
                  className="mt-4 rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                >
                  🔄 Tekrar Oyna
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Column Touch Areas */}
        <div className="absolute bottom-0 left-0 right-0 h-20 flex">
          {Array.from({ length: COLUMNS }).map((_, i) => (
            <button
              key={i}
              className="flex-1 h-full bg-transparent"
              onMouseDown={() => handleColumnPress(i)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleColumnPress(i);
              }}
            />
          ))}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!isPlaying && !gameOver ? (
          <Button
            onClick={startGame}
            className="rounded-2xl px-8 py-4 text-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white border-0 shadow-xl"
          >
            🎮 Oyunu Başlat
          </Button>
        ) : isPlaying ? (
          <Button
            onClick={pauseGame}
            className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-0"
          >
            ⏸️ Duraklat
          </Button>
        ) : (
          <Button
            onClick={resumeGame}
            disabled={gameOver}
            className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0"
          >
            ▶️ Devam Et
          </Button>
        )}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-cyan-200/80 to-blue-200/80 dark:from-cyan-600/20 dark:to-blue-600/20 border-4 border-cyan-300/50">
          <div className="space-y-2">
            <div className="text-3xl">✨</div>
            <div className="text-lg font-bold">Sihirli Fayanslar</div>
            <div className="text-sm opacity-80">
              Düşen fayansları tam zamanında yakala! 3 kaçırma = oyun biter! ⭐ Özel fayanslar bonus! 🎵
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}