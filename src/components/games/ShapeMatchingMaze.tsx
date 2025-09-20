import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Home } from 'lucide-react';

interface ShapeMatchingMazeProps {
  volume: number;
}

interface Shape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  emoji: string;
  name: string;
  color: string;
  bgGradient: string;
  sound: number;
  path: string; // SVG path for the shape
  matched: boolean;
  isDragging: boolean;
  dragPosition: { x: number; y: number };
}

interface Slot {
  id: string;
  shapeType: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  color: string;
  bgGradient: string;
  position: { x: number; y: number };
  filled: boolean;
  isHighlighted: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
  velocity: { x: number; y: number };
  life: number;
}

// Shape configurations with exact specifications
const SHAPES: Omit<Shape, 'matched' | 'isDragging' | 'dragPosition'>[] = [
  {
    id: 'circle',
    type: 'circle',
    emoji: '🔵',
    name: 'Daire',
    color: '#4169E1',
    bgGradient: 'from-blue-400 to-blue-600',
    sound: 440,
    path: 'M30 15 A15 15 0 1 1 30 45 A15 15 0 1 1 30 15 Z'
  },
  {
    id: 'square',
    type: 'square', 
    emoji: '🟥',
    name: 'Kare',
    color: '#DC143C',
    bgGradient: 'from-red-400 to-red-600',
    sound: 330,
    path: 'M15 15 L45 15 L45 45 L15 45 Z'
  },
  {
    id: 'triangle',
    type: 'triangle',
    emoji: '🔺',
    name: 'Üçgen', 
    color: '#32CD32',
    bgGradient: 'from-green-400 to-green-600',
    sound: 550,
    path: 'M30 15 L45 45 L15 45 Z'
  },
  {
    id: 'star',
    type: 'star',
    emoji: '⭐',
    name: 'Yıldız',
    color: '#FFD700',
    bgGradient: 'from-yellow-300 to-yellow-500',
    sound: 660,
    path: 'M30 15 L33 24 L42 24 L36 30 L39 39 L30 33 L21 39 L24 30 L18 24 L27 24 Z'
  },
  {
    id: 'heart',
    type: 'heart',
    emoji: '💖',
    name: 'Kalp',
    color: '#FF69B4',
    bgGradient: 'from-pink-400 to-pink-600', 
    sound: 220,
    path: 'M30 45 C30 45 15 30 15 22.5 A7.5 7.5 0 0 1 30 22.5 A7.5 7.5 0 0 1 45 22.5 C45 30 30 45 30 45 Z'
  }
];

// Maze path data - simplified but functional maze
const MAZE_PATHS = [
  // Horizontal paths
  { x: 50, y: 100, width: 200, height: 40 },
  { x: 150, y: 200, width: 150, height: 40 },
  { x: 50, y: 300, width: 250, height: 40 },
  { x: 100, y: 400, width: 150, height: 40 },
  
  // Vertical connectors
  { x: 150, y: 100, width: 40, height: 100 },
  { x: 200, y: 200, width: 40, height: 100 },
  { x: 100, y: 300, width: 40, height: 100 },
  { x: 250, y: 200, width: 40, height: 200 }
];

// Sound frequencies for each shape
const SOUND_FREQUENCIES = {
  circle: 440,
  square: 330, 
  triangle: 550,
  star: 660,
  heart: 220,
  success: 523,
  error: 196,
  complete: 784
};

export function ShapeMatchingMaze({ volume }: ShapeMatchingMazeProps) {
  // Game state
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [draggedShape, setDraggedShape] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const particleIdCounter = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio system
  const audioSystem = useMemo(() => {
    const getAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const playSound = (frequency: number, duration: number = 300, type: OscillatorType = 'triangle') => {
      if (volume === 0) return;
      
      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = type;
        gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
      } catch (error) {
        console.log('Audio error:', error);
      }
    };

    return { playSound };
  }, [volume]);

  // Initialize game
  useEffect(() => {
    if (!gameStarted) {
      // Initialize shapes
      const initialShapes: Shape[] = SHAPES.map((shape) => ({
        ...shape,
        matched: false,
        isDragging: false,
        dragPosition: { x: 0, y: 0 }
      }));

      // Initialize slots in top area
      const initialSlots: Slot[] = SHAPES.map((shape, index) => ({
        id: `slot-${shape.id}`,
        shapeType: shape.type,
        color: shape.color,
        bgGradient: shape.bgGradient,
        position: { 
          x: 40 + (index * 60), // Distribute across top
          y: 30 
        },
        filled: false,
        isHighlighted: false
      }));

      setShapes(initialShapes);
      setSlots(initialSlots);
      setGameStarted(true);
    }
  }, [gameStarted]);

  // Create success particles
  const createSuccessParticles = useCallback((centerX: number, centerY: number, color: string) => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const velocity = 50 + Math.random() * 100;
      
      newParticles.push({
        id: particleIdCounter.current++,
        x: centerX,
        y: centerY,
        color: color,
        scale: 0.5 + Math.random() * 0.8,
        opacity: 1,
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity
        },
        life: 1
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Handle shape drag start
  const handleShapeDragStart = useCallback((shapeId: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    setDraggedShape(shapeId);
    setShapes(prev => prev.map(shape => 
      shape.id === shapeId 
        ? { 
            ...shape, 
            isDragging: true,
            dragPosition: { x: clientX, y: clientY }
          }
        : shape
    ));

    // Play pickup sound
    const shape = SHAPES.find(s => s.id === shapeId);
    if (shape) {
      audioSystem.playSound(shape.sound, 200);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [audioSystem]);

  // Handle shape drag move
  const handleShapeDragMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!draggedShape) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    setShapes(prev => prev.map(shape => 
      shape.id === draggedShape 
        ? { ...shape, dragPosition: { x: clientX, y: clientY } }
        : shape
    ));

    // Highlight slots when shape is near
    setSlots(prev => prev.map(slot => {
      const slotElement = document.querySelector(`[data-slot-id="${slot.id}"]`);
      if (slotElement) {
        const rect = slotElement.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(clientX - (rect.left + rect.width / 2), 2) +
          Math.pow(clientY - (rect.top + rect.height / 2), 2)
        );
        
        return {
          ...slot,
          isHighlighted: distance < 60 && !slot.filled
        };
      }
      return slot;
    }));
  }, [draggedShape]);

  // Handle shape drop
  const handleShapeDrop = useCallback(() => {
    if (!draggedShape) return;

    const draggedShapeObj = shapes.find(s => s.id === draggedShape);
    if (!draggedShapeObj) return;

    // Check if shape is dropped on correct slot
    let targetSlot: Slot | null = null;
    let correctMatch = false;

    // Find the slot under the dropped shape
    const slotElements = document.querySelectorAll('[data-slot-id]');
    slotElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(draggedShapeObj.dragPosition.x - (rect.left + rect.width / 2), 2) +
        Math.pow(draggedShapeObj.dragPosition.y - (rect.top + rect.height / 2), 2)
      );
      
      if (distance < 50) { // 30dp tolerance + some buffer
        const slotId = element.getAttribute('data-slot-id');
        targetSlot = slots.find(s => s.id === slotId);
      }
    });

    if (targetSlot && !targetSlot.filled && targetSlot.shapeType === draggedShapeObj.type) {
      // Correct match!
      correctMatch = true;
      
      // Play success sound
      audioSystem.playSound(SOUND_FREQUENCIES.success, 500);
      
      // Create success particles
      const slotElement = document.querySelector(`[data-slot-id="${targetSlot.id}"]`);
      if (slotElement) {
        const rect = slotElement.getBoundingClientRect();
        createSuccessParticles(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          draggedShapeObj.color
        );
      }
      
      // Update shape as matched
      setShapes(prev => prev.map(shape =>
        shape.id === draggedShape
          ? { 
              ...shape, 
              matched: true, 
              isDragging: false,
              dragPosition: { x: 0, y: 0 }
            }
          : shape
      ));
      
      // Update slot as filled
      setSlots(prev => prev.map(slot =>
        slot.id === targetSlot!.id
          ? { ...slot, filled: true, isHighlighted: false }
          : { ...slot, isHighlighted: false }
      ));
      
      // Update score
      setScore(prev => prev + 20);
      setMatches(prev => {
        const newMatches = prev + 1;
        if (newMatches === 5) {
          setIsComplete(true);
          setShowCelebration(true);
          // Play completion fanfare
          setTimeout(() => audioSystem.playSound(SOUND_FREQUENCIES.complete, 800), 200);
          setTimeout(() => audioSystem.playSound(SOUND_FREQUENCIES.complete * 1.25, 800), 600);
          setTimeout(() => audioSystem.playSound(SOUND_FREQUENCIES.complete * 1.5, 1000), 1000);
          setTimeout(() => setShowCelebration(false), 4000);
        }
        return newMatches;
      });
      
      // Haptic feedback for success
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
    } else {
      // Wrong match or no target
      if (targetSlot && !correctMatch) {
        // Play error sound
        audioSystem.playSound(SOUND_FREQUENCIES.error, 400, 'sawtooth');
        
        // Haptic feedback for error
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }

      // Reset shape position
      setShapes(prev => prev.map(shape =>
        shape.id === draggedShape
          ? { 
              ...shape, 
              isDragging: false,
              dragPosition: { x: 0, y: 0 }
            }
          : shape
      ));
      
      // Clear slot highlights
      setSlots(prev => prev.map(slot => ({ ...slot, isHighlighted: false })));
    }
    
    setDraggedShape(null);
  }, [draggedShape, shapes, slots, audioSystem, createSuccessParticles]);

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0);
    setMatches(0);
    setShowCelebration(false);
    setIsComplete(false);
    setGameStarted(false);
    setParticles([]);
    setDraggedShape(null);
  }, []);

  // Update particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.velocity.x * 0.016,
          y: particle.y + particle.velocity.y * 0.016,
          velocity: {
            x: particle.velocity.x * 0.98,
            y: particle.velocity.y * 0.98 + 2 // gravity
          },
          life: particle.life - 0.02,
          opacity: particle.opacity - 0.02,
          scale: particle.scale * 0.99
        }))
        .filter(particle => particle.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Game Container - iPhone 14 dimensions */}
      <div 
        ref={containerRef}
        className="relative w-full h-[812px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-purple-100 via-blue-50 to-green-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-green-900/30"
        onMouseMove={handleShapeDragMove}
        onMouseUp={handleShapeDrop}
        onTouchMove={handleShapeDragMove}
        onTouchEnd={handleShapeDrop}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Sun */}
          <motion.div
            className="absolute top-8 right-8 text-6xl z-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            ☀️
          </motion.div>
          
          {/* Clouds */}
          <motion.div
            className="absolute top-12 left-8 text-4xl opacity-80 z-10"
            animate={{ x: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            ☁️
          </motion.div>
          
          <motion.div
            className="absolute top-16 right-20 text-3xl opacity-60 z-10"
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          >
            ☁️
          </motion.div>
          
          {/* Butterflies */}
          <motion.div
            className="absolute top-20 left-20 text-2xl z-10"
            animate={{ 
              x: [0, 30, 10, 40, 0],
              y: [0, -10, 5, -15, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            🦋
          </motion.div>
          
          <motion.div
            className="absolute top-24 right-12 text-2xl z-10"
            animate={{ 
              x: [0, -25, -5, -35, 0],
              y: [0, 8, -3, 12, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            🦋
          </motion.div>
          
          {/* Forest background */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-500 to-green-400 z-10" />
          <div className="absolute bottom-16 left-4 text-4xl z-10">🌳</div>
          <div className="absolute bottom-16 right-4 text-4xl z-10">🌲</div>
          <div className="absolute bottom-20 left-1/3 text-3xl z-10">🌿</div>
          <div className="absolute bottom-20 right-1/3 text-3xl z-10">🍄</div>
        </div>

        {/* Game Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
          {/* Score */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border-2 border-white/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="font-bold text-purple-600">{score}</span>
            </div>
          </motion.div>

          {/* Progress */}
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index < matches ? 'bg-green-500 shadow-lg' : 'bg-white/50'
                }`}
                animate={index < matches ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Reset Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={resetGame}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center border-2 border-white/50 hover:bg-white"
          >
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </motion.button>
        </div>

        {/* Slots (Top Area) */}
        <div className="absolute top-16 left-4 right-4 z-20">
          <div className="flex justify-center gap-3">
            {slots.map((slot) => (
              <motion.div
                key={slot.id}
                data-slot-id={slot.id}
                className={`
                  w-20 h-20 rounded-2xl border-4 shadow-lg relative overflow-hidden
                  ${slot.filled ? 'border-green-400 bg-green-100/50' : 
                    slot.isHighlighted ? 'border-yellow-400 bg-yellow-100/50' : 'border-white/70'}
                  bg-gradient-to-br ${slot.bgGradient}
                `}
                animate={{
                  scale: slot.isHighlighted ? 1.1 : 1,
                  borderColor: slot.filled ? '#4ade80' : slot.isHighlighted ? '#facc15' : '#ffffff70'
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Slot silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12" viewBox="0 0 60 60">
                    <path
                      d={SHAPES.find(s => s.type === slot.shapeType)?.path}
                      fill={slot.filled ? slot.color : 'rgba(255,255,255,0.3)'}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                
                {/* Success indicator */}
                {slot.filled && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 text-green-500 text-lg"
                  >
                    ✨
                  </motion.div>
                )}
                
                {/* Highlight pulse */}
                {slot.isHighlighted && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-yellow-300/30"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Maze Area (Center) */}
        <div className="absolute top-32 left-6 right-6 h-96 z-15">
          <div className="relative w-full h-full bg-gray-200/50 rounded-3xl overflow-hidden shadow-inner">
            {/* Maze paths */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400">
              {/* Maze walls (background) */}
              <rect width="300" height="400" fill="#2C2C2C" />
              
              {/* Maze paths */}
              {MAZE_PATHS.map((path, index) => (
                <rect
                  key={index}
                  x={path.x}
                  y={path.y}
                  width={path.width}
                  height={path.height}
                  fill="#F5F5F5"
                  rx="4"
                />
              ))}
            </svg>
            
            {/* Decorative maze elements */}
            <div className="absolute top-4 left-4 text-2xl opacity-60">🏁</div>
            <div className="absolute bottom-4 right-4 text-2xl opacity-60">🎯</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl opacity-40">🔄</div>
            
            {/* Path indicators */}
            <motion.div
              className="absolute top-8 left-8 w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-8 right-8 w-2 h-2 bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </div>
        </div>

        {/* Shapes (Bottom Area) */}
        <div className="absolute bottom-24 left-4 right-4 z-20">
          <div className="flex justify-center gap-3">
            {shapes.map((shape, index) => (
              <motion.div
                key={shape.id}
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                  ...(shape.isDragging ? {
                    position: 'fixed',
                    left: shape.dragPosition.x - 30,
                    top: shape.dragPosition.y - 30,
                    zIndex: 50,
                    pointerEvents: 'none'
                  } : {})
                }}
                animate={{
                  scale: shape.isDragging ? 1.2 : shape.matched ? 0.8 : 1,
                  opacity: shape.matched ? 0.3 : 1,
                  rotate: shape.isDragging ? 5 : 0
                }}
                whileHover={!shape.matched ? { scale: 1.05 } : {}}
                onMouseDown={!shape.matched ? (e) => handleShapeDragStart(shape.id, e) : undefined}
                onTouchStart={!shape.matched ? (e) => handleShapeDragStart(shape.id, e) : undefined}
              >
                {/* Shape Container */}
                <div className={`
                  w-15 h-15 rounded-2xl relative overflow-hidden shadow-lg
                  border-4 border-white/80 bg-gradient-to-br ${shape.bgGradient}
                  ${shape.isDragging ? 'shadow-2xl' : ''}
                  ${shape.matched ? 'grayscale' : ''}
                `}>
                  {/* Shape SVG */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10" viewBox="0 0 60 60">
                      <path
                        d={shape.path}
                        fill={shape.color}
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="2"
                      />
                      {/* Highlight effect */}
                      <path
                        d={shape.path}
                        fill="url(#highlight)"
                        opacity="0.4"
                      />
                      <defs>
                        <linearGradient id="highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                          <stop offset="30%" stopColor="white" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Sparkle Effect */}
                  {!shape.matched && (
                    <motion.div
                      className="absolute top-1 right-1 text-xs"
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      ✨
                    </motion.div>
                  )}

                  {/* Matched indicator */}
                  {shape.matched && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl">
                      <span className="text-2xl">✓</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {score === 0 && !showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-4 left-4 right-4 z-25"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg text-center border-2 border-white/50">
              <div className="text-sm font-bold text-gray-700">
                🎯 Şekilleri doğru yuvalarına sürükle!
              </div>
            </div>
          </motion.div>
        )}

        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none text-lg z-40"
              style={{
                left: particle.x,
                top: particle.y,
                color: particle.color
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: particle.scale,
                opacity: particle.opacity
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              ⭐
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white px-8 py-6 rounded-3xl text-xl font-bold shadow-2xl text-center"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ 
                  scale: [0, 1.3, 1],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
              >
                <div className="text-4xl mb-3">🎉</div>
                <div>Tüm Şekiller Eşleşti!</div>
                <div className="text-lg mt-2">Harika iş çıkardın! 🌟</div>
                <div className="text-4xl mt-3">🎉</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}