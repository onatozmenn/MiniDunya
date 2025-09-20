import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, ChevronLeft, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { KidsPiano } from './KidsPiano';

interface TutorialNote {
  note: string;
  frequency: number;
  emoji: string;
  color: string;
  duration: number;
  delay: number;
}

interface TutorialSong {
  id: string;
  name: string;
  emoji: string;
  notes: TutorialNote[];
  description: string;
}

const TUTORIAL_SONGS: TutorialSong[] = [
  {
    id: 'twinkle',
    name: '⭐',
    emoji: '⭐',
    description: '✨🌟✨',
    notes: [
      // Simplified Twinkle Twinkle - first 8 notes only for easier learning
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 0 },
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 0.6 },
      { note: 'G4', frequency: 392.00, emoji: '🐦', color: 'bg-blue-400', duration: 0.5, delay: 1.2 },
      { note: 'G4', frequency: 392.00, emoji: '🐦', color: 'bg-blue-400', duration: 0.5, delay: 1.8 },
      { note: 'A4', frequency: 440.00, emoji: '🐭', color: 'bg-purple-400', duration: 0.5, delay: 2.4 },
      { note: 'A4', frequency: 440.00, emoji: '🐭', color: 'bg-purple-400', duration: 0.5, delay: 3.0 },
      { note: 'G4', frequency: 392.00, emoji: '🐦', color: 'bg-blue-400', duration: 1.0, delay: 3.6 },
    ]
  },
  {
    id: 'happy_farm',
    name: '🐄',
    emoji: '🐄',
    description: '🚜🐮🐷',
    notes: [
      // Simple 5-note farm melody
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 0 },
      { note: 'D4', frequency: 293.66, emoji: '🐶', color: 'bg-orange-400', duration: 0.5, delay: 0.6 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.5, delay: 1.2 },
      { note: 'F4', frequency: 349.23, emoji: '🐸', color: 'bg-green-400', duration: 0.5, delay: 1.8 },
      { note: 'G4', frequency: 392.00, emoji: '🐦', color: 'bg-blue-400', duration: 1.0, delay: 2.4 },
    ]
  },
  {
    id: 'mary_lamb',
    name: '🐑',
    emoji: '🐑',
    description: '🐑💕🌈',
    notes: [
      // Mary Had a Little Lamb - simplified
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.5, delay: 0 },
      { note: 'D4', frequency: 293.66, emoji: '🐶', color: 'bg-orange-400', duration: 0.5, delay: 0.6 },
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 1.2 },
      { note: 'D4', frequency: 293.66, emoji: '🐶', color: 'bg-orange-400', duration: 0.5, delay: 1.8 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.5, delay: 2.4 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.5, delay: 3.0 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 1.0, delay: 3.6 },
    ]
  },
  {
    id: 'birthday',
    name: '🎂',
    emoji: '🎂',
    description: '🎂🎈🎊',
    notes: [
      // Happy Birthday - first line only
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.3, delay: 0 },
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.3, delay: 0.4 },
      { note: 'D4', frequency: 293.66, emoji: '🐶', color: 'bg-orange-400', duration: 0.6, delay: 0.8 },
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.6, delay: 1.5 },
      { note: 'F4', frequency: 349.23, emoji: '🐸', color: 'bg-green-400', duration: 0.6, delay: 2.2 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 1.2, delay: 2.9 },
    ]
  },
  {
    id: 'jingle_bells',
    name: '🔔',
    emoji: '🔔',
    description: '🎄❄️🛷',
    notes: [
      // Jingle Bells - simplified first line
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.4, delay: 0 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.4, delay: 0.5 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.8, delay: 1.0 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.4, delay: 1.9 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.4, delay: 2.4 },
      { note: 'E4', frequency: 329.63, emoji: '🦆', color: 'bg-yellow-400', duration: 0.8, delay: 2.9 },
    ]
  },
  {
    id: 'old_macdonald',
    name: '👨‍🌾',
    emoji: '👨‍🌾',
    description: '🚜🐄🐷',
    notes: [
      // Old MacDonald - simplified first line
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 0 },
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 0.6 },
      { note: 'C4', frequency: 261.63, emoji: '🐱', color: 'bg-red-400', duration: 0.5, delay: 1.2 },
      { note: 'G4', frequency: 392.00, emoji: '🐦', color: 'bg-blue-400', duration: 1.0, delay: 1.8 },
      { note: 'A4', frequency: 440.00, emoji: '🐭', color: 'bg-purple-400', duration: 0.5, delay: 3.0 },
      { note: 'A4', frequency: 440.00, emoji: '🐭', color: 'bg-purple-400', duration: 0.5, delay: 3.6 },
      { note: 'G4', frequency: 392.00, emoji: '🐦', color: 'bg-blue-400', duration: 1.0, delay: 4.2 },
    ]
  }
];

interface SongTutorialProps {
  volume: number;
  onComplete: (songId: string) => void;
}

export function SongTutorial({ volume, onComplete }: SongTutorialProps) {
  const [selectedSong, setSelectedSong] = useState<TutorialSong | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [hasPlayedPreview, setHasPlayedPreview] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.5) => {
    if (!audioContext.current) return;

    const oscillator1 = audioContext.current.createOscillator();
    const oscillator2 = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator1.type = 'triangle';
    
    oscillator2.frequency.setValueAtTime(frequency * 2, audioContext.current.currentTime);
    oscillator2.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator2.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    oscillator2.stop(audioContext.current.currentTime + duration);
  };

  // Play preview of current note
  const playPreview = () => {
    if (!selectedSong) return;
    
    const currentNote = selectedSong.notes[currentStep];
    setIsPlayingPreview(true);
    playNote(currentNote.frequency, 1.0);
    setHasPlayedPreview(true);
    
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, 1200);
  };

  // Auto-play preview when starting a new note
  useEffect(() => {
    if (selectedSong && isWaitingForInput && !hasPlayedPreview) {
      setTimeout(() => {
        playPreview();
      }, 500);
    }
  }, [currentStep, isWaitingForInput, selectedSong]);

  // Handle note played from piano
  const handleNoteFromPiano = (playedNote: string) => {
    if (!selectedSong || !isWaitingForInput) return;

    const expectedNote = selectedSong.notes[currentStep];

    if (playedNote === expectedNote.note) {
      // Correct note played
      setShowCorrectFeedback(true);
      setIsWaitingForInput(false);
      
      setTimeout(() => {
        setShowCorrectFeedback(false);
        
        if (currentStep + 1 < selectedSong.notes.length) {
          // Move to next step
          setCurrentStep(prev => prev + 1);
          setHasPlayedPreview(false);
          setIsWaitingForInput(true);
        } else {
          // Song completed!
          onComplete(selectedSong.id);
          
          // Show completion celebration
          setTimeout(() => {
            setSelectedSong(null);
            setCurrentStep(0);
          }, 3000);
        }
      }, 1500);
    } else {
      // Incorrect note played
      setShowIncorrectFeedback(true);
      
      setTimeout(() => {
        setShowIncorrectFeedback(false);
      }, 1500);
    }
  };

  // Get the piano key to highlight
  const getHighlightedKey = () => {
    if (!selectedSong || !isWaitingForInput) return null;
    return selectedSong.notes[currentStep].note;
  };

  const startSong = (song: TutorialSong) => {
    setSelectedSong(song);
    setCurrentStep(0);
    setHasPlayedPreview(false);
    setIsWaitingForInput(true);
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setHasPlayedPreview(false);
    setIsWaitingForInput(true);
    setShowCorrectFeedback(false);
    setShowIncorrectFeedback(false);
  };

  if (!selectedSong) {
    return (
      <div className="space-y-6">


        {/* Song Selection Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {TUTORIAL_SONGS.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                bounce: 0.6 
              }}
            >
              <Card 
                className="p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-0 shadow-lg rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-600/30 dark:to-purple-600/30 dark:bg-slate-800/50 hover:shadow-xl"
                onClick={() => startSong(song)}
              >
                <div className="text-center space-y-3">
                  <div className="text-5xl">{song.emoji}</div>
                  <div className="text-2xl">{song.name}</div>
                  <div className="text-lg">{song.description}</div>
                  <Button 
                    className="w-full rounded-2xl text-lg h-12 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white shadow-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Öğren!
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Tutorial Mode
  const progress = ((currentStep + 1) / selectedSong.notes.length) * 100;
  const currentNote = selectedSong.notes[currentStep];

  if (currentStep >= selectedSong.notes.length) {
    // Completion screen
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="text-center space-y-6"
      >
        <Card className="p-8 border-0 shadow-xl rounded-3xl bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 dark:from-green-600/40 dark:via-emerald-600/40 dark:to-teal-600/40 dark:bg-slate-800/50">
          <div className="space-y-4">
            <div className="text-8xl">🎉</div>
            <div className="text-3xl">Tebrikler!</div>
            <div className="text-xl">🎵 {selectedSong.name} şarkısını öğrendin! 🎵</div>
            <div className="text-6xl">{selectedSong.emoji}</div>
            
            <div className="flex gap-4 justify-center mt-6">
              <Button 
                onClick={resetTutorial}
                className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Çal
              </Button>
              <Button 
                onClick={() => setSelectedSong(null)}
                className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-pink-400 to-red-500 hover:from-pink-500 hover:to-red-600 text-white"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Geri Dön
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="p-6 border-0 shadow-lg rounded-3xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-600/30 dark:to-indigo-600/30 dark:bg-slate-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedSong(null)}
                className="rounded-2xl border-0 bg-white/50 dark:bg-slate-700/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <div className="text-4xl">{selectedSong.emoji}</div>
                <div className="text-lg">{selectedSong.name}</div>
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Adım {currentStep + 1}</span>
                <span>{selectedSong.notes.length} / {selectedSong.notes.length}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Current Note Display */}
      <motion.div
        key={currentStep}
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
      >
        <Card className="p-8 border-0 shadow-lg rounded-3xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-600/30 dark:to-orange-600/30 dark:bg-slate-800/50">
          <div className="text-center space-y-6">
            <div className="text-xl">Şimdi bu hayvana bas:</div>
            
            <motion.div
              animate={{ 
                scale: isWaitingForInput ? [1, 1.1, 1] : 1,
                rotate: isWaitingForInput ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: 2,
                repeat: isWaitingForInput ? Infinity : 0
              }}
              className="text-8xl"
            >
              {currentNote.emoji}
            </motion.div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={playPreview}
                disabled={isPlayingPreview}
                className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                🔊 Dinle
              </Button>
            </div>

            {/* Feedback */}
            {showCorrectFeedback && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl"
              >
                🎉
              </motion.div>
            )}
            
            {showIncorrectFeedback && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl"
              >
                🤔
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Piano */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <KidsPiano
          volume={volume}
          onNoteChange={handleNoteFromPiano}
          highlightedKey={getHighlightedKey()}
          onNotePlay={() => {}}
        />
      </motion.div>
    </div>
  );
}