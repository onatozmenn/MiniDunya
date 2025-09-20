import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface ShapeSortProps {
  volume: number;
  onBack: () => void;
}

const SHAPES = [
  { id: 'circle', name: 'Daire', emoji: '🔴', color: 'bg-red-300' },
  { id: 'square', name: 'Kare', emoji: '🟦', color: 'bg-blue-300' },
  { id: 'triangle', name: 'Üçgen', emoji: '🔺', color: 'bg-green-300' },
  { id: 'star', name: 'Yıldız', emoji: '⭐', color: 'bg-yellow-300' },
];

interface DraggableShape {
  id: string;
  shapeType: string;
  x: number;
  y: number;
}

export function ShapeSort({ volume, onBack }: ShapeSortProps) {
  const [shapes, setShapes] = useState<DraggableShape[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [draggedShape, setDraggedShape] = useState<string | null>(null);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    
    // Create random shapes
    const newShapes: DraggableShape[] = [];
    for (let i = 0; i < 6; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      newShapes.push({
        id: `shape-${i}`,
        shapeType: randomShape.id,
        x: Math.random() * 60 + 5, // 5-65% from left
        y: 60 + Math.random() * 20, // Bottom area
      });
    }
    setShapes(newShapes);
  }, []);

  const handleDrop = useCallback((shapeId: string, targetType: string) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    if (shape.shapeType === targetType) {
      // Correct!
      setShapes(prev => prev.filter(s => s.id !== shapeId));
      setScore(prev => prev + 1);
      
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playSuccess();
      }
    } else {
      // Wrong - shake animation
      if (volume > 0) {
        const soundManager = getSoundManager(volume);
        soundManager.playError();
      }
    }
    setDraggedShape(null);
  }, [shapes, volume]);

  const getShapeData = (shapeType: string) => {
    return SHAPES.find(s => s.id === shapeType) || SHAPES[0];
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-300 via-blue-200 to-purple-200 relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Card className="px-6 py-3 bg-white/90 rounded-full shadow-lg">
          <div className="text-2xl font-bold text-gray-800">🌟 {score}</div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🎮
        </Button>
      </div>

      {gameStarted ? (
        <>
          {/* Shape Slots */}
          <div className="flex justify-center gap-4 p-8">
            {SHAPES.map((shape) => (
              <motion.div
                key={shape.id}
                className={`w-24 h-24 ${shape.color} rounded-2xl border-4 border-dashed border-gray-400 flex items-center justify-center text-4xl`}
                whileHover={{ scale: 1.05 }}
                onMouseUp={() => draggedShape && handleDrop(draggedShape, shape.id)}
                onTouchEnd={() => draggedShape && handleDrop(draggedShape, shape.id)}
              >
                {shape.emoji}
              </motion.div>
            ))}
          </div>

          {/* Draggable Shapes */}
          <div className="flex-1 relative">
            {shapes.map((shape) => {
              const shapeData = getShapeData(shape.shapeType);
              return (
                <motion.div
                  key={shape.id}
                  className="absolute w-16 h-16 bg-white rounded-xl shadow-lg border-2 border-gray-300 flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing"
                  style={{
                    left: `${shape.x}%`,
                    top: `${shape.y}%`,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  drag
                  dragMomentum={false}
                  onDragStart={() => setDraggedShape(shape.id)}
                  onDragEnd={() => setDraggedShape(null)}
                >
                  {shapeData.emoji}
                </motion.div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="p-4 text-center">
            <Card className="p-4 bg-white/90 rounded-2xl shadow-lg">
              <div className="text-lg font-bold text-gray-800">
                Şekilleri doğru yerlere sürükle! 👆
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 text-center bg-white/90 rounded-3xl shadow-xl max-w-md">
            <div className="text-6xl mb-6">🔷</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Şekil Sıralama!</h2>
            <p className="text-gray-600 mb-6">
              Şekilleri doğru kutularına sürükle!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white text-xl font-bold rounded-2xl"
            >
              Başla! 🎮
            </Button>
          </Card>
        </div>
      )}

      {/* Win Condition */}
      {gameStarted && shapes.length === 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <Card className="p-8 bg-white rounded-3xl shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600 mb-4">Tebrikler!</div>
            <div className="text-lg text-gray-600 mb-6">Tüm şekilleri doğru yere koydun!</div>
            <Button
              onClick={startGame}
              className="w-full h-14 bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold rounded-2xl"
            >
              Yeniden Oyna! 🎮
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default ShapeSort;