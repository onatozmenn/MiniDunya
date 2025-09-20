import React from 'react';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { VolumeX, Volume1, Volume2 } from 'lucide-react';

interface VolumeControlProps {
  volume: number[];
  onVolumeChange: (value: number[]) => void;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const getVolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX className="w-6 h-6" />;
    if (volume[0] < 0.5) return <Volume1 className="w-6 h-6" />;
    return <Volume2 className="w-6 h-6" />;
  };

  return (
    <Card className="p-4 w-full border-0 shadow-lg rounded-3xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-600/30 dark:to-purple-600/30 dark:bg-slate-800/50 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-4xl">🔊</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-2xl">🔇</div>
          <Slider
            value={volume}
            onValueChange={onVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="flex-1"
          />
          <div className="text-2xl">📢</div>
        </div>
      </div>
    </Card>
  );
}