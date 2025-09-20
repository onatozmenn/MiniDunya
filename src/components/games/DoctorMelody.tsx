import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface DoctorMelodyProps {
  volume: number;
}

const PATIENTS = [
  { 
    id: 'bear', 
    emoji: '🐻', 
    problem: 'fever',
    problemEmoji: '🌡️',
    sound: 261.63,
    treatment: ['medicine', 'rest']
  },
  { 
    id: 'cat', 
    emoji: '🐱', 
    problem: 'hurt_paw',
    problemEmoji: '🩹',
    sound: 329.63,
    treatment: ['bandage', 'care']
  },
  { 
    id: 'dog', 
    emoji: '🐶', 
    problem: 'checkup',
    problemEmoji: '🩺',
    sound: 392.00,
    treatment: ['stethoscope', 'medicine']
  },
  { 
    id: 'rabbit', 
    emoji: '🐰', 
    problem: 'tooth_ache',
    problemEmoji: '🦷',
    sound: 440.00,
    treatment: ['dentist', 'medicine']
  },
];

const MEDICAL_TOOLS = [
  { id: 'stethoscope', emoji: '🩺', sound: 'heartbeat', freq: 200 },
  { id: 'thermometer', emoji: '🌡️', sound: 'beep', freq: 400 },
  { id: 'bandage', emoji: '🩹', sound: 'wrap', freq: 300 },
  { id: 'medicine', emoji: '💊', sound: 'pop', freq: 500 },
  { id: 'syringe', emoji: '💉', sound: 'inject', freq: 350 },
  { id: 'dentist', emoji: '🦷', sound: 'drill', freq: 600 },
];

const CARE_ACTIONS = [
  { id: 'rest', emoji: '😴', sound: 523.25 },
  { id: 'care', emoji: '❤️', sound: 659.25 },
  { id: 'happy', emoji: '😊', sound: 783.99 },
];

export function DoctorMelody({ volume }: DoctorMelodyProps) {
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [usedTools, setUsedTools] = useState<string[]>([]);
  const [healedPatients, setHealedPatients] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    emoji: string;
  }>>([]);

  // Audio system
  const playSound = useCallback((frequency: number, type: 'sine' | 'sawtooth' | 'square' = 'sine', duration: number = 0.3) => {
    if (volume === 0) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [volume]);

  // Play medical tool sounds
  const playToolSound = useCallback((soundType: string, frequency: number) => {
    switch (soundType) {
      case 'heartbeat':
        playSound(frequency, 'sine', 0.2);
        setTimeout(() => playSound(frequency, 'sine', 0.2), 300);
        setTimeout(() => playSound(frequency, 'sine', 0.2), 600);
        break;
      case 'beep':
        playSound(frequency, 'square', 0.1);
        break;
      case 'wrap':
        playSound(frequency, 'sawtooth', 0.5);
        break;
      case 'pop':
        playSound(frequency, 'sine', 0.2);
        break;
      case 'inject':
        playSound(frequency, 'square', 0.3);
        break;
      case 'drill':
        playSound(frequency, 'sawtooth', 0.8);
        break;
    }
  }, [playSound]);

  // Select patient
  const selectPatient = useCallback((patient: any) => {
    if (healedPatients.includes(patient.id)) return;
    
    setCurrentPatient(patient);
    setUsedTools([]);
    playSound(patient.sound);
  }, [healedPatients, playSound]);

  // Use medical tool
  const useTool = useCallback((tool: any) => {
    if (!currentPatient) return;
    
    setActiveTool(tool.id);
    playToolSound(tool.sound, tool.freq);
    
    // Add tool to used tools
    setUsedTools(prev => [...prev, tool.id]);
    
    // Create tool particles
    const newParticles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200,
      y: Math.random() * 100,
      emoji: tool.emoji
    }));
    
    setParticles(newParticles);
    
    // Check if patient is healed
    setTimeout(() => {
      const hasAllTreatments = currentPatient.treatment.every((treatment: string) => 
        usedTools.includes(treatment) || treatment === tool.id
      );
      
      if (hasAllTreatments && currentPatient.treatment.includes(tool.id)) {
        // Patient is healed!
        setHealedPatients(prev => [...prev, currentPatient.id]);
        playSound(1000, 'sine', 1.5); // Success melody
        
        // Happy particles
        const happyParticles = Array.from({ length: 8 }, (_, i) => ({
          id: Date.now() + 1000 + i,
          x: Math.random() * 300,
          y: Math.random() * 200,
          emoji: ['❤️', '✨', '🌟', '😊'][Math.floor(Math.random() * 4)]
        }));
        
        setParticles(prev => [...prev, ...happyParticles]);
        
        // Reset after celebration
        setTimeout(() => {
          setCurrentPatient(null);
          setUsedTools([]);
        }, 2000);
      }
      
      setActiveTool(null);
      setTimeout(() => setParticles([]), 2000);
    }, 1000);
  }, [currentPatient, usedTools, playToolSound, playSound]);

  // Perform care action
  const performCare = useCallback((action: any) => {
    if (!currentPatient) return;
    
    playSound(action.sound);
    
    // Check if this completes treatment
    const updatedTools = [...usedTools, action.id];
    const hasAllTreatments = currentPatient.treatment.every((treatment: string) => 
      updatedTools.includes(treatment)
    );
    
    if (hasAllTreatments) {
      setHealedPatients(prev => [...prev, currentPatient.id]);
      playSound(1200, 'sine', 2.0);
      
      // Create celebration
      const celebrationParticles = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 300,
        y: Math.random() * 200,
        emoji: ['🎉', '✨', '❤️', '🌟'][Math.floor(Math.random() * 4)]
      }));
      
      setParticles(celebrationParticles);
      
      setTimeout(() => {
        setCurrentPatient(null);
        setUsedTools([]);
        setParticles([]);
      }, 3000);
    }
  }, [currentPatient, usedTools, playSound]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 hardware-accelerated">
      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl mb-2">🏥 Müzikli Doktor</h2>
        <p className="text-white/80">Hastaları iyileştir ve müzik çal!</p>
        <div className="text-lg mt-2">
          ✨ İyileştirilen: {healedPatients.length}/{PATIENTS.length}
        </div>
      </motion.div>

      {/* Hospital Room */}
      <div className="relative mb-8 p-6 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-3xl border-4 border-white/20">
        {/* Examination Table */}
        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8 relative overflow-hidden min-h-[200px] flex items-center justify-center">
          <div className="absolute inset-4 border-4 border-blue-300 rounded-3xl bg-white/50"></div>
          
          {/* Current Patient */}
          <div className="relative z-10 text-center">
            {currentPatient ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="space-y-4"
              >
                <div className="text-8xl">{currentPatient.emoji}</div>
                <div className="flex justify-center items-center gap-4 text-4xl">
                  <div>😷</div>
                  <div>{currentPatient.problemEmoji}</div>
                </div>
                <div className="text-lg text-gray-700">
                  Tedavi gerekli: {currentPatient.treatment.map((t: string) => {
                    const tool = MEDICAL_TOOLS.find(mt => mt.id === t);
                    const care = CARE_ACTIONS.find(ca => ca.id === t);
                    return tool?.emoji || care?.emoji || '❓';
                  }).join(' ')}
                </div>
              </motion.div>
            ) : (
              <div className="text-6xl opacity-50">🏥</div>
            )}
          </div>

          {/* Active Tool Animation */}
          {activeTool && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                x: [0, 10, -10, 0],
                y: [0, -5, 5, 0]
              }}
              transition={{ 
                rotate: { duration: 0.3 },
                x: { duration: 0.5, repeat: 2 },
                y: { duration: 0.3, repeat: 3 }
              }}
              className="absolute top-4 right-4 text-6xl"
            >
              {MEDICAL_TOOLS.find(t => t.id === activeTool)?.emoji}
            </motion.div>
          )}

          {/* Particles */}
          <AnimatePresence>
            {particles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute pointer-events-none"
                initial={{ 
                  x: particle.x, 
                  y: particle.y, 
                  scale: 0, 
                  opacity: 1 
                }}
                animate={{ 
                  y: particle.y - 120,
                  scale: [0, 1, 0.8, 0],
                  opacity: [1, 0.9, 0.7, 0],
                  rotate: [0, 180, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2 }}
              >
                <div className="text-3xl">{particle.emoji}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Waiting Room - Patient Selection */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">🪑 Bekleme Odası</h3>
        <div className="grid grid-cols-2 gap-4">
          {PATIENTS.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ scale: 0, x: -50 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className={`
                  w-full h-24 rounded-2xl border-0 relative
                  ${healedPatients.includes(patient.id) 
                    ? 'bg-gradient-to-br from-green-400 to-blue-400' 
                    : 'bg-gradient-to-br from-red-400 to-orange-400'
                  }
                  ${currentPatient?.id === patient.id ? 'ring-4 ring-yellow-300 scale-105' : ''}
                  transition-all duration-200 flex flex-col items-center justify-center gap-1
                  ${healedPatients.includes(patient.id) ? 'opacity-75' : 'hover:opacity-90'}
                `}
                onClick={() => selectPatient(patient)}
                disabled={healedPatients.includes(patient.id)}
              >
                <div className="text-4xl">{patient.emoji}</div>
                <div className="text-2xl">{patient.problemEmoji}</div>
                
                {healedPatients.includes(patient.id) && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2 text-3xl"
                  >
                    ✅
                  </motion.div>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Medical Tools */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">🛠️ Tıbbi Araçlar</h3>
        <div className="grid grid-cols-3 gap-4">
          {MEDICAL_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className={`
                  w-full h-20 rounded-2xl border-0 relative
                  bg-gradient-to-br from-blue-500 to-purple-500 hover:opacity-90
                  ${!currentPatient ? 'opacity-50' : ''}
                  ${usedTools.includes(tool.id) ? 'ring-4 ring-green-300' : ''}
                  transition-all duration-200
                `}
                onClick={() => useTool(tool)}
                disabled={!currentPatient}
              >
                <div className="text-3xl">{tool.emoji}</div>
                {usedTools.includes(tool.id) && (
                  <div className="absolute -top-1 -right-1 text-lg">✅</div>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Care Actions */}
      <div>
        <h3 className="text-xl mb-4 text-center">💝 Bakım</h3>
        <div className="grid grid-cols-3 gap-4">
          {CARE_ACTIONS.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className={`
                  w-full h-20 rounded-2xl border-0 relative
                  bg-gradient-to-br from-pink-400 to-red-400 hover:opacity-90
                  ${!currentPatient ? 'opacity-50' : ''}
                  transition-all duration-200
                `}
                onClick={() => performCare(action)}
                disabled={!currentPatient}
              >
                <div className="text-3xl">{action.emoji}</div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {healedPatients.length === PATIENTS.length && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-3xl text-2xl font-bold shadow-2xl">
              🎉 Tüm Hastalar İyileşti! Süper Doktor! 🎉
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}