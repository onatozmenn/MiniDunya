import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { getSoundManager } from '../utils/SoundManager';

interface RainbowMakerProps {
  volume: number;
  onBack: () => void;
}

interface RainbowStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface Sparkle {
  id: string;
  x: number;
  y: number;
  size: number;
}

const RAINBOW_COLORS = [
  '#ff6b6b', // Red
  '#ff8e53', // Orange  
  '#ffd93d', // Yellow
  '#6bcf7f', // Green
  '#4ecdc4', // Teal
  '#45b7d1', // Blue
  '#96ceb4', // Light Blue
  '#b19cd9', // Purple
  '#feca57', // Gold
  '#ff9ff3'  // Pink
];

export function RainbowMaker({ volume, onBack }: RainbowMakerProps) {
  const [rainbowStrokes, setRainbowStrokes] = useState<RainbowStroke[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<RainbowStroke | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const newStroke: RainbowStroke = {
      id: Math.random().toString(36).substr(2, 9),
      points: [{ x, y }],
      color: RAINBOW_COLORS[colorIndex],
      width: Math.random() * 10 + 15
    };

    setCurrentStroke(newStroke);
    setIsDrawing(true);
    setColorIndex((colorIndex + 1) % RAINBOW_COLORS.length);

    // Play sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }
  }, [colorIndex, volume]);

  const continueDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, { x, y }]
      };
    });

    // Add sparkles while drawing
    const sparkleId = Math.random().toString(36).substr(2, 9);
    const newSparkle: Sparkle = {
      id: sparkleId,
      x,
      y,
      size: Math.random() * 20 + 10
    };

    setSparkles(prev => [...prev, newSparkle]);

    // Remove sparkle after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== sparkleId));
    }, 1000);
  }, [isDrawing, currentStroke]);

  const stopDrawing = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 1) {
      setRainbowStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [currentStroke]);

  const clearCanvas = useCallback(() => {
    setRainbowStrokes([]);
    setSparkles([]);
    setCurrentStroke(null);
    setIsDrawing(false);
    setColorIndex(0);
    
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  const pathFromPoints = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }
    return path;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-200 via-white to-blue-100 relative overflow-hidden">
      {/* Floating Clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl opacity-30"
            style={{
              left: `${5 + i * 15}%`,
              top: `${10 + i * 12}%`
            }}
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 drop-shadow-lg mb-1">
            🌈 Gökkuşağı Yapıcı
          </div>
          <div className="text-lg text-gray-600">
            Parmağını sürükle, gökkuşağı çiz! ✨
          </div>
        </div>

        <Button
          onClick={clearCanvas}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🧹
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={continueDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={continueDrawing}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none' }}
      >
        {/* SVG for smooth curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Completed rainbow strokes */}
          {rainbowStrokes.map((stroke) => (
            <motion.path
              key={stroke.id}
              d={pathFromPoints(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 0.5 }}
            />
          ))}

          {/* Current drawing stroke */}
          {currentStroke && currentStroke.points.length > 1 && (
            <path
              d={pathFromPoints(currentStroke.points)}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              opacity="0.9"
            />
          )}
        </svg>

        {/* Sparkles */}
        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{ scale: 0, rotate: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 360],
                opacity: [1, 0.8, 0]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute pointer-events-none"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                fontSize: `${sparkle.size}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              ✨
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Instructions */}
        {rainbowStrokes.length === 0 && !currentStroke && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl">
              <motion.div 
                className="text-8xl mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              >
                🌈
              </motion.div>
              <div className="text-3xl font-bold text-gray-800 mb-3">
                Parmağını Sürükle!
              </div>
              <div className="text-lg text-gray-600">
                Ekranda parmağını gezdirerek gökkuşağı çiz ✨
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Color Palette Preview */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg">
          {RAINBOW_COLORS.map((color, index) => (
            <div
              key={index}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${index === colorIndex ? 'border-white scale-110' : 'border-gray-300'}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Sun and Rainbow Effect */}
      {rainbowStrokes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-16 right-16 text-6xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            ☀️
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default RainbowMaker;