import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface MusicalGardenProps {
  volume: number;
  onBack: () => void;
}

interface Flower {
  id: number;
  x: number;
  y: number;
  note: string;
  color: string;
  emoji: string;
  size: number;
  growth: number;
  isGrowing: boolean;
  waterLevel: number;
}

interface WaterDrop {
  id: number;
  x: number;
  y: number;
  note: string;
}

const GARDEN_SOUNDS = [
  { note: 'C4', color: '#FF6B9D', emoji: '🌸', name: 'Kiraz', freq: 261.63, flower: '🌺' },
  { note: 'D4', color: '#FF8E53', emoji: '🌻', name: 'Ayçiçeği', freq: 293.66, flower: '🌻' },
  { note: 'E4', color: '#FFD93D', emoji: '🌼', name: 'Papatya', freq: 329.63, flower: '🌼' },
  { note: 'F4', color: '#6BCF7F', emoji: '🌿', name: 'Yaprak', freq: 349.23, flower: '🌱' },
  { note: 'G4', color: '#4D96FF', emoji: '🦋', name: 'Mavi', freq: 392.00, flower: '💙' },
  { note: 'A4', color: '#9B59B6', emoji: '🌷', name: 'Lale', freq: 440.00, flower: '🌷' },
];

export function MusicalGarden({ volume, onBack }: MusicalGardenProps) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
  const [selectedSeed, setSelectedSeed] = useState(GARDEN_SOUNDS[0]);
  const [isWatering, setIsWatering] = useState(false);
  const [gardenLevel, setGardenLevel] = useState(1);
  
  const audioContext = useRef<AudioContext | null>(null);
  const flowerIdCounter = useRef(0);
  const dropIdCounter = useRef(0);
  const gardenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.8) => {
    if (!audioContext.current) return;

    // Nature-inspired sound with multiple harmonics
    const oscillator1 = audioContext.current.createOscillator();
    const oscillator2 = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator1.type = 'triangle';
    
    oscillator2.frequency.setValueAtTime(frequency * 1.5, audioContext.current.currentTime);
    oscillator2.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator2.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    oscillator2.stop(audioContext.current.currentTime + duration);
  };

  const plantSeed = (event: React.MouseEvent) => {
    if (!gardenRef.current) return;
    
    const rect = gardenRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if planting area is valid
    if (y < 100) return; // Keep top area clear

    const newFlower: Flower = {
      id: flowerIdCounter.current++,
      x,
      y,
      note: selectedSeed.note,
      color: selectedSeed.color,
      emoji: selectedSeed.emoji,
      size: 20,
      growth: 0,
      isGrowing: false,
      waterLevel: 0
    };

    setFlowers(prev => [...prev, newFlower]);
    playNote(selectedSeed.freq);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const waterFlower = (event: React.MouseEvent) => {
    if (!gardenRef.current || !isWatering) return;
    
    const rect = gardenRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create water drop
    const dropId = dropIdCounter.current++;
    const newDrop: WaterDrop = {
      id: dropId,
      x,
      y,
      note: selectedSeed.note
    };

    setWaterDrops(prev => [...prev, newDrop]);

    // Find nearby flowers to water
    setFlowers(prev => prev.map(flower => {
      const distance = Math.sqrt((flower.x - x) ** 2 + (flower.y - y) ** 2);
      if (distance < 60) {
        const newWaterLevel = Math.min(flower.waterLevel + 20, 100);
        const newGrowth = newWaterLevel > 50 ? Math.min(flower.growth + 10, 100) : flower.growth;
        
        if (newWaterLevel > flower.waterLevel) {
          playNote(GARDEN_SOUNDS.find(s => s.note === flower.note)?.freq || 440, 0.3);
        }
        
        return {
          ...flower,
          waterLevel: newWaterLevel,
          growth: newGrowth,
          isGrowing: newGrowth > flower.growth,
          size: 20 + (newGrowth * 0.5)
        };
      }
      return flower;
    }));

    // Remove water drop after animation
    setTimeout(() => {
      setWaterDrops(prev => prev.filter(drop => drop.id !== dropId));
    }, 800);
  };

  const harvestFlower = (flowerId: number) => {
    const flower = flowers.find(f => f.id === flowerId);
    if (!flower || flower.growth < 80) return;

    // Play harvest sound
    const soundData = GARDEN_SOUNDS.find(s => s.note === flower.note);
    if (soundData) {
      playNote(soundData.freq, 1.2);
    }

    // Remove flower and gain points
    setFlowers(prev => prev.filter(f => f.id !== flowerId));
    setGardenLevel(prev => prev + 1);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const clearGarden = () => {
    setFlowers([]);
    setWaterDrops([]);
    setGardenLevel(1);
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
          <div className="text-6xl">🌸</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Müzik Bahçesi
          </div>
          <div className="text-sm opacity-80">Bahçe Seviyesi: {gardenLevel}</div>
        </div>
        
        <Button
          onClick={clearGarden}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Garden Area */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-b from-sky-200/80 via-green-200/80 to-amber-200/80 dark:from-sky-800/40 dark:via-green-800/40 dark:to-amber-800/40 min-h-[400px] overflow-hidden">
        {/* Garden Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/50 via-green-100/50 to-amber-100/50 dark:from-sky-900/20 dark:via-green-900/20 dark:to-amber-900/20 rounded-[2rem]" />
        
        {/* Cloud decorations */}
        <div className="absolute top-4 left-8 text-4xl opacity-60">☁️</div>
        <div className="absolute top-6 right-12 text-3xl opacity-60">☁️</div>
        <div className="absolute top-8 left-1/3 text-2xl opacity-60">☁️</div>
        
        {/* Sun */}
        <motion.div
          className="absolute top-4 right-8 text-6xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          ☀️
        </motion.div>

        {/* Garden Interactive Area */}
        <div
          ref={gardenRef}
          className="relative w-full h-[400px] cursor-pointer"
          onClick={isWatering ? waterFlower : plantSeed}
        >
          {/* Soil line */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-600/40 to-transparent rounded-b-[2rem]" />
          
          {/* Flowers */}
          <AnimatePresence>
            {flowers.map((flower) => (
              <motion.div
                key={flower.id}
                className="absolute cursor-pointer"
                style={{ left: flower.x - flower.size/2, top: flower.y - flower.size }}
                initial={{ scale: 0, y: 20 }}
                animate={{ 
                  scale: 1,
                  y: 0,
                  size: flower.size
                }}
                exit={{ scale: 0, y: 20 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
                whileHover={{ scale: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (flower.growth >= 80) {
                    harvestFlower(flower.id);
                  }
                }}
              >
                {/* Stem */}
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-green-500 rounded-full"
                  style={{ 
                    width: '4px', 
                    height: `${Math.max(flower.growth * 0.3, 10)}px` 
                  }}
                />
                
                {/* Flower */}
                <motion.div
                  className="text-center"
                  style={{ fontSize: `${flower.size}px` }}
                  animate={flower.isGrowing ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 1 }}
                >
                  {flower.growth < 30 ? '🌱' : 
                   flower.growth < 60 ? '🌿' : 
                   flower.growth < 80 ? flower.emoji :
                   GARDEN_SOUNDS.find(s => s.note === flower.note)?.flower || flower.emoji}
                </motion.div>
                
                {/* Water level indicator */}
                {flower.waterLevel > 0 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${flower.waterLevel}%` }}
                    />
                  </div>
                )}
                
                {/* Growth sparkles */}
                {flower.isGrowing && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute -top-2 -left-2 text-yellow-400">✨</div>
                    <div className="absolute -top-1 -right-2 text-yellow-400">⭐</div>
                    <div className="absolute -bottom-1 -left-1 text-yellow-400">💫</div>
                  </motion.div>
                )}
                
                {/* Harvest indicator */}
                {flower.growth >= 80 && (
                  <motion.div
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-lg"
                    animate={{ 
                      y: [-5, 5, -5],
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    👆
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Water Drops */}
          <AnimatePresence>
            {waterDrops.map((drop) => (
              <motion.div
                key={drop.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: drop.x - 10, top: drop.y - 10 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                💧
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {flowers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-8xl">🌱</div>
                <div className="text-xl">Tohum ekmek için dokun</div>
                <div className="text-lg">Büyümesi için sula! 💧</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Tools */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={!isWatering ? "default" : "outline"}
          onClick={() => setIsWatering(false)}
          className="rounded-2xl px-6 py-3 text-lg border-4 border-green-300"
          style={{ backgroundColor: !isWatering ? selectedSeed.color : undefined }}
        >
          🌱 Tohum Ek
        </Button>
        
        <Button
          variant={isWatering ? "default" : "outline"}
          onClick={() => setIsWatering(true)}
          className="rounded-2xl px-6 py-3 text-lg bg-blue-400 hover:bg-blue-500 text-white border-4 border-blue-300"
        >
          💧 Sula
        </Button>
      </div>

      {/* Seed Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {GARDEN_SOUNDS.map((seed, index) => (
          <motion.div
            key={seed.note}
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
                ${selectedSeed.note === seed.note ? 'border-yellow-300 ring-4 ring-yellow-200' : 'border-white/50'}
              `}
              style={{ backgroundColor: seed.color }}
              onClick={() => setSelectedSeed(seed)}
            >
              <div className="text-center space-y-1">
                <div className="text-3xl">{seed.emoji}</div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {seed.name}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-green-200/80 to-blue-200/80 dark:from-green-600/20 dark:to-blue-600/20 border-4 border-green-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🌻</div>
            <div className="text-lg font-bold">Bahçıvan Ol</div>
            <div className="text-sm opacity-80">
              Tohum ek, sula, büyümesini izle! Çiçekler büyüyünce müzik çalar! 🎵🌸
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}