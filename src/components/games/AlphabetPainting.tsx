import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSoundManager } from '../utils/SoundManager';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { turkishSpeech } from '../utils/TurkishSpeechManager';

interface AlphabetPaintingProps {
  volume: number;
  onGoBack: () => void;
}

interface LetterTemplate {
  id: string;
  letter: string;
  name: string;
  sound: string;
  image?: string;
  baseColor: string;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
}

// Color palette for kids - bright and fun colors
const COLORS = [
  { id: 'red', color: '#FF6B6B', name: 'Kırmızı', emoji: '🔴' },
  { id: 'blue', color: '#4ECDC4', name: 'Mavi', emoji: '🔵' },
  { id: 'yellow', color: '#FFE66D', name: 'Sarı', emoji: '🟡' },
  { id: 'green', color: '#95E1D3', name: 'Yeşil', emoji: '🟢' },
  { id: 'purple', color: '#B06AB3', name: 'Mor', emoji: '🟣' },
  { id: 'orange', color: '#FF8B94', name: 'Turuncu', emoji: '🟠' },
  { id: 'pink', color: '#FFB6C1', name: 'Pembe', emoji: '🩷' },
  { id: 'brown', color: '#D2B48C', name: 'Kahverengi', emoji: '🤎' }
];

// Turkish Alphabet with colorful background images for painting
const TURKISH_ALPHABET: LetterTemplate[] = [
  {
    id: 'A',
    letter: 'A',
    name: 'A harfi',
    sound: 'a',
    baseColor: '#FF6B6B',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'B',
    letter: 'B',
    name: 'B harfi',
    sound: 'be',
    baseColor: '#4ECDC4',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'C',
    letter: 'C',
    name: 'C harfi',
    sound: 'ce',
    baseColor: '#FFE66D',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Ç',
    letter: 'Ç',
    name: 'Ç harfi',
    sound: 'çe',
    baseColor: '#95E1D3',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'D',
    letter: 'D',
    name: 'D harfi',
    sound: 'de',
    baseColor: '#B06AB3',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'E',
    letter: 'E',
    name: 'E harfi',
    sound: 'e',
    baseColor: '#FF8B94',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'F',
    letter: 'F',
    name: 'F harfi',
    sound: 'fe',
    baseColor: '#FFB6C1',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'G',
    letter: 'G',
    name: 'G harfi',
    sound: 'ge',
    baseColor: '#D2B48C',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Ğ',
    letter: 'Ğ',
    name: 'Ğ harfi',
    sound: 'yumuşak ge',
    baseColor: '#87CEEB',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'H',
    letter: 'H',
    name: 'H harfi',
    sound: 'he',
    baseColor: '#98FB98',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'I',
    letter: 'I',
    name: 'I harfi',
    sound: 'ı',
    baseColor: '#FFA07A',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'İ',
    letter: 'İ',
    name: 'İ harfi',
    sound: 'i',
    baseColor: '#20B2AA',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'J',
    letter: 'J',
    name: 'J harfi',
    sound: 'je',
    baseColor: '#DDA0DD',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'K',
    letter: 'K',
    name: 'K harfi',
    sound: 'ke',
    baseColor: '#F0E68C',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'L',
    letter: 'L',
    name: 'L harfi',
    sound: 'le',
    baseColor: '#FF69B4',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'M',
    letter: 'M',
    name: 'M harfi',
    sound: 'me',
    baseColor: '#32CD32',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'N',
    letter: 'N',
    name: 'N harfi',
    sound: 'ne',
    baseColor: '#FF4500',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'O',
    letter: 'O',
    name: 'O harfi',
    sound: 'o',
    baseColor: '#4169E1',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Ö',
    letter: 'Ö',
    name: 'Ö harfi',
    sound: 'ö',
    baseColor: '#8A2BE2',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'P',
    letter: 'P',
    name: 'P harfi',
    sound: 'pe',
    baseColor: '#DC143C',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'R',
    letter: 'R',
    name: 'R harfi',
    sound: 're',
    baseColor: '#00CED1',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'S',
    letter: 'S',
    name: 'S harfi',
    sound: 'se',
    baseColor: '#FFD700',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Ş',
    letter: 'Ş',
    name: 'Ş harfi',
    sound: 'şe',
    baseColor: '#9370DB',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'T',
    letter: 'T',
    name: 'T harfi',
    sound: 'te',
    baseColor: '#CD5C5C',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'U',
    letter: 'U',
    name: 'U harfi',
    sound: 'u',
    baseColor: '#48D1CC',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Ü',
    letter: 'Ü',
    name: 'Ü harfi',
    sound: 'ü',
    baseColor: '#DA70D6',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'V',
    letter: 'V',
    name: 'V harfi',
    sound: 've',
    baseColor: '#FF1493',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Y',
    letter: 'Y',
    name: 'Y harfi',
    sound: 'ye',
    baseColor: '#00FF7F',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: 'Z',
    letter: 'Z',
    name: 'Z harfi',
    sound: 'ze',
    baseColor: '#FF6347',
    image: 'https://images.unsplash.com/photo-1688244653798-a779ad20cc7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHBoYWJldCUyMGxldHRlcnMlMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc1Nzg2NTE4OHww&ixlib=rb-4.1.0&q=80&w=400'
  }
];

export function AlphabetPainting({ volume, onGoBack }: AlphabetPaintingProps) {
  const [selectedLetterIndex, setSelectedLetterIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].color);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isColored, setIsColored] = useState<boolean>(false);

  const textIdCounter = useRef(0);
  const sparkleIdCounter = useRef(0);
  const animationFrameRef = useRef<number>();

  const selectedLetter = TURKISH_ALPHABET[selectedLetterIndex];

  // Sparkle animation system
  useEffect(() => {
    const animateSparkles = () => {
      setSparkles(prev => prev.map(sparkle => ({
        ...sparkle,
        life: sparkle.life - 1,
        y: sparkle.y - 1,
        size: sparkle.size * 0.98
      })).filter(sparkle => sparkle.life > 0));
      
      animationFrameRef.current = requestAnimationFrame(animateSparkles);
    };
    
    animateSparkles();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Sound system
  const playSound = useCallback((frequency: number, duration: number = 300) => {
    if (!isSoundOn || volume === 0) return;
    const soundManager = getSoundManager(volume);
    soundManager.playNote(frequency, duration / 1000);
  }, [isSoundOn, volume]);

  // Create floating text
  const createFloatingText = useCallback((text: string, x: number, y: number, color: string = '#10B981') => {
    const newText: FloatingText = {
      id: textIdCounter.current++,
      text,
      x,
      y,
      color
    };
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
  }, []);

  // Create sparkles
  const createSparkles = useCallback((x: number, y: number, color: string) => {
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 5; i++) {
      newSparkles.push({
        id: sparkleIdCounter.current++,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        color,
        size: Math.random() * 12 + 6,
        life: 80
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
  }, []);

  // Handle letter selection
  const selectLetter = useCallback((direction: 'prev' | 'next') => {
    setSelectedLetterIndex(prev => {
      const newIndex = direction === 'next' 
        ? (prev + 1) % TURKISH_ALPHABET.length
        : (prev - 1 + TURKISH_ALPHABET.length) % TURKISH_ALPHABET.length;
      
      const newLetter = TURKISH_ALPHABET[newIndex];
      setIsColored(false); // Reset coloring
      playSound(440 + newIndex * 10, 200);
      createFloatingText(`${newLetter.letter} - ${newLetter.sound}`, 150, 100, selectedColor);
      
      return newIndex;
    });
  }, [playSound, createFloatingText, selectedColor]);

  // Handle color selection
  const selectColor = useCallback((colorInfo: typeof COLORS[0]) => {
    setSelectedColor(colorInfo.color);
    playSound(330 + COLORS.indexOf(colorInfo) * 50, 150);
    createFloatingText(`${colorInfo.emoji} ${colorInfo.name}`, 150, 50, colorInfo.color);
  }, [playSound, createFloatingText]);

  // Simple Turkish Speech System - Using Google Web Speech API
  const speakText = useCallback(async (text: string) => {
    if (!isSoundOn || volume === 0) return;
    
    console.log('🎤 Speaking Turkish letter:', text);
    
    try {
      // Use Turkish Speech Manager for perfect pronunciation
      await turkishSpeech.speakLetter(text, volume);
      console.log('✅ Turkish speech completed successfully!');
    } catch (error) {
      console.warn('⚠️ Speech failed:', error);
      // Show friendly message to user
      createFloatingText('🔊 Ses çalınıyor...', 150, 100, '#4ECDC4');
    }
  }, [isSoundOn, volume, createFloatingText]);

  // Initialize voices when component mounts
  useEffect(() => {
    const initVoices = () => {
      // Load voices
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Voices not loaded yet, wait for them
          speechSynthesis.onvoiceschanged = () => {
            const newVoices = speechSynthesis.getVoices();
            console.log(`🎤 Loaded ${newVoices.length} voices for Turkish alphabet`);
            
            // Log Turkish voices found
            const turkishVoices = newVoices.filter(voice => 
              voice.lang.startsWith('tr') || voice.name.toLowerCase().includes('turkish')
            );
            
            // Look specifically for Emel voice
            const emelVoice = newVoices.find(voice => 
              voice.name.toLowerCase().includes('emel')
            );
            
            if (emelVoice) {
              console.log('🌟 EMEL voice found:', emelVoice.name, '(', emelVoice.lang, ')');
            }
            
            if (turkishVoices.length > 0) {
              console.log('🇹🇷 Turkish voices available:', turkishVoices.map(v => `${v.name} (${v.lang})`));
            } else {
              console.log('🎤 No Turkish voices found, using system default');
            }
          };
        } else {
          console.log(`🎤 ${voices.length} voices ready for Turkish alphabet`);
          
          // Check for Emel voice immediately
          const emelVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('emel')
          );
          
          if (emelVoice) {
            console.log('🌟 EMEL voice found:', emelVoice.name, '(', emelVoice.lang, ')');
          }
        }
      }
    };

    initVoices();
  }, []);

  // Handle painting
  const paintLetter = useCallback(async (event: React.MouseEvent | React.TouchEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsColored(true);
    createSparkles(x, y, selectedColor);
    playSound(523.25, 200);
    createFloatingText('🎨 Güzel!', x, y, selectedColor);

    // 🎤 Speak the letter pronunciation using Turkish Speech Manager
    speakText(selectedLetter.sound);
  }, [selectedColor, createSparkles, playSound, createFloatingText, selectedLetter.sound, speakText]);

  // Clear painting
  const clearPainting = useCallback(() => {
    setIsColored(false);
    playSound(200, 300);
    createFloatingText('🧽 Temizlendi!', 150, 120, '#4ECDC4');
  }, [playSound, createFloatingText]);

  // Save painting
  const savePainting = useCallback(() => {
    playSound(523.25, 500);
    createFloatingText('💾 Kaydedildi!', 150, 120, '#FFD700');
  }, [playSound, createFloatingText]);

  return (
    <div 
      className="relative mx-auto overflow-hidden shadow-2xl w-full max-w-sm"
      style={{ 
        aspectRatio: '375 / 812',
        borderRadius: 'var(--radius-widget)',
        maxHeight: '85vh',
        minHeight: '600px',
        background: 'linear-gradient(to bottom, #E6F3FF, #F0F8FF, #FFF8E6)'
      }}
    >
      {/* Header */}
      <div 
        className="absolute flex justify-between items-center z-30"
        style={{ 
          top: 'calc(var(--mobile-padding) * 0.5)', 
          left: 'var(--mobile-padding)', 
          right: 'var(--mobile-padding)',
          height: 'clamp(48px, 12vw, 56px)'
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
          style={{ 
            borderRadius: 'var(--radius-card)',
            padding: 'clamp(8px, 2vw, 12px)',
            fontFamily: 'var(--font-text)',
            height: 'clamp(40px, 10vw, 48px)',
            minWidth: 'clamp(80px, 20vw, 120px)'
          }}
        >
          <div className="flex items-center" style={{ gap: 'clamp(4px, 1vw, 8px)' }}>
            <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>🔤</span>
            <span style={{ 
              fontSize: 'var(--text-kids-small)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(147, 51, 234)',
              whiteSpace: 'nowrap'
            }}>Alfabe</span>
          </div>
        </motion.div>

        {/* Controls - Horizontal Layout */}
        <div className="flex items-center" style={{ gap: 'clamp(8px, 2vw, 12px)' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={clearPainting}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(40px, 10vw, 48px)',
              height: 'clamp(40px, 10vw, 48px)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <RotateCcw className="w-4 h-4 text-orange-600" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(40px, 10vw, 48px)',
              height: 'clamp(40px, 10vw, 48px)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            {isSoundOn ? (
              <Volume2 className="w-4 h-4 text-blue-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-600" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onGoBack}
            className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            style={{ 
              width: 'clamp(40px, 10vw, 48px)',
              height: 'clamp(40px, 10vw, 48px)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>🏠</span>
          </motion.button>
        </div>
      </div>

      {/* Game Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
        style={{ 
          paddingTop: 'calc(var(--mobile-padding) * 0.5 + clamp(48px, 12vw, 56px) + var(--mobile-padding) * 0.4)',
          paddingBottom: 'calc(var(--mobile-padding) * 0.4)',
          fontFamily: 'var(--font-display)'
        }}
      >
        <div style={{ 
          fontSize: 'var(--text-kids-large)', 
          fontWeight: 'var(--font-weight-bold)',
          color: 'rgb(147, 51, 234)',
          marginBottom: '0',
          textShadow: '2px 2px 4px rgba(147, 51, 234, 0.2)'
        }}>
          🔤 Alfabe Boyama ✏️
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={{ 
        padding: 'var(--mobile-padding)',
        paddingTop: 'calc(var(--mobile-padding) * 0.5)'
      }}>
        
        {/* Letter Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div 
            className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm shadow-lg"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            {/* Previous Letter */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => selectLetter('prev')}
              className="bg-purple-500 text-white shadow-lg flex items-center justify-center"
              style={{ 
                width: 'calc(var(--kids-emoji-size) * 0.8)',
                height: 'calc(var(--kids-emoji-size) * 0.8)',
                borderRadius: 'var(--radius)'
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Current Letter Display */}
            <div className="text-center flex-1">
              <motion.div
                key={selectedLetter.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                style={{ 
                  fontSize: 'calc(var(--kids-emoji-size) * 1.5)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: selectedLetter.baseColor,
                  fontFamily: 'var(--font-display)',
                  marginBottom: '4px'
                }}
              >
                {selectedLetter.letter}
              </motion.div>
              <div style={{ 
                fontSize: 'var(--text-kids-small)',
                color: 'rgb(107, 114, 128)',
                fontFamily: 'var(--font-text)'
              }}>
                {selectedLetter.name}
              </div>
              <div style={{ 
                fontSize: 'var(--text-kids-small)',
                color: 'rgb(147, 51, 234)',
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                {selectedLetterIndex + 1}/29
              </div>
            </div>

            {/* Next Letter */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => selectLetter('next')}
              className="bg-purple-500 text-white shadow-lg flex items-center justify-center"
              style={{ 
                width: 'calc(var(--kids-emoji-size) * 0.8)',
                height: 'calc(var(--kids-emoji-size) * 0.8)',
                borderRadius: 'var(--radius)'
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Color Palette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div 
            className="flex flex-wrap gap-2 p-3 bg-white/90 backdrop-blur-sm shadow-lg justify-center"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            {COLORS.map((colorInfo) => (
              <motion.button
                key={colorInfo.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => selectColor(colorInfo)}
                className={`rounded-full shadow-lg transition-all ${
                  selectedColor === colorInfo.color 
                    ? 'ring-4 ring-white ring-offset-2 ring-offset-purple-200' 
                    : ''
                }`}
                style={{ 
                  width: 'calc(var(--kids-emoji-size) * 0.7)',
                  height: 'calc(var(--kids-emoji-size) * 0.7)',
                  backgroundColor: colorInfo.color
                }}
              >
                <motion.div
                  animate={selectedColor === colorInfo.color ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: 'var(--text-kids-small)' }}
                >
                  {colorInfo.emoji}
                </motion.div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Canvas Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div 
            className="bg-white shadow-lg p-6 overflow-hidden relative cursor-pointer"
            style={{ 
              borderRadius: 'var(--radius-card)',
              minHeight: '300px'
            }}
            onClick={paintLetter}
            onTouchStart={(e) => {
              e.preventDefault();
              paintLetter(e);
            }}
          >
            {/* Letter Display */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                key={`${selectedLetter.id}-${isColored}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="relative"
                style={{ 
                  width: '200px',
                  height: '250px',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  border: '4px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Background Image */}
                {/* Background image removed - only letter remains */}
                
                {/* Letter Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center z-10"
                  style={{
                    fontSize: 'calc(var(--kids-emoji-size) * 4)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-display)',
                    color: isColored ? selectedColor : selectedLetter.baseColor, // Start with baseColor, only change when painted
                    textShadow: isColored 
                      ? `3px 3px 6px ${selectedColor}33, 0 0 15px ${selectedColor}66`
                      : '2px 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    transform: isColored ? 'scale(1.05)' : 'scale(1)',
                    WebkitTextStroke: isColored ? '2px rgba(255,255,255,0.8)' : '2px rgba(0,0,0,0.1)'
                  }}
                >
                  {selectedLetter.letter}
                </div>
                
                {/* Paint Effect Overlay */}
                {isColored && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.3 }}
                    className="absolute inset-0 rounded-lg"
                    style={{ 
                      background: `radial-gradient(circle, ${selectedColor}80 0%, transparent 70%)`,
                      mixBlendMode: 'multiply'
                    }}
                  />
                )}
              </motion.div>
            </div>

            {/* Sparkles overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {sparkles.map((sparkle) => (
                <motion.div
                  key={sparkle.id}
                  className="absolute rounded-full"
                  style={{
                    left: sparkle.x,
                    top: sparkle.y,
                    width: sparkle.size,
                    height: sparkle.size,
                    backgroundColor: sparkle.color,
                    opacity: sparkle.life / 80
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                />
              ))}
            </div>

            {/* Floating texts overlay */}
            <AnimatePresence>
              {floatingTexts.map((text) => (
                <motion.div
                  key={text.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: text.x,
                    top: text.y,
                    color: text.color,
                    fontSize: 'var(--text-kids-medium)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-display)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ y: -50, opacity: 1, scale: 1 }}
                  exit={{ y: -100, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  {text.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-4"
        >
          <div style={{ 
            fontSize: 'var(--text-kids-small)',
            color: 'rgb(107, 114, 128)',
            fontFamily: 'var(--font-text)'
          }}>
            {isColored ? '🎨 Harika! Başka renk seç ve tekrar boya!' : '👆 Harfe dokun ve boyamaya başla!'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}