import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, Save } from 'lucide-react';
import { getSoundManager } from '../utils/SoundManager';

interface AnimalPaintingProps {
  volume: number;
  onGoBack: () => void;
}

interface AnimalTemplate {
  id: string;
  name: string;
  emoji: string;
  sound: string;
  paths: string[];
  baseColor: string;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
}

// Color palette for kids - bright and fun colors
const COLORS = [
  { id: 'red', color: '#FF6B6B', name: 'Kırmızı', emoji: '🔴' },
  { id: 'blue', color: '#4ECDC4', name: 'Mavi', emoji: '🔵' },
  { id: 'yellow', color: '#FFE66D', name: 'Sarı', emoji: '🟡' },
  { id: 'green', color: '#95E1D3', name: 'Yeşil', emoji: '🟢' },
  { id: 'purple', color: '#B06AB3', name: 'Mor', emoji: '🟣' },
  { id: 'orange', color: '#FF8B94', name: 'Turuncu', emoji: '🟠' },
  { id: 'pink', color: '#FFB6C1', name: 'Pembe', emoji: '🩷' },
  { id: 'brown', color: '#D2B48C', name: 'Kahverengi', emoji: '🤎' }
];

// Animal templates with simple SVG-like shapes
const ANIMALS: AnimalTemplate[] = [
  {
    id: 'cat',
    name: 'Kedi',
    emoji: '🐱',
    sound: 'Miyav miyav!',
    baseColor: '#FFA500',
    paths: [
      'M150 200 Q120 180 120 150 Q120 120 150 120 Q180 120 180 150 Q180 180 150 200 Z', // head
      'M130 130 Q120 120 110 130 Q120 140 130 130 Z', // left ear
      'M170 130 Q180 120 190 130 Q180 140 170 130 Z', // right ear
      'M135 155 Q140 150 145 155 Q140 160 135 155 Z', // left eye
      'M155 155 Q160 150 165 155 Q160 160 155 155 Z', // right eye
      'M150 170 Q145 175 150 180 Q155 175 150 170 Z', // nose
      'M150 220 Q130 240 130 260 Q130 280 150 280 Q170 280 170 260 Q170 240 150 220 Z', // body
      'M120 250 Q100 250 100 270 Q100 290 120 290 Q140 290 140 270 Q140 250 120 250 Z', // left paw
      'M180 250 Q160 250 160 270 Q160 290 180 290 Q200 290 200 270 Q200 250 180 250 Z' // right paw
    ]
  },
  {
    id: 'dog',
    name: 'Köpek', 
    emoji: '🐶',
    sound: 'Hav hav!',
    baseColor: '#8B4513',
    paths: [
      'M150 200 Q110 180 110 140 Q110 100 150 100 Q190 100 190 140 Q190 180 150 200 Z', // head
      'M120 120 Q100 100 80 120 Q100 140 120 120 Z', // left ear
      'M180 120 Q200 100 220 120 Q200 140 180 120 Z', // right ear
      'M130 145 Q135 140 140 145 Q135 150 130 145 Z', // left eye
      'M160 145 Q165 140 170 145 Q165 150 160 145 Z', // right eye
      'M150 165 Q140 170 140 180 Q150 190 160 180 Q160 170 150 165 Z', // snout
      'M150 220 Q120 240 120 270 Q120 300 150 300 Q180 300 180 270 Q180 240 150 220 Z', // body
      'M110 280 Q90 280 90 300 Q90 320 110 320 Q130 320 130 300 Q130 280 110 280 Z', // left paw
      'M190 280 Q170 280 170 300 Q170 320 190 320 Q210 320 210 300 Q210 280 190 280 Z' // right paw
    ]
  },
  {
    id: 'rabbit',
    name: 'Tavşan',
    emoji: '🐰', 
    sound: 'Hop hop!',
    baseColor: '#FFB6C1',
    paths: [
      'M150 200 Q120 180 120 150 Q120 120 150 120 Q180 120 180 150 Q180 180 150 200 Z', // head
      'M135 100 Q130 80 130 60 Q130 40 140 40 Q150 40 150 60 Q150 80 145 100 Z', // left ear
      'M155 100 Q150 80 150 60 Q150 40 160 40 Q170 40 170 60 Q170 80 165 100 Z', // right ear
      'M135 155 Q140 150 145 155 Q140 160 135 155 Z', // left eye
      'M155 155 Q160 150 165 155 Q160 160 155 155 Z', // right eye
      'M150 170 Q145 175 150 180 Q155 175 150 170 Z', // nose
      'M150 220 Q125 235 125 260 Q125 285 150 285 Q175 285 175 260 Q175 235 150 220 Z', // body
      'M130 270 Q115 270 115 285 Q115 300 130 300 Q145 300 145 285 Q145 270 130 270 Z', // left paw
      'M170 270 Q155 270 155 285 Q155 300 170 300 Q185 300 185 285 Q185 270 170 270 Z' // right paw
    ]
  },
  {
    id: 'bird',
    name: 'Kuş',
    emoji: '🐦',
    sound: 'Cik cik!',
    baseColor: '#87CEEB',
    paths: [
      'M150 160 Q125 140 125 115 Q125 90 150 90 Q175 90 175 115 Q175 140 150 160 Z', // head
      'M150 180 Q120 200 120 230 Q120 260 150 260 Q180 260 180 230 Q180 200 150 180 Z', // body
      'M105 115 Q85 105 75 115 Q85 125 105 115 Z', // beak
      'M135 110 Q140 105 145 110 Q140 115 135 110 Z', // left eye
      'M155 110 Q160 105 165 110 Q160 115 155 110 Z', // right eye
      'M110 220 Q80 210 60 230 Q80 250 110 240 Z', // left wing
      'M190 220 Q220 210 240 230 Q220 250 190 240 Z', // right wing
      'M140 270 Q130 280 130 290 Q140 280 140 270 Z', // left foot
      'M160 270 Q170 280 170 290 Q160 280 160 270 Z' // right foot
    ]
  },
  {
    id: 'fish',
    name: 'Balık',
    emoji: '🐟',
    sound: 'Balık balık!',
    baseColor: '#FFD700',
    paths: [
      'M150 200 Q100 180 100 150 Q100 120 150 120 Q200 120 200 150 Q200 180 150 200 Z', // body
      'M80 150 Q60 130 40 150 Q60 170 80 150 Z', // tail
      'M125 135 Q130 130 135 135 Q130 140 125 135 Z', // left eye
      'M165 135 Q170 130 175 135 Q170 140 165 135 Z', // right eye
      'M170 120 Q180 110 190 120 Q180 130 170 120 Z', // top fin
      'M170 180 Q180 190 190 180 Q180 170 170 180 Z', // bottom fin
      'M130 110 Q140 100 150 110 Q140 120 130 110 Z', // dorsal fin
      'M110 160 Q100 150 90 160 Q100 170 110 160 Z' // side fin
    ]
  }
];

export function AnimalPainting({ volume, onGoBack }: AnimalPaintingProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalTemplate>(ANIMALS[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].color);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [paintedPaths, setPaintedPaths] = useState<{[key: string]: string}>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);

  const textIdCounter = useRef(0);
  const sparkleIdCounter = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number>();

  // Sparkle animation system
  useEffect(() => {
    const animateSparkles = () => {
      setSparkles(prev => prev.map(sparkle => ({
        ...sparkle,
        life: sparkle.life - 1,
        y: sparkle.y - 1,
        size: sparkle.size * 0.98
      })).filter(sparkle => sparkle.life > 0));
      
      animationFrameRef.current = requestAnimationFrame(animateSparkles);
    };
    
    animateSparkles();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  // Create sparkles
  const createSparkles = useCallback((x: number, y: number, color: string) => {
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 3; i++) {
      newSparkles.push({
        id: sparkleIdCounter.current++,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        color,
        size: Math.random() * 8 + 4,
        life: 60
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
  }, []);

  // Handle animal selection
  const selectAnimal = useCallback((animal: AnimalTemplate) => {
    setSelectedAnimal(animal);
    setPaintedPaths({}); // Reset painting
    playSound(440, 200);
    createFloatingText(animal.sound, 150, 100, selectedColor);
  }, [playSound, createFloatingText, selectedColor]);

  // Handle color selection
  const selectColor = useCallback((colorInfo: typeof COLORS[0]) => {
    setSelectedColor(colorInfo.color);
    playSound(330 + COLORS.indexOf(colorInfo) * 50, 150);
    createFloatingText(`${colorInfo.emoji} ${colorInfo.name}`, 150, 50, colorInfo.color);
  }, [playSound, createFloatingText]);

  // Handle path painting
  const paintPath = useCallback((pathIndex: number, event: React.MouseEvent | React.TouchEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setPaintedPaths(prev => ({ ...prev, [pathIndex]: selectedColor }));
    createSparkles(x, y, selectedColor);
    playSound(440 + pathIndex * 80, 100);
  }, [selectedColor, createSparkles, playSound]);

  // Clear painting
  const clearPainting = useCallback(() => {
    setPaintedPaths({});
    playSound(200, 300);
    createFloatingText('🧽 Temizlendi!', 150, 120, '#4ECDC4');
  }, [playSound, createFloatingText]);

  // Save painting (placeholder for now)
  const savePainting = useCallback(() => {
    playSound(523.25, 500);
    createFloatingText('💾 Kaydedildi!', 150, 120, '#FFD700');
  }, [playSound, createFloatingText]);

  return (
    <div 
      className="relative mx-auto overflow-hidden shadow-2xl w-full max-w-sm"
      style={{ 
        aspectRatio: '375 / 812',
        borderRadius: 'var(--radius-widget)',
        maxHeight: '85vh',
        minHeight: '600px',
        background: 'linear-gradient(to bottom, #E6F3FF, #F0F8FF, #FFF8E6)'
      }}
    >
      {/* Header */}
      <div 
        className="absolute flex justify-between items-center z-30"
        style={{ 
          top: 'calc(var(--mobile-padding) / 2)', 
          left: 'var(--mobile-padding)', 
          right: 'var(--mobile-padding)' 
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          style={{ 
            borderRadius: 'var(--radius-card)',
            padding: 'calc(var(--mobile-padding) * 0.6)',
            fontFamily: 'var(--font-text)'
          }}
        >
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 'var(--text-kids-large)' }}>🎨</span>
            <span style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(147, 51, 234)'
            }}>Boya</span>
          </div>
        </motion.div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'calc(var(--mobile-gap) * 0.5)' }}>
          {/* Clear Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={clearPainting}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.7)',
              height: 'calc(var(--kids-emoji-size) * 0.7)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <RotateCcw className="w-4 h-4 text-orange-600" />
          </motion.button>

          {/* Save Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={savePainting}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.7)',
              height: 'calc(var(--kids-emoji-size) * 0.7)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <Save className="w-4 h-4 text-green-600" />
          </motion.button>

          {/* Back Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onGoBack}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.7)',
              height: 'calc(var(--kids-emoji-size) * 0.7)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span style={{ fontSize: 'var(--text-kids-small)' }}>🏠</span>
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'calc(var(--kids-emoji-size) * 0.7)',
              height: 'calc(var(--kids-emoji-size) * 0.7)',
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
          paddingTop: 'calc(var(--kids-emoji-size) * 0.8)',
          paddingBottom: 'calc(var(--mobile-padding) * 0.3)',
          fontFamily: 'var(--font-display)'
        }}
      >
        <div style={{ 
          fontSize: 'var(--text-kids-large)', 
          fontWeight: 'var(--font-weight-bold)',
          color: 'rgb(147, 51, 234)',
          marginBottom: 'calc(var(--mobile-gap) * 0.3)'
        }}>
          🎨 Hayvan Boyama 🖌️
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={{ 
        padding: 'var(--mobile-padding)',
        paddingTop: 'calc(var(--mobile-padding) * 0.5)'
      }}>
        
        {/* Animal Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div 
            className="flex gap-2 p-2 bg-white/90 backdrop-blur-sm shadow-lg overflow-x-auto scrollbar-hide"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            {ANIMALS.map((animal) => (
              <motion.button
                key={animal.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectAnimal(animal)}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  selectedAnimal.id === animal.id 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                style={{ 
                  minWidth: 'calc(var(--kids-emoji-size) * 1.2)',
                  borderRadius: 'var(--radius)'
                }}
              >
                <div className="text-center">
                  <div style={{ fontSize: 'var(--text-kids-medium)' }}>
                    {animal.emoji}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-kids-small)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--font-weight-bold)',
                    marginTop: '2px'
                  }}>
                    {animal.name}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Color Palette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div 
            className="flex flex-wrap gap-2 p-3 bg-white/90 backdrop-blur-sm shadow-lg justify-center"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            {COLORS.map((colorInfo) => (
              <motion.button
                key={colorInfo.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => selectColor(colorInfo)}
                className={`rounded-full shadow-lg transition-all ${
                  selectedColor === colorInfo.color 
                    ? 'ring-4 ring-white ring-offset-2 ring-offset-purple-200' 
                    : ''
                }`}
                style={{ 
                  width: 'calc(var(--kids-emoji-size) * 0.8)',
                  height: 'calc(var(--kids-emoji-size) * 0.8)',
                  backgroundColor: colorInfo.color
                }}
              >
                <motion.div
                  animate={selectedColor === colorInfo.color ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: 'var(--text-kids-medium)' }}
                >
                  {colorInfo.emoji}
                </motion.div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Canvas Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div 
            className="bg-white shadow-lg p-4 overflow-hidden"
            style={{ 
              borderRadius: 'var(--radius-card)',
              minHeight: '300px'
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 300 350"
              className="w-full h-full cursor-pointer"
              style={{ maxHeight: '300px' }}
            >
              {/* Animal paths */}
              {selectedAnimal.paths.map((path, index) => (
                <motion.path
                  key={index}
                  d={path}
                  fill={paintedPaths[index] || selectedAnimal.baseColor}
                  stroke="#333"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:brightness-110"
                  onClick={(e) => paintPath(index, e)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    paintPath(index, e);
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </svg>

            {/* Sparkles overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {sparkles.map((sparkle) => (
                <motion.div
                  key={sparkle.id}
                  className="absolute rounded-full"
                  style={{
                    left: sparkle.x,
                    top: sparkle.y,
                    width: sparkle.size,
                    height: sparkle.size,
                    backgroundColor: sparkle.color,
                    opacity: sparkle.life / 60
                  }}
                  animate={{
                    scale: [1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-center"
        >
          <div 
            className="bg-white/95 backdrop-blur-sm shadow-lg text-center"
            style={{
              borderRadius: 'var(--radius-card)',
              padding: 'calc(var(--mobile-padding) * 0.8)'
            }}
          >
            <div style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(147, 51, 234)',
              fontFamily: 'var(--font-text)',
              marginBottom: 'calc(var(--mobile-gap) / 3)'
            }}>
              🖌️ Hayvanı Boyayalım! 🎨
            </div>
            <div style={{ 
              fontSize: 'var(--text-kids-small)',
              color: 'rgb(107, 114, 128)',
              fontFamily: 'var(--font-text)'
            }}>
              Renk seç, hayvanın parçalarına dokun ve boya!
            </div>
          </div>
        </motion.div>

        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map((text) => (
            <motion.div
              key={text.id}
              className="absolute pointer-events-none z-40 font-bold"
              style={{
                left: text.x,
                top: text.y,
                color: text.color,
                fontSize: 'var(--text-kids-medium)',
                fontFamily: 'var(--font-text)'
              }}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: -30 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5, 
                y: -60 
              }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              {text.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating art supplies */}
          <motion.div
            className="absolute opacity-20"
            style={{ 
              top: '15%', 
              left: '5%',
              fontSize: 'var(--text-kids-medium)'
            }}
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🖌️
          </motion.div>
          
          <motion.div
            className="absolute opacity-20"
            style={{ 
              top: '25%', 
              right: '8%',
              fontSize: 'var(--text-kids-medium)'
            }}
            animate={{ 
              rotate: [0, -8, 8, 0],
              x: [0, 3, -3, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            🎨
          </motion.div>

          <motion.div
            className="absolute opacity-20"
            style={{ 
              bottom: '15%', 
              left: '10%',
              fontSize: 'var(--text-kids-medium)'
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🖍️
          </motion.div>
        </div>
      </div>
    </div>
  );
}