import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { getSoundManager } from '../utils/SoundManager';

interface MemoryCardsProps {
  volume: number;
  onBack: () => void;
}

const CARD_PAIRS = [
  { id: 1, emoji: '🐱', name: 'kedi' },
  { id: 2, emoji: '🐶', name: 'köpek' },
  { id: 3, emoji: '🐻', name: 'ayı' },
  { id: 4, emoji: '🦁', name: 'aslan' },
  { id: 5, emoji: '🐸', name: 'kurbağa' },
  { id: 6, emoji: '🐰', name: 'tavşan' },
];

interface GameCard {
  id: string;
  pairId: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryCards({ volume, onBack }: MemoryCardsProps) {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const createCards = useCallback(() => {
    const gameCards: GameCard[] = [];
    
    // Use first 4 pairs for easier gameplay
    const selectedPairs = CARD_PAIRS.slice(0, 4);
    
    selectedPairs.forEach((pair) => {
      // Create two cards for each pair
      gameCards.push({
        id: `${pair.id}-a`,
        pairId: pair.id,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `${pair.id}-b`,
        pairId: pair.id,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    return gameCards.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setMoves(0);
    setFlippedCards([]);
    setIsChecking(false);
    setCards(createCards());
  }, [createCards]);

  const handleCardClick = useCallback((cardId: string) => {
    if (!gameStarted || isChecking) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    if (flippedCards.length === 0) {
      // First card
      setFlippedCards([cardId]);
      setCards(prev => prev.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      ));
    } else if (flippedCards.length === 1) {
      // Second card
      setFlippedCards(prev => [...prev, cardId]);
      setCards(prev => prev.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      ));
      setMoves(prev => prev + 1);
      setIsChecking(true);

      // Check for match after a short delay
      setTimeout(() => {
        const firstCard = cards.find(c => c.id === flippedCards[0]);
        const secondCard = cards.find(c => c.id === cardId);

        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found!
          setCards(prev => prev.map(c => 
            c.id === flippedCards[0] || c.id === cardId 
              ? { ...c, isMatched: true } 
              : c
          ));
          setScore(prev => prev + 1);
          
          if (volume > 0) {
            const soundManager = getSoundManager(volume);
            soundManager.playSuccess();
          }
        } else {
          // No match - flip cards back
          setCards(prev => prev.map(c => 
            c.id === flippedCards[0] || c.id === cardId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          
          if (volume > 0) {
            const soundManager = getSoundManager(volume);
            soundManager.playError();
          }
        }

        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  }, [gameStarted, isChecking, cards, flippedCards, volume]);

  // Check if game is won
  const isGameWon = cards.length > 0 && cards.every(card => card.isMatched);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-300 via-purple-200 to-pink-200 relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button
          onClick={onBack}
          className="w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg text-2xl"
        >
          🏠
        </Button>
        
        <Card className="px-6 py-3 bg-white/90 rounded-full shadow-lg flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">🌟 {score}</div>
            <div className="text-xs text-gray-600">Eşleşme</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">👆 {moves}</div>
            <div className="text-xs text-gray-600">Hamle</div>
          </div>
        </Card>

        <Button
          onClick={startGame}
          className="w-16 h-16 rounded-full bg-green-400 hover:bg-green-500 shadow-lg text-2xl"
        >
          🎮
        </Button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        {gameStarted ? (
          <div className="grid grid-cols-4 gap-4 max-w-md">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                onClick={() => handleCardClick(card.id)}
                className={`
                  w-16 h-20 rounded-xl shadow-lg border-2 transition-all duration-300
                  ${card.isMatched 
                    ? 'bg-green-400 border-green-500' 
                    : card.isFlipped 
                      ? 'bg-white border-gray-300' 
                      : 'bg-blue-400 border-blue-500 hover:bg-blue-500'
                  }
                `}
                disabled={card.isMatched || isChecking}
              >
                <div className="text-3xl">
                  {card.isFlipped || card.isMatched ? card.emoji : '❓'}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-white/90 rounded-3xl shadow-xl max-w-md">
            <div className="text-6xl mb-6">🃏</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Hafıza Oyunu!</h2>
            <p className="text-gray-600 mb-6">
              Kartları çevir ve eşleşen çiftleri bul!
            </p>
            <Button
              onClick={startGame}
              className="w-full h-16 bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white text-xl font-bold rounded-2xl"
            >
              Başla! 🎮
            </Button>
          </Card>
        )}
      </div>

      {/* Win Screen */}
      {isGameWon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <Card className="p-8 bg-white rounded-3xl shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600 mb-2">Tebrikler!</div>
            <div className="text-lg text-gray-600 mb-4">
              {moves} hamlede {score} eşleşme buldun!
            </div>
            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-bold rounded-2xl"
              >
                Yeniden Oyna! 🎮
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default MemoryCards;