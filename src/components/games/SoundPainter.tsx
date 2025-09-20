import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface SoundPainterProps {
  volume: number;
  onBack: () => void;
}

interface Stroke {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  note: string;
  emoji: string;
  width: number;
}

interface SoundEffect {
  id: number;
  x: number;
  y: number;
  emoji: string;
  color: string;
}

const PAINT_SOUNDS = [
  { note: 'C4', color: '#FF6B9D', emoji: '🐱', name: 'Pembe', freq: 261.63 },
  { note: 'D4', color: '#FF8E53', emoji: '🐶', name: 'Turuncu', freq: 293.66 },
  { note: 'E4', color: '#FFD93D', emoji: '🦆', name: 'Sarı', freq: 329.63 },
  { note: 'F4', color: '#6BCF7F', emoji: '🐸', name: 'Yeşil', freq: 349.23 },
  { note: 'G4', color: '#4D96FF', emoji: '🐦', name: 'Mavi', freq: 392.00 },
  { note: 'A4', color: '#9B59B6', emoji: '🐭', name: 'Mor', freq: 440.00 },
];

export function SoundPainter({ volume, onBack }: SoundPainterProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedSound, setSelectedSound] = useState(PAINT_SOUNDS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [soundEffects, setSoundEffects] = useState<SoundEffect[]>([]);
  const [brushSize, setBrushSize] = useState(8);
  
  const audioContext = useRef<AudioContext | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const strokeIdCounter = useRef(0);
  const effectIdCounter = useRef(0);
  const lastSoundTime = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.3) => {
    if (!audioContext.current) return;

    const now = Date.now();
    if (now - lastSoundTime.current < 100) return; // Throttle sounds
    lastSoundTime.current = now;

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

  const createSoundEffect = (x: number, y: number) => {
    const effectId = effectIdCounter.current++;
    const newEffect: SoundEffect = {
      id: effectId,
      x,
      y,
      emoji: selectedSound.emoji,
      color: selectedSound.color
    };

    setSoundEffects(prev => [...prev, newEffect]);

    setTimeout(() => {
      setSoundEffects(prev => prev.filter(effect => effect.id !== effectId));
    }, 800);
  };

  const getMousePos = (event: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const pos = getMousePos(event);
    
    setIsDrawing(true);
    const newStroke: Stroke = {
      id: strokeIdCounter.current++,
      points: [pos],
      color: selectedSound.color,
      note: selectedSound.note,
      emoji: selectedSound.emoji,
      width: brushSize
    };
    
    setCurrentStroke(newStroke);
    playNote(selectedSound.freq);
    createSoundEffect(pos.x, pos.y);
  };

  const handleMouseMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    
    event.preventDefault();
    const pos = getMousePos(event);
    
    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, pos]
      };
    });

    // Play sound based on movement speed
    const speed = Math.random() * 0.3 + 0.7; // Vary frequency slightly
    playNote(selectedSound.freq * speed);
    createSoundEffect(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    if (currentStroke) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
    setIsDrawing(false);
  };

  const createPathData = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    
    const [first, ...rest] = points;
    let path = `M ${first.x} ${first.y}`;
    
    for (let i = 0; i < rest.length; i++) {
      const curr = rest[i];
      if (i === 0) {
        path += ` L ${curr.x} ${curr.y}`;
      } else {
        const prev = rest[i - 1];
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2;
        path += ` Q ${prev.x} ${prev.y} ${cpx} ${cpy}`;
      }
    }
    
    return path;
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setSoundEffects([]);
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
          <div className="text-6xl">🖌️</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Ses Ressam
          </div>
        </div>
        
        <Button
          onClick={clearCanvas}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Drawing Canvas */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-slate-800/95 dark:to-slate-700/95 min-h-[400px] overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-[400px] cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Canvas Background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Finished Strokes */}
          {strokes.map((stroke) => (
            <g key={stroke.id}>
              <path
                d={createPathData(stroke.points)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.8"
              />
              {/* Emoji decorations along the stroke */}
              {stroke.points.filter((_, i) => i % 10 === 0).map((point, i) => (
                <text
                  key={i}
                  x={point.x}
                  y={point.y}
                  fontSize="16"
                  textAnchor="middle"
                  opacity="0.6"
                >
                  {stroke.emoji}
                </text>
              ))}
            </g>
          ))}
          
          {/* Current Stroke */}
          {currentStroke && (
            <g>
              <path
                d={createPathData(currentStroke.points)}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.9"
              />
            </g>
          )}
        </svg>

        {/* Sound Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {soundEffects.map((effect) => (
              <motion.div
                key={effect.id}
                className="absolute text-2xl"
                style={{ left: effect.x - 10, top: effect.y - 10 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  rotate: [0, 180, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {effect.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Canvas Instructions */}
        {strokes.length === 0 && !currentStroke && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center space-y-4 opacity-60">
              <div className="text-8xl">🎨</div>
              <div className="text-xl">Boyama alanı</div>
              <div className="text-lg">Çiz ve müzik dinle! 🎵</div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Sound Palette */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {PAINT_SOUNDS.map((sound, index) => (
          <motion.div
            key={sound.note}
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
                ${selectedSound.note === sound.note ? 'border-yellow-300 ring-4 ring-yellow-200' : 'border-white/50'}
              `}
              style={{ backgroundColor: sound.color }}
              onClick={() => setSelectedSound(sound)}
            >
              <div className="text-center space-y-1">
                <div className="text-3xl">{sound.emoji}</div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {sound.name}
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedSound.note === sound.note && (
                <motion.div
                  className="absolute inset-0 bg-yellow-300/30 rounded-3xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Brush Size Control */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-center space-x-4"
      >
        <Card className="p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🖌️</div>
            <div className="text-lg font-bold">Fırça Boyutu:</div>
            <div className="flex space-x-2">
              {[4, 8, 12, 16].map((size) => (
                <Button
                  key={size}
                  variant={brushSize === size ? "default" : "outline"}
                  className="w-12 h-12 rounded-full"
                  onClick={() => setBrushSize(size)}
                >
                  <div 
                    className="rounded-full bg-current"
                    style={{ 
                      width: Math.max(size / 2, 4), 
                      height: Math.max(size / 2, 4) 
                    }}
                  />
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-purple-200/80 to-pink-200/80 dark:from-purple-600/20 dark:to-pink-600/20 border-4 border-purple-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🎨</div>
            <div className="text-lg font-bold">Ses Boyama</div>
            <div className="text-sm opacity-80">
              Çizerken sesler çıkar! Her rengin kendine özgü sesi var! 🎵✨
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}