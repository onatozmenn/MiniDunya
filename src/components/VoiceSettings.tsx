import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Settings, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { turkishSpeech } from './utils/TurkishSpeechManager';

interface VoiceSettingsProps {
  onClose: () => void;
}

interface VoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
  quality: 'high' | 'medium' | 'low';
}

export function VoiceSettings({ onClose }: VoiceSettingsProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  useEffect(() => {
    loadVoicesInfo();
    // Load saved settings
    const saved = localStorage.getItem('sevsamut-voice-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setIsVoiceEnabled(settings.enabled ?? true);
    }
  }, []);

  const loadVoicesInfo = () => {
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      const turkishVoices = voices
        .filter(voice => voice.lang.startsWith('tr'))
        .map(voice => ({
          name: voice.name,
          lang: voice.lang,
          localService: voice.localService,
          quality: getVoiceQuality(voice)
        }))
        .sort((a, b) => {
          // Sort by quality then local service
          if (a.quality !== b.quality) {
            const qualityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return qualityOrder[b.quality] - qualityOrder[a.quality];
          }
          return b.localService ? 1 : -1;
        });

      setAvailableVoices(turkishVoices);
      
      const currentVoice = turkishSpeech.getCurrentVoiceInfo();
      if (currentVoice) {
        setSelectedVoice(currentVoice.name);
      }
    }
  };

  const getVoiceQuality = (voice: SpeechSynthesisVoice): 'high' | 'medium' | 'low' => {
    const name = voice.name.toLowerCase();
    
    if (name.includes('natural') || name.includes('neural') || name.includes('premium')) {
      return 'high';
    }
    
    if (voice.localService && !name.includes('default')) {
      return 'medium';
    }
    
    return 'low';
  };

  const saveSettings = (enabled: boolean) => {
    const settings = {
      enabled,
      voice: selectedVoice,
      timestamp: Date.now()
    };
    localStorage.setItem('sevsamut-voice-settings', JSON.stringify(settings));
  };

  const handleVoiceToggle = () => {
    const newEnabled = !isVoiceEnabled;
    setIsVoiceEnabled(newEnabled);
    saveSettings(newEnabled);
    
    if (!newEnabled) {
      turkishSpeech.stop();
    }
  };

  const handleTestVoice = async () => {
    if (isTestPlaying) return;
    
    setIsTestPlaying(true);
    try {
      await turkishSpeech.speak('Merhaba! Bu ses testi. Nasıl geliyor?', 0.8);
    } catch (error) {
      console.warn('Test voice failed:', error);
    }
    setIsTestPlaying(false);
  };

  const getQualityColor = (quality: 'high' | 'medium' | 'low') => {
    switch (quality) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
    }
  };

  const getQualityText = (quality: 'high' | 'medium' | 'low') => {
    switch (quality) {
      case 'high': return 'Yüksek Kalite';
      case 'medium': return 'Orta Kalite';
      case 'low': return 'Düşük Kalite';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{ padding: 'var(--mobile-padding)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{
          maxHeight: '80vh',
          borderRadius: 'var(--radius-widget)'
        }}
      >
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <span style={{ fontSize: 'var(--text-kids-large)', fontWeight: 'var(--font-weight-bold)' }}>
                Ses Ayarları
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6" style={{ fontFamily: 'var(--font-text)' }}>
          
          {/* Voice Enable/Disable */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isVoiceEnabled ? (
                  <Volume2 className="w-5 h-5 text-green-500" />
                ) : (
                  <VolumeX className="w-5 h-5 text-red-500" />
                )}
                <span style={{ fontSize: 'var(--text-kids-medium)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Ses Efektleri
                </span>
              </div>
              <Button
                onClick={handleVoiceToggle}
                variant={isVoiceEnabled ? "default" : "secondary"}
                size="sm"
                className="px-4"
              >
                {isVoiceEnabled ? 'AÇIK' : 'KAPALI'}
              </Button>
            </div>
            <p 
              className="text-muted-foreground leading-relaxed"
              style={{ fontSize: 'var(--text-kids-small)' }}
            >
              {isVoiceEnabled 
                ? 'Oyunlarda ve hikayelerde sesli anlatım aktif.' 
                : 'Sessiz mod aktif. Sadece müzik ve ses efektleri çalacak.'}
            </p>
          </div>

          {/* Voice Quality Info */}
          {isVoiceEnabled && (
            <div className="space-y-4">
              <div className="border rounded-2xl p-4" style={{ borderRadius: 'var(--radius-card)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-kids-medium)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Mevcut Ses
                  </span>
                </div>
                
                <div className="space-y-2">
                  {availableVoices.length > 0 ? (
                    availableVoices.slice(0, 3).map((voice, index) => (
                      <div 
                        key={voice.name}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          voice.name === selectedVoice ? 'bg-primary/10' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-semibold truncate"
                            style={{ fontSize: 'var(--text-kids-small)' }}
                          >
                            {voice.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span 
                              className={getQualityColor(voice.quality)}
                              style={{ fontSize: 'var(--text-kids-small)' }}
                            >
                              {getQualityText(voice.quality)}
                            </span>
                            {voice.localService && (
                              <span className="text-blue-500" style={{ fontSize: 'var(--text-kids-small)' }}>
                                • Yerel
                              </span>
                            )}
                          </div>
                        </div>
                        {voice.name === selectedVoice && index === 0 && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div 
                      className="text-muted-foreground text-center py-4"
                      style={{ fontSize: 'var(--text-kids-small)' }}
                    >
                      Türkçe ses bulunamadı
                    </div>
                  )}
                </div>
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTestVoice}
                disabled={isTestPlaying}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white"
                style={{ 
                  height: 'calc(var(--kids-button-height) * 0.6)',
                  borderRadius: 'var(--radius-card)',
                  fontSize: 'var(--text-kids-medium)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                {isTestPlaying ? (
                  <>
                    <Volume2 className="w-5 h-5 mr-2 animate-pulse" />
                    Çalıyor...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    🎤 Ses Testini Dinle
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4" style={{ borderRadius: 'var(--radius-card)' }}>
            <div 
              className="font-semibold mb-2 text-blue-700 dark:text-blue-300"
              style={{ fontSize: 'var(--text-kids-medium)' }}
            >
              💡 İpuçları:
            </div>
            <ul 
              className="space-y-1 text-blue-600 dark:text-blue-400"
              style={{ fontSize: 'var(--text-kids-small)' }}
            >
              <li>• Ses kalitesi cihazınıza göre değişir</li>
              <li>• Yerel sesler daha kaliteli olur</li>
              <li>• Sessiz modda sadece müzik çalar</li>
              <li>• Ayarlar otomatik kaydedilir</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Global voice settings helper
export const voiceSettings = {
  isEnabled: (): boolean => {
    const saved = localStorage.getItem('sevsamut-voice-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.enabled ?? true;
    }
    return true;
  },
  
  setEnabled: (enabled: boolean) => {
    const settings = {
      enabled,
      timestamp: Date.now()
    };
    localStorage.setItem('sevsamut-voice-settings', JSON.stringify(settings));
  }
};