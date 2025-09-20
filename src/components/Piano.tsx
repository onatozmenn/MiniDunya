import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

interface PianoKey {
  note: string;
  frequency: number;
  isBlack: boolean;
  keyboardKey?: string;
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C4', frequency: 261.63, isBlack: false, keyboardKey: 'a' },
  { note: 'C#4', frequency: 277.18, isBlack: true, keyboardKey: 'w' },
  { note: 'D4', frequency: 293.66, isBlack: false, keyboardKey: 's' },
  { note: 'D#4', frequency: 311.13, isBlack: true, keyboardKey: 'e' },
  { note: 'E4', frequency: 329.63, isBlack: false, keyboardKey: 'd' },
  { note: 'F4', frequency: 349.23, isBlack: false, keyboardKey: 'f' },
  { note: 'F#4', frequency: 369.99, isBlack: true, keyboardKey: 't' },
  { note: 'G4', frequency: 392.00, isBlack: false, keyboardKey: 'g' },
  { note: 'G#4', frequency: 415.30, isBlack: true, keyboardKey: 'y' },
  { note: 'A4', frequency: 440.00, isBlack: false, keyboardKey: 'h' },
  { note: 'A#4', frequency: 466.16, isBlack: true, keyboardKey: 'u' },
  { note: 'B4', frequency: 493.88, isBlack: false, keyboardKey: 'j' },
  { note: 'C5', frequency: 523.25, isBlack: false, keyboardKey: 'k' },
  { note: 'C#5', frequency: 554.37, isBlack: true, keyboardKey: 'o' },
  { note: 'D5', frequency: 587.33, isBlack: false, keyboardKey: 'l' },
  { note: 'D#5', frequency: 622.25, isBlack: true, keyboardKey: 'p' },
  { note: 'E5', frequency: 659.25, isBlack: false, keyboardKey: ';' },
];

export function Piano() {
  const audioContext = useRef<AudioContext | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState([0.5]);
  const [octave, setOctave] = useState([4]);

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

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(frequency * Math.pow(2, octave[0] - 4), audioContext.current.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume[0] * 0.3, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const handleKeyPress = (key: PianoKey) => {
    setActiveKeys(prev => new Set(prev).add(key.note));
    playNote(key.frequency);
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.note);
        return newSet;
      });
    }, 150);
  };

  useEffect(() => {
    const handleKeyboardPress = (event: KeyboardEvent) => {
      const key = PIANO_KEYS.find(k => k.keyboardKey === event.key.toLowerCase());
      if (key && !activeKeys.has(key.note)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyboardPress);
    return () => window.removeEventListener('keydown', handleKeyboardPress);
  }, [activeKeys]);

  const whiteKeys = PIANO_KEYS.filter(key => !key.isBlack);
  const blackKeys = PIANO_KEYS.filter(key => key.isBlack);

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Controls */}
      <Card className="p-6 w-full max-w-md">
        <div className="space-y-6">
          <div>
            <label className="block mb-2">Volume</label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Octave</label>
            <Slider
              value={octave}
              onValueChange={setOctave}
              max={6}
              min={2}
              step={1}
              className="w-full"
            />
            <span className="block mt-1 opacity-60">Octave {octave[0]}</span>
          </div>
        </div>
      </Card>

      {/* Piano */}
      <div className="relative">
        {/* White Keys */}
        <div className="flex">
          {whiteKeys.map((key) => (
            <Button
              key={key.note}
              variant="outline"
              className={`
                w-12 h-32 rounded-b-lg border-2 border-border
                bg-card hover:bg-muted transition-all duration-75
                ${activeKeys.has(key.note) ? 'bg-muted scale-95' : ''}
                relative flex flex-col justify-end items-center pb-2
                shadow-lg
              `}
              onMouseDown={() => handleKeyPress(key)}
              onTouchStart={() => handleKeyPress(key)}
            >
              <div className="absolute bottom-1 opacity-60 text-xs">
                {key.keyboardKey?.toUpperCase()}
              </div>
            </Button>
          ))}
        </div>

        {/* Black Keys */}
        <div className="absolute top-0 flex">
          {blackKeys.map((key, index) => {
            // Calculate position for black keys
            const positions = [0.75, 1.75, 3.75, 4.75, 5.75, 7.75, 8.75, 10.75, 11.75, 12.75, 14.75, 15.75];
            const position = positions[index];
            
            return (
              <Button
                key={key.note}
                variant="outline"
                className={`
                  absolute w-8 h-20 rounded-b-lg
                  bg-foreground hover:bg-foreground/80 border-foreground
                  text-background transition-all duration-75
                  ${activeKeys.has(key.note) ? 'bg-foreground/60 scale-95' : ''}
                  flex flex-col justify-end items-center pb-1
                  shadow-xl z-10
                `}
                style={{ left: `${position * 3}rem` }}
                onMouseDown={() => handleKeyPress(key)}
                onTouchStart={() => handleKeyPress(key)}
              >
                <div className="absolute bottom-0.5 opacity-60 text-xs">
                  {key.keyboardKey?.toUpperCase()}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center max-w-lg">
        <p className="opacity-75">
          Click the keys or use your keyboard to play. Use the sliders to adjust volume and octave.
        </p>
        <p className="opacity-60 mt-2">
          Keyboard: A-L and W, E, T, Y, U, O, P for different notes
        </p>
      </div>
    </div>
  );
}