/**
 * SevSaMut Premium Story Voice Manager
 * Advanced text-to-speech for interactive storytelling
 * Turkish optimized with emotional voice modulation
 */

export interface VoiceConfig {
  character: string;
  pitch: number;
  rate: number;
  volume: number;
  lang: string;
  prosody: string;
}

export interface StoryAudio {
  id: string;
  text: string;
  character: string;
  emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'mysterious' | 'scared' | 'angry' | 'loving';
}

class StoryVoiceManager {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;
  private bestTurkishVoice: SpeechSynthesisVoice | null = null;

  // Premium character voice configurations - Highly tuned for Turkish storytelling
  private characterVoices: Record<string, VoiceConfig> = {
    narrator: {
      character: 'narrator',
      pitch: 0.95,      // Slightly lower for authority
      rate: 0.75,       // Slow, clear storytelling pace
      volume: 1.0,
      lang: 'tr-TR',
      prosody: 'storytelling'
    },
    girl: {
      character: 'girl',
      pitch: 1.6,       // High pitch for young girl
      rate: 1.0,        // Normal speed, energetic
      volume: 0.9,
      lang: 'tr-TR',
      prosody: 'youthful'
    },
    mother: {
      character: 'mother',
      pitch: 1.15,      // Gentle, caring tone
      rate: 0.8,        // Calm, measured
      volume: 0.95,
      lang: 'tr-TR',
      prosody: 'caring'
    },
    wolf: {
      character: 'wolf',
      pitch: 0.5,       // Very deep for wolf
      rate: 0.7,        // Slow, menacing
      volume: 1.0,
      lang: 'tr-TR',
      prosody: 'mysterious'
    },
    grandmother: {
      character: 'grandmother',
      pitch: 1.4,       // Higher but wavering
      rate: 0.6,        // Slower for elderly
      volume: 0.85,
      lang: 'tr-TR',
      prosody: 'elderly'
    }
  };

  // Advanced emotion system with micro-adjustments
  private emotionModifiers = {
    happy: { 
      pitchMultiplier: 1.15, 
      rateMultiplier: 1.05, 
      volumeMultiplier: 1.0,
      pauseMultiplier: 0.9,
      intonation: 'upward'
    },
    sad: { 
      pitchMultiplier: 0.8, 
      rateMultiplier: 0.7, 
      volumeMultiplier: 0.85,
      pauseMultiplier: 1.5,
      intonation: 'downward'
    },
    excited: { 
      pitchMultiplier: 1.3, 
      rateMultiplier: 1.3, 
      volumeMultiplier: 1.0,
      pauseMultiplier: 0.5,
      intonation: 'rising'
    },
    calm: { 
      pitchMultiplier: 1.0, 
      rateMultiplier: 0.95, 
      volumeMultiplier: 0.95,
      pauseMultiplier: 1.0,
      intonation: 'steady'
    },
    mysterious: { 
      pitchMultiplier: 0.85, 
      rateMultiplier: 0.65, 
      volumeMultiplier: 0.8,
      pauseMultiplier: 2.0,
      intonation: 'whisper'
    },
    scared: { 
      pitchMultiplier: 1.4, 
      rateMultiplier: 1.2, 
      volumeMultiplier: 0.8,
      pauseMultiplier: 0.9,
      intonation: 'shaky'
    },
    angry: { 
      pitchMultiplier: 0.7, 
      rateMultiplier: 1.1, 
      volumeMultiplier: 1.0,
      pauseMultiplier: 0.6,
      intonation: 'harsh'
    },
    loving: { 
      pitchMultiplier: 1.1, 
      rateMultiplier: 0.9, 
      volumeMultiplier: 0.95,
      pauseMultiplier: 1.1,
      intonation: 'warm'
    }
  };

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoicesAttempt = () => {
        const availableVoices = this.synth.getVoices();
        
        if (availableVoices.length > 0) {
          this.voices = availableVoices;
          this.bestTurkishVoice = this.findBestTurkishVoice();
          this.isLoaded = true;
          
          console.log(`🎙️ Voice system loaded! Found ${availableVoices.length} voices`);
          console.log(`🇹🇷 Best Turkish voice: ${this.bestTurkishVoice?.name || 'Default'}`);
          
          resolve();
        } else {
          // Voices not loaded yet, wait for the event
          this.synth.addEventListener('voiceschanged', () => {
            this.voices = this.synth.getVoices();
            this.bestTurkishVoice = this.findBestTurkishVoice();
            this.isLoaded = true;
            
            console.log(`🎙️ Voice system loaded! Found ${this.voices.length} voices`);
            console.log(`🇹🇷 Best Turkish voice: ${this.bestTurkishVoice?.name || 'Default'}`);
            
            resolve();
          }, { once: true });
        }
      };

      loadVoicesAttempt();
    });
  }

  private findBestTurkishVoice(): SpeechSynthesisVoice | null {
    // Priority order for Turkish voice selection
    const priorities = [
      'tr-TR',     // Turkish (Turkey)
      'tr',        // Turkish (generic)
      'en-US',     // Fallback to clear English
      'en'         // Generic English fallback
    ];

    for (const langCode of priorities) {
      // Find exact match
      const exactMatch = this.voices.find(voice => 
        voice.lang === langCode && voice.localService
      );
      if (exactMatch) return exactMatch;

      // Find partial match with local service
      const localMatch = this.voices.find(voice => 
        voice.lang.startsWith(langCode) && voice.localService
      );
      if (localMatch) return localMatch;

      // Find any match
      const anyMatch = this.voices.find(voice => 
        voice.lang.startsWith(langCode)
      );
      if (anyMatch) return anyMatch;
    }

    // Return first available voice as last resort
    return this.voices[0] || null;
  }

  // 🚫 NO TEXT PREPROCESSING - CLEAN VERSION
  private preprocessText(text: string, emotion: string): string {
    // Just return clean text without ANY modifications  
    return text.trim().replace(/\s+/g, ' ');
  }

  async speak(storyAudio: StoryAudio): Promise<void> {
    // Stop any current speech
    this.stop();
    
    // Wait for voices to load
    if (!this.isLoaded) {
      await this.loadVoices();
    }

    try {
      await this.speakWithTTS(storyAudio);
    } catch (error) {
      console.warn('TTS failed:', error);
      // Continue without blocking
    }
  }

  private async speakWithTTS(storyAudio: StoryAudio): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('Speech synthesis not available');
        resolve();
        return;
      }

      // Stop any current speech
      this.synth.cancel();
      
      // Process text for natural delivery
      const processedText = this.preprocessText(storyAudio.text, storyAudio.emotion);
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Get character voice config
        const voiceConfig = this.characterVoices[storyAudio.character] || this.characterVoices.narrator;
        const emotionModifier = this.emotionModifiers[storyAudio.emotion];
        
        // Calculate final voice parameters
        const finalPitch = Math.max(0.1, Math.min(2.0, 
          voiceConfig.pitch * emotionModifier.pitchMultiplier
        ));
        const finalRate = Math.max(0.1, Math.min(3.0, 
          voiceConfig.rate * emotionModifier.rateMultiplier
        ));
        const finalVolume = Math.max(0.1, Math.min(1.0, 
          voiceConfig.volume * emotionModifier.volumeMultiplier
        ));
        
        // Apply voice settings
        utterance.pitch = finalPitch;
        utterance.rate = finalRate;
        utterance.volume = finalVolume;
        utterance.lang = voiceConfig.lang;
        
        // Use best Turkish voice
        if (this.bestTurkishVoice) {
          utterance.voice = this.bestTurkishVoice;
        }

        // Enhanced error handling
        let isResolved = false;
        
        const cleanup = () => {
          if (!isResolved) {
            isResolved = true;
            resolve();
          }
        };

        // Safety timeout
        const timeoutId = setTimeout(() => {
          console.log('🕐 Story TTS timeout - continuing...');
          this.synth.cancel();
          cleanup();
        }, Math.max(20000, processedText.length * 150)); // Dynamic timeout

        utterance.onstart = () => {
          const characterEmoji = {
            'narrator': '📖',
            'girl': '👧',
            'mother': '👩‍🦳',
            'wolf': '🐺',
            'grandmother': '👵'
          };
          console.log(`${characterEmoji[storyAudio.character] || '🎙️'} ${storyAudio.character} (${storyAudio.emotion}): "${storyAudio.text.substring(0, 30)}..."`);
        };

        utterance.onend = () => {
          clearTimeout(timeoutId);
          cleanup();
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          clearTimeout(timeoutId);
          console.warn('⚠️ Story TTS error details:', {
            error: event.error || 'unknown',
            message: event.message || 'no message',
            type: event.type || 'no type',
            isTrusted: event.isTrusted,
            character: storyAudio.character,
            emotion: storyAudio.emotion,
            text: storyAudio.text.substring(0, 50) + (storyAudio.text.length > 50 ? '...' : '')
          });
          
          // Try fallback speech with simplified settings
          this.tryStoryFallback(storyAudio, cleanup);
        };

        // Speak with error handling
        try {
          this.synth.speak(utterance);
          
          // Double-check speech is working
          setTimeout(() => {
            if (!this.synth.speaking && !this.synth.pending && !isResolved) {
              console.log('🔧 Story speech not starting, trying fallback...');
              this.tryStoryFallback(storyAudio, cleanup);
            }
          }, 100);
          
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('💥 Story TTS speak error:', error);
          cleanup();
        }
      }, 150); // Small delay for better speech synthesis
    });
  }

  /**
   * Try fallback speech for stories with simplified settings
   */
  private tryStoryFallback(storyAudio: StoryAudio, resolve: () => void): void {
    try {
      console.log('🔄 Trying story speech fallback...');
      
      const utterance = new SpeechSynthesisUtterance(storyAudio.text);
      
      // Use simplified settings
      utterance.lang = 'tr';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.voice = null; // Use system default
      
      utterance.onend = () => {
        console.log('✅ Story fallback speech completed');
        resolve();
      };
      
      utterance.onerror = () => {
        console.log('❌ Story fallback speech failed - giving up gracefully');
        resolve(); // Still resolve to not break story flow
      };
      
      this.synth.speak(utterance);
      
    } catch (err) {
      console.log('💥 Story fallback speech also failed:', err);
      resolve(); // Always resolve to not break the story
    }
  }

  // Quick UI feedback sounds
  quickSpeak(text: string, character: string = 'narrator'): void {
    if (this.synth.speaking) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.4;
    utterance.rate = 1.5;
    utterance.pitch = 1.2;
    
    try {
      this.synth.speak(utterance);
    } catch (error) {
      // Silently fail
    }
  }

  // Stop all speech
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Check if speech is available
  isAvailable(): boolean {
    return 'speechSynthesis' in window && this.synth !== undefined;
  }

  // Get voice system info
  getSystemInfo(): { 
    available: boolean; 
    voiceCount: number; 
    bestVoice: string;
    turkishVoices: number;
  } {
    const turkishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('tr')
    ).length;

    return {
      available: this.isAvailable(),
      voiceCount: this.voices.length,
      bestVoice: this.bestTurkishVoice?.name || 'Default',
      turkishVoices
    };
  }
}

// Singleton instance
export const storyVoiceManager = new StoryVoiceManager();