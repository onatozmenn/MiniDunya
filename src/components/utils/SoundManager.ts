// Simple sound manager for kids games
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.7;

  constructor(volume: number = 0.7) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  // Play piano note
  playNote(frequency: number, duration: number = 0.3) {
    if (!this.audioContext || this.volume === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play success sound
  playSuccess() {
    if (!this.audioContext || this.volume === 0) return;

    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playNote(freq, 0.2);
      }, index * 100);
    });
  }

  // Play error sound  
  playError() {
    if (!this.audioContext || this.volume === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Play pop sound
  playPop() {
    if (!this.audioContext || this.volume === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Play drum sound
  playDrum(type: 'kick' | 'snare' | 'hihat' | 'cymbal') {
    if (!this.audioContext || this.volume === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'kick':
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        break;
      case 'snare':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.type = 'white';
        filter.type = 'highpass';
        filter.frequency.value = 300;
        break;
      case 'hihat':
        oscillator.frequency.setValueAtTime(8000, this.audioContext.currentTime);
        oscillator.type = 'square';
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        break;
      case 'cymbal':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        oscillator.type = 'sawtooth';
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        break;
    }

    gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Play realistic animal sounds
  playAnimalSound(animal: string) {
    if (!this.audioContext || this.volume === 0) return;

    switch (animal) {
      case 'cat':
        this.playCatMeow();
        break;
      case 'dog':
        this.playDogWoof();
        break;
      case 'cow':
        this.playCowMoo();
        break;
      case 'pig':
        this.playPigOink();
        break;
      case 'duck':
        this.playDuckQuack();
        break;
      case 'lion':
        this.playLionRoar();
        break;
      case 'elephant':
        this.playElephantTrumpet();
        break;
      case 'bird':
        this.playBirdChirp();
        break;
      case 'frog':
        this.playFrogRibbit();
        break;
      case 'horse':
        this.playHorseNeigh();
        break;
      case 'sheep':
        this.playSheepBaa();
        break;
      case 'chicken':
        this.playChickenCluck();
        break;
      default:
        this.playSuccess(); // Fallback
    }
  }

  private playCatMeow() {
    // More realistic cat meow with multiple formants
    const duration = 0.6;
    const now = this.audioContext!.currentTime;
    
    // Main oscillator for fundamental frequency
    const osc1 = this.audioContext!.createOscillator();
    const gain1 = this.audioContext!.createGain();
    const filter1 = this.audioContext!.createBiquadFilter();
    
    // Second oscillator for harmonics
    const osc2 = this.audioContext!.createOscillator();
    const gain2 = this.audioContext!.createGain();
    
    // Noise for realism
    const noise = this.audioContext!.createOscillator();
    const noiseGain = this.audioContext!.createGain();
    const noiseFilter = this.audioContext!.createBiquadFilter();
    
    // Connect main voice
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.audioContext!.destination);
    
    // Connect harmonics
    osc2.connect(gain2);
    gain2.connect(this.audioContext!.destination);
    
    // Connect noise
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext!.destination);
    
    // Main meow sound - rising then falling
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.linearRampToValueAtTime(440, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(180, now + duration);
    
    // Filter for vocal quality
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(800, now);
    filter1.frequency.linearRampToValueAtTime(1200, now + 0.15);
    filter1.frequency.linearRampToValueAtTime(600, now + duration);
    filter1.Q.value = 2;
    
    // Harmonics
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.linearRampToValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(360, now + duration);
    
    // Add some noise for realism
    noise.type = 'white';
    noise.frequency.value = 100;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2000;
    
    // Volume envelopes
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(this.volume * 0.05, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    // Start all oscillators
    osc1.start(now);
    osc2.start(now);
    noise.start(now);
    
    // Stop all oscillators
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    noise.stop(now + duration);
  }

  private playDogWoof() {
    // Realistic dog bark with attack and growl
    const duration = 0.4;
    const now = this.audioContext!.currentTime;
    
    // Main bark sound
    const osc1 = this.audioContext!.createOscillator();
    const gain1 = this.audioContext!.createGain();
    const filter1 = this.audioContext!.createBiquadFilter();
    
    // Growl component
    const osc2 = this.audioContext!.createOscillator();
    const gain2 = this.audioContext!.createGain();
    
    // Attack noise
    const noise = this.audioContext!.createOscillator();
    const noiseGain = this.audioContext!.createGain();
    const noiseFilter = this.audioContext!.createBiquadFilter();
    
    // Connect main bark
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.audioContext!.destination);
    
    // Connect growl
    osc2.connect(gain2);
    gain2.connect(this.audioContext!.destination);
    
    // Connect noise
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext!.destination);
    
    // Main bark - starts high, drops quickly
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.1);
    osc1.frequency.setValueAtTime(100, now + 0.1);
    
    // Filter for bark quality
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(1500, now);
    filter1.frequency.exponentialRampToValueAtTime(300, now + duration);
    
    // Growl undertone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(80, now);
    osc2.frequency.linearRampToValueAtTime(60, now + duration);
    
    // Attack noise for sharp bark start
    noise.type = 'white';
    noise.frequency.value = 200;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2000;
    noiseFilter.Q.value = 1;
    
    // Sharp attack, quick decay
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc1.start(now);
    osc2.start(now);
    noise.start(now);
    
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    noise.stop(now + 0.05);
  }

  private playCowMoo() {
    // Deep, long cow moo with vibrato
    const duration = 1.2;
    const now = this.audioContext!.currentTime;
    
    // Main moo sound
    const osc1 = this.audioContext!.createOscillator();
    const gain1 = this.audioContext!.createGain();
    const filter1 = this.audioContext!.createBiquadFilter();
    
    // Vibrato LFO
    const lfo = this.audioContext!.createOscillator();
    const lfoGain = this.audioContext!.createGain();
    
    // Sub-harmonic for depth
    const subOsc = this.audioContext!.createOscillator();
    const subGain = this.audioContext!.createGain();
    
    // Connect main moo
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.audioContext!.destination);
    
    // Connect vibrato
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    
    // Connect sub-harmonic
    subOsc.connect(subGain);
    subGain.connect(this.audioContext!.destination);
    
    // Main moo - deep and breathy
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now); // Deep bass note
    osc1.frequency.linearRampToValueAtTime(85, now + 0.3);
    osc1.frequency.linearRampToValueAtTime(95, now + duration);
    
    // Filter for vocal cavity resonance
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(400, now);
    filter1.frequency.linearRampToValueAtTime(250, now + duration);
    filter1.Q.value = 1.5;
    
    // Vibrato for natural cow sound
    lfo.type = 'sine';
    lfo.frequency.value = 4; // 4 Hz vibrato
    lfoGain.gain.value = 8; // Vibrato depth
    
    // Sub-harmonic for rumble
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now); // Octave below
    subOsc.frequency.linearRampToValueAtTime(42.5, now + 0.3);
    subOsc.frequency.linearRampToValueAtTime(47.5, now + duration);
    
    // Volume envelopes - slow attack, long sustain
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.2);
    gain1.gain.setValueAtTime(this.volume * 0.5, now + 0.8);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    // Start oscillators
    osc1.start(now);
    lfo.start(now);
    subOsc.start(now);
    
    // Stop oscillators
    osc1.stop(now + duration);
    lfo.stop(now + duration);
    subOsc.stop(now + duration);
  }

  private playPigOink() {
    // Oink sound: quick nasal sound
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(250, this.audioContext!.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext!.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.25);
    
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + 0.25);
  }

  private playDuckQuack() {
    // Nasal duck quack with multiple quacks
    const duration = 0.6;
    const now = this.audioContext!.currentTime;
    
    // Create 2-3 quick quacks
    for (let i = 0; i < 2; i++) {
      const startTime = now + (i * 0.25);
      const quackDuration = 0.15;
      
      // Main quack oscillator
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const filter = this.audioContext!.createBiquadFilter();
      
      // Nasal formant filter
      const formant = this.audioContext!.createBiquadFilter();
      
      // Connect chain
      osc.connect(filter);
      filter.connect(formant);
      formant.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      // Square wave for nasal quality
      osc.type = 'square';
      osc.frequency.setValueAtTime(350, startTime);
      osc.frequency.linearRampToValueAtTime(280, startTime + quackDuration);
      
      // First filter for basic tone shaping
      filter.type = 'bandpass';
      filter.frequency.value = 600;
      filter.Q.value = 3;
      
      // Formant filter for nasal quality
      formant.type = 'bandpass';
      formant.frequency.value = 1200;
      formant.Q.value = 5;
      
      // Quick attack and decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + quackDuration);
      
      osc.start(startTime);
      osc.stop(startTime + quackDuration);
    }
  }

  private playLionRoar() {
    // Powerful lion roar with growl and rumble
    const duration = 1.5;
    const now = this.audioContext!.currentTime;
    
    // Deep fundamental growl
    const deepOsc = this.audioContext!.createOscillator();
    const deepGain = this.audioContext!.createGain();
    const deepFilter = this.audioContext!.createBiquadFilter();
    
    // Mid-range roar
    const midOsc = this.audioContext!.createOscillator();
    const midGain = this.audioContext!.createGain();
    const midFilter = this.audioContext!.createBiquadFilter();
    
    // High-frequency breath/hiss
    const breathOsc = this.audioContext!.createOscillator();
    const breathGain = this.audioContext!.createGain();
    const breathFilter = this.audioContext!.createBiquadFilter();
    
    // Rumble (sub-bass)
    const rumbleOsc = this.audioContext!.createOscillator();
    const rumbleGain = this.audioContext!.createGain();
    
    // Connect deep growl
    deepOsc.connect(deepFilter);
    deepFilter.connect(deepGain);
    deepGain.connect(this.audioContext!.destination);
    
    // Connect mid roar
    midOsc.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(this.audioContext!.destination);
    
    // Connect breath
    breathOsc.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(this.audioContext!.destination);
    
    // Connect rumble
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.audioContext!.destination);
    
    // Deep growl - sawtooth for harshness
    deepOsc.type = 'sawtooth';
    deepOsc.frequency.setValueAtTime(85, now);
    deepOsc.frequency.linearRampToValueAtTime(120, now + 0.4);
    deepOsc.frequency.linearRampToValueAtTime(70, now + duration);
    
    deepFilter.type = 'lowpass';
    deepFilter.frequency.setValueAtTime(300, now);
    deepFilter.frequency.linearRampToValueAtTime(180, now + duration);
    deepFilter.Q.value = 2;
    
    // Mid-range roar
    midOsc.type = 'triangle';
    midOsc.frequency.setValueAtTime(170, now);
    midOsc.frequency.linearRampToValueAtTime(240, now + 0.4);
    midOsc.frequency.linearRampToValueAtTime(140, now + duration);
    
    midFilter.type = 'bandpass';
    midFilter.frequency.setValueAtTime(600, now);
    midFilter.frequency.linearRampToValueAtTime(400, now + duration);
    midFilter.Q.value = 1.5;
    
    // Breath component
    breathOsc.type = 'white';
    breathOsc.frequency.value = 200;
    
    breathFilter.type = 'highpass';
    breathFilter.frequency.setValueAtTime(1000, now);
    breathFilter.frequency.linearRampToValueAtTime(1500, now + 0.3);
    breathFilter.frequency.linearRampToValueAtTime(800, now + duration);
    
    // Sub-bass rumble
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(45, now);
    rumbleOsc.frequency.linearRampToValueAtTime(35, now + duration);
    
    // Complex envelope - builds up, sustains, then fades
    deepGain.gain.setValueAtTime(0, now);
    deepGain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.3);
    deepGain.gain.setValueAtTime(this.volume * 0.6, now + 0.8);
    deepGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    midGain.gain.setValueAtTime(0, now);
    midGain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.2);
    midGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    breathGain.gain.setValueAtTime(0, now);
    breathGain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.1);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
    
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.2);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    // Start all components
    deepOsc.start(now);
    midOsc.start(now);
    breathOsc.start(now);
    rumbleOsc.start(now);
    
    // Stop all components
    deepOsc.stop(now + duration);
    midOsc.stop(now + duration);
    breathOsc.stop(now + duration * 0.7);
    rumbleOsc.stop(now + duration);
  }

  private playElephantTrumpet() {
    // Trumpet sound: rising high pitch
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext!.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, this.audioContext!.currentTime + 0.4);
    oscillator.frequency.linearRampToValueAtTime(400, this.audioContext!.currentTime + 0.8);
    
    gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext!.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 1.0);
    
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + 1.0);
  }

  private playBirdChirp() {
    // Realistic bird chirping with multiple notes
    const now = this.audioContext!.currentTime;
    const chirpPattern = [
      { freq: 1200, time: 0, duration: 0.08 },
      { freq: 1500, time: 0.1, duration: 0.06 },
      { freq: 1800, time: 0.18, duration: 0.08 },
      { freq: 1400, time: 0.28, duration: 0.1 },
      { freq: 1600, time: 0.4, duration: 0.06 }
    ];
    
    chirpPattern.forEach((chirp) => {
      const startTime = now + chirp.time;
      
      // Main chirp oscillator
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const filter = this.audioContext!.createBiquadFilter();
      
      // Frequency modulation for warble
      const fmOsc = this.audioContext!.createOscillator();
      const fmGain = this.audioContext!.createGain();
      
      // Connect main path
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      // Connect FM
      fmOsc.connect(fmGain);
      fmGain.connect(osc.frequency);
      
      // High pitched sine wave
      osc.type = 'sine';
      osc.frequency.setValueAtTime(chirp.freq, startTime);
      
      // Slight frequency modulation for natural warble
      fmOsc.type = 'sine';
      fmOsc.frequency.value = 8; // 8 Hz warble
      fmGain.gain.value = 20; // Small pitch variation
      
      // High-pass filter for bright bird sound
      filter.type = 'highpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      
      // Quick attack, quick decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + chirp.duration);
      
      osc.start(startTime);
      fmOsc.start(startTime);
      
      osc.stop(startTime + chirp.duration);
      fmOsc.stop(startTime + chirp.duration);
    });
  }

  private playFrogRibbit() {
    // Ribbit sound: quick low croak
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, this.audioContext!.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, this.audioContext!.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(120, this.audioContext!.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + 0.3);
  }

  private playHorseNeigh() {
    // Realistic horse neigh with multiple phases
    const duration = 1.1;
    const now = this.audioContext!.currentTime;
    
    // First phase - rising whinny
    const osc1 = this.audioContext!.createOscillator();
    const gain1 = this.audioContext!.createGain();
    const filter1 = this.audioContext!.createBiquadFilter();
    
    // Second phase - the "nay" part
    const osc2 = this.audioContext!.createOscillator();
    const gain2 = this.audioContext!.createGain();
    const filter2 = this.audioContext!.createBiquadFilter();
    
    // Breath noise
    const noise = this.audioContext!.createOscillator();
    const noiseGain = this.audioContext!.createGain();
    const noiseFilter = this.audioContext!.createBiquadFilter();
    
    // Connect first phase
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.audioContext!.destination);
    
    // Connect second phase
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(this.audioContext!.destination);
    
    // Connect noise
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext!.destination);
    
    // First phase: "Whiii" - rising pitch
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(250, now);
    osc1.frequency.linearRampToValueAtTime(650, now + 0.4);
    
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(800, now);
    filter1.frequency.linearRampToValueAtTime(1500, now + 0.4);
    filter1.Q.value = 2;
    
    // Second phase: "Nay" - falling pitch
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(400, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(200, now + duration);
    
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(1200, now + 0.3);
    filter2.frequency.exponentialRampToValueAtTime(400, now + duration);
    
    // Breath noise for realism
    noise.type = 'white';
    noise.frequency.value = 100;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1500;
    
    // First phase envelope
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.1);
    gain1.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.4);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    // Second phase envelope
    gain2.gain.setValueAtTime(0, now + 0.3);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    // Noise envelope
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(this.volume * 0.08, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    // Start everything
    osc1.start(now);
    osc2.start(now + 0.3);
    noise.start(now);
    
    // Stop everything
    osc1.stop(now + 0.5);
    osc2.stop(now + duration);
    noise.stop(now + 0.3);
  }

  private playSheepBaa() {
    // Baa sound: bleating sound
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, this.audioContext!.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext!.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + 0.5);
  }

  private playChickenCluck() {
    // Cluck sound: quick staccato sounds
    const clucks = 3;
    for (let i = 0; i < clucks; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.value = 350;
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.08);
        
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.08);
      }, i * 120);
    }
  }

  // Set volume
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Get piano frequencies
  getPianoFrequency(note: string): number {
    const frequencies: Record<string, number> = {
      'C': 261.63,
      'D': 293.66,
      'E': 329.63,
      'F': 349.23,
      'G': 392.00,
      'A': 440.00,
      'B': 493.88
    };
    return frequencies[note] || 440;
  }
}

// Global sound manager instance
let globalSoundManager: SoundManager | null = null;

export function getSoundManager(volume: number = 0.7): SoundManager {
  if (!globalSoundManager) {
    globalSoundManager = new SoundManager(volume);
  } else {
    globalSoundManager.setVolume(volume);
  }
  return globalSoundManager;
}