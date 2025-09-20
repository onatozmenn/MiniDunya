import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { getSoundManager } from '../utils/SoundManager';

interface ColorShapesProps {
  volume: number;
}

const COLORS = [
  { name: 'Kırmızı', value: '#FF6B9D', sound: 'pop' },
  { name: 'Mavi', value: '#4ECDC4', sound: 'success' },
  { name: 'Sarı', value: '#FECA57', sound: 'error' },
  { name: 'Yeşil', value: '#2ED573', sound: 'pop' },
  { name: 'Mor', value: '#A55EEA', sound: 'success' },
  { name: 'Turuncu', value: '#FF6348', sound: 'error' }
];

const SHAPES = [
  { name: 'Daire', component: 'circle', emoji: '🔴' },
  { name: 'Kare', component: 'square', emoji: '🟦' },
  { name: 'Üçgen', component: 'triangle', emoji: '🔺' },
  { name: 'Yıldız', component: 'star', emoji: '⭐' },
  { name: 'Kalp', component: 'heart', emoji: '💖' },
  { name: 'Elmas', component: 'diamond', emoji: '💎' }
];

type ShapeItem = {
  id: string;
  shape: typeof SHAPES[0];
  color: typeof COLORS[0];
  x: number;
  y: number;
  size: number;
  isActive: boolean;
};

export function ColorShapes({ volume }: ColorShapesProps) {
  const [shapes, setShapes] = useState<ShapeItem[]>(() => 
    [...Array(8)].map((_, i) => ({
      id: `shape-${i}`,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 80 + Math.random() * 40,
      isActive: false
    }))
  );

  const handleShapeClick = useCallback((shapeId: string) => {
    setShapes(prevShapes => 
      prevShapes.map(shape => {
        if (shape.id === shapeId) {
          // Change to new random color and shape
          const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          
          // Play sound
          if (volume > 0) {
            const soundManager = getSoundManager(volume);
            switch (newColor.sound) {
              case 'pop':
                soundManager.playPop();
                break;
              case 'success':
                soundManager.playSuccess();
                break;
              case 'error':
                soundManager.playError();
                break;
            }
          }

          return {
            ...shape,
            color: newColor,
            shape: newShape,
            isActive: true,
            // Slight position change for movement effect
            x: Math.max(10, Math.min(80, shape.x + (Math.random() - 0.5) * 20)),
            y: Math.max(10, Math.min(80, shape.y + (Math.random() - 0.5) * 20))
          };
        }
        return shape;
      })
    );

    // Reset active state after animation
    setTimeout(() => {
      setShapes(prevShapes => 
        prevShapes.map(shape => 
          shape.id === shapeId ? { ...shape, isActive: false } : shape
        )
      );
    }, 600);
  }, [volume]);

  const renderShape = (shape: ShapeItem) => {
    const commonProps = {
      className: "w-full h-full drop-shadow-lg",
      style: { color: shape.color.value }
    };

    switch (shape.shape.component) {
      case 'circle':
        return (
          <div 
            {...commonProps}
            className="w-full h-full rounded-full drop-shadow-lg"
            style={{ backgroundColor: shape.color.value }}
          />
        );
      case 'square':
        return (
          <div 
            {...commonProps}
            className="w-full h-full rounded-2xl drop-shadow-lg"
            style={{ backgroundColor: shape.color.value }}
          />
        );
      case 'triangle':
        return (
          <div 
            {...commonProps}
            className="w-full h-full drop-shadow-lg flex items-center justify-center"
          >
            <div 
              className="w-0 h-0 drop-shadow-lg"
              style={{
                borderLeft: `${shape.size/2}px solid transparent`,
                borderRight: `${shape.size/2}px solid transparent`,
                borderBottom: `${shape.size}px solid ${shape.color.value}`
              }}
            />
          </div>
        );
      case 'heart':
        return (
          <div 
            {...commonProps}
            className="text-6xl flex items-center justify-center drop-shadow-lg"
            style={{ color: shape.color.value }}
          >
            💖
          </div>
        );
      case 'star':
        return (
          <div 
            {...commonProps}
            className="text-6xl flex items-center justify-center drop-shadow-lg"
            style={{ color: shape.color.value }}
          >
            ⭐
          </div>
        );
      case 'diamond':
        return (
          <div 
            {...commonProps}
            className="w-full h-full drop-shadow-lg flex items-center justify-center"
          >
            <div 
              className="w-full h-full transform rotate-45 drop-shadow-lg"
              style={{ backgroundColor: shape.color.value }}
            />
          </div>
        );
      default:
        return (
          <div 
            {...commonProps}
            className="w-full h-full rounded-full drop-shadow-lg"
            style={{ backgroundColor: shape.color.value }}
          />
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-pink-200 via-yellow-200 to-blue-200 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-20"
            style={{
              left: `${5 + i * 12}%`,
              top: `${10 + i * 11}%`
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.6
            }}
          >
            {['🌈', '✨', '🎨', '🔮', '🌟', '💫', '🎭', '🎪'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 p-6 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="text-6xl mb-3">🎨</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
            Renk ve Şekiller
          </h1>
          <p className="text-lg text-white/90 mt-2">
            Dokun ve değiştir! 🌈
          </p>
        </motion.div>
      </div>

      {/* Shapes Container */}
      <div className="relative w-full h-96 mx-auto max-w-4xl px-6">
        {shapes.map((shape, index) => (
          <motion.button
            key={shape.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: shape.isActive ? [0, -10, 10, 0] : 0,
              y: shape.isActive ? [0, -15, 5, 0] : 0
            }}
            transition={{ 
              delay: index * 0.1,
              x: { duration: 0.6 },
              y: { duration: 0.6 }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShapeClick(shape.id)}
            className="absolute cursor-pointer"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div
              animate={shape.isActive ? {
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              } : {}}
              transition={{ duration: 0.6 }}
              className="relative w-full h-full"
            >
              {renderShape(shape)}
              
              {/* Active Ring Effect */}
              {shape.isActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-full border-4 border-white/60"
                />
              )}

              {/* Sparkles */}
              {shape.isActive && (
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1, 0], 
                        opacity: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 100],
                        y: [0, (Math.random() - 0.5) * 100]
                      }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="absolute text-2xl"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Color Palette */}
      <div className="px-6 mt-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 mb-2">🌈 Renkler</h2>
          <p className="text-white/70">Bu renkler şekillerde görünüyor!</p>
        </motion.div>

        <div className="flex justify-center gap-4 flex-wrap max-w-lg mx-auto">
          {COLORS.map((color, index) => (
            <motion.div
              key={color.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div 
                className="w-16 h-16 rounded-full shadow-lg border-4 border-white/50 mb-2"
                style={{ backgroundColor: color.value }}
              />
              <p className="text-sm font-bold text-white/90">{color.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shape Guide */}
      <div className="px-6 mt-6 mb-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 mb-2">⭐ Şekiller</h2>
          <p className="text-white/70">Bu şekiller değişebiliyor!</p>
        </motion.div>

        <div className="flex justify-center gap-4 flex-wrap max-w-lg mx-auto">
          {SHAPES.map((shape, index) => (
            <motion.div
              key={shape.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-white/90 rounded-2xl shadow-lg border-4 border-white/50 mb-2 flex items-center justify-center text-2xl">
                {shape.emoji}
              </div>
              <p className="text-sm font-bold text-white/90">{shape.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-6 left-6 z-30">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">👆</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Dokun ve İzle!</p>
              <p className="text-xs text-gray-600">Şekiller renk ve form değiştirir!</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Character Helper */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎨</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Renk Ustası</p>
              <p className="text-xs text-gray-600">Harika çalışıyorsun!</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ColorShapes;