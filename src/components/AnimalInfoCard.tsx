import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AnimalInfo {
  name: string;
  emoji: string;
  color: string;
  sound: string;
  habitat: string;
  food: string;
  funFact: string;
  frequency: number;
}

interface AnimalInfoCardProps {
  animal: AnimalInfo;
  isOpen: boolean;
  onClose: () => void;
  onPlaySound: (frequency: number) => void;
}

export function AnimalInfoCard({ animal, isOpen, onClose, onPlaySound }: AnimalInfoCardProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full"
      >
        <Card className="p-8 relative border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 transition-all duration-300">
          {/* Close Button - Big and Visual */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="absolute top-4 right-4 p-3 text-2xl rounded-full bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-300"
          >
            ❌
          </Button>

          <div className="text-center space-y-6">
            {/* Big Animal Display */}
            <div className={`w-32 h-32 ${animal.color} rounded-full flex items-center justify-center text-8xl mx-auto shadow-xl border-4 border-white dark:border-slate-600`}>
              {animal.emoji}
            </div>

            {/* Sound Button - Big and Prominent */}
            <Button
              size="lg"
              onClick={() => onPlaySound(animal.frequency)}
              className="w-full h-16 text-2xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0 rounded-2xl shadow-lg"
            >
              <Volume2 className="w-8 h-8 mr-2" />
              🔊
            </Button>

            {/* Visual Information Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-600/30 dark:to-orange-600/30 p-4 rounded-2xl">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">🏠</span>
                </div>
                <p className="text-center dark:text-white">{animal.habitat}</p>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-600/30 dark:to-blue-600/30 p-4 rounded-2xl">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-center dark:text-white">{animal.food}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-600/30 dark:to-pink-600/30 p-4 rounded-2xl">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">💡</span>
                </div>
                <p className="text-center dark:text-white">{animal.funFact}</p>
              </div>
            </div>

            {/* Big Close Button */}
            <Button 
              onClick={onClose}
              size="lg"
              className="w-full h-16 text-2xl bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white border-0 rounded-2xl shadow-lg"
            >
              👍 Tamam!
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}