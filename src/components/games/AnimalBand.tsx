import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface AnimalBandProps {
  volume: number;
  onBack: () => void;
}

interface BandMember {
  id: number;
  animal: string;
  emoji: string;
  instrument: string;
  instrumentEmoji: string;
  note: string;
  frequency: number;
  color: string;
  x: number;
  y: number;
  isPlaying: boolean;
  size: number;
}

interface SoundWave {
  id: number;
  x: number;
  y: number;
  color: string;
}

const BAND_ANIMALS = [
  { 
    animal: 'Kedi', emoji: '🐱', instrument: 'Piyano', instrumentEmoji: '🎹',
    note: 'C4', frequency: 261.63, color: '#FF6B9D'
  },
  { 
    animal: 'Köpek', emoji: '🐶', instrument: 'Davul', instrumentEmoji: '🥁',
    note: 'D4', frequency: 293.66, color: '#FF8E53'
  },
  { 
    animal: 'Ördek', emoji: '🦆', instrument: 'Trompet', instrumentEmoji: '🎺',
    note: 'E4', frequency: 329.63, color: '#FFD93D'
  },
  { 
    animal: 'Kurbağa', emoji: '🐸', instrument: 'Gitar', instrumentEmoji: '🎸',
    note: 'F4', frequency: 349.23, color: '#6BCF7F'
  },
  { 
    animal: 'Kuş', emoji: '🐦', instrument: 'Flüt', instrumentEmoji: '🎵',
    note: 'G4', frequency: 392.00, color: '#4D96FF'
  },
  { 
    animal: 'Fare', emoji: '🐭', instrument: 'Keman', instrumentEmoji: '🎻',
    note: 'A4', frequency: 440.00, color: '#9B59B6'
  },
];

export function AnimalBand({ volume, onBack }: AnimalBandProps) {
  const [bandMembers, setBandMembers] = useState<BandMember[]>([]);
  const [soundWaves, setSoundWaves] = useState<SoundWave[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState(BAND_ANIMALS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120); // BPM
  
  const audioContext = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const memberIdCounter = useRef(0);
  const waveIdCounter = useRef(0);
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, []);

  const playNote = (frequency: number, instrument: string, duration: number = 0.8) => {
    if (!audioContext.current) return;

    let oscillator1: OscillatorNode;
    let oscillator2: OscillatorNode | null = null;
    const gainNode = audioContext.current.createGain();

    oscillator1 = audioContext.current.createOscillator();
    oscillator1.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    // Different sound types for different instruments
    switch (instrument) {
      case 'Davul':
        oscillator1.frequency.setValueAtTime(frequency * 0.5, audioContext.current.currentTime);
        oscillator1.type = 'sawtooth';
        duration = 0.3;
        break;
      case 'Trompet':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'square';
        oscillator2 = audioContext.current.createOscillator();
        oscillator2.connect(gainNode);
        oscillator2.frequency.setValueAtTime(frequency * 2, audioContext.current.currentTime);
        oscillator2.type = 'triangle';
        break;
      case 'Gitar':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'sawtooth';
        break;
      case 'Flüt':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'sine';
        break;
      case 'Keman':
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'triangle';
        oscillator2 = audioContext.current.createOscillator();
        oscillator2.connect(gainNode);
        oscillator2.frequency.setValueAtTime(frequency * 1.5, audioContext.current.currentTime);
        oscillator2.type = 'sine';
        break;
      default: // Piyano
        oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
        oscillator1.type = 'triangle';
    }

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    
    if (oscillator2) {
      oscillator2.start(audioContext.current.currentTime);
      oscillator2.stop(audioContext.current.currentTime + duration);
    }
  };

  const addBandMember = (event: React.MouseEvent) => {
    if (!stageRef.current) return;
    
    const rect = stageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if position is valid (not too close to other members)
    const tooClose = bandMembers.some(member => {
      const distance = Math.sqrt((member.x - x) ** 2 + (member.y - y) ** 2);
      return distance < 80;
    });

    if (tooClose) return;

    const newMember: BandMember = {
      id: memberIdCounter.current++,
      animal: selectedAnimal.animal,
      emoji: selectedAnimal.emoji,
      instrument: selectedAnimal.instrument,
      instrumentEmoji: selectedAnimal.instrumentEmoji,
      note: selectedAnimal.note,
      frequency: selectedAnimal.frequency,
      color: selectedAnimal.color,
      x,
      y,
      isPlaying: false,
      size: 60
    };

    setBandMembers(prev => [...prev, newMember]);
    playNote(selectedAnimal.frequency, selectedAnimal.instrument);
    createSoundWave(x, y, selectedAnimal.color);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const createSoundWave = (x: number, y: number, color: string) => {
    const waveId = waveIdCounter.current++;
    const newWave: SoundWave = {
      id: waveId,
      x,
      y,
      color
    };

    setSoundWaves(prev => [...prev, newWave]);

    setTimeout(() => {
      setSoundWaves(prev => prev.filter(wave => wave.id !== waveId));
    }, 1000);
  };

  const playMember = (member: BandMember) => {
    setBandMembers(prev => prev.map(m => 
      m.id === member.id ? { ...m, isPlaying: true } : m
    ));

    playNote(member.frequency, member.instrument);
    createSoundWave(member.x, member.y, member.color);

    setTimeout(() => {
      setBandMembers(prev => prev.map(m => 
        m.id === member.id ? { ...m, isPlaying: false } : m
      ));
    }, 300);
  };

  const removeMember = (memberId: number) => {
    setBandMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const startAutoPlay = () => {
    if (bandMembers.length === 0) return;
    
    setIsPlaying(true);
    const beatDuration = 60000 / tempo; // ms per beat

    autoPlayInterval.current = setInterval(() => {
      // Play random member or chord
      if (Math.random() > 0.3) {
        // Single note
        const randomMember = bandMembers[Math.floor(Math.random() * bandMembers.length)];
        playMember(randomMember);
      } else {
        // Chord (multiple members)
        const shuffled = [...bandMembers].sort(() => 0.5 - Math.random());
        const chordSize = Math.min(Math.floor(Math.random() * 3) + 2, shuffled.length);
        
        for (let i = 0; i < chordSize; i++) {
          setTimeout(() => playMember(shuffled[i]), i * 50);
        }
      }
    }, beatDuration);
  };

  const stopAutoPlay = () => {
    setIsPlaying(false);
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
      autoPlayInterval.current = null;
    }
  };

  const clearStage = () => {
    setBandMembers([]);
    setSoundWaves([]);
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
          <div className="text-6xl">🎭</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Hayvan Grubu
          </div>
          <div className="text-sm opacity-80">Müzisyen Sayısı: {bandMembers.length}</div>
        </div>
        
        <Button
          onClick={clearStage}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Stage */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-b from-purple-200/80 via-pink-200/80 to-red-200/80 dark:from-purple-800/40 dark:via-pink-800/40 dark:to-red-800/40 min-h-[400px] overflow-hidden">
        {/* Stage Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/50 via-pink-100/50 to-red-100/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 rounded-[2rem]" />
        
        {/* Stage Lights */}
        <div className="absolute top-4 left-1/4 text-4xl">💡</div>
        <div className="absolute top-4 right-1/4 text-4xl">💡</div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-3xl">🎤</div>
        
        {/* Curtains */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-red-600/60 to-transparent rounded-l-[2rem]" />
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-red-600/60 to-transparent rounded-r-[2rem]" />

        {/* Interactive Stage Area */}
        <div
          ref={stageRef}
          className="relative w-full h-[400px] cursor-pointer"
          onClick={addBandMember}
        >
          {/* Band Members */}
          <AnimatePresence>
            {bandMembers.map((member) => (
              <motion.div
                key={member.id}
                className="absolute cursor-pointer"
                style={{ 
                  left: member.x - member.size/2, 
                  top: member.y - member.size/2,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: member.isPlaying ? 1.3 : 1,
                  rotate: 0
                }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playMember(member);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  removeMember(member.id);
                }}
              >
                {/* Member Base */}
                <div 
                  className="w-16 h-16 rounded-full border-4 border-white/70 shadow-xl flex flex-col items-center justify-center relative"
                  style={{ backgroundColor: member.color }}
                >
                  {/* Animal */}
                  <div className="text-2xl">{member.emoji}</div>
                  
                  {/* Instrument */}
                  <div className="absolute -bottom-2 -right-2 text-xl bg-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-300">
                    {member.instrumentEmoji}
                  </div>
                  
                  {/* Playing indicator */}
                  {member.isPlaying && (
                    <motion.div
                      className="absolute inset-0 border-4 border-yellow-300 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Sound notes when playing */}
                  {member.isPlaying && (
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div
                        className="absolute -top-4 -left-2 text-xl"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        🎵
                      </motion.div>
                      <motion.div
                        className="absolute -top-2 -right-2 text-lg"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: -15, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        🎶
                      </motion.div>
                    </div>
                  )}
                </div>
                
                {/* Member Info */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
                    {member.animal}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Sound Waves */}
          <AnimatePresence>
            {soundWaves.map((wave) => (
              <motion.div
                key={wave.id}
                className="absolute pointer-events-none border-4 rounded-full"
                style={{ 
                  left: wave.x - 25, 
                  top: wave.y - 25,
                  borderColor: wave.color,
                  width: 50,
                  height: 50
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>

          {/* Stage Instructions */}
          {bandMembers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-8xl">🎭</div>
                <div className="text-xl">Sahneye müzisyen ekle</div>
                <div className="text-lg">Çal ve dinle! 🎵</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={isPlaying ? stopAutoPlay : startAutoPlay}
          disabled={bandMembers.length === 0}
          className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0"
        >
          {isPlaying ? '⏸️ Durdur' : '▶️ Otomatik Çal'}
        </Button>
        
        <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 rounded-2xl px-4 py-2">
          <span className="text-sm font-bold">Tempo:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTempo(Math.max(80, tempo - 20))}
            className="w-8 h-8 rounded-full"
          >
            -
          </Button>
          <span className="text-sm w-12 text-center">{tempo}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTempo(Math.min(180, tempo + 20))}
            className="w-8 h-8 rounded-full"
          >
            +
          </Button>
        </div>
      </div>

      {/* Animal Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {BAND_ANIMALS.map((animal, index) => (
          <motion.div
            key={animal.note}
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
                ${selectedAnimal.note === animal.note ? 'border-yellow-300 ring-4 ring-yellow-200' : 'border-white/50'}
              `}
              style={{ backgroundColor: animal.color }}
              onClick={() => setSelectedAnimal(animal)}
            >
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl">{animal.emoji}</span>
                  <span className="text-lg">{animal.instrumentEmoji}</span>
                </div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {animal.animal}
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
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-purple-200/80 to-pink-200/80 dark:from-purple-600/20 dark:to-pink-600/20 border-4 border-purple-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🎼</div>
            <div className="text-lg font-bold">Orkestra Yönet</div>
            <div className="text-sm opacity-80">
              Sahneye ekle, tek tek çal veya otomatik konser ver! 🎭✨
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}