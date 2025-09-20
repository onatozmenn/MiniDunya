import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherOrchestraProps {
  volume: number;
  onBack: () => void;
}

interface WeatherElement {
  id: number;
  type: 'weather' | 'season' | 'animal' | 'nature';
  name: string;
  emoji: string;
  color: string;
  soundPattern: number[];
  intensity: number;
  isActive: boolean;
  x: number;
  y: number;
  description: string;
}

interface WeatherParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  velocity: { x: number; y: number };
  life: number;
}

interface EnvironmentState {
  temperature: number;
  humidity: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  timeOfDay: 'morning' | 'day' | 'evening' | 'night';
}

const WEATHER_ELEMENTS: WeatherElement[] = [
  // Weather
  { 
    id: 0, type: 'weather', name: 'Yağmur', emoji: '🌧️', color: '#3B82F6', 
    soundPattern: [220, 246, 261, 293], intensity: 70, isActive: false, x: 0, y: 0,
    description: 'Yağmur damlalarının ritmi'
  },
  { 
    id: 1, type: 'weather', name: 'Gök Gürültüsü', emoji: '⛈️', color: '#6366F1', 
    soundPattern: [110, 130, 146], intensity: 90, isActive: false, x: 0, y: 0,
    description: 'Güçlü fırtına sesleri'
  },
  { 
    id: 2, type: 'weather', name: 'Rüzgar', emoji: '💨', color: '#06B6D4', 
    soundPattern: [174, 196, 220, 246], intensity: 50, isActive: false, x: 0, y: 0,
    description: 'Hafif rüzgar esintisi'
  },
  { 
    id: 3, type: 'weather', name: 'Kar', emoji: '❄️', color: '#E5E7EB', 
    soundPattern: [523, 587, 659, 698], intensity: 30, isActive: false, x: 0, y: 0,
    description: 'Sessiz kar yağışı'
  },
  
  // Seasons
  { 
    id: 4, type: 'season', name: 'İlkbahar', emoji: '🌸', color: '#EC4899', 
    soundPattern: [329, 369, 415, 440], intensity: 60, isActive: false, x: 0, y: 0,
    description: 'Çiçeklerin açılması'
  },
  { 
    id: 5, type: 'season', name: 'Yaz', emoji: '☀️', color: '#F59E0B', 
    soundPattern: [440, 493, 523, 587], intensity: 80, isActive: false, x: 0, y: 0,
    description: 'Sıcak yaz günü'
  },
  { 
    id: 6, type: 'season', name: 'Sonbahar', emoji: '🍂', color: '#D97706', 
    soundPattern: [293, 329, 349, 392], intensity: 40, isActive: false, x: 0, y: 0,
    description: 'Yaprakların dökülmesi'
  },
  { 
    id: 7, type: 'season', name: 'Kış', emoji: '🗻', color: '#9CA3AF', 
    soundPattern: [196, 220, 246, 261], intensity: 35, isActive: false, x: 0, y: 0,
    description: 'Sessiz kış manzarası'
  },

  // Animals
  { 
    id: 8, type: 'animal', name: 'Kuşlar', emoji: '🐦', color: '#10B981', 
    soundPattern: [659, 698, 783, 880], intensity: 65, isActive: false, x: 0, y: 0,
    description: 'Sabah kuş sesleri'
  },
  { 
    id: 9, type: 'animal', name: 'Böcekler', emoji: '🦗', color: '#22C55E', 
    soundPattern: [1174, 1318, 1396, 1567], intensity: 45, isActive: false, x: 0, y: 0,
    description: 'Gece böcek cıvıltısı'
  },
  { 
    id: 10, type: 'animal', name: 'Kurbağalar', emoji: '🐸', color: '#16A34A', 
    soundPattern: [146, 164, 174, 196], intensity: 55, isActive: false, x: 0, y: 0,
    description: 'Gölet kenarı sesleri'
  },

  // Nature
  { 
    id: 11, type: 'nature', name: 'Dalga', emoji: '🌊', color: '#0EA5E9', 
    soundPattern: [87, 98, 110, 123], intensity: 60, isActive: false, x: 0, y: 0,
    description: 'Okyanus dalgaları'
  },
  { 
    id: 12, type: 'nature', name: 'Orman', emoji: '🌲', color: '#059669', 
    soundPattern: [261, 293, 329, 349], intensity: 50, isActive: false, x: 0, y: 0,
    description: 'Ormandaki hışırtı'
  },
  { 
    id: 13, type: 'nature', name: 'Şelale', emoji: '💧', color: '#0284C7', 
    soundPattern: [392, 440, 493, 523], intensity: 75, isActive: false, x: 0, y: 0,
    description: 'Su şırıltısı'
  },
];

export function WeatherOrchestra({ volume, onBack }: WeatherOrchestraProps) {
  const [weatherElements, setWeatherElements] = useState<WeatherElement[]>([]);
  const [particles, setParticles] = useState<WeatherParticle[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentState>({
    temperature: 20,
    humidity: 50,
    season: 'spring',
    timeOfDay: 'day'
  });
  const [activeElements, setActiveElements] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const audioContext = useRef<AudioContext | null>(null);
  const particleIdCounter = useRef(0);
  const soundInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    initializeElements();
    
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (soundInterval.current) {
        clearInterval(soundInterval.current);
      }
    };
  }, []);

  const playNatureSound = (frequencies: number[], intensity: number) => {
    if (!audioContext.current) return;

    frequencies.forEach((frequency, index) => {
      setTimeout(() => {
        const oscillator = audioContext.current!.createOscillator();
        const gainNode = audioContext.current!.createGain();
        const filterNode = audioContext.current!.createBiquadFilter();

        oscillator.connect(gainNode);
        gainNode.connect(filterNode);
        filterNode.connect(audioContext.current!.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.current!.currentTime);
        oscillator.type = 'sine';
        
        // Natural filter for organic sound
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(frequency * 2, audioContext.current!.currentTime);

        const adjustedVolume = volume * (intensity / 100) * 0.3;
        gainNode.gain.setValueAtTime(0, audioContext.current!.currentTime);
        gainNode.gain.linearRampToValueAtTime(adjustedVolume, audioContext.current!.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current!.currentTime + 2);

        oscillator.start(audioContext.current!.currentTime);
        oscillator.stop(audioContext.current!.currentTime + 2);
      }, index * 200);
    });
  };

  const createParticle = (x: number, y: number, emoji: string, weatherType: string) => {
    const particleId = particleIdCounter.current++;
    
    let velocity = { x: 0, y: 0 };
    switch (weatherType) {
      case 'Yağmur':
        velocity = { x: Math.random() * 2 - 1, y: Math.random() * 5 + 3 };
        break;
      case 'Kar':
        velocity = { x: Math.random() * 4 - 2, y: Math.random() * 2 + 1 };
        break;
      case 'Rüzgar':
        velocity = { x: Math.random() * 8 - 4, y: Math.random() * 2 - 1 };
        break;
      default:
        velocity = { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 };
    }

    const newParticle: WeatherParticle = {
      id: particleId,
      x,
      y,
      emoji,
      velocity,
      life: 100
    };

    setParticles(prev => [...prev, newParticle]);

    // Particle lifecycle
    const particleTimer = setInterval(() => {
      setParticles(prev => {
        const updatedParticles = prev.map(p => {
          if (p.id === particleId) {
            return {
              ...p,
              x: p.x + p.velocity.x,
              y: p.y + p.velocity.y,
              life: p.life - 2,
              velocity: {
                x: p.velocity.x * 0.98,
                y: p.velocity.y + (weatherType === 'Kar' ? 0.1 : 0.2)
              }
            };
          }
          return p;
        });

        return updatedParticles.filter(p => p.life > 0 && p.y < 600 && p.x > -50 && p.x < 650);
      });
    }, 50);

    setTimeout(() => {
      clearInterval(particleTimer);
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 5000);
  };

  const initializeElements = () => {
    const elements = WEATHER_ELEMENTS.map((element, index) => ({
      ...element,
      x: (index % 4) * 150 + 75,
      y: Math.floor(index / 4) * 120 + 100
    }));

    setWeatherElements(elements);
  };

  const handleElementPress = (element: WeatherElement) => {
    playNatureSound(element.soundPattern, element.intensity);
    
    setWeatherElements(prev =>
      prev.map(el =>
        el.id === element.id ? { ...el, isActive: true } : el
      )
    );

    // Create appropriate particles
    for (let i = 0; i < Math.floor(element.intensity / 20); i++) {
      setTimeout(() => {
        const x = element.x + Math.random() * 100 - 50;
        const y = element.y + Math.random() * 100 - 50;
        createParticle(x, y, element.emoji, element.name);
      }, i * 200);
    }

    setTimeout(() => {
      setWeatherElements(prev =>
        prev.map(el =>
          el.id === element.id ? { ...el, isActive: false } : el
        )
      );
    }, 1000);

    // Update environment based on element
    updateEnvironment(element);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(element.intensity);
    }
  };

  const updateEnvironment = (element: WeatherElement) => {
    setEnvironment(prev => {
      let newEnv = { ...prev };
      
      switch (element.name) {
        case 'Yağmur':
          newEnv.humidity = Math.min(100, prev.humidity + 20);
          newEnv.temperature = Math.max(0, prev.temperature - 5);
          break;
        case 'Güneş':
          newEnv.temperature = Math.min(40, prev.temperature + 10);
          newEnv.humidity = Math.max(0, prev.humidity - 10);
          break;
        case 'Kar':
          newEnv.temperature = Math.max(-10, prev.temperature - 15);
          newEnv.season = 'winter';
          break;
        case 'İlkbahar':
          newEnv.season = 'spring';
          newEnv.temperature = 18;
          break;
      }
      
      return newEnv;
    });
  };

  const startWeatherSymphony = () => {
    if (activeElements.length === 0) {
      // Select random elements for automatic play
      const randomElements = WEATHER_ELEMENTS
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(el => el.id);
      setActiveElements(randomElements);
    }

    setIsPlaying(true);

    soundInterval.current = setInterval(() => {
      const elementIds = activeElements.length > 0 ? activeElements : [0, 4, 8, 11];
      const randomElementId = elementIds[Math.floor(Math.random() * elementIds.length)];
      const element = WEATHER_ELEMENTS.find(el => el.id === randomElementId);
      
      if (element) {
        handleElementPress(element);
      }
    }, 2000);
  };

  const stopWeatherSymphony = () => {
    setIsPlaying(false);
    if (soundInterval.current) {
      clearInterval(soundInterval.current);
      soundInterval.current = null;
    }
  };

  const toggleElementInOrchestra = (elementId: number) => {
    setActiveElements(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId);
      } else {
        return [...prev, elementId];
      }
    });
  };

  const getFilteredElements = () => {
    if (selectedCategory === 'all') return weatherElements;
    return weatherElements.filter(el => el.type === selectedCategory);
  };

  const getBackgroundGradient = () => {
    const { season, timeOfDay } = environment;
    
    const gradients = {
      spring: {
        morning: 'from-pink-200 via-green-200 to-blue-200',
        day: 'from-green-200 via-yellow-200 to-blue-200',
        evening: 'from-orange-200 via-pink-200 to-purple-200',
        night: 'from-purple-900 via-blue-900 to-black'
      },
      summer: {
        morning: 'from-yellow-200 via-orange-200 to-blue-200',
        day: 'from-yellow-300 via-orange-300 to-red-200',
        evening: 'from-red-200 via-orange-200 to-purple-200',
        night: 'from-blue-900 via-purple-900 to-black'
      },
      autumn: {
        morning: 'from-orange-200 via-red-200 to-brown-200',
        day: 'from-red-200 via-orange-200 to-yellow-200',
        evening: 'from-red-300 via-orange-300 to-purple-200',
        night: 'from-gray-900 via-brown-900 to-black'
      },
      winter: {
        morning: 'from-blue-200 via-gray-200 to-white',
        day: 'from-gray-200 via-blue-200 to-white',
        evening: 'from-purple-200 via-blue-200 to-gray-200',
        night: 'from-gray-900 via-blue-900 to-black'
      }
    };

    return gradients[season][timeOfDay];
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
          <div className="text-6xl">🌦️</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Hava Orkestrası
          </div>
          <div className="text-sm opacity-80">
            🌡️ {environment.temperature}°C | 💧 {environment.humidity}%
          </div>
        </div>
        
        <Button
          onClick={isPlaying ? stopWeatherSymphony : startWeatherSymphony}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
      </motion.div>

      {/* Environment Display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl">🌡️</div>
              <div className="text-sm font-bold">{environment.temperature}°C</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">💧</div>
              <div className="text-sm font-bold">{environment.humidity}%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">
                {environment.season === 'spring' ? '🌸' :
                 environment.season === 'summer' ? '☀️' :
                 environment.season === 'autumn' ? '🍂' : '❄️'}
              </div>
              <div className="text-sm font-bold capitalize">{environment.season}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">
                {environment.timeOfDay === 'morning' ? '🌅' :
                 environment.timeOfDay === 'day' ? '☀️' :
                 environment.timeOfDay === 'evening' ? '🌅' : '🌙'}
              </div>
              <div className="text-sm font-bold capitalize">{environment.timeOfDay}</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Weather Stage */}
      <Card className={`
        relative p-4 border-0 shadow-2xl rounded-[2rem] min-h-[400px] overflow-hidden
        bg-gradient-to-br ${getBackgroundGradient()} dark:opacity-80
      `}>
        {/* Dynamic background elements */}
        <div className="absolute inset-0 opacity-30">
          {environment.season === 'winter' && (
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, 400],
                    x: [-20, 20, -20],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                >
                  ❄️
                </motion.div>
              ))}
            </div>
          )}
          
          {environment.humidity > 70 && (
            <div className="absolute inset-0">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-blue-500 text-xl opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                  }}
                  animate={{
                    y: [0, 500],
                    x: [-10, 10, -10]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3
                  }}
                >
                  💧
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full h-[400px]">
          {/* Weather Elements Grid */}
          <div className="absolute inset-4">
            <div className="grid grid-cols-4 gap-4 h-full">
              {getFilteredElements().map((element, index) => (
                <motion.div
                  key={element.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.6,
                    type: "spring",
                    bounce: 0.8
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  className="relative"
                >
                  <Button
                    className={`
                      w-full h-full rounded-3xl border-4 shadow-xl relative overflow-hidden
                      ${element.isActive ? 'scale-110 shadow-[0_0_30px_rgba(255,255,255,0.8)] border-white' : 'border-white/50'}
                      ${activeElements.includes(element.id) ? 'ring-4 ring-yellow-300' : ''}
                    `}
                    style={{ backgroundColor: element.color }}
                    onClick={() => handleElementPress(element)}
                    onDoubleClick={() => toggleElementInOrchestra(element.id)}
                  >
                    <div className="text-center space-y-2">
                      <motion.div 
                        className="text-4xl"
                        animate={element.isActive ? {
                          scale: [1, 1.4, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {element.emoji}
                      </motion.div>
                      <div className="text-xs font-bold text-white drop-shadow-lg">
                        {element.name}
                      </div>
                    </div>
                    
                    {/* Intensity indicator */}
                    <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/20 rounded-full">
                      <div 
                        className="h-full bg-white/60 rounded-full transition-all duration-300"
                        style={{ width: `${element.intensity}%` }}
                      />
                    </div>
                    
                    {/* Orchestra member indicator */}
                    {activeElements.includes(element.id) && (
                      <div className="absolute top-1 right-1 text-yellow-300 text-lg">
                        ⭐
                      </div>
                    )}
                    
                    {/* Active glow */}
                    {element.isActive && (
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-3xl"
                        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </Button>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    {element.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute text-2xl pointer-events-none z-10"
                style={{ 
                  left: particle.x, 
                  top: particle.y,
                  opacity: particle.life / 100
                }}
                animate={{
                  x: particle.x + particle.velocity.x,
                  y: particle.y + particle.velocity.y
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-2 backdrop-blur-sm flex space-x-2">
          {[
            { id: 'all', name: 'Hepsi', emoji: '🌍' },
            { id: 'weather', name: 'Hava', emoji: '🌦️' },
            { id: 'season', name: 'Mevsim', emoji: '🌸' },
            { id: 'animal', name: 'Hayvan', emoji: '🐦' },
            { id: 'nature', name: 'Doğa', emoji: '🌲' },
          ].map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="text-center">
                <div className="text-lg">{category.emoji}</div>
                <div className="text-xs">{category.name}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-sky-200/80 to-blue-200/80 dark:from-sky-600/20 dark:to-blue-600/20 border-4 border-sky-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🌈</div>
            <div className="text-lg font-bold">Doğa Orkestrası</div>
            <div className="text-sm opacity-80">
              Doğa seslerini keşfet! Tek tıkla çal, çift tıkla orkestraya ekle. Çevre bilincini müzikle öğren! 🌍🎵
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}