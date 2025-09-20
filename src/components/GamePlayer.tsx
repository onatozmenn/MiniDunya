import React from 'react';
import { BubblePopMagic } from './games/BubblePopMagic';
import { AlphabetPainting } from './games/AlphabetPainting';
import { ColorMixer } from './games/ColorMixer';

interface GamePlayerProps {
  volume: number;
  gameId: string;
  onGoBack: () => void;
}

export function GamePlayer({ volume, gameId, onGoBack }: GamePlayerProps) {
  const renderGame = () => {
    switch (gameId) {
      case 'bubbles':
        return <BubblePopMagic volume={volume} onGoBack={onGoBack} />;
      case 'feeding':
        return <AlphabetPainting volume={volume} onGoBack={onGoBack} />;
      case 'colors':
        return <ColorMixer volume={volume} onGoBack={onGoBack} />;
      default:
        return <BubblePopMagic volume={volume} onGoBack={onGoBack} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderGame()}
    </div>
  );
}