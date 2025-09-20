import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface PetOrchestraProps {
  volume: number;
  onBack: () => void;
}

interface Pet {
  id: number;
  type: string;
  emoji: string;
  name: string;
  instrument: string;
  instrumentEmoji: string;
  frequency: number;
  x: number;
  y: number;
  happiness: number;
  energy: number;
  skill: number;
  color: string;
  isPlaying: boolean;
  lastFed: number;
  lastPetted: number;
  size: number;
}

interface Food {
  id: number;
  emoji: string;
  name: string;
  energyBoost: number;
  happinessBoost: number;
}

interface Heart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const PET_TYPES = [
  { type: 'cat', emoji: '🐱', name: 'Kedi', instrument: 'Piyano', instrumentEmoji: '🎹', frequency: 261.63, color: '#FF6B9D' },
  { type: 'dog', emoji: '🐶', name: 'Köpek', instrument: 'Davul', instrumentEmoji: '🥁', frequency: 293.66, color: '#FF8E53' },
  { type: 'duck', emoji: '🦆', name: 'Ördek', instrument: 'Flüt', instrumentEmoji: '🎵', frequency: 329.63, color: '#FFD93D' },
  { type: 'frog', emoji: '🐸', name: 'Kurbağa', instrument: 'Gitar', instrumentEmoji: '🎸', frequency: 349.23, color: '#6BCF7F' },
  { type: 'bird', emoji: '🐦', name: 'Kuş', instrument: 'Keman', instrumentEmoji: '🎻', frequency: 392.00, color: '#4D96FF' },
  { type: 'mouse', emoji: '🐭', name: 'Fare', instrument: 'Trompet', instrumentEmoji: '🎺', frequency: 440.00, color: '#9B59B6' },
];

const FOODS: Food[] = [
  { id: 0, emoji: '🥕', name: 'Havuç', energyBoost: 20, happinessBoost: 10 },
  { id: 1, emoji: '🍎', name: 'Elma', energyBoost: 15, happinessBoost: 15 },
  { id: 2, emoji: '🐟', name: 'Balık', energyBoost: 25, happinessBoost: 20 },
  { id: 3, emoji: '🥛', name: 'Süt', energyBoost: 10, happinessBoost: 25 },
];

export function PetOrchestra({ volume, onBack }: PetOrchestraProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [selectedFood, setSelectedFood] = useState(FOODS[0]);
  const [selectedPetType, setSelectedPetType] = useState(PET_TYPES[0]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const petIdCounter = useRef(0);
  const heartIdCounter = useRef(0);
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Pet needs decay timer
    const needsTimer = setInterval(() => {
      setPets(prev => prev.map(pet => ({
        ...pet,
        happiness: Math.max(0, pet.happiness - 1),
        energy: Math.max(0, pet.energy - 2)
      })));
    }, 5000);

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
      clearInterval(needsTimer);
    };
  }, []);

  const playNote = (frequency: number, instrument: string, skill: number) => {
    if (!audioContext.current) return;

    const baseVolume = volume * (skill / 100) * 0.5;
    
    let oscillator1: OscillatorNode;
    let oscillator2: OscillatorNode | null = null;
    const gainNode = audioContext.current.createGain();

    oscillator1 = audioContext.current.createOscillator();
    oscillator1.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    // Different sounds for different instruments
    switch (instrument) {
      case 'Davul':
        oscillator1.frequency.setValueAtTime(frequency * 0.5, audioContext.current.currentTime);
        oscillator1.type = 'triangle';
        break;
      case 'Flüt':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'sine';
        break;
      case 'Gitar':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'sawtooth';
        break;
      case 'Keman':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'triangle';
        oscillator2 = audioContext.current.createOscillator();
        oscillator2.connect(gainNode);
        oscillator2.frequency.setValueAtTime(frequency * 1.5, audioContext.current.currentTime);
        oscillator2.type = 'sine';
        break;
      case 'Trompet':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'square';
        break;
      default: // Piyano
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'triangle';
    }

    const duration = 0.5 + (skill / 200); // Better pets play longer

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(baseVolume, audioContext.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    
    if (oscillator2) {
      oscillator2.start(audioContext.current.currentTime);
      oscillator2.stop(audioContext.current.currentTime + duration);
    }
  };

  const adoptPet = (event: React.MouseEvent) => {
    if (!stageRef.current || pets.length >= 8) return;
    
    const rect = stageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if position is valid
    const tooClose = pets.some(pet => {
      const distance = Math.sqrt((pet.x - x) ** 2 + (pet.y - y) ** 2);
      return distance < 80;
    });

    if (tooClose) return;

    const newPet: Pet = {
      id: petIdCounter.current++,
      type: selectedPetType.type,
      emoji: selectedPetType.emoji,
      name: selectedPetType.name,
      instrument: selectedPetType.instrument,
      instrumentEmoji: selectedPetType.instrumentEmoji,
      frequency: selectedPetType.frequency,
      x,
      y,
      happiness: 100,
      energy: 100,
      skill: 30 + Math.random() * 40, // Random starting skill
      color: selectedPetType.color,
      isPlaying: false,
      lastFed: Date.now(),
      lastPetted: Date.now(),
      size: 60
    };

    setPets(prev => [...prev, newPet]);
    createHeart(x, y, '💕');

    // Play adoption sound
    playNote(selectedPetType.frequency, selectedPetType.instrument, 50);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const createHeart = (x: number, y: number, emoji: string) => {
    const heartId = heartIdCounter.current++;
    const newHeart: Heart = {
      id: heartId,
      x,
      y,
      emoji
    };

    setHearts(prev => [...prev, newHeart]);

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== heartId));
    }, 1500);
  };

  const feedPet = (petId: number) => {
    setPets(prev => prev.map(pet => {
      if (pet.id === petId) {
        const newHappiness = Math.min(100, pet.happiness + selectedFood.happinessBoost);
        const newEnergy = Math.min(100, pet.energy + selectedFood.energyBoost);
        const newSkill = Math.min(100, pet.skill + 2); // Feeding improves skill
        
        createHeart(pet.x, pet.y - 20, selectedFood.emoji);
        
        return {
          ...pet,
          happiness: newHappiness,
          energy: newEnergy,
          skill: newSkill,
          lastFed: Date.now()
        };
      }
      return pet;
    }));
  };

  const petPet = (petId: number) => {
    setPets(prev => prev.map(pet => {
      if (pet.id === petId) {
        const newHappiness = Math.min(100, pet.happiness + 15);
        const newSkill = Math.min(100, pet.skill + 3); // Petting improves skill more
        
        createHeart(pet.x, pet.y - 20, '💖');
        
        return {
          ...pet,
          happiness: newHappiness,
          skill: newSkill,
          lastPetted: Date.now()
        };
      }
      return pet;
    }));

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const playPet = (pet: Pet) => {
    if (pet.energy < 20) return; // Too tired to play
    
    setPets(prev => prev.map(p => 
      p.id === pet.id ? { 
        ...p, 
        isPlaying: true, 
        energy: Math.max(0, p.energy - 10),
        skill: Math.min(100, p.skill + 1) // Playing improves skill
      } : p
    ));

    playNote(pet.frequency, pet.instrument, pet.skill);
    createHeart(pet.x, pet.y - 20, '🎵');

    setTimeout(() => {
      setPets(prev => prev.map(p => 
        p.id === pet.id ? { ...p, isPlaying: false } : p
      ));
    }, 600);
  };

  const releasePet = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      createHeart(pet.x, pet.y, '👋');
    }
    setPets(prev => prev.filter(p => p.id !== petId));
  };

  const startAutoPlay = () => {
    setIsAutoPlay(true);
    autoPlayInterval.current = setInterval(() => {
      const availablePets = pets.filter(pet => pet.energy >= 20 && pet.happiness >= 30);
      if (availablePets.length > 0) {
        const randomPet = availablePets[Math.floor(Math.random() * availablePets.length)];
        playPet(randomPet);
      }
    }, 1000);
  };

  const stopAutoPlay = () => {
    setIsAutoPlay(false);
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
      autoPlayInterval.current = null;
    }
  };

  const getPetMood = (pet: Pet) => {
    if (pet.happiness > 80 && pet.energy > 60) return '😊';
    if (pet.happiness > 60 && pet.energy > 40) return '😐';
    if (pet.happiness > 40 && pet.energy > 20) return '😔';
    return '😢';
  };

  const clearStage = () => {
    pets.forEach(pet => createHeart(pet.x, pet.y, '👋'));
    setPets([]);
    setHearts([]);
    stopAutoPlay();
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
          <div className="text-6xl">🐾</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Evcil Orkestra
          </div>
          <div className="text-sm opacity-80">Hayvanlar: {pets.length}/8</div>
        </div>
        
        <Button
          onClick={clearStage}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Pet Stage */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-br from-green-200/80 via-blue-200/80 to-purple-200/80 dark:from-green-800/40 dark:via-blue-800/40 dark:to-purple-800/40 min-h-[400px] overflow-hidden">
        {/* Stage Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-blue-100/50 to-purple-100/50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-[2rem]" />
        
        {/* Stage decorations */}
        <div className="absolute top-4 left-8 text-4xl">🌟</div>
        <div className="absolute top-6 right-12 text-3xl">🎭</div>
        <div className="absolute bottom-8 left-12 text-3xl">🎪</div>

        {/* Interactive Stage Area */}
        <div
          ref={stageRef}
          className="relative w-full h-[400px] cursor-pointer"
          onClick={adoptPet}
        >
          {/* Pets */}
          <AnimatePresence>
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                className="absolute cursor-pointer"
                style={{ 
                  left: pet.x - pet.size/2, 
                  top: pet.y - pet.size/2,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: pet.isPlaying ? 1.3 : 1,
                  rotate: 0,
                  y: pet.isPlaying ? [-5, 5, -5] : 0
                }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPet(pet);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  petPet(pet.id);
                }}
              >
                {/* Pet Base */}
                <div 
                  className="w-16 h-16 rounded-full border-4 border-white/70 shadow-xl flex flex-col items-center justify-center relative"
                  style={{ backgroundColor: pet.color }}
                >
                  {/* Pet emoji */}
                  <div className="text-2xl">{pet.emoji}</div>
                  
                  {/* Mood indicator */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xl">
                    {getPetMood(pet)}
                  </div>
                  
                  {/* Instrument */}
                  <div className="absolute -bottom-2 -right-2 text-lg bg-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-300">
                    {pet.instrumentEmoji}
                  </div>
                  
                  {/* Stats bars */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-12 space-y-1">
                    {/* Happiness bar */}
                    <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-400 rounded-full transition-all duration-300"
                        style={{ width: `${pet.happiness}%` }}
                      />
                    </div>
                    {/* Energy bar */}
                    <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full transition-all duration-300"
                        style={{ width: `${pet.energy}%` }}
                      />
                    </div>
                    {/* Skill bar */}
                    <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${pet.skill}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Playing indicator */}
                  {pet.isPlaying && (
                    <motion.div
                      className="absolute inset-0 border-4 border-yellow-300 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Low energy warning */}
                  {pet.energy < 30 && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-lg animate-bounce">
                      😴
                    </div>
                  )}
                  
                  {/* Low happiness warning */}
                  {pet.happiness < 30 && (
                    <div className="absolute -top-10 right-1/2 transform translate-x-1/2 text-lg animate-bounce">
                      💔
                    </div>
                  )}
                </div>
                
                {/* Feed button */}
                <Button
                  className="absolute -left-8 top-0 w-6 h-6 rounded-full text-xs p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    feedPet(pet.id);
                  }}
                >
                  🍎
                </Button>
                
                {/* Release button */}
                <Button
                  className="absolute -right-8 top-0 w-6 h-6 rounded-full text-xs p-0 bg-red-400 hover:bg-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    releasePet(pet.id);
                  }}
                >
                  👋
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Hearts */}
          <AnimatePresence>
            {hearts.map((heart) => (
              <motion.div
                key={heart.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: heart.x - 10, top: heart.y - 10 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  y: [-30, -60]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1.5 }}
              >
                {heart.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {pets.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-8xl">🐾</div>
                <div className="text-xl">Hayvan sahiplen</div>
                <div className="text-lg">Besle, sevgi göster, müzik yap! 🎵</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={isAutoPlay ? stopAutoPlay : startAutoPlay}
          disabled={pets.length === 0}
          className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0"
        >
          {isAutoPlay ? '⏸️ Durdur' : '▶️ Otomatik Konser'}
        </Button>
      </div>

      {/* Pet Types */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {PET_TYPES.map((petType, index) => (
          <motion.div
            key={petType.type}
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
                ${selectedPetType.type === petType.type ? 'border-yellow-300 ring-4 ring-yellow-200' : 'border-white/50'}
              `}
              style={{ backgroundColor: petType.color }}
              onClick={() => setSelectedPetType(petType)}
            >
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl">{petType.emoji}</span>
                  <span className="text-lg">{petType.instrumentEmoji}</span>
                </div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {petType.name}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Food Selection */}
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {FOODS.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              className={`
                w-full h-16 rounded-2xl border-4 shadow-lg
                ${selectedFood.id === food.id ? 'border-green-300 ring-4 ring-green-200 bg-green-200' : 'border-white/50 bg-white/80'}
              `}
              onClick={() => setSelectedFood(food)}
            >
              <div className="text-center">
                <div className="text-2xl">{food.emoji}</div>
                <div className="text-xs font-bold opacity-80">
                  {food.name}
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
            <div className="text-3xl">🎼</div>
            <div className="text-lg font-bold">Evcil Müzisyenler</div>
            <div className="text-sm opacity-80">
              Hayvan sahiplen, besle, sev ve müzik öğret! Mutlu hayvanlar daha güzel çalar! 🐾🎵
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}