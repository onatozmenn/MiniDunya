import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { getSoundManager } from '../utils/SoundManager';

interface MagicPainterProps {
  volume: number;
  onBack: () => void;
}

interface Paint {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  emoji: string;
}

const COLORS = [
  { color: 'bg-red-400', emoji: '🔴', sound: 'note' },
  { color: 'bg-blue-400', emoji: '🔵', sound: 'note' },
  { color: 'bg-green-400', emoji: '🟢', sound: 'note' },
  { color: 'bg-yellow-400', emoji: '🟡', sound: 'note' },
  { color: 'bg-purple-400', emoji: '🟣', sound: 'note' },
  { color: 'bg-pink-400', emoji: '🩷', sound: 'note' },
  { color: 'bg-orange-400', emoji: '🟠', sound: 'note' },
  { color: 'bg-cyan-400', emoji: '🩵', sound: 'note' },
];

const PAINT_EMOJIS = ['✨', '💫', '⭐', '🌟', '💖', '🎨', '🎭', '🦋'];

export function MagicPainter({ volume, onBack }: MagicPainterProps) {
  const [paints, setPaints] = useState<Paint[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addPaint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const newPaint: Paint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      color: selectedColor.color,
      size: Math.random() * 30 + 20,
      emoji: PAINT_EMOJIS[Math.floor(Math.random() * PAINT_EMOJIS.length)]
    };

    setPaints(prev => [...prev, newPaint]);

    // Play sound
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }

    // Auto remove after 8 seconds
    setTimeout(() => {
      setPaints(prev => prev.filter(p => p.id !== newPaint.id));
    }, 8000);
  }, [selectedColor, volume]);

  const clearCanvas = useCallback(() => {
    setPaints([]);
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [volume]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <div className="text-4xl font-bold text-white drop-shadow-lg">
          🎨 Sihirli Boyama
        </div>

        <Button
          onClick={clearCanvas}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🧹
        </Button>
      </div>

      {/* Color Palette */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-3 bg-white/90 p-4 rounded-full shadow-2xl">
          {COLORS.map((color, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedColor(color)}
              className={`
                w-12 h-12 ${color.color} rounded-full shadow-lg border-4 transition-all
                ${selectedColor.color === color.color ? 'border-white scale-110' : 'border-gray-200'}
              `}
            >
              <div className="text-2xl">{color.emoji}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={addPaint}
        onTouchStart={addPaint}
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence>
          {paints.map((paint) => (
            <motion.div
              key={paint.id}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: [0, 5, -5, 0],
                opacity: 1,
                y: [0, -10, 0]
              }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{
                rotate: { duration: 2, repeat: Infinity },
                y: { duration: 3, repeat: Infinity }
              }}
              className={`
                absolute ${paint.color} rounded-full border-4 border-white shadow-xl
                flex items-center justify-center pointer-events-none
              `}
              style={{
                left: `${paint.x}%`,
                top: `${paint.y}%`,
                width: `${paint.size}px`,
                height: `${paint.size}px`,
                fontSize: `${paint.size * 0.5}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {paint.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Instructions */}
        {paints.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">👆</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                Dokun ve Boya!
              </div>
              <div className="text-lg text-gray-600">
                Ekrana dokunarak sihirli boyalar yap ✨
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default MagicPainter;