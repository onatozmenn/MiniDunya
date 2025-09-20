/**
 * Simple Turkish Speech Manager using Web Speech API
 * Replaces complex Voicemaker system with reliable browser synthesis
 */

class TurkishSpeechManager {
  private isInitialized: boolean = false;
  private turkishVoices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking: boolean = false;
  private speechQueue: Array<{ text: string; volume: number; resolve: () => void }> = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🎤 Initializing Turkish Speech Manager...');

    // Wait for voices to load
    if ('speechSynthesis' in window) {
      // Load voices
      await this.loadVoices();
      
      // Listen for voice changes
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };

      this.isInitialized = true;
      console.log('✅ Turkish Speech Manager ready!');
      console.log(`🎤 Found ${this.turkishVoices.length} Turkish voices`);
      console.log('🌟 Preferred voice:', this.preferredVoice?.name || 'Default');
    } else {
      console.warn('⚠️ Speech synthesis not supported in this browser');
    }
  }

  private loadVoices(): void {
    const voices = speechSynthesis.getVoices();
    
    // Find Turkish voices with quality scoring
    const turkishVoicesWithScore = voices
      .filter(voice => voice.lang.startsWith('tr') || voice.lang.startsWith('TR'))
      .map(voice => ({
        voice,
        score: this.calculateVoiceQuality(voice)
      }))
      .sort((a, b) => b.score - a.score);

    this.turkishVoices = turkishVoicesWithScore.map(item => item.voice);

    // Select best quality Turkish voice
    this.preferredVoice = turkishVoicesWithScore.length > 0 
      ? turkishVoicesWithScore[0].voice 
      : this.findFallbackVoice(voices);

    console.log('🎤 Voice quality analysis:', turkishVoicesWithScore.map(item => ({
      name: item.voice.name,
      lang: item.voice.lang,
      score: item.score,
      isLocal: item.voice.localService,
      isSelected: item.voice === this.preferredVoice
    })));
  }

  /**
   * Calculate voice quality score based on various factors
   */
  private calculateVoiceQuality(voice: SpeechSynthesisVoice): number {
    let score = 0;
    
    // Prefer local voices (better quality, no network issues)
    if (voice.localService) score += 50;
    
    // Language preference (exact match is better)
    if (voice.lang === 'tr-TR') score += 40;
    else if (voice.lang === 'tr') score += 30;
    
    // Voice name quality indicators
    const name = voice.name.toLowerCase();
    
    // Prefer natural-sounding voices
    if (name.includes('natural')) score += 30;
    if (name.includes('enhanced')) score += 25;
    if (name.includes('premium')) score += 20;
    if (name.includes('neural')) score += 30;
    
    // Gender preference (female voices often sound better for kids)
    if (name.includes('female') || name.includes('kadın') || name.includes('woman')) score += 15;
    
    // Avoid robotic-sounding voices
    if (name.includes('robot')) score -= 30;
    if (name.includes('synthetic')) score -= 20;
    if (name.includes('default')) score -= 15;
    
    // Platform-specific quality indicators
    if (name.includes('siri')) score += 25; // Apple voices are generally good
    if (name.includes('cortana')) score += 15; // Microsoft voices
    if (name.includes('google')) score += 10; // Google voices
    
    // Prefer voices with Turkish names
    if (name.includes('emel') || name.includes('ayşe') || name.includes('fatma') || name.includes('zeynep')) score += 20;
    
    return Math.max(0, score);
  }

  /**
   * Find best fallback voice if no Turkish voices available
   */
  private findFallbackVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // Try English voices as fallback (often higher quality)
    const englishVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && voice.localService
    ).sort((a, b) => this.calculateVoiceQuality(b) - this.calculateVoiceQuality(a));
    
    if (englishVoices.length > 0) {
      console.log('🔄 Using high-quality English voice as fallback');
      return englishVoices[0];
    }
    
    // Last resort: any local voice
    const localVoices = voices.filter(voice => voice.localService);
    return localVoices[0] || voices[0] || null;
  }

  /**
   * Gracefully stop current speech without errors
   */
  private gracefulStop(): void {
    if (this.currentUtterance) {
      try {
        // Set flag to prevent error handling
        this.isCurrentlySpeaking = false;
        
        // Stop the current utterance gracefully
        if ('speechSynthesis' in window && speechSynthesis.speaking) {
          speechSynthesis.cancel();
        }
        
        this.currentUtterance = null;
      } catch (error) {
        // Ignore graceful stop errors
        console.log('🔇 Graceful stop completed');
      }
    }
  }

  /**
   * Add debouncing to prevent rapid speech requests
   */
  private debounceTimeout: number | null = null;
  private lastSpeechText: string = '';
  private lastSpeechTime: number = 0;

  /**
   * Speak Turkish text with optimized settings and error handling
   */
  public speak(text: string, volume: number = 0.8): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('⚠️ Speech synthesis not supported');
        resolve();
        return;
      }

      // Check if voice settings are enabled
      const savedSettings = localStorage.getItem('sevsamut-voice-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (!settings.enabled) {
          console.log('🔇 Voice disabled by user settings');
          resolve();
          return;
        }
      }

      // Debounce rapid identical requests
      const currentTime = Date.now();
      if (text === this.lastSpeechText && (currentTime - this.lastSpeechTime) < 500) {
        console.log('🔇 Debounced duplicate speech request:', text);
        resolve();
        return;
      }

      this.lastSpeechText = text;
      this.lastSpeechTime = currentTime;

      // Gracefully stop any current speech
      this.gracefulStop();

      // Clear any existing debounce
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }

      // Short delay to ensure previous speech is fully stopped
      this.debounceTimeout = setTimeout(() => {
        this.performSpeech(text, volume, resolve);
      }, 100);
    });
  }

  /**
   * Perform the actual speech synthesis
   */
  private performSpeech(text: string, volume: number, resolve: () => void): void {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    
    // Use preferred Turkish voice
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    // ÇOCUK DOSTU OPTIMIZE EDİLMİŞ PARAMETRELER
    utterance.lang = this.preferredVoice?.lang || 'tr-TR';
    utterance.rate = this.getOptimalRate(text);
    utterance.pitch = this.getOptimalPitch(text);
    utterance.volume = Math.max(0.1, Math.min(1.0, volume));

    let hasEnded = false;
    this.isCurrentlySpeaking = true;
    
    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (!hasEnded && this.isCurrentlySpeaking) {
        console.log('🕐 Speech timeout - completing gracefully');
        hasEnded = true;
        this.isCurrentlySpeaking = false;
        this.currentUtterance = null;
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
        resolve();
      }
    }, Math.max(3000, text.length * 80));

    // Success handler
    utterance.onend = () => {
      if (!hasEnded) {
        console.log('✅ Speech completed successfully:', text.substring(0, 30) + (text.length > 30 ? '...' : ''));
        hasEnded = true;
        this.isCurrentlySpeaking = false;
        this.currentUtterance = null;
        clearTimeout(timeoutId);
        resolve();
      }
    };
    
    // Enhanced error handler for "interrupted" errors
    utterance.onerror = (error: SpeechSynthesisErrorEvent) => {
      const errorType = error.error || 'unknown';
      
      // Don't log "interrupted" errors as warnings - they're expected during rapid clicking
      if (errorType === 'interrupted') {
        console.log('🔄 Speech interrupted (normal for rapid clicks)');
      } else {
        console.warn('⚠️ Speech error:', {
          error: errorType,
          text: text.substring(0, 20) + '...'
        });
      }
      
      if (!hasEnded) {
        hasEnded = true;
        this.isCurrentlySpeaking = false;
        this.currentUtterance = null;
        clearTimeout(timeoutId);
        
        // For interrupted errors, just resolve without retrying
        if (errorType === 'interrupted') {
          resolve();
        } else {
          // For other errors, try simple fallback
          this.handleSpeechError(error, text, volume, resolve);
        }
      }
    };

    utterance.onstart = () => {
      if (this.isCurrentlySpeaking) {
        console.log('🎤 Started speaking:', text.substring(0, 30) + (text.length > 30 ? '...' : ''));
      }
    };

    // Perform speech synthesis
    try {
      speechSynthesis.speak(utterance);
      
      // Verification check
      setTimeout(() => {
        if (this.isCurrentlySpeaking && !speechSynthesis.speaking && !speechSynthesis.pending && !hasEnded) {
          console.log('🔧 Speech synthesis inactive - resolving gracefully');
          hasEnded = true;
          this.isCurrentlySpeaking = false;
          this.currentUtterance = null;
          clearTimeout(timeoutId);
          resolve();
        }
      }, 200);
      
    } catch (err) {
      console.warn('💥 Speech synthesis failed:', err);
      hasEnded = true;
      this.isCurrentlySpeaking = false;
      this.currentUtterance = null;
      clearTimeout(timeoutId);
      resolve();
    }
  }

  /**
   * Get optimal speech rate based on content
   */
  private getOptimalRate(text: string): number {
    // Çocuklar için her zaman yavaş
    const baseRate = 0.7;
    
    // Alfabe harfleri için daha yavaş
    if (text.length <= 2 && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ]+$/.test(text)) {
      return 0.5; // Harfler için çok yavaş
    }
    
    // Kısa kelimeler için biraz yavaş
    if (text.length <= 10) {
      return 0.6;
    }
    
    // Uzun cümleler için normal yavaş
    return baseRate;
  }

  /**
   * Get optimal pitch for pleasant sound
   */
  private getOptimalPitch(text: string): number {
    // Temel ��ocuk dostu pitch
    let basePitch = 1.2;
    
    // Kadın sesi kullanıyorsak biraz daha tatlı
    if (this.preferredVoice?.name.toLowerCase().includes('female') ||
        this.preferredVoice?.name.toLowerCase().includes('kadın') ||
        this.preferredVoice?.name.toLowerCase().includes('woman')) {
      basePitch = 1.15; // Kadın sesleri için daha az pitch
    }
    
    // Erkek sesi kullanıyorsak daha yüksek pitch
    if (this.preferredVoice?.name.toLowerCase().includes('male') ||
        this.preferredVoice?.name.toLowerCase().includes('erkek')) {
      basePitch = 1.3; // Erkek sesleri için daha yüksek pitch
    }
    
    // Ünlem işaretli cümleler için daha heyecanlı
    if (text.includes('!')) {
      basePitch += 0.1;
    }
    
    // Soru için biraz daha yüksek
    if (text.includes('?')) {
      basePitch += 0.05;
    }
    
    return Math.max(0.8, Math.min(2.0, basePitch));
  }

  /**
   * Handle speech errors with fallback strategies
   */
  private handleSpeechError(error: SpeechSynthesisErrorEvent, text: string, volume: number, resolve: () => void): void {
    const errorType = error.error || 'unknown';
    
    console.log('🔧 Handling speech error:', errorType);
    
    switch (errorType) {
      case 'network':
        console.log('🌐 Network error - retrying in 500ms...');
        setTimeout(() => {
          this.tryAlternativeSpeech(text, volume, resolve);
        }, 500);
        break;
        
      case 'synthesis-failed':
      case 'synthesis-unavailable':
        console.log('🎤 Synthesis failed - trying with different settings...');
        this.tryAlternativeSpeech(text, volume, resolve);
        break;
        
      case 'audio-busy':
        console.log('🔊 Audio busy - retrying in 200ms...');
        setTimeout(() => {
          resolve(); // Just resolve to not block the flow
        }, 200);
        break;
        
      default:
        console.log('❓ Unknown speech error - resolving silently');
        resolve();
        break;
    }
  }

  /**
   * Try alternative speech synthesis with simplified settings
   */
  private tryAlternativeSpeech(text: string, volume: number, resolve: () => void): void {
    try {
      console.log('🔄 Trying alternative speech synthesis...');
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use simplified settings
      utterance.lang = 'tr'; // Simplified language code
      utterance.rate = 1.0;   // Default rate
      utterance.pitch = 1.0;  // Default pitch  
      utterance.volume = volume;
      utterance.voice = null; // Use system default
      
      utterance.onend = () => {
        console.log('✅ Alternative speech completed');
        resolve();
      };
      
      utterance.onerror = () => {
        console.log('❌ Alternative speech failed - giving up gracefully');
        resolve(); // Still resolve to not break flow
      };
      
      speechSynthesis.speak(utterance);
      
    } catch (err) {
      console.log('💥 Alternative speech also failed:', err);
      resolve(); // Always resolve to not break the app
    }
  }

  /**
   * Speak Turkish alphabet letter with special handling
   */
  public speakLetter(letter: string, volume: number = 0.8): Promise<void> {
    // Special pronunciation mappings for Turkish alphabet
    const letterMappings: { [key: string]: string } = {
      'ç': 'çe',
      'ğ': 'yumuşak ge',
      'ı': 'ı',
      'İ': 'İ',
      'ö': 'ö',
      'ş': 'şe',
      'ü': 'ü',
      'A': 'A',
      'B': 'Be',
      'C': 'Ce',
      'D': 'De',
      'E': 'E',
      'F': 'Fe',
      'G': 'Ge',
      'H': 'He',
      'J': 'Je',
      'K': 'Ke',
      'L': 'Le',
      'M': 'Me',
      'N': 'Ne',
      'O': 'O',
      'P': 'Pe',
      'R': 'Re',
      'S': 'Se',
      'T': 'Te',
      'U': 'U',
      'V': 'Ve',
      'Y': 'Ye',
      'Z': 'Ze'
    };

    const textToSpeak = letterMappings[letter] || letter;
    return this.speak(textToSpeak, volume);
  }

  /**
   * Stop any current speech gracefully
   */
  public stop(): void {
    this.gracefulStop();
    
    // Clear any pending debounce
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    // Reset state
    this.isCurrentlySpeaking = false;
    this.currentUtterance = null;
    this.lastSpeechText = '';
    this.lastSpeechTime = 0;
    
    console.log('🛑 Speech system stopped and reset');
  }

  /**
   * Check if Turkish speech is available
   */
  public isAvailable(): boolean {
    return 'speechSynthesis' in window && this.isInitialized;
  }

  /**
   * Get current voice info
   */
  public getCurrentVoiceInfo(): { name: string; lang: string } | null {
    if (this.preferredVoice) {
      return {
        name: this.preferredVoice.name,
        lang: this.preferredVoice.lang
      };
    }
    return null;
  }

  /**
   * Speak Turkish word with natural pauses
   */
  public async speakWords(words: string[], volume: number = 0.8, pauseBetween: number = 500): Promise<void> {
    for (let i = 0; i < words.length; i++) {
      await this.speak(words[i], volume);
      
      // Pause between words (except for last word)
      if (i < words.length - 1) {
        await new Promise(resolve => setTimeout(resolve, pauseBetween));
      }
    }
  }

  /**
   * Speak sentence with natural rhythm
   */
  public speakSentence(sentence: string, volume: number = 0.8): Promise<void> {
    // Add natural pauses at punctuation
    const enhancedSentence = sentence
      .replace(/,/g, ', ') // Add space after commas
      .replace(/\./g, '. ') // Add space after periods
      .replace(/!/g, '! ') // Add space after exclamations
      .replace(/\?/g, '? ') // Add space after questions
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();

    return this.speak(enhancedSentence, volume);
  }
}

// Create singleton instance
export const turkishSpeech = new TurkishSpeechManager();

// Export class for advanced usage
export { TurkishSpeechManager };