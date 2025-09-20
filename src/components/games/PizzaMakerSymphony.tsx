import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface PizzaMakerSymphonyProps {
  volume: number;
}

const PIZZA_BASES = [
  { id: 'thin', emoji: '⚪', sound: 261.63, color: 'bg-amber-200' },
  { id: 'thick', emoji: '🟤', sound: 293.66, color: 'bg-amber-400' },
  { id: 'stuffed', emoji: '🟫', sound: 329.63, color: 'bg-amber-600' },
];

const SAUCES = [
  { id: 'tomato', emoji: '🍅', sound: 349.23, color: 'bg-red-500' },
  { id: 'pesto', emoji: '🟢', sound: 392.00, color: 'bg-green-500' },
  { id: 'white', emoji: '⚪', sound: 440.00, color: 'bg-gray-100' },
];

const TOPPINGS = [
  { id: 'cheese', emoji: '🧀', sound: 493.88, color: 'bg-yellow-300' },
  { id: 'pepperoni', emoji: '🍖', sound: 523.25, color: 'bg-red-600' },
  { id: 'mushroom', emoji: '🍄', sound: 587.33, color: 'bg-amber-700' },
  { id: 'pepper', emoji: '🫑', sound: 659.25, color: 'bg-green-400' },
  { id: 'olive', emoji: '🫒', sound: 698.46, color: 'bg-green-800' },
  { id: 'onion', emoji: '🧅', sound: 783.99, color: 'bg-purple-300' },
  { id: 'tomato_slice', emoji: '🍅', sound: 880.00, color: 'bg-red-400' },
  { id: 'basil', emoji: '🌿', sound: 987.77, color: 'bg-green-600' },
];

const PIZZA_RECIPES = [
  {
    id: 'margherita',
    name: 'Margherita',
    emoji: '🍕',
    base: 'thin',
    sauce: 'tomato',
    toppings: ['cheese', 'basil'],
    points: 10
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    emoji: '🍕',
    base: 'thick',
    sauce: 'tomato',
    toppings: ['cheese', 'pepperoni'],
    points: 15
  },
  {
    id: 'veggie',
    name: 'Veggie Supreme',
    emoji: '🍕',
    base: 'thin',
    sauce: 'pesto',
    toppings: ['cheese', 'mushroom', 'pepper', 'olive'],
    points: 20
  }
];

export function PizzaMakerSymphony({ volume }: PizzaMakerSymphonyProps) {
  const [currentPizza, setCurrentPizza] = useState<{
    base: string | null;
    sauce: string | null;
    toppings: string[];
  }>({ base: null, sauce: null, toppings: [] });
  
  const [completedPizzas, setCompletedPizzas] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isOvenActive, setIsOvenActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<'base' | 'sauce' | 'toppings' | 'bake'>('base');
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

  // Play cooking sounds
  const playCookingSound = useCallback((soundType: string) => {
    switch (soundType) {
      case 'stretch':
        playSound(200, 'sine', 0.5);
        break;
      case 'spread':
        playSound(300, 'sawtooth', 0.4);
        break;
      case 'sprinkle':
        playSound(800, 'sine', 0.2);
        break;
      case 'oven':
        playSound(150, 'sawtooth', 2.0);
        break;
    }
  }, [playSound]);

  // Select base
  const selectBase = useCallback((base: any) => {
    setCurrentPizza(prev => ({ ...prev, base: base.id }));
    setCurrentStep('sauce');
    playSound(base.sound);
    playCookingSound('stretch');
  }, [playSound, playCookingSound]);

  // Select sauce
  const selectSauce = useCallback((sauce: any) => {
    setCurrentPizza(prev => ({ ...prev, sauce: sauce.id }));
    setCurrentStep('toppings');
    playSound(sauce.sound);
    playCookingSound('spread');
  }, [playSound, playCookingSound]);

  // Add topping
  const addTopping = useCallback((topping: any) => {
    if (currentPizza.toppings.includes(topping.id)) {
      // Remove topping
      setCurrentPizza(prev => ({
        ...prev, 
        toppings: prev.toppings.filter(t => t !== topping.id)
      }));
    } else {
      // Add topping
      setCurrentPizza(prev => ({
        ...prev, 
        toppings: [...prev.toppings, topping.id]
      }));
      playSound(topping.sound);
      playCookingSound('sprinkle');
    }
  }, [currentPizza.toppings, playSound, playCookingSound]);

  // Bake pizza
  const bakePizza = useCallback(() => {
    if (!currentPizza.base || !currentPizza.sauce) return;
    
    setIsOvenActive(true);
    setCurrentStep('bake');
    playCookingSound('oven');
    
    // Create baking particles
    const bakingParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200,
      y: Math.random() * 100,
      emoji: ['🔥', '💨', '✨', '⭐'][Math.floor(Math.random() * 4)]
    }));
    
    setParticles(bakingParticles);
    
    // Check if pizza matches a recipe
    setTimeout(() => {
      const matchingRecipe = PIZZA_RECIPES.find(recipe => 
        recipe.base === currentPizza.base &&
        recipe.sauce === currentPizza.sauce &&
        recipe.toppings.length === currentPizza.toppings.length &&
        recipe.toppings.every(topping => currentPizza.toppings.includes(topping))
      );
      
      if (matchingRecipe && !completedPizzas.includes(matchingRecipe.id)) {
        // Perfect recipe match!
        setCompletedPizzas(prev => [...prev, matchingRecipe.id]);
        setScore(prev => prev + matchingRecipe.points);
        playSound(1000, 'sine', 1.5);
        
        // Success particles
        const successParticles = Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + 1000 + i,
          x: Math.random() * 300,
          y: Math.random() * 200,
          emoji: ['🎉', '⭐', '🏆', '🍕'][Math.floor(Math.random() * 4)]
        }));
        
        setParticles(prev => [...prev, ...successParticles]);
      } else {
        // Custom pizza
        setScore(prev => prev + Math.max(5, currentPizza.toppings.length * 2));
        playSound(800, 'sine', 1.0);
      }
      
      setIsOvenActive(false);
      
      // Reset after showing result
      setTimeout(() => {
        setCurrentPizza({ base: null, sauce: null, toppings: [] });
        setCurrentStep('base');
        setParticles([]);
      }, 3000);
      
    }, 3000);
  }, [currentPizza, completedPizzas, playSound, playCookingSound]);

  // Reset pizza
  const resetPizza = useCallback(() => {
    setCurrentPizza({ base: null, sauce: null, toppings: [] });
    setCurrentStep('base');
    playSound(200, 'square', 0.5);
  }, [playSound]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 hardware-accelerated">
      {/* Title & Score */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h2 className="text-4xl mb-2">🍕 Pizza Yapım Müziği</h2>
        <div className="flex justify-center items-center gap-4">
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-2xl font-bold">
            ⭐ {score} Puan
          </div>
          <div className="bg-green-400 text-black px-4 py-2 rounded-2xl font-bold">
            🍕 {completedPizzas.length}/3 Tarif
          </div>
          <Button
            onClick={resetPizza}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-2xl"
          >
            🔄 Yeniden
          </Button>
        </div>
      </motion.div>

      {/* Pizza Making Area */}
      <div className="relative mb-6 p-6 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-3xl border-4 border-white/20">
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 relative overflow-hidden min-h-[250px] flex items-center justify-center">
          {/* Pizza Visualization */}
          <div className="relative">
            {/* Base */}
            {currentPizza.base && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`w-32 h-32 rounded-full ${PIZZA_BASES.find(b => b.id === currentPizza.base)?.color} border-4 border-amber-400`} />
              </motion.div>
            )}
            
            {/* Sauce */}
            {currentPizza.sauce && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`w-28 h-28 rounded-full ${SAUCES.find(s => s.id === currentPizza.sauce)?.color} opacity-80`} />
              </motion.div>
            )}
            
            {/* Toppings */}
            {currentPizza.toppings.map((toppingId, index) => {
              const topping = TOPPINGS.find(t => t.id === toppingId);
              return topping ? (
                <motion.div
                  key={toppingId + index}
                  initial={{ scale: 0, rotate: Math.random() * 360 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="absolute"
                  style={{
                    left: `${40 + Math.random() * 20}%`,
                    top: `${40 + Math.random() * 20}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="text-2xl">{topping.emoji}</div>
                </motion.div>
              ) : null;
            })}
            
            {/* Placeholder */}
            {!currentPizza.base && (
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-400 opacity-50 flex items-center justify-center">
                <div className="text-4xl opacity-50">🍕</div>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="absolute top-4 left-4 bg-white/20 rounded-2xl p-3">
            <div className="text-sm font-bold mb-2">Adım: {currentStep}</div>
            <div className="flex gap-1">
              {['base', 'sauce', 'toppings', 'bake'].map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    ['base', 'sauce', 'toppings', 'bake'].indexOf(currentStep) >= index
                      ? 'bg-green-400' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Oven Animation */}
          {isOvenActive && (
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-orange-400/30 rounded-3xl flex items-center justify-center"
            >
              <div className="text-6xl">🔥</div>
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
                  y: particle.y - 100,
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0],
                  rotate: [0, 360]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2 }}
              >
                <div className="text-3xl">{particle.emoji}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bake Button */}
        {currentStep === 'toppings' && currentPizza.base && currentPizza.sauce && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <Button
              onClick={bakePizza}
              disabled={isOvenActive}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl text-xl"
            >
              🔥 Fırınla!
            </Button>
          </motion.div>
        )}
      </div>

      {/* Recipe Guide */}
      <div className="mb-6 p-4 bg-white/10 rounded-2xl">
        <h3 className="text-lg mb-3 text-center">📋 Tarifler</h3>
        <div className="grid grid-cols-3 gap-3">
          {PIZZA_RECIPES.map((recipe) => (
            <div
              key={recipe.id}
              className={`p-3 rounded-xl text-center text-sm ${
                completedPizzas.includes(recipe.id) 
                  ? 'bg-green-400/50 text-green-900' 
                  : 'bg-white/20'
              }`}
            >
              <div className="text-2xl mb-1">{recipe.emoji}</div>
              <div className="font-bold">{recipe.name}</div>
              <div className="text-xs">⭐ {recipe.points} puan</div>
              {completedPizzas.includes(recipe.id) && (
                <div className="text-lg">✅</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pizza Bases */}
      {currentStep === 'base' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="text-xl mb-4 text-center">🍞 Pizza Tabanı Seç</h3>
          <div className="grid grid-cols-3 gap-4">
            {PIZZA_BASES.map((base, index) => (
              <motion.div
                key={base.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`w-full h-24 rounded-2xl border-0 ${base.color} hover:opacity-90 transition-all duration-200`}
                  onClick={() => selectBase(base)}
                >
                  <div className="text-4xl">{base.emoji}</div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sauces */}
      {currentStep === 'sauce' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="text-xl mb-4 text-center">🥫 Sos Seç</h3>
          <div className="grid grid-cols-3 gap-4">
            {SAUCES.map((sauce, index) => (
              <motion.div
                key={sauce.id}
                initial={{ scale: 0, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`w-full h-24 rounded-2xl border-0 ${sauce.color} hover:opacity-90 transition-all duration-200`}
                  onClick={() => selectSauce(sauce)}
                >
                  <div className="text-4xl">{sauce.emoji}</div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Toppings */}
      {currentStep === 'toppings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl mb-4 text-center">🧀 Malzemeler Ekle</h3>
          <div className="grid grid-cols-4 gap-3">
            {TOPPINGS.map((topping, index) => (
              <motion.div
                key={topping.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`
                    w-full h-20 rounded-2xl border-0 relative
                    ${topping.color} hover:opacity-90
                    ${currentPizza.toppings.includes(topping.id) ? 'ring-4 ring-yellow-300 scale-105' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => addTopping(topping)}
                >
                  <div className="text-3xl">{topping.emoji}</div>
                  {currentPizza.toppings.includes(topping.id) && (
                    <div className="absolute -top-1 -right-1 text-lg">✅</div>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {completedPizzas.length === PIZZA_RECIPES.length && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-3xl text-2xl font-bold shadow-2xl">
              🎉 Tüm Tarifler Tamamlandı! Master Chef! 🍕👨‍🍳
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}