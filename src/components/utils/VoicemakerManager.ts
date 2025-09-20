// Voicemaker.in API integration for Turkish alphabet pronunciation - BACKEND PROXY
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export class VoicemakerManager {
  private cache = new Map<string, string>(); // Cache for audio URLs
  private isAvailable = false; // Track availability
  private serverUrl: string;

  constructor() {
    this.serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7da483db`;
    console.log('🔑 VoicemakerManager initialized with server URL:', this.serverUrl);
  }

  /**
   * Initialize with server connection test
   */
  async init(): Promise<boolean> {
    console.log('🚀 Initializing Voicemaker via backend...');
    
    try {
      // Test backend connection
      const testResponse = await fetch(`${this.serverUrl}/voicemaker-test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        console.error('🚨 Backend test failed:', testResponse.status);
        return false;
      }

      const testData = await testResponse.json();
      console.log('📋 Backend test response:', testData);

      if (testData.success) {
        this.isAvailable = true;
        console.log('🎉 Voicemaker backend is working! Emel voice available.');
        return true;
      } else {
        console.warn('⚠️ Backend test returned error:', testData.error);
        this.isAvailable = false;
        return false;
      }

    } catch (error) {
      console.error('🌐 Backend connection error:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Generate speech via backend
   */
  async generateSpeech(text: string, options: {
    voice?: string;
    speed?: number;
    volume?: number;
  } = {}): Promise<string | null> {
    
    console.log('🎤 generateSpeech via backend:', text, options);
    
    try {
      // Check cache first
      const cacheKey = `${text}-${options.voice || 'emel'}-${options.speed || -20}`;
      if (this.cache.has(cacheKey)) {
        console.log('💾 Using local cache for:', text);
        return this.cache.get(cacheKey)!;
      }

      console.log('📤 Calling backend for speech generation...');

      const response = await fetch(`${this.serverUrl}/voicemaker-generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice: options.voice || 'tr-TR-EmelNeural',
          speed: options.speed || -20,
          volume: options.volume || 5
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Backend API call failed:', response.status, errorText);
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Backend response:', data);
      
      if (data.success && data.path) {
        this.cache.set(cacheKey, data.path);
        console.log('🌟 SUCCESS! Audio URL from backend:', data.path);
        return data.path;
      } else {
        console.error('🚨 Backend returned invalid data:', data);
        throw new Error(`Backend returned error: ${data.error}`);
      }

    } catch (error) {
      console.error('💥 generateSpeech failed:', error);
      throw error;
    }
  }

  /**
   * Play audio from URL with debug
   */
  async playAudio(audioUrl: string, volume: number = 0.7): Promise<void> {
    console.log('🔊 Playing audio from URL:', audioUrl);
    
    try {
      const audio = new Audio(audioUrl);
      audio.volume = Math.min(Math.max(volume, 0), 1);
      audio.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          console.log('✅ Audio playback completed');
          resolve();
        };
        audio.onerror = (error) => {
          console.error('🚨 Audio playback failed:', error);
          reject(new Error('Audio playback failed'));
        };
        audio.oncanplaythrough = () => {
          console.log('▶️ Starting audio playback...');
          audio.play().catch(reject);
        };
        audio.load();
      });
    } catch (error) {
      console.error('💥 playAudio failed:', error);
      throw error;
    }
  }

  /**
   * Generate and play Turkish letter pronunciation - FORCE EMEL VOICE
   */
  async speakTurkishLetter(letter: string, volume: number = 0.7): Promise<void> {
    console.log('🎯 speakTurkishLetter called for:', letter, 'volume:', volume);
    
    try {
      // Force Emel voice generation via backend
      const audioUrl = await this.generateSpeech(letter, {
        voice: 'tr-TR-EmelNeural',
        speed: -20,
        volume: 5
      });

      if (audioUrl) {
        console.log('🎵 Playing Emel voice audio from backend...');
        await this.playAudio(audioUrl, volume);
        console.log('🎉 Emel voice playback completed for:', letter);
      } else {
        throw new Error('No audio URL generated from backend');
      }
    } catch (error) {
      console.error('💥 speakTurkishLetter failed:', error);
      throw error;
    }
  }

  /**
   * Check if Voicemaker is available
   */
  get available(): boolean {
    console.log('🔍 Checking availability:', this.isAvailable);
    return this.isAvailable;
  }

  /**
   * Preload Turkish alphabet - EMEL VOICE via backend
   */
  async preloadTurkishAlphabet(): Promise<void> {
    console.log('📚 Starting Turkish alphabet preload via backend...');
    
    const turkishLetters = [
      'a', 'be', 'ce', 'çe', 'de', 'e', 'fe', 'ge', 'yumuşak ge', 'he',
      'ı', 'i', 'je', 'ke', 'le', 'me', 'ne', 'o', 'ö', 'pe', 're', 
      'se', 'şe', 'te', 'u', 'ü', 've', 'ye', 'ze'
    ];

    for (const letter of turkishLetters) {
      try {
        await this.generateSpeech(letter, {
          voice: 'tr-TR-EmelNeural',
          speed: -20,
          volume: 5
        });
        console.log('✅ Preloaded via backend:', letter);
        // Small delay to prevent overwhelming the backend
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn('⚠️ Failed to preload:', letter, error);
      }
    }
    
    console.log('🎉 Turkish alphabet preload completed via backend!');
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Turkish voices available
   */
  getTurkishVoices(): Array<{id: string, name: string, gender: string}> {
    return [
      { id: 'tr-TR-EmelNeural', name: 'Emel (BACKEND)', gender: 'female' },
      { id: 'tr-TR-AhmetNeural', name: 'Ahmet (Available)', gender: 'male' },
    ];
  }
}

// Singleton instance
export const voicemakerManager = new VoicemakerManager();