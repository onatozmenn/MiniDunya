import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface StoryMakerProps {
  volume: number;
  onBack: () => void;
}

interface StoryElement {
  id: number;
  type: 'character' | 'setting' | 'object' | 'action' | 'mood';
  emoji: string;
  name: string;
  sound: number;
  color: string;
}

interface StoryScene {
  id: number;
  elements: StoryElement[];
  text: string;
  musicPattern: number[];
}

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  element: StoryElement;
  isSelected: boolean;
}

const STORY_ELEMENTS = {
  characters: [
    { id: 0, type: 'character', emoji: '🐱', name: 'Kedi', sound: 261.63, color: '#FF6B9D' },
    { id: 1, type: 'character', emoji: '🐶', name: 'Köpek', sound: 293.66, color: '#FF8E53' },
    { id: 2, type: 'character', emoji: '🦆', name: 'Ördek', sound: 329.63, color: '#FFD93D' },
    { id: 3, type: 'character', emoji: '🐸', name: 'Kurbağa', sound: 349.23, color: '#6BCF7F' },
    { id: 4, type: 'character', emoji: '🐦', name: 'Kuş', sound: 392.00, color: '#4D96FF' },
    { id: 5, type: 'character', emoji: '🐭', name: 'Fare', sound: 440.00, color: '#9B59B6' },
  ],
  settings: [
    { id: 10, type: 'setting', emoji: '🏠', name: 'Ev', sound: 523.25, color: '#FF9999' },
    { id: 11, type: 'setting', emoji: '🌳', name: 'Orman', sound: 587.33, color: '#99FF99' },
    { id: 12, type: 'setting', emoji: '🏰', name: 'Kale', sound: 659.25, color: '#9999FF' },
    { id: 13, type: 'setting', emoji: '🏖️', name: 'Sahil', sound: 698.46, color: '#FFE999' },
    { id: 14, type: 'setting', emoji: '⛰️', name: 'Dağ', sound: 783.99, color: '#CCCCCC' },
    { id: 15, type: 'setting', emoji: '🌙', name: 'Gece', sound: 880.00, color: '#9966FF' },
  ],
  objects: [
    { id: 20, type: 'object', emoji: '🎈', name: 'Balon', sound: 1046.50, color: '#FF6666' },
    { id: 21, type: 'object', emoji: '⚽', name: 'Top', sound: 1174.66, color: '#66FF66' },
    { id: 22, type: 'object', emoji: '🎁', name: 'Hediye', sound: 1318.51, color: '#6666FF' },
    { id: 23, type: 'object', emoji: '🌟', name: 'Yıldız', sound: 1396.91, color: '#FFFF66' },
    { id: 24, type: 'object', emoji: '🚗', name: 'Araba', sound: 1567.98, color: '#FF66FF' },
    { id: 25, type: 'object', emoji: '🎵', name: 'Müzik', sound: 1760.00, color: '#66FFFF' },
  ],
  actions: [
    { id: 30, type: 'action', emoji: '🏃', name: 'Koş', sound: 220.00, color: '#FFB366' },
    { id: 31, type: 'action', emoji: '💃', name: 'Dans', sound: 246.94, color: '#B366FF' },
    { id: 32, type: 'action', emoji: '🎵', name: 'Şarkı Söyle', sound: 277.18, color: '#66FFB3' },
    { id: 33, type: 'action', emoji: '🤗', name: 'Sarıl', sound: 311.13, color: '#FFB3B3' },
    { id: 34, type: 'action', emoji: '🎮', name: 'Oyna', sound: 369.99, color: '#B3B3FF' },
    { id: 35, type: 'action', emoji: '😴', name: 'Uyu', sound: 415.30, color: '#B3FFB3' },
  ],
  moods: [
    { id: 40, type: 'mood', emoji: '😊', name: 'Mutlu', sound: 130.81, color: '#FFEEAA' },
    { id: 41, type: 'mood', emoji: '😢', name: 'Üzgün', sound: 146.83, color: '#AAEEFF' },
    { id: 42, type: 'mood', emoji: '😮', name: 'Şaşkın', sound: 164.81, color: '#FFAAEE' },
    { id: 43, type: 'mood', emoji: '😍', name: 'Aşık', sound: 174.61, color: '#EEFFAA' },
    { id: 44, type: 'mood', emoji: '😨', name: 'Korkmuş', sound: 196.00, color: '#EEAAFF' },
    { id: 45, type: 'mood', emoji: '🤔', name: 'Düşünceli', sound: 207.65, color: '#AAFFEE' },
  ]
};

const STORY_TEMPLATES = [
  "Bir zamanlar {character} {setting} yaşarmış. Bir gün {object} bulmuş ve çok {mood} olmuş. Sonra {action} karar vermiş.",
  "{character} ve {character} {setting} {action}. {object} görünce ikisi de {mood} hale gelmiş. Birlikte güzel zaman geçirmişler.",
  "Günlerden bir gün {character} {setting} yürürken {object} karşılaşmış. O kadar {mood} ki {action} başlamış.",
  "{setting} {character} ve arkadaşları {action}. Aniden {object} görünce hepsi {mood} olmuş ve büyük macera başlamış."
];

export function StoryMaker({ volume, onBack }: StoryMakerProps) {
  const [selectedElements, setSelectedElements] = useState<StoryElement[]>([]);
  const [currentStory, setCurrentStory] = useState<string>('');
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentElementIndex, setCurrentElementIndex] = useState(-1);
  const [scenes, setScenes] = useState<StoryScene[]>([]);
  const [activeCategory, setActiveCategory] = useState<keyof typeof STORY_ELEMENTS>('characters');
  
  const audioContext = useRef<AudioContext | null>(null);
  const storyAreaRef = useRef<HTMLDivElement>(null);
  const floatingIdCounter = useRef(0);
  const sceneIdCounter = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.8) => {
    if (!audioContext.current) return;

    // Create magical storytelling sound
    const oscillator1 = audioContext.current.createOscillator();
    const oscillator2 = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator1.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator1.type = 'triangle';
    
    oscillator2.frequency.setValueAtTime(frequency * 1.618, audioContext.current.currentTime); // Golden ratio for harmony
    oscillator2.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);

    oscillator1.start(audioContext.current.currentTime);
    oscillator2.start(audioContext.current.currentTime);
    oscillator1.stop(audioContext.current.currentTime + duration);
    oscillator2.stop(audioContext.current.currentTime + duration);
  };

  const addElementToStory = (element: StoryElement, x?: number, y?: number) => {
    if (selectedElements.find(e => e.id === element.id)) return; // Already selected
    
    setSelectedElements(prev => [...prev, element]);
    playNote(element.sound);

    // Add floating visual element
    if (storyAreaRef.current && x !== undefined && y !== undefined) {
      const rect = storyAreaRef.current.getBoundingClientRect();
      const relativeX = x - rect.left;
      const relativeY = y - rect.top;

      const floatingElement: FloatingElement = {
        id: floatingIdCounter.current++,
        x: relativeX,
        y: relativeY,
        element,
        isSelected: true
      };

      setFloatingElements(prev => [...prev, floatingElement]);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Generate story if we have enough elements
    if (selectedElements.length >= 2) {
      generateStory([...selectedElements, element]);
    }
  };

  const generateStory = (elements: StoryElement[]) => {
    const template = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
    let story = template;

    // Group elements by type
    const elementsByType = elements.reduce((acc, element) => {
      if (!acc[element.type]) acc[element.type] = [];
      acc[element.type].push(element);
      return acc;
    }, {} as Record<string, StoryElement[]>);

    // Replace placeholders with elements
    Object.keys(elementsByType).forEach(type => {
      const typeElements = elementsByType[type];
      let index = 0;
      story = story.replace(new RegExp(`{${type}}`, 'g'), () => {
        const element = typeElements[index % typeElements.length];
        index++;
        return element.name;
      });
    });

    setCurrentStory(story);
  };

  const narrateStory = () => {
    if (selectedElements.length === 0) return;
    
    setIsNarrating(true);
    setCurrentElementIndex(0);

    selectedElements.forEach((element, index) => {
      setTimeout(() => {
        setCurrentElementIndex(index);
        playNote(element.sound, 1.2);
        
        if (index === selectedElements.length - 1) {
          setTimeout(() => {
            setIsNarrating(false);
            setCurrentElementIndex(-1);
            
            // Play final flourish
            setTimeout(() => playNote(523.25, 0.5), 0);
            setTimeout(() => playNote(659.25, 0.5), 200);
            setTimeout(() => playNote(783.99, 1.0), 400);
          }, 1200);
        }
      }, index * 1500);
    });
  };

  const saveScene = () => {
    if (selectedElements.length === 0 || !currentStory) return;

    const newScene: StoryScene = {
      id: sceneIdCounter.current++,
      elements: [...selectedElements],
      text: currentStory,
      musicPattern: selectedElements.map(e => e.sound)
    };

    setScenes(prev => [...prev, newScene]);
  };

  const playScene = (scene: StoryScene) => {
    scene.musicPattern.forEach((frequency, index) => {
      setTimeout(() => {
        playNote(frequency, 0.8);
      }, index * 400);
    });
  };

  const clearStory = () => {
    setSelectedElements([]);
    setCurrentStory('');
    setFloatingElements([]);
    setCurrentElementIndex(-1);
    setIsNarrating(false);
  };

  const removeElement = (elementId: number) => {
    setSelectedElements(prev => prev.filter(e => e.id !== elementId));
    setFloatingElements(prev => prev.filter(f => f.element.id !== elementId));
    
    // Regenerate story with remaining elements
    const remaining = selectedElements.filter(e => e.id !== elementId);
    if (remaining.length >= 2) {
      generateStory(remaining);
    } else {
      setCurrentStory('');
    }
  };

  const addElementToArea = (event: React.MouseEvent) => {
    if (activeCategory && STORY_ELEMENTS[activeCategory].length > 0) {
      const availableElements = STORY_ELEMENTS[activeCategory].filter(
        element => !selectedElements.find(e => e.id === element.id)
      );
      
      if (availableElements.length > 0) {
        const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
        addElementToStory(randomElement, event.clientX, event.clientY);
      }
    }
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
          <div className="text-6xl">📚</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Hikaye Yapıcı
          </div>
          <div className="text-sm opacity-80">Elementler: {selectedElements.length}</div>
        </div>
        
        <Button
          onClick={clearStory}
          variant="outline"
          className="rounded-full w-12 h-12 border-4 border-white/50 bg-white/20 backdrop-blur-sm"
        >
          🗑️
        </Button>
      </motion.div>

      {/* Story Area */}
      <Card className="relative p-4 border-0 shadow-2xl rounded-[2rem] bg-gradient-to-br from-amber-200/80 via-yellow-200/80 to-orange-200/80 dark:from-amber-800/40 dark:via-yellow-800/40 dark:to-orange-800/40 min-h-[300px] overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-yellow-100/50 to-orange-100/50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-[2rem]" />
        
        {/* Floating story decorations */}
        <div className="absolute top-4 left-8 text-4xl opacity-40">📖</div>
        <div className="absolute top-6 right-12 text-3xl opacity-40">✨</div>
        <div className="absolute bottom-8 left-12 text-3xl opacity-40">🌟</div>

        <div
          ref={storyAreaRef}
          className="relative w-full h-[300px] cursor-pointer"
          onClick={addElementToArea}
        >
          {/* Floating Elements */}
          <AnimatePresence>
            {floatingElements.map((floatingElement) => (
              <motion.div
                key={floatingElement.id}
                className="absolute cursor-pointer"
                style={{ 
                  left: floatingElement.x - 25, 
                  top: floatingElement.y - 25,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: currentElementIndex === selectedElements.findIndex(e => e.id === floatingElement.element.id) ? 1.5 : 1,
                  rotate: 0,
                  y: isNarrating && currentElementIndex === selectedElements.findIndex(e => e.id === floatingElement.element.id) ? [-10, 10, -10] : 0
                }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeElement(floatingElement.element.id);
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full border-4 border-white/70 shadow-xl flex items-center justify-center text-2xl relative"
                  style={{ backgroundColor: floatingElement.element.color }}
                >
                  {floatingElement.element.emoji}
                  
                  {/* Currently narrating indicator */}
                  {currentElementIndex === selectedElements.findIndex(e => e.id === floatingElement.element.id) && (
                    <motion.div
                      className="absolute inset-0 border-4 border-yellow-300 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Story Text */}
          {currentStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Card className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl">
                <div className="text-lg font-bold text-center">
                  {currentStory}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Instructions */}
          {selectedElements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center space-y-4 opacity-60">
                <div className="text-8xl">📚</div>
                <div className="text-xl">Hikaye elementleri seç</div>
                <div className="text-lg">Dokun ve hikayeni yarat! ✨</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={narrateStory}
          disabled={selectedElements.length === 0 || isNarrating}
          className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white border-0"
        >
          {isNarrating ? '🎵 Anlatılıyor...' : '🎭 Hikayeyi Anlat'}
        </Button>
        
        <Button
          onClick={saveScene}
          disabled={!currentStory}
          className="rounded-2xl px-6 py-3 text-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0"
        >
          💾 Sahneyi Kaydet
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-2 backdrop-blur-sm flex space-x-2">
          {Object.keys(STORY_ELEMENTS).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setActiveCategory(category as keyof typeof STORY_ELEMENTS)}
            >
              <div className="text-center">
                <div className="text-lg">
                  {category === 'characters' ? '🐾' :
                   category === 'settings' ? '🏞️' :
                   category === 'objects' ? '⭐' :
                   category === 'actions' ? '🎭' : '😊'}
                </div>
                <div className="text-xs capitalize">
                  {category === 'characters' ? 'Karakterler' :
                   category === 'settings' ? 'Yerler' :
                   category === 'objects' ? 'Nesneler' :
                   category === 'actions' ? 'Eylemler' : 'Duygular'}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Element Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {STORY_ELEMENTS[activeCategory].map((element, index) => (
          <motion.div
            key={element.id}
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
                w-full h-20 rounded-3xl border-4 shadow-xl relative overflow-hidden
                ${selectedElements.find(e => e.id === element.id) ? 'opacity-50 border-green-300' : 'border-white/50'}
              `}
              style={{ backgroundColor: element.color }}
              onClick={() => addElementToStory(element)}
              disabled={!!selectedElements.find(e => e.id === element.id)}
            >
              <div className="text-center space-y-1">
                <div className="text-3xl">{element.emoji}</div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {element.name}
                </div>
              </div>
              
              {/* Selected indicator */}
              {selectedElements.find(e => e.id === element.id) && (
                <div className="absolute top-1 right-1 text-green-400 text-lg">
                  ✓
                </div>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Saved Scenes */}
      {scenes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="text-xl font-bold">📚 Kaydedilen Sahneler</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-amber-300/50">
                  <div className="space-y-3">
                    {/* Scene elements */}
                    <div className="flex justify-center space-x-2">
                      {scene.elements.map((element) => (
                        <div
                          key={element.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: element.color }}
                        >
                          {element.emoji}
                        </div>
                      ))}
                    </div>
                    
                    {/* Scene text */}
                    <div className="text-sm text-center opacity-80">
                      {scene.text}
                    </div>
                    
                    {/* Play button */}
                    <Button
                      onClick={() => playScene(scene)}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                    >
                      🎵 Çal
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="p-4 rounded-3xl bg-gradient-to-r from-amber-200/80 to-orange-200/80 dark:from-amber-600/20 dark:to-orange-600/20 border-4 border-amber-300/50">
          <div className="space-y-2">
            <div className="text-3xl">📖</div>
            <div className="text-lg font-bold">Hikaye Yaratıcısı</div>
            <div className="text-sm opacity-80">
              Elementleri seç, hikayeni oluştur ve müzikli anlatım dinle! Her element kendine özgü ses çıkarır! ✨📚
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}