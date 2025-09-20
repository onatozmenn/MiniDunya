import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface NumberMelodyProps {
  volume: number;
  onBack: () => void;
}

interface NumberNote {
  id: number;
  number: number;
  emoji: string;
  color: string;
  frequency: number;
  isActive: boolean;
  x: number;
  y: number;
}

interface MathProblem {
  id: number;
  question: string;
  answer: number;
  options: number[];
  type: 'addition' | 'subtraction' | 'counting' | 'sequence';
  visual: string;
}

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  number: string;
  color: string;
}

const NUMBER_NOTES = [
  { number: 1, emoji: '1️⃣', color: '#FF6B9D', frequency: 261.63 },
  { number: 2, emoji: '2️⃣', color: '#FF8E53', frequency: 293.66 },
  { number: 3, emoji: '3️⃣', color: '#FFD93D', frequency: 329.63 },
  { number: 4, emoji: '4️⃣', color: '#6BCF7F', frequency: 349.23 },
  { number: 5, emoji: '5️⃣', color: '#4D96FF', frequency: 392.00 },
  { number: 6, emoji: '6️⃣', color: '#9B59B6', frequency: 440.00 },
  { number: 7, emoji: '7️⃣', color: '#EC4899', frequency: 493.88 },
  { number: 8, emoji: '8️⃣', color: '#10B981', frequency: 523.25 },
  { number: 9, emoji: '9️⃣', color: '#F59E0B', frequency: 587.33 },
  { number: 0, emoji: '0️⃣', color: '#8B5CF6', frequency: 659.25 },
];

const GAME_MODES = [
  { id: 'freeplay', name: 'Serbest Çal', emoji: '🎹', description: 'Sayılarla müzik yap' },
  { id: 'math', name: 'Matematik', emoji: '🧮', description: 'Sayıları öğren' },
  { id: 'sequence', name: 'Dizi Oyunu', emoji: '🔢', description: 'Sayı dizilerini tamamla' },
  { id: 'melody', name: 'Melodi Yap', emoji: '🎵', description: 'Sayılarla şarkı yarat' },
];

export function NumberMelody({ volume, onBack }: NumberMelodyProps) {
  const [numberNotes, setNumberNotes] = useState<NumberNote[]>([]);
  const [currentMode, setCurrentMode] = useState<string>('freeplay');
  const [mathProblems, setMathProblems] = useState<MathProblem[]>([]);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [score, setScore] = useState(0);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [playedSequence, setPlayedSequence] = useState<number[]>([]);
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);
  const floatingIdCounter = useRef(0);
  const problemIdCounter = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    initializeNumberNotes();
    generateMathProblems();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.8) => {
    if (!audioContext.current) return;

    // Create beautiful mathematical harmony
    const oscillator1 = audioContext.current.createOscillator();
    const oscillator2 = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator1.type = 'triangle';
    
    // Golden ratio harmony
    oscillator2.frequency.setValueAtTime(frequency * 1.618, audioContext.current.currentTime);
    oscillator2.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator2.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    oscillator2.stop(audioContext.current.currentTime + duration);
  };

  const createFloatingNumber = (x: number, y: number, number: string, color: string) => {
    const floatingId = floatingIdCounter.current++;
    const newFloating: FloatingNumber = {
      id: floatingId,
      x,
      y,
      number,
      color
    };

    setFloatingNumbers(prev => [...prev, newFloating]);

    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(f => f.id !== floatingId));
    }, 2000);
  };

  const initializeNumberNotes = () => {
    const notes = NUMBER_NOTES.map((note, index) => ({
      id: index,
      number: note.number,
      emoji: note.emoji,
      color: note.color,
      frequency: note.frequency,
      isActive: false,
      x: (index % 5) * 100 + 50,
      y: Math.floor(index / 5) * 100 + 50
    }));

    setNumberNotes(notes);
  };

  const generateMathProblems = () => {
    const problems: MathProblem[] = [];
    
    // Addition problems
    for (let i = 0; i < 5; i++) {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const answer = a + b;
      const wrongOptions = [answer + 1, answer - 1, answer + 2].filter(x => x > 0 && x <= 10);
      const options = [answer, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
      
      problems.push({
        id: problemIdCounter.current++,
        question: `${a} + ${b} = ?`,
        answer,
        options,
        type: 'addition',
        visual: '🍎'.repeat(a) + ' + ' + '🍊'.repeat(b) + ' = ?'
      });
    }

    // Counting problems
    for (let i = 0; i < 3; i++) {
      const count = Math.floor(Math.random() * 8) + 2;
      const emojis = ['🐱', '🐶', '🦆', '🐸', '🐦'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const wrongOptions = [count + 1, count - 1, count + 2].filter(x => x > 0);
      const options = [count, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
      
      problems.push({
        id: problemIdCounter.current++,
        question: `Kaç tane ${emoji}?`,
        answer: count,
        options,
        type: 'counting',
        visual: emoji.repeat(count)
      });
    }

    setMathProblems(problems);
  };

  const handleNumberPress = (note: NumberNote) => {
    playNote(note.frequency);
    
    setNumberNotes(prev => prev.map(n => 
      n.id === note.id ? { ...n, isActive: true } : { ...n, isActive: false }
    ));

    setTimeout(() => {
      setNumberNotes(prev => prev.map(n => ({ ...n, isActive: false })));
    }, 300);

    createFloatingNumber(note.x + 25, note.y + 25, note.number.toString(), note.color);

    // Handle different modes
    if (currentMode === 'sequence') {
      handleSequencePlay(note.number);
    } else if (currentMode === 'melody') {
      handleMelodyPlay(note.number);
    } else if (currentMode === 'math' && currentProblem) {
      handleMathAnswer(note.number);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleSequencePlay = (number: number) => {
    const newSequence = [...playedSequence, number];
    setPlayedSequence(newSequence);

    if (targetSequence.length === 0) {
      // First number sets the pattern
      const pattern = generateNumberPattern(number);
      setTargetSequence(pattern);
    } else {
      // Check if sequence matches
      if (newSequence.length <= targetSequence.length) {
        const isCorrect = newSequence.every((num, idx) => num === targetSequence[idx]);
        
        if (isCorrect) {
          if (newSequence.length === targetSequence.length) {
            // Sequence completed!
            setScore(prev => prev + targetSequence.length * 50);
            createFloatingNumber(200, 150, '✅', '#22C55E');
            
            setTimeout(() => {
              const newPattern = generateNumberPattern();
              setTargetSequence(newPattern);
              setPlayedSequence([]);
            }, 1500);
          }
        } else {
          // Wrong sequence - restart
          createFloatingNumber(200, 150, '❌', '#EF4444');
          setTimeout(() => {
            setPlayedSequence([]);
          }, 1000);
        }
      }
    }
  };

  const generateNumberPattern = (start?: number) => {
    const patterns = [
      [1, 2, 3, 4, 5], // Counting up
      [5, 4, 3, 2, 1], // Counting down
      [1, 3, 5, 7, 9], // Odd numbers
      [2, 4, 6, 8], // Even numbers
      [1, 1, 2, 3, 5], // Fibonacci start
    ];
    
    if (start) {
      return [start, start + 1, start + 2];
    }
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  const handleMelodyPlay = (number: number) => {
    const newMelody = [...playedSequence, number];
    setPlayedSequence(newMelody);

    if (newMelody.length >= 4) {
      // Play back the melody
      playMelody(newMelody);
    }
  };

  const playMelody = (melody: number[]) => {
    setIsPlayingMelody(true);
    
    melody.forEach((number, index) => {
      setTimeout(() => {
        const note = NUMBER_NOTES.find(n => n.number === number);
        if (note) {
          playNote(note.frequency, 0.6);
          createFloatingNumber(200 + index * 50, 200, number.toString(), note.color);
        }
        
        if (index === melody.length - 1) {
          setTimeout(() => {
            setIsPlayingMelody(false);
            setPlayedSequence([]);
          }, 600);
        }
      }, index * 700);
    });
  };

  const handleMathAnswer = (answer: number) => {
    if (!currentProblem) return;

    if (answer === currentProblem.answer) {
      // Correct!
      setScore(prev => prev + 100);
      createFloatingNumber(200, 200, '🎉', '#22C55E');
      
      // Play success melody
      setTimeout(() => playNote(523.25, 0.3), 0);
      setTimeout(() => playNote(659.25, 0.3), 200);
      setTimeout(() => playNote(783.99, 0.5), 400);
      
      setTimeout(() => {
        const nextProblem = mathProblems[Math.floor(Math.random() * mathProblems.length)];
        setCurrentProblem(nextProblem);
      }, 1500);
    } else {
      // Wrong
      createFloatingNumber(200, 200, '❌', '#EF4444');
      playNote(200, 0.5); // Error sound
    }
  };

  const startMathMode = () => {
    const problem = mathProblems[Math.floor(Math.random() * mathProblems.length)];
    setCurrentProblem(problem);
  };

  const clearSequence = () => {
    setPlayedSequence([]);
    setTargetSequence([]);
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
          <div className="text-6xl">🔢</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
            Sayı Melodisi
          </div>
          <div className="text-sm opacity-80">Puan: {score}</div>
        </div>
        
        <Button
          onClick={clearSequence}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {GAME_MODES.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, type: "spring", bounce: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className={`
                w-full h-20 rounded-3xl border-4 shadow-xl relative overflow-hidden
                ${currentMode === mode.id ? 'border-green-300 ring-4 ring-green-200 bg-green-400' : 'border-white/50 bg-white/80 dark:bg-slate-800/80'}
              `}
              onClick={() => {
                setCurrentMode(mode.id);
                if (mode.id === 'math') startMathMode();
                if (mode.id === 'sequence') clearSequence();
              }}
            >
              <div className="text-center space-y-1">
                <div className="text-3xl">{mode.emoji}</div>
                <div className="text-xs font-bold">
                  {mode.name}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Game Area */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-br from-emerald-200/80 via-green-200/80 to-teal-200/80 dark:from-emerald-800/40 dark:via-green-800/40 dark:to-teal-800/40 min-h-[400px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-green-100/50 to-teal-100/50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 rounded-[2rem]" />
        
        {/* Mathematical background pattern */}
        <div className="absolute inset-0 opacity-10 text-6xl overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {['∑', '∫', '√', 'π', '∞', '∆'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>

        <div className="relative w-full h-[400px]">
          {/* Math Problem Display */}
          {currentMode === 'math' && currentProblem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2"
            >
              <Card className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{currentProblem.question}</div>
                  <div className="text-3xl">{currentProblem.visual}</div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Sequence Display */}
          {currentMode === 'sequence' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2"
            >
              <Card className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl">
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold">
                    {targetSequence.length > 0 ? 'Diziyi Tamamla:' : 'Bir sayıyla başla!'}
                  </div>
                  {targetSequence.length > 0 && (
                    <div className="flex space-x-2 justify-center">
                      {targetSequence.map((num, idx) => (
                        <div
                          key={idx}
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${idx < playedSequence.length ? 'bg-green-400 text-white' : 'bg-gray-300'}
                          `}
                        >
                          {idx < playedSequence.length ? playedSequence[idx] : '?'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Melody Display */}
          {currentMode === 'melody' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2"
            >
              <Card className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl">
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold">Melodin:</div>
                  <div className="flex space-x-2 justify-center">
                    {playedSequence.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-sm font-bold"
                      >
                        {num}
                      </div>
                    ))}
                    {playedSequence.length < 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                        +
                      </div>
                    )}
                  </div>
                  {playedSequence.length >= 4 && (
                    <Button
                      onClick={() => playMelody(playedSequence)}
                      disabled={isPlayingMelody}
                      className="rounded-2xl bg-blue-500 text-white"
                    >
                      🎵 {isPlayingMelody ? 'Çalıyor...' : 'Tekrar Çal'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Number Piano */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="grid grid-cols-5 gap-4">
              {numberNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.6,
                    type: "spring",
                    bounce: 0.8
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                >
                  <Button
                    className={`
                      w-16 h-16 rounded-3xl border-4 shadow-xl relative overflow-hidden
                      ${note.isActive ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)] border-white' : 'border-white/50'}
                    `}
                    style={{ backgroundColor: note.color }}
                    onClick={() => handleNumberPress(note)}
                  >
                    <div className="text-2xl">{note.emoji}</div>
                    
                    {/* Active pulse */}
                    {note.isActive && (
                      <motion.div
                        className="absolute inset-0 bg-white/30 rounded-3xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating Numbers */}
          <AnimatePresence>
            {floatingNumbers.map((floating) => (
              <motion.div
                key={floating.id}
                className="absolute text-4xl font-bold pointer-events-none"
                style={{ 
                  left: floating.x - 20, 
                  top: floating.y - 20,
                  color: floating.color
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 1, 0],
                  opacity: [1, 1, 1, 0],
                  y: -50
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2 }}
              >
                {floating.number}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {currentMode === 'freeplay' && playedSequence.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-8xl">🎹</div>
                <div className="text-xl font-bold">Sayılarla müzik yap</div>
                <div className="text-lg">Her sayının kendine özgü sesi var! 🎵</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-emerald-200/80 to-green-200/80 dark:from-emerald-600/20 dark:to-green-600/20 border-4 border-emerald-300/50">
          <div className="space-y-2">
            <div className="text-3xl">🔢</div>
            <div className="text-lg font-bold">Sayı Melodisi</div>
            <div className="text-sm opacity-80">
              4 farklı oyun modu: Serbest çalma, matematik problemleri, sayı dizileri ve melodi yaratma! 🎵📚
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}