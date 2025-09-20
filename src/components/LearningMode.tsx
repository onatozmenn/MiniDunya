import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Trophy, Star, RefreshCw, Volume2 } from 'lucide-react';

interface LearningQuestion {
  emoji: string;
  correctAnswer: string;
  options: string[];
  frequency: number;
}

interface LearningModeProps {
  volume: number;
  onComplete: (score: number) => void;
}

const LEARNING_QUESTIONS: LearningQuestion[] = [
  {
    emoji: '🐱',
    correctAnswer: 'Kedi',
    options: ['Kedi', 'Köpek', 'Ördek', 'Kurbağa'],
    frequency: 261.63
  },
  {
    emoji: '🐶',
    correctAnswer: 'Köpek', 
    options: ['Kuş', 'Köpek', 'Fare', 'Aslan'],
    frequency: 293.66
  },
  {
    emoji: '🦆',
    correctAnswer: 'Ördek',
    options: ['Tavşan', 'Kedi', 'Ördek', 'Kurbağa'], 
    frequency: 329.63
  },
  {
    emoji: '🐸',
    correctAnswer: 'Kurbağa',
    options: ['Kurbağa', 'Ördek', 'Kuş', 'Fare'],
    frequency: 349.23
  },
  {
    emoji: '🐦',
    correctAnswer: 'Kuş',
    options: ['Aslan', 'Kuş', 'Köpek', 'Tavşan'],
    frequency: 392.00
  },
  {
    emoji: '🐭',
    correctAnswer: 'Fare',
    options: ['Kedi', 'Kurbağa', 'Fare', 'Ördek'],
    frequency: 440.00
  },
  {
    emoji: '🐰',
    correctAnswer: 'Tavşan',
    options: ['Tavşan', 'Köpek', 'Kuş', 'Kedi'],
    frequency: 493.88
  },
  {
    emoji: '🦁',
    correctAnswer: 'Aslan',
    options: ['Fare', 'Ördek', 'Aslan', 'Kurbağa'],
    frequency: 523.25
  }
];

export function LearningMode({ volume, onComplete }: LearningModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questions] = useState(() => 
    [...LEARNING_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
  );

  const currentQ = questions[currentQuestion];

  const playAnimalSound = (frequency: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === currentQ.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
      playAnimalSound(currentQ.frequency);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsComplete(false);
  };

  const handleComplete = () => {
    onComplete(0); // Artık puan göndermeyelim
    resetQuiz();
  };

  if (isComplete) {
    return (
      <Card className="p-6 w-full max-w-md">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
          >
            <div className="text-8xl">🎉</div>
          </motion.div>

          <div>
            <h3>Tebrikler! 🎉</h3>
            <p className="mt-2">
              {questions.length} sorudan <strong>{correctAnswers}</strong> doğru!
            </p>
          </div>

          <div className="space-y-2">
            {correctAnswers >= 4 && (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg dark:bg-yellow-600/30 dark:text-yellow-300">
                🏆 Mükemmel! Hayvan uzmanısın!
              </div>
            )}
            {correctAnswers >= 3 && correctAnswers < 4 && (
              <div className="bg-green-100 text-green-800 p-3 rounded-lg dark:bg-green-600/30 dark:text-green-300">
                ⭐ Harika! Çok iyi gidiyorsun!
              </div>
            )}
            {correctAnswers < 3 && (
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg dark:bg-blue-600/30 dark:text-blue-300">
                💪 İyi deneme! Biraz daha pratik yapalım!
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={resetQuiz} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Çöz
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Tamam! 🎵
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full max-w-md border-0 shadow-lg rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-600/30 dark:to-pink-600/30 dark:bg-slate-800/50 transition-all duration-300">
      <div className="text-center space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
        </div>

        <div className="text-center">
          <div className="text-lg mb-2 dark:text-white">{currentQuestion + 1} / {questions.length}</div>
        </div>

        <div className="w-full bg-white/50 dark:bg-slate-600/50 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <motion.div
              key={currentQuestion}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.6 }}
              className="text-8xl"
            >
              {currentQ.emoji}
            </motion.div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => playAnimalSound(currentQ.frequency)}
              className="h-16 w-16 rounded-full border-0 text-2xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-300"
            >
              🔊
            </Button>
          </div>

          <div className="text-4xl">❓</div>

          <div className="grid grid-cols-2 gap-4">
            {currentQ.options.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={
                    showResult
                      ? option === currentQ.correctAnswer
                        ? "default"
                        : option === selectedAnswer
                        ? "destructive" 
                        : "outline"
                      : "outline"
                  }
                  className="w-full h-16 text-lg rounded-2xl border-0 shadow-md bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-600/90 transition-all duration-300"
                  onClick={() => !showResult && handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  {option}
                </Button>
              </motion.div>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-3xl"
            >
              {selectedAnswer === currentQ.correctAnswer ? (
                <div>🎉</div>
              ) : (
                <div>😊</div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}