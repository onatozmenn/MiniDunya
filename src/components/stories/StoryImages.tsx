// Story Images for SevSaMut - CARTOON ILLUSTRATION SYSTEM
// Every scene gets its own beautiful cartoon image!
import { ImageWithFallback } from '../figma/ImageWithFallback';

// 🎨 COMPLETE SCENE-BY-SCENE IMAGE LIBRARY
export const STORY_SCENE_IMAGES = {
  'three-little-pigs': {
    // Background for entire story
    background: 'https://images.unsplash.com/photo-1726142240443-c827f518afb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMGxpdHRsZSUyMHBpZ3MlMjBjYXJ0b29uJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1NzgyNjgyNHww&ixlib=rb-4.1.0&q=80&w=1080',
    
    // Scene-specific images
    scenes: {
      'intro': 'https://images.unsplash.com/photo-1570033434999-2ee19256107d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXR0bGUlMjBwaWclMjBjdXRlJTIwY2FydG9vbnxlbnwxfHx8fDE3NTc4MjY4Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'first-pig': 'https://images.unsplash.com/photo-1705895360045-7442f5b55d21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmljayUyMGhvdXNlJTIwc3RyYXclMjBob3VzZSUyMGNhcnRvb258ZW58MXx8fHwxNzU3ODI2ODM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'second-pig': 'https://images.unsplash.com/photo-1705895360045-7442f5b55d21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmljayUyMGhvdXNlJTIwc3RyYXclMjBob3VzZSUyMGNhcnRvb258ZW58MXx8fHwxNzU3ODI2ODM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'third-pig': 'https://images.unsplash.com/photo-1705895360045-7442f5b55d21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmljayUyMGhvdXNlJTIwc3RyYXclMjBob3VzZSUyMGNhcnRvb258ZW58MXx8fHwxNzU3ODI2ODM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'wolf-arrives': 'https://images.unsplash.com/photo-1551735361-661bd4b10c5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWclMjBiYWQlMjB3b2xmJTIwY2FydG9vbnxlbnwxfHx8fDE3NTc4MjY4MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'happy-ending': 'https://images.unsplash.com/photo-1570033434999-2ee19256107d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXR0bGUlMjBwaWclMjBjdXRlJTIwY2FydG9vbnxlbnwxfHx8fDE3NTc4MjY4Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  },
  
  'red-riding-hood': {
    background: 'https://images.unsplash.com/photo-1701981652674-c39ba8b28e81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBjYXJ0b29uJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1NzgyNjg0MXww&ixlib=rb-4.1.0&q=80&w=1080',
    
    scenes: {
      'intro': 'https://images.unsplash.com/photo-1707551795677-976ce0a97057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjByaWRpbmclMjBob29kJTIwZ2lybCUyMGNhcnRvb258ZW58MXx8fHwxNzU3ODI2ODM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'girl-speaks': 'https://images.unsplash.com/photo-1707551795677-976ce0a97057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjByaWRpbmclMjBob29kJTIwZ2lybCUyMGNhcnRvb258ZW58MXx8fHwxNzU3ODI2ODM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'wolf-appears': 'https://images.unsplash.com/photo-1551735361-661bd4b10c5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWclMjBiYWQlMjB3b2xmJTIwY2FydG9vbnxlbnwxfHx8fDE3NTc4MjY4MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'happy-ending': 'https://images.unsplash.com/photo-1707551795677-976ce0a97057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjByaWRpbmclMjBob29kJTIwZ2lybCUyMGNhcnRvb258ZW58MXx8fHwxNzU3ODI2ODM4fDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  },
  
  // Default fallback for other stories
  'default': {
    background: 'https://images.unsplash.com/photo-1701981652674-c39ba8b28e81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBjYXJ0b29uJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1NzgyNjg0MXww&ixlib=rb-4.1.0&q=80&w=1080',
    scenes: {
      'default': 'https://images.unsplash.com/photo-1726142240443-c827f518afb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMGxpdHRsZSUyMHBpZ3MlMjBjYXJ0b29uJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc1NzgyNjgyNHww&ixlib=rb-4.1.0&q=80&w=1080'
    }
  }
};

// 📸 Scene-Specific Image Component - The Core Magic!
export interface StorySceneImageProps {
  storyId: string;
  sceneId: string;
  className?: string;
  size?: number;
  fallbackEmoji?: string;
}

export function StorySceneImage({ 
  storyId, 
  sceneId,
  className = '', 
  size = 200,
  fallbackEmoji = '📚'
}: StorySceneImageProps) {
  const storyImages = STORY_SCENE_IMAGES[storyId as keyof typeof STORY_SCENE_IMAGES] || STORY_SCENE_IMAGES.default;
  const sceneImage = storyImages.scenes[sceneId as keyof typeof storyImages.scenes] || storyImages.scenes.default || storyImages.background;
  
  console.log(`🎨 Loading scene image for ${storyId}/${sceneId}:`, sceneImage?.substring(0, 50));
  
  if (!sceneImage) {
    return (
      <div 
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>{fallbackEmoji}</span>
      </div>
    );
  }
  
  return (
    <ImageWithFallback
      src={sceneImage}
      alt={`${storyId} scene ${sceneId}`}
      className={`rounded-2xl object-cover shadow-2xl border-4 border-white/30 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// 🖼️ Story Background Component - Each Story Gets Its Own Background
export interface StoryBackgroundProps {
  storyId: string;
  className?: string;
  children?: React.ReactNode;
}

export function StoryBackground({ storyId, className = '', children }: StoryBackgroundProps) {
  const storyImages = STORY_SCENE_IMAGES[storyId as keyof typeof STORY_SCENE_IMAGES] || STORY_SCENE_IMAGES.default;
  const backgroundUrl = storyImages.background;
  
  return (
    <div 
      className={`relative w-full h-full bg-cover bg-center bg-no-repeat ${className}`}
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${backgroundUrl})`
      }}
    >
      {children}
    </div>
  );
}

// Legacy support - Character Image Component (keeping for compatibility)
export interface StoryCharacterImageProps {
  storyId: string;
  character?: string;
  className?: string;
  size?: number;
  fallbackEmoji?: string;
}

export function StoryCharacterImage({ 
  storyId, 
  character = 'main', 
  className = '', 
  size = 120,
  fallbackEmoji = '📚'
}: StoryCharacterImageProps) {
  // This now just uses the scene image system
  const storyImages = STORY_SCENE_IMAGES[storyId as keyof typeof STORY_SCENE_IMAGES] || STORY_SCENE_IMAGES.default;
  const imageUrl = storyImages.background;
  
  return (
    <ImageWithFallback
      src={imageUrl}
      alt={`${storyId} ${character} character`}
      className={`rounded-full object-cover shadow-lg border-2 border-white/40 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}