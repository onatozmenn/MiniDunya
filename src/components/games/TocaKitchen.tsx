import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface TocaKitchenProps {
  volume: number;
}

const INGREDIENTS = [
  { id: 'tomato', emoji: '🍅', sound: 'C4', color: 'bg-red-400' },
  { id: 'carrot', emoji: '🥕', sound: 'D4', color: 'bg-orange-400' },
  { id: 'broccoli', emoji: '🥦', sound: 'E4', color: 'bg-green-400' },
  { id: 'onion', emoji: '🧅', sound: 'F4', color: 'bg-yellow-200' },
  { id: 'mushroom', emoji: '🍄', sound: 'G4', color: 'bg-amber-300' },
  { id: 'pepper', emoji: '🫑', sound: 'A4', color: 'bg-green-500' },
];

const COOKING_TOOLS = [
  { id: 'pan', emoji: '🍳', sound: 'sizzle' },
  { id: 'pot', emoji: '🍲', sound: 'bubble' },
  { id: 'oven', emoji: '🔥', sound: 'crackle' },
  { id: 'blender', emoji: '🌪️', sound: 'whirr' },
];

const RECIPES = [
  { 
    id: 'soup', 
    emoji: '🍜', 
    ingredients: ['tomato', 'carrot', 'onion'],
    tool: 'pot',
    completedSound: 'C5'
  },
  { 
    id: 'salad', 
    emoji: '🥗', 
    ingredients: ['broccoli', 'pepper', 'mushroom'],
    tool: 'pan',
    completedSound: 'G5'
  },
];

export function TocaKitchen({ volume }: TocaKitchenProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [completedRecipe, setCompletedRecipe] = useState<string | null>(null);
  const [cookingParticles, setCookingParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    emoji: string;
  }>>([]);

  // Audio context for cooking sounds
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

  // Play cooking sound effects
  const playCookingSound = useCallback((soundType: string) => {
    switch (soundType) {
      case 'sizzle':
        playSound(200, 'sawtooth', 0.5);
        break;
      case 'bubble':
        playSound(150, 'sine', 0.8);
        break;
      case 'crackle':
        playSound(300, 'square', 0.3);
        break;
      case 'whirr':
        playSound(400, 'sawtooth', 1.0);
        break;
    }
  }, [playSound]);

  // Handle ingredient selection
  const handleIngredientSelect = useCallback((ingredient: any) => {
    const freq = ingredient.sound === 'C4' ? 261.63 : 
                 ingredient.sound === 'D4' ? 293.66 :
                 ingredient.sound === 'E4' ? 329.63 :
                 ingredient.sound === 'F4' ? 349.23 :
                 ingredient.sound === 'G4' ? 392.00 : 440.00;
    
    playSound(freq);
    
    setSelectedIngredients(prev => {
      if (prev.includes(ingredient.id)) {
        return prev.filter(id => id !== ingredient.id);
      } else {
        return [...prev, ingredient.id];
      }
    });
  }, [playSound]);

  // Handle cooking tool selection
  const handleToolSelect = useCallback((tool: any) => {
    setSelectedTool(tool.id);
    playCookingSound(tool.sound);
    
    if (selectedIngredients.length > 0) {
      setIsActive(true);
      
      // Create cooking particles
      const particles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 200,
        y: Math.random() * 100,
        emoji: ['✨', '💫', '⭐'][Math.floor(Math.random() * 3)]
      }));
      
      setCookingParticles(particles);
      
      // Check for completed recipes
      setTimeout(() => {
        const recipe = RECIPES.find(r => 
          r.ingredients.every(ing => selectedIngredients.includes(ing)) &&
          r.tool === tool.id &&
          selectedIngredients.length === r.ingredients.length
        );
        
        if (recipe) {
          setCompletedRecipe(recipe.id);
          const freq = recipe.completedSound === 'C5' ? 523.25 : 783.99;
          playSound(freq, 'sine', 1.0);
          
          // Clear after celebration
          setTimeout(() => {
            setSelectedIngredients([]);
            setSelectedTool(null);
            setCompletedRecipe(null);
          }, 2000);
        }
        
        setIsActive(false);
        setCookingParticles([]);
      }, 1500);
    }
  }, [selectedIngredients, playCookingSound, playSound]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 hardware-accelerated">
      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl mb-2">🍳 Müzikli Mutfak</h2>
        <p className="text-white/80">Malzemeleri seç ve pişir!</p>
      </motion.div>

      {/* Cooking Area */}
      <div className="relative mb-8 p-6 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl border-4 border-white/20">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Selected Ingredients Display */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-lg mb-3 text-center">🥗 Malzemeler</h3>
            <div className="flex flex-wrap gap-2 justify-center min-h-[60px] items-center">
              {selectedIngredients.map((ingredientId, index) => {
                const ingredient = INGREDIENTS.find(i => i.id === ingredientId);
                return ingredient ? (
                  <motion.div
                    key={ingredientId + index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl"
                  >
                    {ingredient.emoji}
                  </motion.div>
                ) : null;
              })}
            </div>
          </div>

          {/* Cooking Result */}
          <div className="bg-white/10 rounded-2xl p-4 relative overflow-hidden">
            <h3 className="text-lg mb-3 text-center">👨‍🍳 Sonuç</h3>
            <div className="flex justify-center items-center min-h-[60px]">
              {completedRecipe && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl"
                >
                  {RECIPES.find(r => r.id === completedRecipe)?.emoji}
                </motion.div>
              )}
              {isActive && !completedRecipe && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-4xl"
                >
                  🔄
                </motion.div>
              )}
            </div>

            {/* Cooking Particles */}
            <AnimatePresence>
              {cookingParticles.map(particle => (
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
                    scale: [0, 1, 0],
                    opacity: [1, 0.8, 0]
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <div className="text-2xl">{particle.emoji}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Cooking Tools */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {COOKING_TOOLS.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className={`
                  w-full h-20 rounded-2xl border-0 relative overflow-hidden
                  ${selectedTool === tool.id ? 'bg-yellow-400/50 scale-105' : 'bg-white/20'}
                  transition-all duration-200
                `}
                onClick={() => handleToolSelect(tool)}
              >
                <div className="text-4xl">{tool.emoji}</div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-3 gap-4">
        {INGREDIENTS.map((ingredient, index) => (
          <motion.div
            key={ingredient.id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className={`
                w-full h-24 rounded-2xl border-0 relative overflow-hidden
                ${ingredient.color} hover:opacity-90
                ${selectedIngredients.includes(ingredient.id) ? 'ring-4 ring-yellow-300 scale-105' : ''}
                transition-all duration-200 flex flex-col gap-1
              `}
              onClick={() => handleIngredientSelect(ingredient)}
            >
              <div className="text-4xl">{ingredient.emoji}</div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
              
              {/* Selection glow */}
              {selectedIngredients.includes(ingredient.id) && (
                <motion.div
                  className="absolute inset-0 bg-yellow-300/30 rounded-2xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {completedRecipe && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-4 rounded-3xl text-2xl font-bold shadow-2xl">
              🎉 {completedRecipe === 'soup' ? 'Çorba Hazır!' : 'Salata Hazır!'} 🎉
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}