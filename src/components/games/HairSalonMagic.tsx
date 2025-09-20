import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface HairSalonMagicProps {
  volume: number;
}

const HAIR_STYLES = [
  { id: 'short', emoji: '👱‍♀️', sound: 261.63, color: 'bg-pink-400' },
  { id: 'long', emoji: '👩‍🦱', sound: 293.66, color: 'bg-purple-400' },
  { id: 'braids', emoji: '👧', sound: 329.63, color: 'bg-blue-400' },
  { id: 'ponytail', emoji: '🙎‍♀️', sound: 349.23, color: 'bg-green-400' },
];

const HAIR_COLORS = [
  { id: 'blonde', emoji: '💛', sound: 392.00, color: 'bg-yellow-400' },
  { id: 'brown', emoji: '🤎', sound: 440.00, color: 'bg-amber-600' },
  { id: 'black', emoji: '🖤', sound: 493.88, color: 'bg-gray-800' },
  { id: 'red', emoji: '❤️', sound: 523.25, color: 'bg-red-500' },
];

const ACCESSORIES = [
  { id: 'bow', emoji: '🎀', sound: 587.33, color: 'bg-pink-300' },
  { id: 'flower', emoji: '🌸', sound: 659.25, color: 'bg-rose-300' },
  { id: 'headband', emoji: '👑', sound: 698.46, color: 'bg-yellow-300' },
  { id: 'hat', emoji: '👒', sound: 783.99, color: 'bg-indigo-400' },
];

const TOOLS = [
  { id: 'scissors', emoji: '✂️', sound: 'snip' },
  { id: 'comb', emoji: '🪮', sound: 'brush' },
  { id: 'dryer', emoji: '💨', sound: 'whoosh' },
  { id: 'spray', emoji: '💫', sound: 'spray' },
];

export function HairSalonMagic({ volume }: HairSalonMagicProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [makeover, setMakeover] = useState<any>(null);
  const [sparkles, setSparkles] = useState<Array<{
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

  // Tool sound effects
  const playToolSound = useCallback((soundType: string) => {
    switch (soundType) {
      case 'snip':
        playSound(800, 'square', 0.2);
        setTimeout(() => playSound(850, 'square', 0.2), 100);
        break;
      case 'brush':
        playSound(200, 'sawtooth', 0.5);
        break;
      case 'whoosh':
        playSound(150, 'sawtooth', 1.0);
        break;
      case 'spray':
        playSound(400, 'sine', 0.8);
        break;
    }
  }, [playSound]);

  // Handle selections
  const handleStyleSelect = useCallback((style: any) => {
    playSound(style.sound);
    setSelectedStyle(style.id);
  }, [playSound]);

  const handleColorSelect = useCallback((color: any) => {
    playSound(color.sound);
    setSelectedColor(color.id);
  }, [playSound]);

  const handleAccessorySelect = useCallback((accessory: any) => {
    playSound(accessory.sound);
    setSelectedAccessory(accessory.id);
  }, [playSound]);

  // Handle tool usage
  const handleToolUse = useCallback((tool: any) => {
    setActiveTool(tool.id);
    playToolSound(tool.sound);
    
    // Create sparkle effects
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 300,
      y: Math.random() * 200,
      emoji: ['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)]
    }));
    
    setSparkles(newSparkles);
    
    // Complete makeover if all selections made
    if (selectedStyle && selectedColor) {
      setTimeout(() => {
        const style = HAIR_STYLES.find(s => s.id === selectedStyle);
        const color = HAIR_COLORS.find(c => c.id === selectedColor);
        const accessory = selectedAccessory ? ACCESSORIES.find(a => a.id === selectedAccessory) : null;
        
        setMakeover({ style, color, accessory });
        playSound(1000, 'sine', 1.5); // Success sound
      }, 1000);
    }
    
    setTimeout(() => {
      setActiveTool(null);
      setSparkles([]);
    }, 1500);
  }, [selectedStyle, selectedColor, selectedAccessory, playToolSound, playSound]);

  // Reset makeover
  const resetMakeover = useCallback(() => {
    setSelectedStyle(null);
    setSelectedColor(null);
    setSelectedAccessory(null);
    setMakeover(null);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 hardware-accelerated">
      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl mb-2">✂️ Sihirli Kuaför</h2>
        <p className="text-white/80">Saç stilini müzikle tasarla!</p>
      </motion.div>

      {/* Mirror & Result Area */}
      <div className="relative mb-8 p-6 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-3xl border-4 border-white/20">
        <div className="bg-gradient-to-br from-blue-100 to-pink-100 rounded-3xl p-8 relative overflow-hidden min-h-[200px] flex items-center justify-center">
          {/* Mirror Frame */}
          <div className="absolute inset-4 border-8 border-yellow-400 rounded-3xl bg-gradient-to-br from-blue-50 to-pink-50"></div>
          
          {/* Character */}
          <div className="relative z-10">
            {makeover ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-8xl mb-4">{makeover.style.emoji}</div>
                <div className="flex justify-center gap-2 text-3xl">
                  <div>{makeover.color.emoji}</div>
                  {makeover.accessory && <div>{makeover.accessory.emoji}</div>}
                </div>
              </motion.div>
            ) : (
              <div className="text-8xl opacity-50">👤</div>
            )}
          </div>

          {/* Active Tool Display */}
          {activeTool && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              className="absolute top-4 right-4 text-6xl"
            >
              {TOOLS.find(t => t.id === activeTool)?.emoji}
            </motion.div>
          )}

          {/* Sparkles */}
          <AnimatePresence>
            {sparkles.map(sparkle => (
              <motion.div
                key={sparkle.id}
                className="absolute pointer-events-none"
                initial={{ 
                  x: sparkle.x, 
                  y: sparkle.y, 
                  scale: 0, 
                  opacity: 1 
                }}
                animate={{ 
                  y: sparkle.y - 100,
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0],
                  rotate: [0, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1.5 }}
              >
                <div className="text-3xl">{sparkle.emoji}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        {makeover && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <Button
              onClick={resetMakeover}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl text-lg"
            >
              🔄 Yeniden Başla
            </Button>
          </motion.div>
        )}
      </div>

      {/* Selection Grid */}
      <div className="space-y-6">
        {/* Hair Styles */}
        <div>
          <h3 className="text-xl mb-4 text-center">💇‍♀️ Saç Stili</h3>
          <div className="grid grid-cols-4 gap-3">
            {HAIR_STYLES.map((style, index) => (
              <motion.div
                key={style.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`
                    w-full h-20 rounded-2xl border-0 relative
                    ${style.color} hover:opacity-90
                    ${selectedStyle === style.id ? 'ring-4 ring-yellow-300 scale-105' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => handleStyleSelect(style)}
                >
                  <div className="text-3xl">{style.emoji}</div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hair Colors */}
        <div>
          <h3 className="text-xl mb-4 text-center">🎨 Saç Rengi</h3>
          <div className="grid grid-cols-4 gap-3">
            {HAIR_COLORS.map((color, index) => (
              <motion.div
                key={color.id}
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
                    ${color.color} hover:opacity-90
                    ${selectedColor === color.id ? 'ring-4 ring-yellow-300 scale-105' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => handleColorSelect(color)}
                >
                  <div className="text-3xl">{color.emoji}</div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <h3 className="text-xl mb-4 text-center">👑 Aksesuarlar</h3>
          <div className="grid grid-cols-4 gap-3">
            {ACCESSORIES.map((accessory, index) => (
              <motion.div
                key={accessory.id}
                initial={{ scale: 0, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`
                    w-full h-20 rounded-2xl border-0 relative
                    ${accessory.color} hover:opacity-90
                    ${selectedAccessory === accessory.id ? 'ring-4 ring-yellow-300 scale-105' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => handleAccessorySelect(accessory)}
                >
                  <div className="text-3xl">{accessory.emoji}</div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-xl mb-4 text-center">🛠️ Araçlar</h3>
          <div className="grid grid-cols-4 gap-3">
            {TOOLS.map((tool, index) => (
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
                    bg-gradient-to-br from-blue-400 to-purple-400 hover:opacity-90
                    ${activeTool === tool.id ? 'ring-4 ring-yellow-300 scale-105' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => handleToolUse(tool)}
                >
                  <div className="text-3xl">{tool.emoji}</div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {makeover && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-3xl text-2xl font-bold shadow-2xl">
              ✨ Makeover Tamamlandı! ✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}