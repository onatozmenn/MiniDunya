import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface HouseBuilderBeatsProps {
  volume: number;
}

const BUILDING_MATERIALS = [
  { id: 'foundation', emoji: '🧱', sound: 130.81, layer: 1, color: 'bg-gray-500' },
  { id: 'walls', emoji: '🏠', sound: 196.00, layer: 2, color: 'bg-red-400' },
  { id: 'roof', emoji: '🏘️', sound: 261.63, layer: 3, color: 'bg-blue-500' },
  { id: 'door', emoji: '🚪', sound: 329.63, layer: 4, color: 'bg-amber-600' },
  { id: 'windows', emoji: '🪟', sound: 392.00, layer: 5, color: 'bg-sky-400' },
  { id: 'chimney', emoji: '🏭', sound: 523.25, layer: 6, color: 'bg-gray-600' },
];

const DECORATIONS = [
  { id: 'garden', emoji: '🌻', sound: 659.25, color: 'bg-green-400' },
  { id: 'tree', emoji: '🌳', sound: 783.99, color: 'bg-green-600' },
  { id: 'fence', emoji: '🚧', sound: 880.00, color: 'bg-yellow-600' },
  { id: 'mailbox', emoji: '📮', sound: 987.77, color: 'bg-blue-600' },
];

const TOOLS = [
  { id: 'hammer', emoji: '🔨', sound: 'bang', freq: 200 },
  { id: 'drill', emoji: '🪚', sound: 'drill', freq: 400 },
  { id: 'paint', emoji: '🎨', sound: 'brush', freq: 300 },
  { id: 'measure', emoji: '📏', sound: 'beep', freq: 500 },
];

export function HouseBuilderBeats({ volume }: HouseBuilderBeatsProps) {
  const [builtLayers, setBuiltLayers] = useState<number[]>([]);
  const [decorations, setDecorations] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [buildingParticles, setBuildingParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    emoji: string;
  }>>([]);
  const [isBuilding, setIsBuilding] = useState(false);

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

  // Play tool sounds
  const playToolSound = useCallback((soundType: string, frequency: number) => {
    switch (soundType) {
      case 'bang':
        playSound(frequency, 'square', 0.2);
        setTimeout(() => playSound(frequency * 0.8, 'square', 0.2), 100);
        break;
      case 'drill':
        playSound(frequency, 'sawtooth', 0.8);
        break;
      case 'brush':
        playSound(frequency, 'sine', 0.5);
        setTimeout(() => playSound(frequency * 1.2, 'sine', 0.3), 200);
        break;
      case 'beep':
        playSound(frequency, 'sine', 0.1);
        break;
    }
  }, [playSound]);

  // Build layer
  const buildLayer = useCallback((material: any) => {
    // Check if previous layers are built
    const canBuild = material.layer === 1 || builtLayers.includes(material.layer - 1);
    
    if (!canBuild || builtLayers.includes(material.layer)) return;
    
    setIsBuilding(true);
    setBuiltLayers(prev => [...prev, material.layer]);
    playSound(material.sound);
    
    // Create building particles
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 50,
      emoji: ['🔨', '⚡', '✨', '💫'][Math.floor(Math.random() * 4)]
    }));
    
    setBuildingParticles(newParticles);
    
    // Play construction melody
    setTimeout(() => playSound(material.sound * 1.2, 'sine', 0.2), 200);
    setTimeout(() => playSound(material.sound * 1.5, 'sine', 0.2), 400);
    
    setTimeout(() => {
      setIsBuilding(false);
      setBuildingParticles([]);
    }, 1500);
  }, [builtLayers, playSound]);

  // Add decoration
  const addDecoration = useCallback((decoration: any) => {
    if (decorations.includes(decoration.id) || builtLayers.length < 3) return;
    
    setDecorations(prev => [...prev, decoration.id]);
    playSound(decoration.sound);
    
    // Create decoration particles
    const newParticles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 300,
      y: Math.random() * 150,
      emoji: decoration.emoji
    }));
    
    setBuildingParticles(newParticles);
    setTimeout(() => setBuildingParticles([]), 1000);
  }, [decorations, builtLayers, playSound]);

  // Use tool
  const useTool = useCallback((tool: any) => {
    setActiveTool(tool.id);
    playToolSound(tool.sound, tool.freq);
    
    // Tool particles
    const toolParticles = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 150,
      y: Math.random() * 100,
      emoji: tool.emoji
    }));
    
    setBuildingParticles(toolParticles);
    
    setTimeout(() => {
      setActiveTool(null);
      setBuildingParticles([]);
    }, 1000);
  }, [playToolSound]);

  // Reset house
  const resetHouse = useCallback(() => {
    setBuiltLayers([]);
    setDecorations([]);
    playSound(150, 'square', 1.0);
  }, [playSound]);

  // Check if house is complete
  const isHouseComplete = builtLayers.length === BUILDING_MATERIALS.length;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 hardware-accelerated">
      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl mb-2">🏠 Ev İnşaat Müziği</h2>
        <p className="text-white/80">Ev inşa et ve müzik yap!</p>
        <div className="flex justify-center mt-4">
          <Button
            onClick={resetHouse}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-2xl"
          >
            🔄 Yeniden Başla
          </Button>
        </div>
      </motion.div>

      {/* Construction Site */}
      <div className="relative mb-8 p-6 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-3xl border-4 border-white/20">
        <div className="bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl p-8 relative overflow-hidden min-h-[300px]">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-600 to-green-400 rounded-b-3xl"></div>
          
          {/* House Visualization */}
          <div className="relative z-10 flex items-end justify-center h-full">
            <div className="relative">
              {/* Built layers display */}
              <div className="space-y-2">
                {BUILDING_MATERIALS.map((material) => (
                  <motion.div
                    key={material.id}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ 
                      scale: builtLayers.includes(material.layer) ? 1 : 0,
                      y: builtLayers.includes(material.layer) ? 0 : 20
                    }}
                    transition={{ 
                      duration: 0.5,
                      type: "spring",
                      bounce: 0.6
                    }}
                    className="text-6xl text-center"
                    style={{ 
                      position: 'relative',
                      zIndex: 10 - material.layer 
                    }}
                  >
                    {material.emoji}
                  </motion.div>
                ))}
              </div>
              
              {/* Decorations around house */}
              <div className="absolute -left-20 -right-20 -bottom-10 flex justify-around items-end">
                {DECORATIONS.map((decoration) => (
                  <motion.div
                    key={decoration.id}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ 
                      scale: decorations.includes(decoration.id) ? 1 : 0,
                      y: decorations.includes(decoration.id) ? 0 : 20
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl"
                  >
                    {decorations.includes(decoration.id) ? decoration.emoji : ''}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Tool Display */}
          {activeTool && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                x: [0, 15, -15, 0],
                y: [0, -10, 10, 0]
              }}
              transition={{ 
                rotate: { duration: 0.3 },
                x: { duration: 0.6, repeat: 2 },
                y: { duration: 0.4, repeat: 3 }
              }}
              className="absolute top-4 right-4 text-6xl"
            >
              {TOOLS.find(t => t.id === activeTool)?.emoji}
            </motion.div>
          )}

          {/* Building Progress Indicator */}
          <div className="absolute top-4 left-4 bg-white/20 rounded-2xl p-3">
            <div className="text-sm font-bold mb-2">İnşaat İlerlemesi</div>
            <div className="flex gap-1">
              {BUILDING_MATERIALS.map((material) => (
                <div
                  key={material.id}
                  className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                    builtLayers.includes(material.layer) 
                      ? 'bg-green-400' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Particles */}
          <AnimatePresence>
            {buildingParticles.map(particle => (
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
                  y: particle.y - 80,
                  scale: [0, 1, 0.8, 0],
                  opacity: [1, 0.9, 0.6, 0],
                  rotate: [0, 180, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1.5 }}
              >
                <div className="text-3xl">{particle.emoji}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Building Materials */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">🧱 İnşaat Malzemeleri</h3>
        <div className="grid grid-cols-3 gap-4">
          {BUILDING_MATERIALS.map((material, index) => {
            const canBuild = material.layer === 1 || builtLayers.includes(material.layer - 1);
            const isBuilt = builtLayers.includes(material.layer);
            
            return (
              <motion.div
                key={material.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: canBuild && !isBuilt ? 1.05 : 1 }}
                whileTap={{ scale: canBuild && !isBuilt ? 0.95 : 1 }}
              >
                <Button
                  variant="outline"
                  className={`
                    w-full h-24 rounded-2xl border-0 relative
                    ${material.color} 
                    ${!canBuild ? 'opacity-30' : isBuilt ? 'opacity-60 bg-green-500' : 'hover:opacity-90'}
                    transition-all duration-200 flex flex-col items-center justify-center gap-1
                  `}
                  onClick={() => buildLayer(material)}
                  disabled={!canBuild || isBuilt}
                >
                  <div className="text-4xl">{material.emoji}</div>
                  <div className="text-xs font-bold">Katman {material.layer}</div>
                  
                  {isBuilt && (
                    <div className="absolute -top-2 -right-2 text-2xl">✅</div>
                  )}
                  
                  {!canBuild && material.layer > 1 && (
                    <div className="absolute -top-2 -right-2 text-2xl">🔒</div>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decorations */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">🌸 Dekorasyon</h3>
        <div className="grid grid-cols-4 gap-4">
          {DECORATIONS.map((decoration, index) => {
            const canAdd = builtLayers.length >= 3;
            const isAdded = decorations.includes(decoration.id);
            
            return (
              <motion.div
                key={decoration.id}
                initial={{ scale: 0, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: canAdd && !isAdded ? 1.05 : 1 }}
                whileTap={{ scale: canAdd && !isAdded ? 0.95 : 1 }}
              >
                <Button
                  variant="outline"
                  className={`
                    w-full h-20 rounded-2xl border-0 relative
                    ${decoration.color}
                    ${!canAdd ? 'opacity-30' : isAdded ? 'opacity-60 bg-green-400' : 'hover:opacity-90'}
                    transition-all duration-200
                  `}
                  onClick={() => addDecoration(decoration)}
                  disabled={!canAdd || isAdded}
                >
                  <div className="text-3xl">{decoration.emoji}</div>
                  
                  {isAdded && (
                    <div className="absolute -top-1 -right-1 text-lg">✅</div>
                  )}
                  
                  {!canAdd && (
                    <div className="absolute -top-1 -right-1 text-lg">🔒</div>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div>
        <h3 className="text-xl mb-4 text-center">🛠️ Araçlar</h3>
        <div className="grid grid-cols-4 gap-4">
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className="w-full h-20 rounded-2xl border-0 bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90 transition-all duration-200"
                onClick={() => useTool(tool)}
              >
                <div className="text-3xl">{tool.emoji}</div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {isHouseComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-3xl text-2xl font-bold shadow-2xl">
              🎉 Ev Tamamlandı! Süper Mimar! 🏠✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}