import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { aiVoiceManager } from '../utils/AIVoiceManager';
import { ANT_AND_GRASSHOPPER_STORY, CINDERELLA_STORY } from './StoryDataMore';
import { StoryCharacterImage, StoryBackground } from './StoryImages';

interface StoryScene {
  id: string;
  type: 'visual' | 'interaction' | 'choice';
  character?: string;
  text: string;
  emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'mysterious' | 'scared' | 'angry' | 'loving';
  visualCue: string;
  mainCharacter: {
    emoji: string;
    position: [number, number];
    size: number;
    animation?: string;
  };
  backgroundEmojis: string[];
  interactables?: {
    id: string;
    emoji: string;
    position: [number, number];
    size: number;
    action?: string;
    sound?: string;
  }[];
  choices?: {
    id: string;
    emoji: string;
    position: [number, number];
    nextScene: string;
  }[];
}

interface StoryData {
  id: string;
  title: string;
  emoji: string;
  scenes: StoryScene[];
}

interface InteractiveStoryProps {
  storyId: string;
  onGoBack: () => void;
}

// Sample story data
const SAMPLE_STORY: StoryData = {
  id: 'sample',
  title: 'Test Hikayesi',
  emoji: '📚',
  scenes: [
    {
      id: 'intro',
      type: 'visual',
      character: 'narrator',
      text: 'Bir zamanlar çok güzel bir hikaye varmış...',
      emotion: 'calm',
      visualCue: '📚',
      mainCharacter: { emoji: '👧', position: [50, 50], size: 120 },
      backgroundEmojis: ['✨', '🌟'],
    }
  ]
};

// Story mapping
const storyMap: Record<string, StoryData> = {
  'three-little-pigs': SAMPLE_STORY,
  'goldilocks': SAMPLE_STORY,
  'ugly-duckling': SAMPLE_STORY,
  'red-riding-hood': SAMPLE_STORY,
  'tortoise-and-hare': SAMPLE_STORY,
  'jack-and-beanstalk': SAMPLE_STORY,
  'ant-and-grasshopper': ANT_AND_GRASSHOPPER_STORY,
  'cinderella': CINDERELLA_STORY,
};

export default function InteractiveStory({ storyId, onGoBack }: InteractiveStoryProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const sceneTransitionRef = useRef<NodeJS.Timeout>();

  const story = storyMap[storyId] || SAMPLE_STORY;
  const currentScene = story.scenes[currentSceneIndex];

  // Auto-advance to next scene after voice finishes
  useEffect(() => {
    if (!isPlaying || !autoAdvance || !currentScene) return;
    
    const playSceneVoice = async () => {
      try {
        setIsVoicePlaying(true);
        
        // Play voice with optimized settings
        await aiVoiceManager.speak({
          id: `${currentScene.id}-${Date.now()}`,
          text: currentScene.text,
          character: currentScene.character || 'narrator',
          emotion: currentScene.emotion
        });

        // Wait a bit then advance to next scene automatically
        sceneTransitionRef.current = setTimeout(() => {
          if (currentSceneIndex < story.scenes.length - 1) {
            setCurrentSceneIndex(prev => prev + 1);
          }
          setIsVoicePlaying(false);
        }, 300); // Fast transition for continuous flow

      } catch (error) {
        console.warn('Voice playback failed:', error);
        setIsVoicePlaying(false);
        
        // Still advance scene even if voice fails
        sceneTransitionRef.current = setTimeout(() => {
          if (currentSceneIndex < story.scenes.length - 1) {
            setCurrentSceneIndex(prev => prev + 1);
          }
        }, 2000);
      }
    };

    playSceneVoice();

    return () => {
      if (sceneTransitionRef.current) {
        clearTimeout(sceneTransitionRef.current);
      }
    };
  }, [currentSceneIndex, isPlaying, autoAdvance, currentScene, story.scenes.length]);

  const handleChoice = (nextSceneId: string) => {
    const nextIndex = story.scenes.findIndex(scene => scene.id === nextSceneId);
    if (nextIndex !== -1) {
      setCurrentSceneIndex(nextIndex);
    }
  };

  const handleInteractableClick = (interactable: any) => {
    // Add visual feedback for interaction
    console.log(`🎯 Interacted with ${interactable.emoji}`);
  };

  const handleSceneAdvance = () => {
    if (currentSceneIndex < story.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  const handleToggleAutoAdvance = () => {
    setAutoAdvance(!autoAdvance);
    console.log(`🔄 Auto-advance ${!autoAdvance ? 'enabled' : 'disabled'}`);
  };

  if (!currentScene) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 to-pink-900">
        <p className="text-white">Hikaye yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-screen overflow-hidden"
         style={{ fontFamily: 'var(--font-text)' }}>
      
      {/* Beautiful Story Background with Real Images */}
      <StoryBackground storyId={storyId} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/40" />
      </StoryBackground>

      {/* Main Story Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Story Header */}
        <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-md">
          <motion.button
            onClick={onGoBack}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Geri
          </motion.button>
          
          <h1 className="text-white font-bold text-lg">{story.title}</h1>
          
          <motion.button
            onClick={handleToggleAutoAdvance}
            className={`p-3 rounded-full backdrop-blur-md text-white transition-colors ${
              autoAdvance ? 'bg-green-500/80' : 'bg-red-500/80'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {autoAdvance ? '⏵' : '⏸'}
          </motion.button>
        </div>

        {/* Story Visual Area - The Main Focus for Children */}
        <div className="flex-1 relative overflow-hidden">
          
          {/* Beautiful Character Images */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`scene-${currentSceneIndex}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Main Character Image - Real Professional Photo */}
                <StoryCharacterImage
                  storyId={storyId}
                  character={currentScene.character || 'main'}
                  size={200}
                  className="shadow-2xl border-4 border-white/50 animate-pulse"
                  fallbackEmoji={currentScene.mainCharacter.emoji}
                />
                
                {/* Voice Playing Indicator */}
                {isVoicePlaying && (
                  <motion.div
                    className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🎵
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Elements */}
          {currentScene.interactables && (
            <div className="absolute inset-0 pointer-events-none">
              {currentScene.interactables.map((item, index) => (
                <motion.button
                  key={`${item.id}-${currentSceneIndex}`}
                  className="absolute pointer-events-auto"
                  style={{
                    left: `${item.position[0]}%`,
                    top: `${item.position[1]}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${item.size * 0.6}px`
                  }}
                  onClick={() => handleInteractableClick(item)}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.2, type: "spring", bounce: 0.6 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg">
                    {item.emoji}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Choice Buttons */}
          {currentScene.type === 'choice' && currentScene.choices && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-4 px-4">
              {currentScene.choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  onClick={() => handleChoice(choice.nextScene)}
                  className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 text-4xl shadow-lg"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {choice.emoji}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Story Text - Beautiful Typography */}
        <div className="p-6 bg-black/30 backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSceneIndex}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-white text-lg leading-relaxed font-medium drop-shadow-lg">
                {currentScene.text}
              </p>
              
              {/* Scene Progress */}
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2">
                  {story.scenes.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSceneIndex 
                          ? 'bg-white' 
                          : index < currentSceneIndex 
                            ? 'bg-white/60' 
                            : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Manual Controls */}
        {!autoAdvance && (
          <div className="p-4 bg-black/20 backdrop-blur-md flex justify-center">
            <motion.button
              onClick={handleSceneAdvance}
              className="bg-blue-500/80 backdrop-blur-md text-white px-8 py-3 rounded-full font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentSceneIndex >= story.scenes.length - 1}
            >
              Devam Et ➡️
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}