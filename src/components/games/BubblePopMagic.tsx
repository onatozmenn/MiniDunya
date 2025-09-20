import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface BubblePopMagicProps {
  volume: number;
  onGoBack: () => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number; // X velocity for physics
  vy: number; // Y velocity for physics
  colorIndex: number;
  size: 'small' | 'medium' | 'large';
  speed: number;
  lifespan: number;
  createdAt: number;
  type: 'normal' | 'bomb' | 'rainbow' | 'magnet' | 'freeze' | 'multiplier';
  magneticField?: number; // For magnet bubbles
  frozen?: boolean; // For freeze effect
  chainReaction?: boolean; // For bomb bubbles
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: 1 | 2 | 3;
  speed: number;
}

// Color system with 6 colors × 3 tones
const BUBBLE_COLORS = [
  // Red
  { light: '#FF6B6B', medium: '#FF4757', dark: '#C44569', note: 261.63 },
  // Blue  
  { light: '#74B9FF', medium: '#0984E3', dark: '#2D3436', note: 293.66 },
  // Green
  { light: '#00B894', medium: '#00A085', dark: '#006A4E', note: 329.63 },
  // Yellow
  { light: '#FDCB6E', medium: '#E17055', dark: '#D63031', note: 349.23 },
  // Purple
  { light: '#A29BFE', medium: '#6C5CE7', dark: '#5F3DC4', note: 392.00 },
  // Orange
  { light: '#FFB347', medium: '#FF8C00', dark: '#FF7F00', note: 440.00 }
];

// Size configurations
const BUBBLE_SIZES = {
  small: { diameter: 60, speed: { min: 2, max: 3 }, sound: { duration: 200, frequency: 1.2 } },
  medium: { diameter: 80, speed: { min: 3, max: 5 }, sound: { duration: 300, frequency: 1.0 } },
  large: { diameter: 100, speed: { min: 4, max: 6 }, sound: { duration: 400, frequency: 0.8 } }
};

// Game configuration - Responsive design
const GAME_CONFIG = {
  width: 375,  // Base width for calculations
  height: 812, // Base height for calculations  
  safeArea: 20,
  maxBubbles: 30,
  bubbleLifespan: { min: 8000, max: 15000 },
  spawnInterval: { min: 800, max: 2000 },
  longPressThreshold: 500,
  hitAreaPadding: 20,
  uiSafeZone: 120, // Top safe zone for UI
  
  // Progressive difficulty settings
  difficulty: {
    speedMultiplier: 0.3, // Her seviyede speed artış çarpanı
    spawnRateMultiplier: 0.15, // Her seviyede spawn rate artış çarpanı
    maxSpeedIncrease: 3.0, // Maksimum hız artışı
    maxSpawnIncrease: 0.7 // Maksimum spawn rate artışı
  }
};

export function BubblePopMagic({ volume, onGoBack }: BubblePopMagicProps) {
  // Game state
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [longPressedBubble, setLongPressedBubble] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [windForce, setWindForce] = useState({ x: 0, y: 0 });
  const [freezeMode, setFreezeMode] = useState(0); // Freeze countdown
  const [multiplierMode, setMultiplierMode] = useState(0); // Multiplier countdown
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [touches, setTouches] = useState<{ id: number, x: number, y: number }[]>([]);

  // Refs for performance
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const cloudIdCounter = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Optimized audio system
  const audioSystem = useMemo(() => {
    const getAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const playNote = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      if (!isSoundOn || volume === 0) return;
      
      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = type;
        gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
      } catch (error) {
        console.log('Audio error:', error);
      }
    };

    return { playNote };
  }, [isSoundOn, volume]);

  // Create responsive initial clouds
  useEffect(() => {
    const createResponsiveClouds = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      if (containerWidth === 0 || containerHeight === 0) return;
      
      const initialClouds: Cloud[] = [];
      
      // Layer 1: Responsive cloud size
      for (let i = 0; i < 3; i++) {
        const cloudSize = Math.max(80, containerWidth * 0.32); // 32% of container width
        initialClouds.push({
          id: cloudIdCounter.current++,
          x: Math.random() * (containerWidth - cloudSize),
          y: Math.random() * (containerHeight * 0.15) + 20,
          size: cloudSize,
          opacity: 0.3,
          layer: 1,
          speed: 1
        });
      }
      
      // Layer 2: Smaller responsive clouds
      for (let i = 0; i < 4; i++) {
        const cloudSize = Math.max(60, containerWidth * 0.21); // 21% of container width
        initialClouds.push({
          id: cloudIdCounter.current++,
          x: Math.random() * (containerWidth - cloudSize),
          y: Math.random() * (containerHeight * 0.25) + 30,
          size: cloudSize,
          opacity: 0.2,
          layer: 2,
          speed: 0.5
        });
      }
      
      // Layer 3: Medium responsive clouds
      for (let i = 0; i < 3; i++) {
        const cloudSize = Math.max(70, containerWidth * 0.27); // 27% of container width
        initialClouds.push({
          id: cloudIdCounter.current++,
          x: Math.random() * (containerWidth - cloudSize),
          y: Math.random() * (containerHeight * 0.22) + 25,
          size: cloudSize,
          opacity: 0.25,
          layer: 3,
          speed: 0.8
        });
      }
      
      setClouds(initialClouds);
    };

    // Delay cloud creation to ensure container is rendered
    const timer = setTimeout(createResponsiveClouds, 100);
    return () => clearTimeout(timer);
  }, []);

  // Countdown and game start
  useEffect(() => {
    if (!gameStarted && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setGameStarted(true);
          setCountdown(0);
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, gameStarted]);

  // Responsive balon üretici - container boyutuna göre
  const createBubble = useCallback((): Bubble | null => {
    if (!containerRef.current || !gameStarted) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    const sizeTypes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const size = sizeTypes[Math.floor(Math.random() * sizeTypes.length)];
    const sizeConfig = BUBBLE_SIZES[size];
    
    // Çok yumuşak zorluk artışı - her seviyede sadece %15 hız artışı
    const speedMultiplier = 1 + (gameLevel - 1) * 0.15;
    
    // Özel balon türleri (seviye 2'den itibaren)
    let type: 'normal' | 'bomb' | 'rainbow' | 'magnet' | 'freeze' | 'multiplier' = 'normal';
    const rand = Math.random();
    
    if (gameLevel >= 2) {
      if (rand < 0.08) type = 'bomb';        
      else if (rand < 0.12) type = 'rainbow';  
      else if (rand < 0.16) type = 'magnet';  
      else if (rand < 0.19) type = 'freeze';  
      else if (rand < 0.22) type = 'multiplier';
    }
    
    // Responsive pozisyon - gerçek container genişliğini kullan
    const startX = Math.random() * (containerWidth - sizeConfig.diameter - GAME_CONFIG.safeArea * 2) + GAME_CONFIG.safeArea;
    
    // Responsive hız - ekran boyutuna göre ölçekle
    const screenScale = containerHeight / GAME_CONFIG.height;
    const baseSpeed = (sizeConfig.speed.min + Math.random() * (sizeConfig.speed.max - sizeConfig.speed.min)) * screenScale;
    const finalSpeed = baseSpeed * speedMultiplier;
    
    return {
      id: bubbleIdCounter.current++,
      x: startX,
      y: -sizeConfig.diameter,
      vx: 0,
      vy: finalSpeed,
      colorIndex: Math.floor(Math.random() * BUBBLE_COLORS.length),
      size,
      speed: finalSpeed,
      lifespan: GAME_CONFIG.bubbleLifespan.min + Math.random() * (GAME_CONFIG.bubbleLifespan.max - GAME_CONFIG.bubbleLifespan.min),
      createdAt: Date.now(),
      type,
      magneticField: type === 'magnet' ? 100 : undefined,
      frozen: false,
      chainReaction: type === 'bomb'
    };
  }, [gameStarted, gameLevel]);

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number, colorIndex: number, intensity: number = 1) => {
    const newParticles: Particle[] = [];
    const particleCount = Math.floor(8 + Math.random() * 4) * intensity; // 8-12 particles
    const color = BUBBLE_COLORS[colorIndex];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = (200 + Math.random() * 200) * intensity; // 200-400dp/s
      
      newParticles.push({
        id: particleIdCounter.current++,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color.medium,
        size: 4 + Math.random() * 4, // 4-8dp
        life: 1.0
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Advanced bubble popping with special effects
  const popBubble = useCallback((bubble: Bubble, isLongPress: boolean = false, isChainReaction: boolean = false) => {
    const sizeConfig = BUBBLE_SIZES[bubble.size];
    const colorData = BUBBLE_COLORS[bubble.colorIndex];
    const intensity = isLongPress ? 2 : 1;
    
    // Update combo system
    if (!isChainReaction) {
      setCombo(prev => prev + 1);
      setComboTimer(3000); // 3 second combo window
    }
    
    // Calculate score with combo multiplier
    const sizeMultiplier = bubble.size === 'large' ? 3 : bubble.size === 'medium' ? 2 : 1;
    const pressMultiplier = isLongPress ? 3 : 1;
    const comboMultiplier = Math.min(combo + 1, 10); // Max 10x combo
    const specialMultiplier = currentMultiplier;
    
    let baseScore = sizeMultiplier * pressMultiplier * comboMultiplier * specialMultiplier;
    
    // Special bubble effects
    switch (bubble.type) {
      case 'bomb':
        // Chain reaction - pop nearby bubbles
        setBubbles(prev => {
          const nearbyBubbles = prev.filter(b => {
            if (b.id === bubble.id) return false;
            const dx = b.x - bubble.x;
            const dy = b.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 120; // 120px blast radius
          });
          
          // Pop nearby bubbles with delay for cascade effect
          nearbyBubbles.forEach((nearbyBubble, index) => {
            setTimeout(() => {
              popBubble(nearbyBubble, false, true);
            }, index * 100);
          });
          
          return prev.filter(b => {
            const dx = b.x - bubble.x;
            const dy = b.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance >= 120 || b.id === bubble.id;
          });
        });
        baseScore *= 5; // Bomb bonus
        audioSystem.playNote(colorData.note * 0.5, 800, 'sawtooth'); // Deep explosion sound
        break;
        
      case 'rainbow':
        // Pop all bubbles of the same color
        setBubbles(prev => {
          const sameColorBubbles = prev.filter(b => 
            b.colorIndex === bubble.colorIndex && b.id !== bubble.id
          );
          sameColorBubbles.forEach((colorBubble, index) => {
            setTimeout(() => {
              popBubble(colorBubble, false, true);
            }, index * 50);
          });
          return prev.filter(b => 
            b.colorIndex !== bubble.colorIndex || b.id === bubble.id
          );
        });
        baseScore *= 8; // Rainbow bonus
        audioSystem.playNote(colorData.note * 2, 1000, 'triangle'); // Magical sound
        break;
        
      case 'magnet':
        // Attract all nearby bubbles
        setBubbles(prev => prev.map(b => {
          if (b.id === bubble.id) return b;
          const dx = b.x - bubble.x;
          const dy = b.y - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            return {
              ...b,
              vx: b.vx - (dx / distance) * 20,
              vy: b.vy - (dy / distance) * 20
            };
          }
          return b;
        }));
        baseScore *= 3; // Magnet bonus
        audioSystem.playNote(colorData.note * 1.5, 600, 'square'); // Electric sound
        break;
        
      case 'freeze':
        // Freeze all bubbles for 3 seconds
        setFreezeMode(3000);
        baseScore *= 4; // Freeze bonus
        audioSystem.playNote(colorData.note * 0.8, 1200, 'sine'); // Ice sound
        break;
        
      case 'multiplier':
        // 2x score multiplier for 10 seconds
        setMultiplierMode(10000);
        setCurrentMultiplier(2);
        baseScore *= 6; // Multiplier bonus
        audioSystem.playNote(colorData.note * 1.8, 800, 'triangle'); // Power-up sound
        break;
        
      default:
        // Normal bubble sound
        audioSystem.playNote(colorData.note * sizeConfig.sound.frequency, sizeConfig.sound.duration);
        if (isLongPress) {
          setTimeout(() => {
            audioSystem.playNote(colorData.note * 1.5, sizeConfig.sound.duration * 0.8);
          }, 100);
        }
    }
    
    // Create appropriate explosion effect
    const explosionIntensity = bubble.type === 'bomb' ? 3 : intensity;
    createExplosion(
      bubble.x + BUBBLE_SIZES[bubble.size].diameter / 2,
      bubble.y + BUBBLE_SIZES[bubble.size].diameter / 2,
      bubble.colorIndex,
      explosionIntensity
    );
    
    // Remove bubble
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    
    // Update score
    setScore(prev => prev + baseScore);
    
    // Çok yavaş seviye ilerlemesi - her 100 puanda yeni seviye
    if (score > 0 && (score + baseScore) >= gameLevel * 100) {
      setGameLevel(prev => prev + 1);
      console.log(`🎉 Seviye ${gameLevel + 1}'e geçildi! (${score + baseScore} puan)`);
    }
    
    // Clear long press state
    setLongPressedBubble(null);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, [audioSystem, createExplosion, combo, currentMultiplier, score, gameLevel]);

  // Touch handlers
  const handleBubbleStart = useCallback((bubble: Bubble) => {
    if (!isPlaying) return;
    
    longPressTimer.current = setTimeout(() => {
      setLongPressedBubble(bubble.id);
    }, GAME_CONFIG.longPressThreshold);
  }, [isPlaying]);

  const handleBubbleEnd = useCallback((bubble: Bubble) => {
    if (!isPlaying) return;
    
    const isLongPress = longPressedBubble === bubble.id;
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    popBubble(bubble, isLongPress);
  }, [isPlaying, longPressedBubble, popBubble]);

  // Basit ve performanslı game loop - sadece aşağı düşen balonlar
  useEffect(() => {
    if (!gameStarted || !isPlaying) return;

    const loop = () => {
      const now = Date.now();
      
      // Basit balon hareketi - sadece aşağı düş
      setBubbles(prev => prev
        .map(bubble => {
          // Donmuş balonlar hareket etmesin
          if (bubble.frozen && freezeMode > 0) {
            return bubble;
          }
          
          // Sadece Y pozisyonunu güncelle - basit düşme
          return {
            ...bubble,
            y: bubble.y + bubble.speed // Basit: pozisyon += hız
          };
        })
        .filter(bubble => {
          const containerRect = containerRef.current?.getBoundingClientRect();
          const containerHeight = containerRect?.height || GAME_CONFIG.height;
          
          return bubble.y < containerHeight + 100 && // Responsive container height
                 (now - bubble.createdAt) < bubble.lifespan; // Yaşam süresi kontrolü
        })
      );

      // Parçacık efektleri (basitleştirilmiş)
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx * 0.016, // Sabit 60fps
          y: particle.y + particle.vy * 0.016,
          vy: particle.vy + 200 * 0.016, // Yerçekimi
          life: particle.life - 0.016
        }))
        .filter(particle => particle.life > 0)
      );

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, isPlaying, freezeMode]);

  // Progressive balon spawn sistemi - her seviyede daha sık
  useEffect(() => {
    if (!gameStarted || !isPlaying) return;

    const spawnBubble = () => {
      setBubbles(prev => {
        if (prev.length < GAME_CONFIG.maxBubbles) {
          const newBubble = createBubble();
          return newBubble ? [...prev, newBubble] : prev;
        }
        return prev;
      });
    };

    // Çok yumuşak spawn artışı - her seviyede sadece %10 daha sık
    const baseInterval = 1500; // 1.5 saniye temel (daha yavaş başla)
    const difficultyReduction = (gameLevel - 1) * 0.1; // Her seviye sadece %10 azalma
    const currentInterval = Math.max(800, baseInterval * (1 - difficultyReduction)); // Min 0.8 saniye
    
    // Hız çarpanını burada da hesapla (createBubble ile aynı formül)
    const currentSpeedMultiplier = 1 + (gameLevel - 1) * 0.15;

    console.log(`🎈 Seviye ${gameLevel}: Spawn ${currentInterval}ms, Hız x${currentSpeedMultiplier.toFixed(2)}`);

    const spawnInterval = setInterval(spawnBubble, currentInterval);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, isPlaying, createBubble, gameLevel]);

  // Special effects timers
  useEffect(() => {
    if (comboTimer > 0) {
      const timer = setTimeout(() => {
        setComboTimer(prev => Math.max(0, prev - 100));
        if (comboTimer <= 100) {
          setCombo(0); // Reset combo when timer expires
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [comboTimer]);
  
  useEffect(() => {
    if (freezeMode > 0) {
      const timer = setTimeout(() => {
        setFreezeMode(prev => Math.max(0, prev - 100));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [freezeMode]);
  
  useEffect(() => {
    if (multiplierMode > 0) {
      const timer = setTimeout(() => {
        setMultiplierMode(prev => Math.max(0, prev - 100));
        if (multiplierMode <= 100) {
          setCurrentMultiplier(1); // Reset multiplier when timer expires
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [multiplierMode]);

  // Helper function to get bubble color and special effects
  const getBubbleColor = (bubble: Bubble) => {
    const color = BUBBLE_COLORS[bubble.colorIndex];
    
    switch (bubble.type) {
      case 'bomb':
        return {
          background: `linear-gradient(135deg, #FF4757 0%, #FF3742 50%, #C44569 100%)`,
          shadowColor: '#FF4757',
          emoji: '💣'
        };
      case 'rainbow':
        return {
          background: `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)`,
          shadowColor: '#45B7D1',
          emoji: '🌈'
        };
      case 'magnet':
        return {
          background: `linear-gradient(135deg, #74B9FF 0%, #0984E3 50%, #2D3436 100%)`,
          shadowColor: '#74B9FF',
          emoji: '🧲'
        };
      case 'freeze':
        return {
          background: `linear-gradient(135deg, #A29BFE 0%, #6C5CE7 50%, #5F3DC4 100%)`,
          shadowColor: '#A29BFE',
          emoji: '❄️'
        };
      case 'multiplier':
        return {
          background: `linear-gradient(135deg, #FDCB6E 0%, #E17055 50%, #D63031 100%)`,
          shadowColor: '#FDCB6E',
          emoji: '✨'
        };
      default:
        return {
          background: `linear-gradient(135deg, ${color.light} 0%, ${color.medium} 50%, ${color.dark} 100%)`,
          shadowColor: color.medium,
          emoji: null
        };
    }
  };
  
  // Multi-touch support
  const handleMultiTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const newTouches = Array.from(e.touches).map((touch, index) => ({
      id: index,
      x: touch.clientX,
      y: touch.clientY
    }));
    setTouches(newTouches);
    
    // Check if any bubble is being touched
    newTouches.forEach(touch => {
      const touchedBubble = bubbles.find(bubble => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;
        
        const bubbleX = bubble.x + rect.left;
        const bubbleY = bubble.y + rect.top;
        const diameter = BUBBLE_SIZES[bubble.size].diameter;
        
        const dx = touch.x - (bubbleX + diameter / 2);
        const dy = touch.y - (bubbleY + diameter / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= diameter / 2 + GAME_CONFIG.hitAreaPadding;
      });
      
      if (touchedBubble) {
        popBubble(touchedBubble);
      }
    });
  }, [bubbles, popBubble]);

  return (
    <div 
      className="relative mx-auto overflow-hidden shadow-2xl w-full max-w-sm"
      style={{ 
        aspectRatio: `${GAME_CONFIG.width} / ${GAME_CONFIG.height}`, // Responsive aspect ratio
        borderRadius: 'var(--radius-widget)', // Design system'den
        maxHeight: '85vh', // Ekrana sığsın
        minHeight: '600px' // Minimum oynanabilir boyut
      }}
    >
      {/* Sky Background */}
      <div 
        ref={containerRef}
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 30%, #B6E5F0 70%, #E0F6FF 100%)'
        }}
      >
        {/* Cloud Layers */}
        {clouds.map((cloud) => (
          <motion.div
            key={cloud.id}
            className={`absolute text-white select-none pointer-events-none cloud-drift-${cloud.layer}`}
            style={{
              left: cloud.x,
              top: cloud.y,
              fontSize: cloud.size * 0.5,
              opacity: cloud.opacity,
              zIndex: cloud.layer
            }}
            initial={{ x: cloud.x }}
            animate={{ 
              x: [cloud.x, cloud.x + 30, cloud.x] 
            }}
            transition={{ 
              duration: 15 / cloud.speed, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            ☁️
          </motion.div>
        ))}

        {/* Kompakt Game UI */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-30">
          {/* Kompakt Score ve Stats */}
          <div className="flex items-center gap-2">
            {/* Main Score - Küçük */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg"
              style={{ fontFamily: 'var(--font-text)' }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 'var(--text-sm)' }}>🎈</span>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'rgb(147, 51, 234)'
                }}>{score}</span>
              </div>
            </motion.div>
            
            {/* Level Display - Küçük */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-lg"
              style={{ fontFamily: 'var(--font-text)' }}
            >
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '12px' }}>⭐</span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'rgb(59, 130, 246)'
                }}>L{gameLevel}</span>
              </div>
            </motion.div>
            
            {/* Combo Display - Tek satır kompakt */}
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl px-2.5 py-1.5 shadow-lg"
                style={{ fontFamily: 'var(--font-text)' }}
              >
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: '12px' }}>🔥</span>
                  <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-bold)' }}>{combo}x</span>
                  <div className="w-4 bg-white/30 rounded-full h-1">
                    <div 
                      className="bg-white rounded-full h-1 transition-all duration-100"
                      style={{ width: `${(comboTimer / 3000) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Kompakt Controls */}
          <div className="flex items-center gap-1.5">
            {/* Active Effects - Horizontal */}
            {freezeMode > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-blue-500 text-white rounded-xl px-2 py-1 shadow-lg"
                style={{ fontFamily: 'var(--font-text)' }}
              >
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: '12px' }}>❄️</span>
                  <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-bold)' }}>{Math.ceil(freezeMode / 1000)}s</span>
                </div>
              </motion.div>
            )}
            
            {multiplierMode > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-yellow-500 text-white rounded-xl px-2 py-1 shadow-lg"
                style={{ fontFamily: 'var(--font-text)' }}
              >
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: '12px' }}>✨</span>
                  <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-bold)' }}>{currentMultiplier}x</span>
                </div>
              </motion.div>
            )}
            
            {/* Control Buttons - Küçük */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onGoBack}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center"
              style={{ minWidth: 36, minHeight: 36 }}
            >
              <span style={{ fontSize: '14px' }}>🏠</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center"
              style={{ minWidth: 36, minHeight: 36 }}
            >
              {isSoundOn ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-600" />
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center"
              style={{ minWidth: 40, minHeight: 36 }}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-orange-600" />
              ) : (
                <Play className="w-4 h-4 text-green-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              key={countdown}
              className="absolute inset-0 flex items-center justify-center z-40"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-bold shadow-2xl">
                {countdown}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kompakt Instructions */}
        {gameStarted && score === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 left-3 right-3 z-20"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div 
                className="text-center mb-2"
                style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-text)',
                  color: 'rgb(55, 65, 81)'
                }}
              >
                👆 Dokun = Patlat | ✋ Uzun Bas = Süper!
              </div>
              <div className="flex justify-center gap-3" style={{ fontSize: '11px', color: 'rgb(107, 114, 128)' }}>
                <div className="flex items-center gap-0.5">
                  <span>💣</span>
                  <span style={{ fontFamily: 'var(--font-text)' }}>Bomba</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span>🌈</span>
                  <span style={{ fontFamily: 'var(--font-text)' }}>Renk</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span>🧲</span>
                  <span style={{ fontFamily: 'var(--font-text)' }}>Mıknatış</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span>❄️</span>
                  <span style={{ fontFamily: 'var(--font-text)' }}>Dondurucu</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span>✨</span>
                  <span style={{ fontFamily: 'var(--font-text)' }}>Çarpan</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Seviye Geçiş Uyarıları */}
        {gameLevel > 1 && score > 0 && score % 100 === 0 && (
          <motion.div
            key={`level-up-${gameLevel}`}
            className="absolute left-1/2 top-1/3 transform -translate-x-1/2 z-30 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.3, 1],
              opacity: [0, 1, 0],
              y: [0, -40]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          >
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-2xl"
              style={{ fontFamily: 'var(--font-text)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '24px' }}>🎊</span>
                <div className="text-center">
                  <div style={{ fontSize: 'var(--text-lg)' }}>SEVİYE {gameLevel}!</div>
                  <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Biraz Daha Hızlı!</div>
                </div>
                <span style={{ fontSize: '24px' }}>🎊</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bubbles */}
        <AnimatePresence>
          {bubbles.map((bubble) => {
            const sizeConfig = BUBBLE_SIZES[bubble.size];
            const colorStyle = getBubbleColor(bubble);
            const isLongPressed = longPressedBubble === bubble.id;
            
            return (
              <motion.div
                key={bubble.id}
                className="absolute cursor-pointer select-none"
                style={{
                  left: bubble.x - GAME_CONFIG.hitAreaPadding,
                  top: bubble.y - GAME_CONFIG.hitAreaPadding, // UI safe zone kaldırıldı - balonlar her yerde dokunulabilir
                  width: sizeConfig.diameter + GAME_CONFIG.hitAreaPadding * 2,
                  height: sizeConfig.diameter + GAME_CONFIG.hitAreaPadding * 2,
                  zIndex: 10
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isLongPressed ? 1.3 : 1,
                  opacity: 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onMouseDown={() => handleBubbleStart(bubble)}
                onMouseUp={() => handleBubbleEnd(bubble)}
                onMouseLeave={() => {
                  if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleBubbleStart(bubble);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleBubbleEnd(bubble);
                }}
                onTouchMove={handleMultiTouch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Enhanced Bubble */}
                <div 
                  className={`bubble-float-animation rounded-full relative overflow-hidden ${
                    bubble.frozen ? 'animate-pulse' : ''
                  } ${bubble.type === 'bomb' ? 'animate-bounce' : ''}`}
                  style={{
                    width: sizeConfig.diameter,
                    height: sizeConfig.diameter,
                    marginLeft: GAME_CONFIG.hitAreaPadding,
                    marginTop: GAME_CONFIG.hitAreaPadding,
                    background: colorStyle.background,
                    boxShadow: isLongPressed 
                      ? `0 0 30px ${colorStyle.shadowColor}, 0 8px 20px rgba(0,0,0,0.3)`
                      : bubble.type !== 'normal' 
                        ? `0 0 15px ${colorStyle.shadowColor}, 0 8px 20px rgba(0,0,0,0.2)`
                        : '0 8px 20px rgba(0,0,0,0.2)',
                    border: bubble.frozen 
                      ? '3px solid rgba(173, 216, 230, 0.8)' 
                      : '2px solid rgba(255,255,255,0.6)',
                    opacity: bubble.frozen ? 0.7 : 0.95,
                    filter: bubble.frozen ? 'hue-rotate(240deg) brightness(0.8)' : 'none'
                  }}
                >
                  {/* Highlight */}
                  <div 
                    className="absolute rounded-full bg-white bubble-shine-animation"
                    style={{
                      top: '15%',
                      left: '20%',
                      width: '30%',
                      height: '30%',
                      opacity: 0.4,
                      filter: 'blur(2px)'
                    }}
                  />
                  
                  {/* Small highlight */}
                  <div 
                    className="absolute rounded-full bg-white"
                    style={{
                      top: '10%',
                      left: '15%',
                      width: '15%',
                      height: '15%',
                      opacity: 0.6
                    }}
                  />

                  {/* Special Bubble Icon */}
                  {colorStyle.emoji && (
                    <div className="absolute inset-0 flex items-center justify-center text-xl z-10">
                      <span className="drop-shadow-lg">{colorStyle.emoji}</span>
                    </div>
                  )}
                  
                  {/* Sparkle Animation */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-2 right-2 text-xs">✨</div>
                    <div className="absolute bottom-3 left-3 text-xs">⭐</div>
                  </motion.div>
                  
                  {/* Magnetic Field Visualization */}
                  {bubble.type === 'magnet' && (
                    <motion.div
                      className="absolute inset-0 border-2 border-blue-300 rounded-full opacity-30"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ 
                        width: (bubble.magneticField || 100) * 2,
                        height: (bubble.magneticField || 100) * 2,
                        marginLeft: -(bubble.magneticField || 100) + sizeConfig.diameter / 2,
                        marginTop: -(bubble.magneticField || 100) + sizeConfig.diameter / 2,
                      }}
                    />
                  )}

                  {/* Long Press Indicator */}
                  {isLongPressed && (
                    <motion.div
                      className="absolute inset-0 border-4 border-yellow-300 rounded-full"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.life,
                zIndex: 15
              }}
              animate={{
                scale: [1, 0.2],
                opacity: [particle.life, 0]
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Score Milestones */}
        <AnimatePresence>
          {score > 0 && score % 25 === 0 && (
            <motion.div
              key={`milestone-${score}`}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0],
                y: [0, -60]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-3xl text-2xl font-bold shadow-2xl">
                🎉 {score} Puan! 🎉
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}