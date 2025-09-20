import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, CheckCircle, XCircle, Loader } from 'lucide-react';
import { turkishSpeech } from './utils/TurkishSpeechManager';

interface TurkishSpeechTestProps {
  volume: number;
  onGoBack: () => void;
}

export function TurkishSpeechTest({ volume, onGoBack }: TurkishSpeechTestProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'testing'>('loading');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [voiceInfo, setVoiceInfo] = useState<{ name: string; lang: string } | null>(null);

  useEffect(() => {
    const initTest = async () => {
      console.log('🎤 Starting Turkish Speech API test...');
      
      try {
        // Check if speech synthesis is available
        if (!('speechSynthesis' in window)) {
          throw new Error('Speech synthesis not supported in this browser');
        }

        // Initialize Turkish Speech Manager
        const isAvailable = turkishSpeech.isAvailable();
        const currentVoice = turkishSpeech.getCurrentVoiceInfo();
        
        if (isAvailable) {
          setStatus('success');
          setTestResults([
            '✅ Google Web Speech API ready',
            '🎤 Turkish speech synthesis available',
            '🇹🇷 Optimized for Turkish alphabet'
          ]);
          setVoiceInfo(currentVoice);
        } else {
          setStatus('loading');
          setTestResults(['⏳ Loading Turkish voices...']);
          
          // Wait a bit for voices to load
          setTimeout(() => {
            const updatedVoice = turkishSpeech.getCurrentVoiceInfo();
            setVoiceInfo(updatedVoice);
            setStatus('success');
            setTestResults([
              '✅ Speech synthesis ready',
              '🎤 Turkish support available',
              updatedVoice ? `🔊 Using: ${updatedVoice.name}` : '🔊 Using system default voice'
            ]);
          }, 1000);
        }
      } catch (error) {
        setStatus('error');
        setTestResults(['❌ Speech synthesis not supported', error instanceof Error ? error.message : 'Unknown error']);
      }
    };

    initTest();
  }, []);

  const testVoice = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setStatus('testing');
    
    try {
      console.log('🎯 Testing Turkish alphabet pronunciation...');
      
      // Test Turkish letters with special pronunciation
      const testLetters = ['A', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'];
      
      setTestResults(prev => [...prev, '🔍 Testing Turkish alphabet letters...']);
      
      for (const letter of testLetters) {
        console.log(`🎤 Testing letter: ${letter}`);
        await turkishSpeech.speakLetter(letter, volume);
        setTestResults(prev => [...prev, `✅ ${letter} - Perfect pronunciation!`]);
        
        // Short pause between letters
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Test a complete word
      console.log('🎵 Testing complete Turkish word...');
      await turkishSpeech.speak('Merhaba çocuklar!', volume);
      
      console.log('🎉 All Turkish speech tests passed!');
      setTestResults(prev => [...prev, '🎉 All tests successful!', '🌟 "Merhaba çocuklar!" played perfectly', '✅ Turkish speech is working great!']);
      setStatus('success');

    } catch (error) {
      console.error('💥 Speech test failed:', error);
      setTestResults(prev => [...prev, `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setStatus('error');
    } finally {
      setIsPlaying(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-8 h-8 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'testing':
        return <Volume2 className="w-8 h-8 text-purple-400 animate-pulse" />;
      default:
        return <Loader className="w-8 h-8 text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-500 to-blue-600';
      case 'success':
        return 'from-green-500 to-green-600';
      case 'error':
        return 'from-red-500 to-red-600';
      case 'testing':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

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
          top: 'calc(var(--mobile-padding) / 2)', 
          left: 'var(--mobile-padding)', 
          right: 'var(--mobile-padding)' 
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          style={{ 
            borderRadius: 'var(--radius-card)',
            padding: 'calc(var(--mobile-padding) * 0.6)',
            fontFamily: 'var(--font-text)'
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 'var(--text-kids-large)' }}>🎤</span>
            <span style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(147, 51, 234)'
            }}>Türkçe Ses</span>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onGoBack}
          className="bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
          style={{ 
            width: 'calc(var(--kids-emoji-size) * 0.7)',
            height: 'calc(var(--kids-emoji-size) * 0.7)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <span style={{ fontSize: 'var(--text-kids-small)' }}>🏠</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div 
        className="flex flex-col items-center justify-center h-full"
        style={{ 
          padding: 'var(--mobile-padding)',
          paddingTop: 'calc(var(--kids-emoji-size) * 1.2)'
        }}
      >
        {/* Status Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bg-gradient-to-br ${getStatusColor()} p-6 rounded-3xl shadow-2xl mb-6 w-full max-w-xs`}
        >
          <div className="text-center">
            <motion.div
              key={status}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              {getStatusIcon()}
            </motion.div>
            
            <div 
              className="text-white mb-2"
              style={{ 
                fontSize: 'var(--text-kids-large)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-display)'
              }}
            >
              {status === 'loading' && 'Yükleniyor...'}
              {status === 'success' && 'Hazır! 🎉'}
              {status === 'error' && 'Hata ❌'}
              {status === 'testing' && 'Test Ediliyor...'}
            </div>

            <div 
              className="text-white/80"
              style={{ 
                fontSize: 'var(--text-kids-small)',
                fontFamily: 'var(--font-text)'
              }}
            >
              {voiceInfo ? `${voiceInfo.name} (${voiceInfo.lang})` : 'Sistem varsayılan ses'}
            </div>
          </div>
        </motion.div>

        {/* Test Results */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 w-full max-w-xs mb-6"
        >
          <div 
            className="mb-3"
            style={{ 
              fontSize: 'var(--text-kids-medium)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-display)',
              color: 'rgb(75, 85, 99)'
            }}
          >
            📋 Test Sonuçları:
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
            {testResults.length === 0 ? (
              <div
                className="p-2 bg-blue-50 rounded-lg"
                style={{ 
                  fontSize: 'var(--text-kids-small)',
                  fontFamily: 'var(--font-text)'
                }}
              >
                ⏳ Test başlatılıyor...
              </div>
            ) : (
              testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 bg-gray-50 rounded-lg"
                  style={{ 
                    fontSize: 'var(--text-kids-small)',
                    fontFamily: 'var(--font-text)'
                  }}
                >
                  {result}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Test Button */}
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
          onClick={testVoice}
          disabled={isPlaying}
          className={`bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-xl flex items-center justify-center gap-3 ${isPlaying ? 'opacity-50' : ''}`}
          style={{ 
            width: '100%',
            maxWidth: '300px',
            height: 'calc(var(--kids-button-height) * 0.6)',
            fontSize: 'var(--text-kids-medium)',
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-display)'
          }}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span>Çalıyor...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6" />
              <span>🇹🇷 Türkçe Alfabe Test Et</span>
            </>
          )}
        </motion.button>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
        >
          <div 
            style={{ 
              fontSize: 'var(--text-kids-small)',
              color: 'rgb(107, 114, 128)',
              fontFamily: 'var(--font-text)'
            }}
          >
            Google Web Speech API kullanarak<br />
            Türkçe harflerin doğru telaffuzunu test eder
          </div>
        </motion.div>
      </div>
    </div>
  );
}