/**
 * 🎭 SevSaMut AI Voice Manager - CLEAN VERSION
 * Natural, fluent AI voices without robotic additions
 * ElevenLabs Premium + OpenAI TTS integration
 */

export interface AIVoiceConfig {
  character: string;
  voiceId: string;
  model: 'openai' | 'elevenlabs';
  emotions: Record<string, {
    stability: number;
    similarityBoost: number;
    style: number;
    speakerBoost: boolean;
  }>;
  language: string;
  gender: 'male' | 'female' | 'child';
  age: 'child' | 'young' | 'adult' | 'elderly';
}

export interface StoryAudio {
  id: string;
  text: string;
  character: string;
  emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'mysterious' | 'scared' | 'angry' | 'loving' | 'gentle';
}

class AIVoiceManager {
  private apiKey: string | null = null;
  private isConnected = false;
  private audioCache = new Map<string, string>();
  
  // 🚨 CRITICAL: Track all active audio + timeouts for aggressive cleanup
  private activeAudioElements = new Set<HTMLAudioElement>();
  private activeTimeouts = new Set<NodeJS.Timeout>();
  private isCurrentlyPlaying = false;
  
  // 🎭 PREMIUM AI VOICE CHARACTER LIBRARY
  private aiVoices: Record<string, AIVoiceConfig> = {
    // 📖 PROFESSIONAL STORYTELLERS
    narrator: {
      character: 'narrator',
      voiceId: 'pNInz6obpgDQGcFmaJgB',
      model: 'elevenlabs',
      emotions: {
        happy: { stability: 0.82, similarityBoost: 0.88, style: 0.45, speakerBoost: false },
        calm: { stability: 0.85, similarityBoost: 0.9, style: 0.35, speakerBoost: false },
        mysterious: { stability: 0.8, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        excited: { stability: 0.75, similarityBoost: 0.85, style: 0.55, speakerBoost: false },
        sad: { stability: 0.85, similarityBoost: 0.9, style: 0.3, speakerBoost: false },
        scared: { stability: 0.75, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        angry: { stability: 0.7, similarityBoost: 0.8, style: 0.5, speakerBoost: false },
        loving: { stability: 0.85, similarityBoost: 0.9, style: 0.4, speakerBoost: false },
        gentle: { stability: 0.88, similarityBoost: 0.9, style: 0.35, speakerBoost: false }
      },
      language: 'tr',
      gender: 'male',
      age: 'adult'
    },
    
    girl: {
      character: 'girl',
      voiceId: 'ThT5KcBeYPX3keUQqHPh',
      model: 'elevenlabs',
      emotions: {
        happy: { stability: 0.82, similarityBoost: 0.88, style: 0.45, speakerBoost: false },
        excited: { stability: 0.75, similarityBoost: 0.85, style: 0.55, speakerBoost: false },
        scared: { stability: 0.75, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        sad: { stability: 0.85, similarityBoost: 0.9, style: 0.3, speakerBoost: false },
        calm: { stability: 0.85, similarityBoost: 0.9, style: 0.35, speakerBoost: false },
        loving: { stability: 0.85, similarityBoost: 0.9, style: 0.4, speakerBoost: false },
        angry: { stability: 0.7, similarityBoost: 0.8, style: 0.45, speakerBoost: false },
        mysterious: { stability: 0.8, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        gentle: { stability: 0.88, similarityBoost: 0.9, style: 0.35, speakerBoost: false }
      },
      language: 'tr',
      gender: 'female',
      age: 'child'
    },

    mother: {
      character: 'mother',
      voiceId: 'pNInz6obpgDQGcFmaJgB',
      model: 'elevenlabs',
      emotions: {
        loving: { stability: 0.85, similarityBoost: 0.9, style: 0.4, speakerBoost: false },
        calm: { stability: 0.85, similarityBoost: 0.9, style: 0.35, speakerBoost: false },
        happy: { stability: 0.82, similarityBoost: 0.88, style: 0.45, speakerBoost: false },
        sad: { stability: 0.85, similarityBoost: 0.9, style: 0.3, speakerBoost: false },
        scared: { stability: 0.75, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        angry: { stability: 0.7, similarityBoost: 0.8, style: 0.45, speakerBoost: false },
        excited: { stability: 0.75, similarityBoost: 0.85, style: 0.55, speakerBoost: false },
        mysterious: { stability: 0.8, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        gentle: { stability: 0.88, similarityBoost: 0.9, style: 0.35, speakerBoost: false }
      },
      language: 'tr',
      gender: 'female',
      age: 'adult'
    },

    wolf: {
      character: 'wolf',
      voiceId: 'onwK4e9ZLuTAKqWW03F9',
      model: 'elevenlabs',
      emotions: {
        mysterious: { stability: 0.8, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        angry: { stability: 0.7, similarityBoost: 0.8, style: 0.5, speakerBoost: false },
        scared: { stability: 0.75, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        calm: { stability: 0.85, similarityBoost: 0.9, style: 0.35, speakerBoost: false },
        happy: { stability: 0.82, similarityBoost: 0.88, style: 0.45, speakerBoost: false },
        excited: { stability: 0.75, similarityBoost: 0.85, style: 0.55, speakerBoost: false },
        loving: { stability: 0.85, similarityBoost: 0.9, style: 0.4, speakerBoost: false },
        sad: { stability: 0.85, similarityBoost: 0.9, style: 0.3, speakerBoost: false },
        gentle: { stability: 0.88, similarityBoost: 0.9, style: 0.35, speakerBoost: false }
      },
      language: 'tr',
      gender: 'male',
      age: 'adult'
    },

    grandmother: {
      character: 'grandmother',
      voiceId: 'AZnzlk1XvdvUeBnXmlld',
      model: 'elevenlabs',
      emotions: {
        loving: { stability: 0.85, similarityBoost: 0.9, style: 0.4, speakerBoost: false },
        calm: { stability: 0.85, similarityBoost: 0.9, style: 0.35, speakerBoost: false },
        scared: { stability: 0.75, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        sad: { stability: 0.85, similarityBoost: 0.9, style: 0.3, speakerBoost: false },
        happy: { stability: 0.82, similarityBoost: 0.88, style: 0.45, speakerBoost: false },
        excited: { stability: 0.75, similarityBoost: 0.85, style: 0.55, speakerBoost: false },
        angry: { stability: 0.7, similarityBoost: 0.8, style: 0.45, speakerBoost: false },
        mysterious: { stability: 0.8, similarityBoost: 0.85, style: 0.4, speakerBoost: false },
        gentle: { stability: 0.88, similarityBoost: 0.9, style: 0.35, speakerBoost: false }
      },
      language: 'tr',
      gender: 'female',
      age: 'elderly'
    }
  };

  // 🚫 NO TEXT MODIFICATION - CLEAN VERSION
  private optimizeTextForTurkish(text: string, emotion: string): string {
    // Just return clean text without ANY modifications
    return text.trim().replace(/\s+/g, ' ');
  }

  // Generate audio using backend API
  private async generateAIAudio(
    text: string, 
    voiceConfig: AIVoiceConfig, 
    emotion: string
  ): Promise<string> {
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7da483db/generate-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          text: text, // 🚫 NO OPTIMIZATION - SEND RAW TEXT
          character: voiceConfig.character,
          emotion: emotion,
          model: voiceConfig.model
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        // Check if fallback was used
        if (result.usedFallback && result.audioUrl === 'BROWSER_SYNTHESIS') {
          console.log('🔄 API temporarily unavailable - using browser synthesis');
          return 'BROWSER_SYNTHESIS';
        }
        throw new Error(result.error || 'Voice generation failed');
      }

      // Check if fallback was used successfully
      if (result.usedFallback) {
        console.log('🔄 Used fallback voice system successfully');
      }

      if (!result.audioUrl || typeof result.audioUrl !== 'string') {
        throw new Error('Backend returned invalid audio URL');
      }

      if (result.audioUrl === 'BROWSER_SYNTHESIS') {
        return 'BROWSER_SYNTHESIS';
      }

      if (!result.audioUrl.startsWith('data:audio/') || result.audioUrl.length < 100) {
        throw new Error('Backend returned malformed audio data URL');
      }

      return result.audioUrl;
    } catch (error) {
      return 'DEMO_MODE_FALLBACK';
    }
  }

  // Main speak function
  async speak(storyAudio: StoryAudio): Promise<void>;
  async speak(text: string, options?: { voiceId?: string; character?: string; emotion?: string }): Promise<void>;
  async speak(
    storyAudioOrText: StoryAudio | string, 
    options?: { voiceId?: string; character?: string; emotion?: string }
  ): Promise<void> {
    try {
      if (!this.isCurrentlyPlaying) {
        return;
      }

      let storyAudio: StoryAudio;
      
      // Handle string input with options
      if (typeof storyAudioOrText === 'string') {
        storyAudio = {
          id: 'quick-' + Date.now(),
          text: storyAudioOrText,
          character: options?.character || 'narrator',
          emotion: (options?.emotion as any) || 'happy'
        };
      } else {
        // Handle StoryAudio object
        storyAudio = storyAudioOrText;
      }

      const voiceConfig = this.aiVoices[storyAudio.character] || this.aiVoices.narrator;
      
      // 🚫 NO TEXT OPTIMIZATION - USE RAW TEXT
      const cleanText = storyAudio.text.trim().replace(/\s+/g, ' ');
      
      // 🔍 DEBUG FRONTEND - LOG EXACTLY WHAT WE'RE SENDING
      console.log('🎭 FRONTEND SENDING TO BACKEND:', {
        originalText: storyAudio.text,
        cleanText: cleanText,
        character: storyAudio.character,
        emotion: storyAudio.emotion,
        sameText: storyAudio.text === cleanText
      });
      
      const cacheKey = `${storyAudio.character}-${storyAudio.emotion}-${cleanText}`;
      
      let audioUrl = this.audioCache.get(cacheKey);
      
      if (!audioUrl) {
        audioUrl = await this.generateAIAudio(cleanText, voiceConfig, storyAudio.emotion);
        this.audioCache.set(cacheKey, audioUrl);
      }
      
      if (!this.isCurrentlyPlaying) {
        return;
      }
      
      await this.playAudio(audioUrl, cleanText);
      
    } catch (error) {
      if (this.isCurrentlyPlaying) {
        this.fallbackSpeak(typeof storyAudioOrText === 'string' ? storyAudioOrText : storyAudioOrText.text);
      }
    }
  }

  // Play generated audio
  private async playAudio(audioUrl: string, text?: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isCurrentlyPlaying) {
        resolve();
        return;
      }

      if (!audioUrl || typeof audioUrl !== 'string') {
        this.fallbackToSimpleTTS();
        resolve();
        return;
      }

      if (audioUrl === 'DEMO_MODE_FALLBACK') {
        // 🔊 Demo mode - use browser synthesis instead of silent
        console.log('🔊 Demo mode - using browser synthesis');
        if (text) {
          this.useBrowserSynthesis(text);
        }
        const demoTimeout = setTimeout(() => {
          this.activeTimeouts.delete(demoTimeout);
          resolve();
        }, 1500 + Math.random() * 2000);
        
        this.activeTimeouts.add(demoTimeout);
        return;
      }

      if (audioUrl === 'BROWSER_SYNTHESIS') {
        console.log('🔊 Using browser speech synthesis fallback');
        if (text) {
          this.useBrowserSynthesis(text);
        }
        resolve();
        return;
      }

      if (!audioUrl.startsWith('data:audio/') || audioUrl.length < 50) {
        this.fallbackToSimpleTTS();
        resolve();
        return;
      }

      if (audioUrl.startsWith('data:audio/')) {
        try {
          const audio = new Audio();
          this.activeAudioElements.add(audio);
          
          audio.onended = () => {
            this.activeAudioElements.delete(audio);
            resolve();
          };
          
          audio.onerror = () => {
            this.activeAudioElements.delete(audio);
            
            try {
              audio.src = '';
              audio.removeAttribute('src');
            } catch (cleanupError) {
              // Silent cleanup
            }
            
            if (this.isCurrentlyPlaying) {
              this.fallbackToSimpleTTS();
            }
            
            resolve();
          };

          if (!this.isCurrentlyPlaying) {
            this.activeAudioElements.delete(audio);
            resolve();
            return;
          }

          audio.volume = 0.8;
          audio.preload = 'auto';
          audio.src = audioUrl;
          
          audio.play().catch(() => {
            this.activeAudioElements.delete(audio);
            
            if (this.isCurrentlyPlaying) {
              this.fallbackToSimpleTTS();
            }
            
            resolve();
          });
        } catch (error) {
          this.fallbackToSimpleTTS();
          resolve();
        }
      } else {
        this.fallbackToSimpleTTS();
        resolve();
      }
    });
  }

  // Browser speech synthesis fallback
  private useBrowserSynthesis(text: string): void {
    try {
      if (!('speechSynthesis' in window)) {
        console.log('🚫 Browser speech synthesis not available');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Try to find a Turkish voice
      const voices = speechSynthesis.getVoices();
      const turkishVoice = voices.find(voice => 
        voice.lang.startsWith('tr') || voice.name.includes('Turkish')
      );
      
      if (turkishVoice) {
        utterance.voice = turkishVoice;
      }

      speechSynthesis.speak(utterance);
      console.log('🔊 Using browser speech synthesis for Turkish');
    } catch (error) {
      console.error('🚨 Browser synthesis failed:', error);
    }
  }

  // 🚫 SILENT FALLBACK - NO EXTRA SPEECH
  private fallbackToSimpleTTS(): void {
    // COMPLETELY SILENT - NO FALLBACK SPEECH
    return;
  }

  // 🚫 SILENT FALLBACK - NO EXTRA SPEECH
  private fallbackSpeak(text: string): void {
    // Use browser synthesis as fallback for letter pronunciation
    console.log('🔄 Using browser fallback for:', text);
    this.useBrowserSynthesis(text);
  }

  // Quick preview sounds for UI feedback
  async quickSpeak(text: string, character: string = 'narrator'): Promise<void> {
    const shortAudio: StoryAudio = {
      id: 'quick-' + Date.now(),
      text: text.substring(0, 50),
      character,
      emotion: 'happy'
    };
    
    await this.speak(shortAudio);
  }

  // 🚨 SILENT AGGRESSIVE STOP
  stop(): void {
    try {
      this.isCurrentlyPlaying = false;
      
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      this.activeAudioElements.forEach(audio => {
        try {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
          audio.src = '';
        } catch (error) {
          // Silent cleanup
        }
      });
      this.activeAudioElements.clear();
      
      this.activeTimeouts.forEach(timeout => {
        clearTimeout(timeout);
      });
      this.activeTimeouts.clear();
      
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        try {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
          }
        } catch (error) {
          // Silent cleanup
        }
      });
      
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if ('speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
        }, i * 100);
      }
    } catch (error) {
      // Silent error
    }
  }

  // Start playing mode
  start(): void {
    this.isCurrentlyPlaying = true;
  }

  // Check if currently playing
  isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  // Connect to AI voice service
  async connect(apiKey: string): Promise<boolean> {
    this.apiKey = apiKey;
    this.isConnected = true;
    return true;
  }

  // Check if AI voice is available
  isAvailable(): boolean {
    return this.isConnected;
  }

  // Story-specific speak function
  async speakStory(storyAudio: StoryAudio): Promise<void> {
    return this.speak(storyAudio);
  }

  // Get system information
  getSystemInfo(): {
    connected: boolean;
    voices: number;
    model: string;
    cache: number;
    playing: boolean;
    activeAudio: number;
    activeTimeouts: number;
  } {
    return {
      connected: this.isConnected,
      voices: Object.keys(this.aiVoices).length,
      model: 'ElevenLabs + OpenAI',
      cache: this.audioCache.size,
      playing: this.isCurrentlyPlaying,
      activeAudio: this.activeAudioElements.size,
      activeTimeouts: this.activeTimeouts.size
    };
  }

  // Clear audio cache
  clearCache(): void {
    this.audioCache.clear();
    console.log('🧹 Audio cache cleared - fresh emotions loaded!');
  }

  // Get detailed system info from backend
  async getDetailedSystemInfo(): Promise<any> {
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7da483db/voice-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.warn('Failed to get detailed system info:', error);
      return {
        available: false,
        services: {
          elevenlabs: false,
          openai: false
        },
        characters: ['narrator', 'girl', 'mother', 'wolf', 'grandmother'],
        emotions: ['happy', 'sad', 'excited', 'calm', 'mysterious', 'scared', 'angry', 'loving'],
        error: String(error)
      };
    }
  }

  // 🧹 Clear backend cache too
  async clearAllCaches(): Promise<void> {
    try {
      // Clear frontend cache
      this.clearCache();
      
      // Clear backend cache
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7da483db/clear-voice-cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🧹 Backend cache cleared:', result.message);
      } else {
        console.warn('🚨 Backend cache clear failed:', response.statusText);
      }
    } catch (error) {
      console.warn('🚨 Cache clear error:', error);
    }
  }

  // Demo mode - works without API keys
  enableDemoMode(): void {
    this.isConnected = true;
    this.isCurrentlyPlaying = true;
    this.preWarmDemo();
  }

  // Pre-warm demo system
  private preWarmDemo(): void {
    try {
      const demoTexts = ['Merhaba', 'Test', 'Demo'];
      demoTexts.forEach(text => {
        const cacheKey = `demo_${text}`;
        this.audioCache.set(cacheKey, 'DEMO_MODE_FALLBACK');
      });
    } catch (error) {
      // Silent error
    }
  }
}

// Export singleton instance
export const aiVoiceManager = new AIVoiceManager();

// Auto-enable demo mode for development
if (typeof window !== 'undefined') {
  aiVoiceManager.enableDemoMode();
  
  // 🧹 Clear ALL caches on load to apply new emotion settings
  aiVoiceManager.clearAllCaches();
}