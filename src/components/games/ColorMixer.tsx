import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { getSoundManager } from '../utils/SoundManager';

interface ColorMixerProps {
  volume: number;
  onGoBack: () => void;
}

interface Color {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: number;
}

interface MixResult {
  color1: string;
  color2: string;
  result: Color;
  discovered: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

const PRIMARY_COLORS: Color[] = [
  {
    id: 'red',
    name: 'Kırmızı',
    emoji: '🔴',
    color: '#EF4444',
    frequency: 261.63
  },
  {
    id: 'blue',
    name: 'Mavi',
    emoji: '🔵',
    color: '#3B82F6',
    frequency: 329.63
  },
  {
    id: 'yellow',
    name: 'Sarı',
    emoji: '🟡',
    color: '#EAB308',
    frequency: 392.00
  }
];

const MIX_RESULTS: MixResult[] = [
  {
    color1: 'red',
    color2: 'blue',
    result: {
      id: 'purple',
      name: 'Mor',
      emoji: '🟣',
      color: '#8B5CF6',
      frequency: 440.00
    },
    discovered: false
  },
  {
    color1: 'red',
    color2: 'yellow',
    result: {
      id: 'orange',
      name: 'Turuncu',
      emoji: '🟠',
      color: '#F97316',
      frequency: 349.23
    },
    discovered: false
  },
  {
    color1: 'blue',
    color2: 'yellow',
    result: {
      id: 'green',
      name: 'Yeşil',
      emoji: '🟢',
      color: '#22C55E',
      frequency: 293.66
    },
    discovered: false
  }
];

export function ColorMixer({ volume, onGoBack }: ColorMixerProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mixResults, setMixResults] = useState<MixResult[]>(() => 
    MIX_RESULTS.map(mix => ({ ...mix, discovered: false }))
  );
  const [discoveredColors, setDiscoveredColors] = useState<Color[]>([]);
  const [currentMix, setCurrentMix] = useState<Color | null>(null);
  const [score, setScore] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [rainbow, setRainbow] = useState(false);
  
  const textIdCounter = useRef(0);
  const mixingAreaRef = useRef<HTMLDivElement>(null);

  // Sound system
  const playSound = useCallback((frequency: number, duration: number = 300) => {
    if (!isSoundOn || volume === 0) return;
    const soundManager = getSoundManager(volume);
    soundManager.playNote(frequency, duration / 1000);
  }, [isSoundOn, volume]);

  // Create floating text
  const createFloatingText = useCallback((text: string, x: number, y: number, color: string = '#10B981') => {
    const newText: FloatingText = {
      id: textIdCounter.current++,
      text,
      x,
      y,
      color
    };
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
  }, []);

  // Select color
  const selectColor = useCallback((colorId: string) => {
    const color = PRIMARY_COLORS.find(c => c.id === colorId);
    if (!color) return;

    // Play color sound
    playSound(color.frequency, 200);

    setSelectedColors(prev => {
      if (prev.length >= 2) {
        return [colorId]; // Start new selection
      }
      
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId); // Deselect
      }
      
      return [...prev, colorId]; // Add to selection
    });
  }, [playSound]);



  // Auto mix when 2 colors selected
  useEffect(() => {
    if (selectedColors.length === 2) {
      const timeoutId = setTimeout(() => {
        const [color1, color2] = selectedColors.sort();
        const mixResult = mixResults.find(
          mix => (mix.color1 === color1 && mix.color2 === color2) ||
                 (mix.color1 === color2 && mix.color2 === color1)
        );

        if (mixResult && !mixResult.discovered) {
          // New discovery!
          setMixResults(prev => prev.map(mix => 
            mix === mixResult ? { ...mix, discovered: true } : mix
          ));
          
          setDiscoveredColors(prev => [...prev, mixResult.result]);
          setCurrentMix(mixResult.result);
          setScore(prev => prev + 20);
          
          // Play success sound
          playSound(mixResult.result.frequency, 500);
          
          // Create celebration text
          createFloatingText('Yeni Renk! 🎨', 150, 200, mixResult.result.color);
          createFloatingText('+20', 180, 230, '#F59E0B');
          
        } else if (mixResult && mixResult.discovered) {
          // Already discovered
          setCurrentMix(mixResult.result);
          playSound(mixResult.result.frequency, 300);
          createFloatingText('Zaten keşfettin!', 150, 200, '#6B7280');
          
        } else {
          // No result
          playSound(150, 200);
          createFloatingText('Bu karışım çalışmıyor', 150, 200, '#EF4444');
        }

        // Clear selection after mixing
        setTimeout(() => {
          setSelectedColors([]);
          setCurrentMix(null);
        }, 2000);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedColors, mixResults, playSound, createFloatingText]);

  // Check game completion - only check when mixResults change
  useEffect(() => {
    const allDiscovered = mixResults.every(mix => mix.discovered);
    const discoveredCount = mixResults.filter(mix => mix.discovered).length;
    
    // Only trigger if game is not already complete and all are discovered
    if (allDiscovered && discoveredCount === 3 && !gameComplete) {
      setGameComplete(true);
      setRainbow(true);
      playSound(523.25, 1000); // C5
      createFloatingText('🌈 Tüm renkler keşfedildi! 🌈', 100, 150, '#F59E0B');
    }
  }, [mixResults]); // Only depend on mixResults, not gameComplete!

  // Handle auto-close separately
  useEffect(() => {
    if (gameComplete) {
      const timeoutId = setTimeout(() => {
        setRainbow(false);
        setGameComplete(false);
      }, 5000);
      
      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [gameComplete]);

  // Reset game
  const resetGame = useCallback(() => {
    // Fresh copy of mix results with all discovered = false
    const freshMixResults = MIX_RESULTS.map(mix => ({
      ...mix,
      discovered: false
    }));
    setMixResults(freshMixResults);
    setDiscoveredColors([]);
    setCurrentMix(null);
    setSelectedColors([]);
    setScore(0);
    setGameComplete(false);
    setRainbow(false);
    setFloatingTexts([]);
  }, []);

  return (
    <div 
      className="relative mx-auto overflow-hidden shadow-2xl w-full max-w-sm"
      style={{ 
        aspectRatio: '375 / 812',
        borderRadius: 'var(--radius-widget)',
        maxHeight: '85vh',
        minHeight: '600px',
        background: 'linear-gradient(to bottom, #DDD6FE, #FCE7F3, #FEF3C7)'
      }}
    >
      {/* Header */}
      <div 
        className="absolute flex justify-between items-center z-30"
        style={{ 
          top: 'calc(var(--mobile-padding) * 0.5)', 
          left: 'var(--mobile-padding)', 
          right: 'var(--mobile-padding)' 
        }}
      >
        {/* Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          style={{ 
            borderRadius: 'var(--radius-card)',
            padding: 'clamp(8px, 2vw, 12px)',
            fontFamily: 'var(--font-text)'
          }}
        >
          <div className="flex items-center" style={{ gap: 'clamp(4px, 1vw, 8px)' }}>
            <span style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>🎨</span>
            <span style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(147, 51, 234)'
            }}>{score}</span>
          </div>
        </motion.div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)' }}>
          {/* Reset Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={resetGame}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(36px, 9vw, 44px)',
              height: 'clamp(36px, 9vw, 44px)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </motion.button>

          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onGoBack}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(36px, 9vw, 44px)',
              height: 'clamp(36px, 9vw, 44px)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>🏠</span>
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(36px, 9vw, 44px)',
              height: 'clamp(36px, 9vw, 44px)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            {isSoundOn ? (
              <Volume2 className="w-4 h-4 text-blue-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-600" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Game Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
        style={{ 
          paddingTop: 'calc(var(--kids-emoji-size) + var(--mobile-padding) * 2)',
          paddingBottom: 'var(--mobile-padding)',
          fontFamily: 'var(--font-display)'
        }}
      >
        <div style={{ 
          fontSize: 'var(--text-kids-big)', 
          fontWeight: 'var(--font-weight-bold)',
          color: 'rgb(126, 34, 206)',
          marginBottom: 'var(--mobile-gap)'
        }}>
          🎨 Renk Karıştırma 🌈
        </div>
        <div style={{ 
          fontSize: 'var(--text-kids-small)',
          color: 'rgb(147, 51, 234)'
        }}>
          Renklerle oyna, yeni renkler keşfet!
        </div>
      </motion.div>

      {/* Primary Colors */}
      <div className="px-8 mb-6">
        <div className="text-center text-sm font-bold text-gray-700 mb-4">
          Ana Renkler
        </div>
        <div className="flex justify-center gap-4">
          {PRIMARY_COLORS.map((color) => (
            <motion.button
              key={color.id}
              className={`w-20 h-20 rounded-full shadow-lg border-4 ${
                selectedColors.includes(color.id) 
                  ? 'border-white scale-110' 
                  : 'border-white/50'
              }`}
              style={{ backgroundColor: color.color }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectColor(color.id)}
              animate={{
                scale: selectedColors.includes(color.id) ? 1.1 : 1,
                boxShadow: selectedColors.includes(color.id) 
                  ? `0 0 20px ${color.color}` 
                  : '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <div className="text-2xl">{color.emoji}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mixing Area */}
      <div className="px-8 mb-6">
        <div className="text-center text-sm font-bold text-gray-700 mb-4">
          Karıştırma Alanı
        </div>
        <motion.div
          ref={mixingAreaRef}
          className="relative mx-auto w-32 h-32 bg-white/50 border-4 border-dashed border-gray-400 rounded-3xl flex items-center justify-center"
          animate={{
            borderColor: selectedColors.length === 2 ? '#10B981' : '#9CA3AF',
            backgroundColor: currentMix ? currentMix.color + '40' : 'rgba(255,255,255,0.5)'
          }}
        >
          {selectedColors.length === 0 && (
            <div className="text-gray-500 text-sm text-center">
              Renkleri<br />seç
            </div>
          )}
          
          {selectedColors.length === 1 && (
            <div className="text-gray-600 text-sm text-center">
              Bir renk<br />daha seç
            </div>
          )}
          
          {selectedColors.length === 2 && !currentMix && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-3xl"
            >
              🌪️
            </motion.div>
          )}
          
          {currentMix && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-4xl mb-1">{currentMix.emoji}</div>
              <div className="text-xs font-bold">{currentMix.name}</div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Discovered Colors */}
      {discoveredColors.length > 0 && (
        <div className="px-8 mb-6">
          <div className="text-center text-sm font-bold text-gray-700 mb-4">
            Keşfedilen Renkler ({discoveredColors.length}/3)
          </div>
          <div className="flex justify-center gap-3">
            {discoveredColors.map((color, index) => (
              <motion.div
                key={color.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-16 h-16 rounded-full shadow-lg border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: color.color }}
              >
                <div className="text-2xl">{color.emoji}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {score === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-20 left-4 right-4"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <div className="text-sm font-bold text-gray-700 mb-2">
              İki renk seç ve karıştır!
            </div>
            <div className="text-xs text-gray-600">
              🔴 + 🔵 = ? | 🔴 + 🟡 = ? | 🔵 + 🟡 = ?
            </div>
          </div>
        </motion.div>
      )}

      {/* Rainbow Background */}
      <AnimatePresence>
        {rainbow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Game Complete Animation */}
      <AnimatePresence mode="wait">
        {gameComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/20"
            onClick={() => {
              setGameComplete(false);
              setRainbow(false);
            }}
          >
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl p-8 text-center shadow-2xl cursor-pointer relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setGameComplete(false);
                setRainbow(false);
              }}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setGameComplete(false);
                  setRainbow(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                ✕
              </button>
              
              <div className="text-4xl mb-4">🌈</div>
              <div className="text-2xl font-bold mb-2">Muhteşem!</div>
              <div className="text-base mb-2">Tüm renkler keşfedildi!</div>
              <div className="text-sm opacity-80">Devam etmek için dokun</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map((text) => (
          <motion.div
            key={text.id}
            className="absolute pointer-events-none z-30 font-bold text-center"
            style={{
              left: text.x - 50,
              top: text.y,
              color: text.color,
              width: 100
            }}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: -40 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              y: -80 
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            {text.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Paint Splashes */}
        <motion.div
          className="absolute top-32 left-8 text-3xl opacity-30"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🎨
        </motion.div>
        
        <motion.div
          className="absolute top-40 right-12 text-2xl opacity-30"
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🖌️
        </motion.div>
        
        <motion.div
          className="absolute bottom-32 left-12 text-2xl opacity-30"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>
      </div>
    </div>
  );
}