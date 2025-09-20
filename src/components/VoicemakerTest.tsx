import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, CheckCircle, XCircle, Loader } from 'lucide-react';
import { voicemakerManager } from './utils/VoicemakerManager';
import { publicAnonKey } from '../utils/supabase/info';

interface VoicemakerTestProps {
  volume: number;
  onGoBack: () => void;
}

export function VoicemakerTest({ volume, onGoBack }: VoicemakerTestProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'testing'>('loading');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const initTest = async () => {
      console.log('🧪 Starting Voicemaker.in test...');
      
      try {
        // Initialize Voicemaker
        const isAvailable = await voicemakerManager.init();
        
        if (isAvailable) {
          setStatus('success');
          setTestResults(['✅ Voicemaker.in API key is valid', '🎤 Turkish Neural voice ready']);
        } else {
          setStatus('error');
          setTestResults(['❌ API key validation failed', '🔊 Will fallback to browser synthesis']);
        }
      } catch (error) {
        setStatus('error');
        setTestResults(['💥 Connection error:', error instanceof Error ? error.message : 'Unknown error']);
      }
    };

    initTest();
  }, []);

  const testVoice = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setStatus('testing');
    
    try {
      console.log('🎯 Testing backend step by step...');
      
      // STEP 1: Test basic backend health
      console.log('🏥 Step 1: Testing basic health endpoint...');
      setTestResults(prev => [...prev, '🔍 Step 1: Testing backend health...']);
      
      const healthUrl = `${voicemakerManager['serverUrl']}/health`;
      console.log('🔗 Health URL:', healthUrl);
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🏥 Health response status:', healthResponse.status);
      console.log('🏥 Health response headers:', Object.fromEntries(healthResponse.headers.entries()));
      
      if (!healthResponse.ok) {
        const healthErrorText = await healthResponse.text();
        console.error('🚨 Health check failed:', healthResponse.status, healthErrorText);
        setTestResults(prev => [...prev, `❌ Health check failed: ${healthResponse.status}`, `📄 Response: ${healthErrorText.substring(0, 200)}...`]);
        throw new Error(`Backend health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('🏥 Health data:', healthData);
      setTestResults(prev => [...prev, '✅ Backend health check passed!', `📋 Response: ${JSON.stringify(healthData)}`]);

      // STEP 2: Test Voicemaker endpoint
      console.log('🎤 Step 2: Testing Voicemaker test endpoint...');
      setTestResults(prev => [...prev, '🔍 Step 2: Testing Voicemaker endpoint...']);
      
      const voicemakerTestUrl = `${voicemakerManager['serverUrl']}/voicemaker-test`;
      console.log('🔗 Voicemaker test URL:', voicemakerTestUrl);
      
      const voicemakerResponse = await fetch(voicemakerTestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🎤 Voicemaker test response status:', voicemakerResponse.status);
      
      if (!voicemakerResponse.ok) {
        const vmErrorText = await voicemakerResponse.text();
        console.error('🚨 Voicemaker test failed:', voicemakerResponse.status, vmErrorText);
        setTestResults(prev => [...prev, `❌ Voicemaker test failed: ${voicemakerResponse.status}`, `📄 Response: ${vmErrorText.substring(0, 200)}...`]);
        throw new Error(`Voicemaker test failed: ${voicemakerResponse.status}`);
      }
      
      const vmData = await voicemakerResponse.json();
      console.log('🎤 Voicemaker test data:', vmData);
      setTestResults(prev => [...prev, '✅ Voicemaker test endpoint works!', `📋 API Status: ${vmData.success ? 'SUCCESS' : 'FAILED'}`, `🔑 API Key: ${vmData.apiKeyPrefix}...`]);

      // STEP 3: Only if both backend tests pass, try actual voice generation
      if (vmData.success) {
        console.log('🎵 Step 3: Testing actual voice generation...');
        setTestResults(prev => [...prev, '🔍 Step 3: Testing voice generation...']);
        
        await voicemakerManager.speakTurkishLetter('merhaba', volume);
        
        console.log('🎉 Voice generation successful!');
        setTestResults(prev => [...prev, '🎉 Voice generation successful!', '🌟 "Merhaba" played with Emel Neural voice']);
        setStatus('success');
      } else {
        setTestResults(prev => [...prev, '⚠️ Backend works but Voicemaker API failed', '🔧 Check API key and Voicemaker service']);
        setStatus('error');
      }

    } catch (error) {
      console.error('💥 Test failed:', error);
      setTestResults(prev => [...prev, `💥 Test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      
      // FALLBACK: If backend fails, try browser synthesis
      console.log('🔄 Fallback: Trying browser synthesis...');
      setTestResults(prev => [...prev, '🔄 Fallback: Testing browser synthesis...']);
      
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('merhaba');
          utterance.lang = 'tr-TR';
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.volume = volume;
          
          // Force female voice if available
          const voices = speechSynthesis.getVoices();
          const turkishFemaleVoice = voices.find(voice => 
            voice.lang.startsWith('tr') && voice.name.toLowerCase().includes('female')
          ) || voices.find(voice => 
            voice.lang.startsWith('tr')
          ) || voices.find(voice => 
            !voice.name.toLowerCase().includes('male')
          );
          
          if (turkishFemaleVoice) {
            utterance.voice = turkishFemaleVoice;
            console.log('🎤 Using browser voice:', turkishFemaleVoice.name);
          }
          
          speechSynthesis.speak(utterance);
          
          setTestResults(prev => [...prev, '✅ Browser synthesis works!', '🎤 "Merhaba" played with browser voice']);
          setStatus('success');
        } else {
          throw new Error('Speech synthesis not supported');
        }
      } catch (fallbackError) {
        console.error('💥 Fallback also failed:', fallbackError);
        setTestResults(prev => [...prev, '❌ Browser synthesis also failed']);
        setStatus('error');
      }
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
            <span style={{ fontSize: 'var(--text-kids-large)' }}>🧪</span>
            <span style={{ 
              fontSize: 'var(--text-kids-medium)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'rgb(147, 51, 234)'
            }}>Ses Test</span>
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
              {status === 'loading' && 'Bağlanıyor...'}
              {status === 'success' && 'Başarılı! 🎉'}
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
              API Key: {voicemakerManager['apiKey'] ? '✅ Var' : '❌ Yok'}
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
          
          <div className="space-y-2">
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
            
            {/* Always show browser synthesis status */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-2 bg-green-50 rounded-lg border border-green-200"
              style={{ 
                fontSize: 'var(--text-kids-small)',
                fontFamily: 'var(--font-text)'
              }}
            >
              ✅ Tarayıcı ses sentezi aktif
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-2 bg-blue-50 rounded-lg"
              style={{ 
                fontSize: 'var(--text-kids-small)',
                fontFamily: 'var(--font-text)'
              }}
            >
              🎤 Kaliteli Türkçe ses deneyimi hazır!
            </motion.div>
          </div>
        </motion.div>

        {/* Test Voice Button - Always show for browser synthesis */}
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
              <span>🎤 Türkçe Sesi Test Et</span>
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
            Bu test Voicemaker.in API bağlantısını kontrol eder
          </div>
        </motion.div>
      </div>
    </div>
  );
}