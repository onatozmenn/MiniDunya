import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, Square, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface Note {
  frequency: number;
  duration: number;
  delay: number;
  emoji?: string;
}

interface KidsSong {
  name: string;
  emoji: string;
  notes: Note[];
  tempo: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const KIDS_SONGS: KidsSong[] = [
  {
    name: "Minik Kuş",
    emoji: "🐦",
    difficulty: "Easy",
    notes: [
      { frequency: 261.63, duration: 0.5, delay: 0, emoji: '🐱' },
      { frequency: 293.66, duration: 0.5, delay: 0.5, emoji: '🐶' },
      { frequency: 329.63, duration: 0.5, delay: 1.0, emoji: '🦆' },
      { frequency: 293.66, duration: 0.5, delay: 1.5, emoji: '🐶' },
      { frequency: 261.63, duration: 1.0, delay: 2.0, emoji: '🐱' },
    ],
    tempo: 1.0
  },
  {
    name: "Neşeli Dostlar",
    emoji: "🌈",
    difficulty: "Easy",
    notes: [
      { frequency: 261.63, duration: 0.4, delay: 0, emoji: '🐱' },
      { frequency: 261.63, duration: 0.4, delay: 0.4, emoji: '🐱' },
      { frequency: 349.23, duration: 0.4, delay: 0.8, emoji: '🐸' },
      { frequency: 349.23, duration: 0.4, delay: 1.2, emoji: '🐸' },
      { frequency: 392.00, duration: 0.4, delay: 1.6, emoji: '🐦' },
      { frequency: 392.00, duration: 0.4, delay: 2.0, emoji: '🐦' },
      { frequency: 349.23, duration: 0.8, delay: 2.4, emoji: '🐸' },
    ],
    tempo: 1.0
  },
  {
    name: "Mutlu Çiftlik",
    emoji: "🚜",
    difficulty: "Medium",
    notes: [
      { frequency: 329.63, duration: 0.5, delay: 0, emoji: '🦆' },
      { frequency: 293.66, duration: 0.5, delay: 0.5, emoji: '🐶' },
      { frequency: 261.63, duration: 0.5, delay: 1.0, emoji: '🐱' },
      { frequency: 293.66, duration: 0.5, delay: 1.5, emoji: '🐶' },
      { frequency: 329.63, duration: 0.5, delay: 2.0, emoji: '🦆' },
      { frequency: 329.63, duration: 0.5, delay: 2.5, emoji: '🦆' },
      { frequency: 329.63, duration: 1.0, delay: 3.0, emoji: '🦆' },
      { frequency: 293.66, duration: 0.5, delay: 4.0, emoji: '🐶' },
      { frequency: 293.66, duration: 0.5, delay: 4.5, emoji: '🐶' },
      { frequency: 293.66, duration: 1.0, delay: 5.0, emoji: '🐶' },
    ],
    tempo: 1.0
  },
  {
    name: "Doğum Günü",
    emoji: "🎂",
    difficulty: "Medium",
    notes: [
      { frequency: 261.63, duration: 0.3, delay: 0, emoji: '🐱' },
      { frequency: 261.63, duration: 0.3, delay: 0.4, emoji: '🐱' },
      { frequency: 293.66, duration: 0.6, delay: 0.8, emoji: '🐶' },
      { frequency: 261.63, duration: 0.6, delay: 1.4, emoji: '🐱' },
      { frequency: 349.23, duration: 0.6, delay: 2.0, emoji: '🐸' },
      { frequency: 329.63, duration: 1.2, delay: 2.6, emoji: '🦆' },
    ],
    tempo: 1.0
  }
];

interface KidsSongPlayerProps {
  volume: number;
}

export function KidsSongPlayer({ volume }: KidsSongPlayerProps) {
  const [selectedSong, setSelectedSong] = useState<KidsSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [currentEmoji, setCurrentEmoji] = useState<string>('');
  const [completedSongs, setCompletedSongs] = useState<Set<string>>(new Set());
  const audioContext = useRef<AudioContext | null>(null);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number) => {
    if (!audioContext.current) return;

    // Create kid-friendly sound with multiple oscillators
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

  const playSong = (song: KidsSong) => {
    if (isPlaying) {
      stopSong();
      return;
    }

    setIsPlaying(true);
    setCurrentNoteIndex(0);
    setSelectedSong(song);
    
    song.notes.forEach((note, index) => {
      const timeoutId = setTimeout(() => {
        playNote(note.frequency, note.duration);
        setCurrentNoteIndex(index + 1);
        setCurrentEmoji(note.emoji || '🎵');
        
        if (index === song.notes.length - 1) {
          setIsPlaying(false);
          setCurrentNoteIndex(0);
          setCurrentEmoji('');
          setCompletedSongs(prev => new Set(prev).add(song.name));
        }
      }, note.delay * 1000 / song.tempo);
      
      timeoutIds.current.push(timeoutId);
    });
  };

  const stopSong = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    setCurrentEmoji('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <Card className="p-6 w-full max-w-md">
      <div className="text-center mb-4">
        <h3 className="flex items-center justify-center gap-2">
          <span className="text-2xl">🎵</span>
          Şarkı Oynat
          <span className="text-2xl">🎵</span>
        </h3>
        {completedSongs.size > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm opacity-75">{completedSongs.size} şarkı tamamladın!</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {KIDS_SONGS.map((song) => (
          <div key={song.name} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">{song.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{song.name}</span>
                    {completedSongs.has(song.name) && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${getDifficultyColor(song.difficulty)}`}>
                    {song.difficulty}
                  </div>
                </div>
              </div>
              <Button
                variant={selectedSong === song && isPlaying ? "default" : "outline"}
                size="sm"
                onClick={() => playSong(song)}
                className="flex items-center gap-2"
              >
                {selectedSong === song && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Durdur
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Çal
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedSong && isPlaying && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="opacity-75">Çalıyor:</span>
              <span className="font-semibold">{selectedSong.name}</span>
              <span className="text-xl">{selectedSong.emoji}</span>
            </div>
            
            {currentEmoji && (
              <motion.div
                key={currentNoteIndex}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.5 }}
                className="text-4xl"
              >
                {currentEmoji}
              </motion.div>
            )}
            
            <div className="w-full bg-muted rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(currentNoteIndex / selectedSong.notes.length) * 100}%` 
                }}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={stopSong}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Durdur
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}