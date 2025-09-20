import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, Square } from 'lucide-react';

interface Note {
  frequency: number;
  duration: number;
  delay: number;
}

interface Song {
  name: string;
  notes: Note[];
  tempo: number;
}

const SONGS: Song[] = [
  {
    name: "Twinkle Twinkle Little Star",
    notes: [
      { frequency: 261.63, duration: 0.5, delay: 0 },    // C
      { frequency: 261.63, duration: 0.5, delay: 0.5 },  // C
      { frequency: 392.00, duration: 0.5, delay: 1.0 },  // G
      { frequency: 392.00, duration: 0.5, delay: 1.5 },  // G
      { frequency: 440.00, duration: 0.5, delay: 2.0 },  // A
      { frequency: 440.00, duration: 0.5, delay: 2.5 },  // A
      { frequency: 392.00, duration: 1.0, delay: 3.0 },  // G
      { frequency: 349.23, duration: 0.5, delay: 4.0 },  // F
      { frequency: 349.23, duration: 0.5, delay: 4.5 },  // F
      { frequency: 329.63, duration: 0.5, delay: 5.0 },  // E
      { frequency: 329.63, duration: 0.5, delay: 5.5 },  // E
      { frequency: 293.66, duration: 0.5, delay: 6.0 },  // D
      { frequency: 293.66, duration: 0.5, delay: 6.5 },  // D
      { frequency: 261.63, duration: 1.0, delay: 7.0 },  // C
    ],
    tempo: 1.0
  },
  {
    name: "Happy Birthday",
    notes: [
      { frequency: 261.63, duration: 0.3, delay: 0 },    // C
      { frequency: 261.63, duration: 0.3, delay: 0.4 },  // C
      { frequency: 293.66, duration: 0.6, delay: 0.8 },  // D
      { frequency: 261.63, duration: 0.6, delay: 1.4 },  // C
      { frequency: 349.23, duration: 0.6, delay: 2.0 },  // F
      { frequency: 329.63, duration: 1.2, delay: 2.6 },  // E
      { frequency: 261.63, duration: 0.3, delay: 3.8 },  // C
      { frequency: 261.63, duration: 0.3, delay: 4.2 },  // C
      { frequency: 293.66, duration: 0.6, delay: 4.6 },  // D
      { frequency: 261.63, duration: 0.6, delay: 5.2 },  // C
      { frequency: 392.00, duration: 0.6, delay: 5.8 },  // G
      { frequency: 349.23, duration: 1.2, delay: 6.4 },  // F
    ],
    tempo: 1.0
  },
  {
    name: "Mary Had a Little Lamb",
    notes: [
      { frequency: 329.63, duration: 0.5, delay: 0 },    // E
      { frequency: 293.66, duration: 0.5, delay: 0.5 },  // D
      { frequency: 261.63, duration: 0.5, delay: 1.0 },  // C
      { frequency: 293.66, duration: 0.5, delay: 1.5 },  // D
      { frequency: 329.63, duration: 0.5, delay: 2.0 },  // E
      { frequency: 329.63, duration: 0.5, delay: 2.5 },  // E
      { frequency: 329.63, duration: 1.0, delay: 3.0 },  // E
      { frequency: 293.66, duration: 0.5, delay: 4.0 },  // D
      { frequency: 293.66, duration: 0.5, delay: 4.5 },  // D
      { frequency: 293.66, duration: 1.0, delay: 5.0 },  // D
      { frequency: 329.63, duration: 0.5, delay: 6.0 },  // E
      { frequency: 392.00, duration: 0.5, delay: 6.5 },  // G
      { frequency: 392.00, duration: 1.0, delay: 7.0 },  // G
    ],
    tempo: 1.0
  }
];

interface SongPlayerProps {
  volume: number;
  octave: number;
}

export function SongPlayer({ volume, octave }: SongPlayerProps) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
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

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(frequency * Math.pow(2, octave - 4), audioContext.current.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const playSong = (song: Song) => {
    if (isPlaying) {
      stopSong();
      return;
    }

    setIsPlaying(true);
    setCurrentNoteIndex(0);
    
    song.notes.forEach((note, index) => {
      const timeoutId = setTimeout(() => {
        playNote(note.frequency, note.duration);
        setCurrentNoteIndex(index + 1);
        
        if (index === song.notes.length - 1) {
          setIsPlaying(false);
          setCurrentNoteIndex(0);
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
  };

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <Card className="p-6 w-full max-w-md">
      <h3 className="mb-4">Song Player</h3>
      
      <div className="space-y-3">
        {SONGS.map((song) => (
          <div key={song.name} className="flex items-center justify-between gap-3">
            <span className="flex-1 truncate">{song.name}</span>
            <Button
              variant={selectedSong === song && isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedSong(song);
                playSong(song);
              }}
              className="flex items-center gap-2"
            >
              {selectedSong === song && isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {selectedSong && isPlaying && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="opacity-75">Playing: {selectedSong.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={stopSong}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </div>
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(currentNoteIndex / selectedSong.notes.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}