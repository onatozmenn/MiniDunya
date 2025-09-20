/**
 * AI Voice Settings Panel
 * Configure AI voice services for SevSaMut stories
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { aiVoiceManager } from '../utils/AIVoiceManager';

interface AIVoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIVoiceSettings({ isOpen, onClose }: AIVoiceSettingsProps) {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [detailedInfo, setDetailedInfo] = useState<any>(null);
  const [testVoice, setTestVoice] = useState<string>('narrator');
  const [testEmotion, setTestEmotion] = useState<string>('happy');
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyTest, setApiKeyTest] = useState<{result?: any, isLoading: boolean}>({ isLoading: false });

  // Get system info
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      
      // Get basic info immediately
      const info = aiVoiceManager.getSystemInfo();
      setSystemInfo(info);
      
      // Get detailed info from backend
      aiVoiceManager.getDetailedSystemInfo().then(detailedInfo => {
        setDetailedInfo(detailedInfo);
        setIsLoading(false);
      }).catch(error => {
        console.warn('Failed to get detailed info:', error);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  // Test voice
  const testVoiceFunction = async () => {
    if (isTestPlaying) return;

    setIsTestPlaying(true);
    try {
      await aiVoiceManager.speak({
        id: 'test',
        text: `Merhaba! Ben ${testVoice} karakterinin ${testEmotion} duygulu sesi!`,
        character: testVoice,
        emotion: testEmotion as any
      });
    } catch (error) {
      console.warn('Voice test failed:', error);
    } finally {
      setIsTestPlaying(false);
    }
  };

  // Clear cache
  const clearCache = () => {
    aiVoiceManager.clearCache();
    const info = aiVoiceManager.getSystemInfo();
    setSystemInfo(info);
  };

  // Test API key directly
  const testApiKey = async () => {
    setApiKeyTest({ isLoading: true });
    
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      // Test with our known API key
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7da483db/test-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          apiKey: 'sk_4b4619eabfc05a446bc092f1168537ec70e986243f16404a'
        })
      });

      const result = await response.json();
      setApiKeyTest({ result, isLoading: false });
    } catch (error) {
      setApiKeyTest({ 
        result: { success: false, error: String(error) }, 
        isLoading: false 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        style={{ padding: 'var(--mobile-padding)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-widget)',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '28rem',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div 
            className="sticky top-0 text-white flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-4) 100%)',
              padding: 'var(--mobile-padding)',
              borderTopLeftRadius: 'var(--radius-widget)',
              borderTopRightRadius: 'var(--radius-widget)'
            }}
          >
            <div>
              <h2 
                style={{
                  fontSize: 'var(--text-kids-large)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                🎭 AI Ses Ayarları
              </h2>
              <p 
                style={{
                  fontSize: 'var(--text-kids-small)',
                  fontFamily: 'var(--font-text)',
                  opacity: 0.9
                }}
              >
                Duygusal hikaye sesleri
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-kids-medium)',
                fontFamily: 'var(--font-text)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div 
            style={{
              padding: 'var(--mobile-padding)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--mobile-gap)'
            }}
          >
            {/* System Status */}
            <div 
              style={{
                backgroundColor: 'var(--color-muted)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--mobile-gap)'
              }}
            >
              <h3 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-kids-medium)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-foreground)',
                  marginBottom: 'calc(var(--mobile-gap) * 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'calc(var(--mobile-gap) * 0.5)'
                }}
              >
                🤖 Sistem Durumu
                {isLoading && (
                  <span 
                    style={{
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)'
                    }}
                  >
                    ⏳
                  </span>
                )}
              </h3>
              {systemInfo && (
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(var(--mobile-gap) * 0.5)'
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)'
                    }}
                  >
                    <span style={{ color: 'var(--color-foreground)' }}>Bağlantı:</span>
                    <span style={{ color: systemInfo.connected ? 'var(--color-chart-2)' : 'var(--color-destructive)' }}>
                      {systemInfo.connected ? '✅ Aktif' : '❌ Kapalı'}
                    </span>
                  </div>
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)'
                    }}
                  >
                    <span style={{ color: 'var(--color-foreground)' }}>Karakter Sesleri:</span>
                    <span style={{ color: 'var(--color-chart-1)' }}>{systemInfo.voices} ses</span>
                  </div>
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)'
                    }}
                  >
                    <span style={{ color: 'var(--color-foreground)' }}>Teknoloji:</span>
                    <span style={{ color: 'var(--color-chart-4)' }}>{systemInfo.model}</span>
                  </div>
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)'
                    }}
                  >
                    <span style={{ color: 'var(--color-foreground)' }}>Önbellek:</span>
                    <span style={{ color: 'var(--color-chart-3)' }}>{systemInfo.cache} ses</span>
                  </div>
                  {detailedInfo && (
                    <>
                      <div 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)'
                        }}
                      >
                        <span style={{ color: 'var(--color-foreground)' }}>ElevenLabs:</span>
                        <span style={{ color: detailedInfo.services.elevenlabs ? 'var(--color-chart-2)' : 'var(--color-muted-foreground)' }}>
                          {detailedInfo.services.elevenlabs ? '✅ Yapılandırıldı' : '❌ API Key Yok'}
                        </span>
                      </div>
                      <div 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)'
                        }}
                      >
                        <span style={{ color: 'var(--color-foreground)' }}>OpenAI:</span>
                        <span style={{ color: detailedInfo.services.openai ? 'var(--color-chart-2)' : 'var(--color-muted-foreground)' }}>
                          {detailedInfo.services.openai ? '✅ Yapılandırıldı' : '❌ API Key Yok'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Voice Test */}
            <div 
              style={{
                backgroundColor: 'var(--color-muted)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--mobile-gap)'
              }}
            >
              <h3 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-kids-medium)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-foreground)',
                  marginBottom: 'calc(var(--mobile-gap) * 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'calc(var(--mobile-gap) * 0.5)'
                }}
              >
                🎤 Ses Testi
              </h3>
              
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'calc(var(--mobile-gap) * 0.75)'
                }}
              >
                {/* Character Selection */}
                <div>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-foreground)',
                      marginBottom: 'calc(var(--mobile-gap) * 0.5)'
                    }}
                  >
                    Karakter:
                  </label>
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 'calc(var(--mobile-gap) * 0.5)'
                    }}
                  >
                    {['narrator', 'girl', 'mother', 'wolf', 'grandmother'].map((character) => (
                      <button
                        key={character}
                        onClick={() => setTestVoice(character)}
                        style={{
                          padding: 'calc(var(--mobile-gap) * 0.5)',
                          borderRadius: 'var(--radius-card)',
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)',
                          backgroundColor: testVoice === character ? 'var(--color-primary)' : 'var(--color-card)',
                          color: testVoice === character ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                          border: testVoice === character ? 'none' : '1px solid var(--color-border)'
                        }}
                      >
                        {character === 'narrator' && '📖 Anlatıcı'}
                        {character === 'girl' && '👧 Kız'}
                        {character === 'mother' && '👩 Anne'}
                        {character === 'wolf' && '🐺 Kurt'}
                        {character === 'grandmother' && '👵 Nine'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotion Selection */}
                <div>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-foreground)',
                      marginBottom: 'calc(var(--mobile-gap) * 0.5)'
                    }}
                  >
                    Duygu:
                  </label>
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 'calc(var(--mobile-gap) * 0.5)'
                    }}
                  >
                    {['happy', 'sad', 'excited', 'calm', 'mysterious', 'scared', 'angry', 'loving'].map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => setTestEmotion(emotion)}
                        style={{
                          padding: 'calc(var(--mobile-gap) * 0.5)',
                          borderRadius: 'var(--radius-card)',
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)',
                          backgroundColor: testEmotion === emotion ? 'var(--color-chart-5)' : 'var(--color-card)',
                          color: testEmotion === emotion ? 'white' : 'var(--color-foreground)',
                          border: testEmotion === emotion ? 'none' : '1px solid var(--color-border)'
                        }}
                      >
                        {emotion === 'happy' && '😊'}
                        {emotion === 'sad' && '😢'}
                        {emotion === 'excited' && '🤩'}
                        {emotion === 'calm' && '😌'}
                        {emotion === 'mysterious' && '🤫'}
                        {emotion === 'scared' && '😨'}
                        {emotion === 'angry' && '😠'}
                        {emotion === 'loving' && '🥰'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={testVoiceFunction}
                  disabled={isTestPlaying}
                  style={{
                    width: '100%',
                    padding: 'calc(var(--mobile-gap) * 0.75)',
                    borderRadius: 'var(--radius-card)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--text-kids-medium)',
                    backgroundColor: isTestPlaying ? 'var(--color-muted)' : 'var(--color-chart-2)',
                    background: isTestPlaying ? 'var(--color-muted)' : 'linear-gradient(135deg, var(--color-chart-2) 0%, var(--color-chart-1) 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: isTestPlaying ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isTestPlaying ? '🔊 Oynuyor...' : '▶️ Ses Testi'}
                </motion.button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div 
              style={{
                backgroundColor: 'var(--color-muted)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--mobile-gap)'
              }}
            >
              <h3 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-kids-medium)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-foreground)',
                  marginBottom: 'calc(var(--mobile-gap) * 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'calc(var(--mobile-gap) * 0.5)'
                }}
              >
                ⚙️ Gelişmiş Ayarlar
              </h3>
              
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'calc(var(--mobile-gap) * 0.75)'
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCache}
                  style={{
                    width: '100%',
                    padding: 'calc(var(--mobile-gap) * 0.5)',
                    backgroundColor: 'var(--color-chart-3)',
                    color: 'white',
                    borderRadius: 'var(--radius-card)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--text-kids-medium)',
                    border: 'none'
                  }}
                >
                  🗑️ Önbelleği Temizle
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={testApiKey}
                  disabled={apiKeyTest.isLoading}
                  style={{
                    width: '100%',
                    padding: 'calc(var(--mobile-gap) * 0.5)',
                    backgroundColor: apiKeyTest.isLoading ? 'var(--color-muted)' : 'var(--color-chart-1)',
                    color: 'white',
                    borderRadius: 'var(--radius-card)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--text-kids-medium)',
                    border: 'none',
                    cursor: apiKeyTest.isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {apiKeyTest.isLoading ? '🔄 Test Ediliyor...' : '🔑 API Key Test Et'}
                </motion.button>

                {apiKeyTest.result && (
                  <div 
                    style={{
                      padding: 'calc(var(--mobile-gap) * 0.75)',
                      borderRadius: 'var(--radius-card)',
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)',
                      backgroundColor: apiKeyTest.result.success ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                      color: apiKeyTest.result.success ? 'var(--color-chart-2)' : 'var(--color-destructive)'
                    }}
                  >
                    <div 
                      style={{
                        fontWeight: 'var(--font-weight-semibold)',
                        fontSize: 'var(--text-kids-medium)'
                      }}
                    >
                      {apiKeyTest.result.success ? '✅ API Key Çalışıyor!' : '❌ API Key Sorunu'}
                    </div>
                    <div 
                      style={{
                        fontSize: 'var(--text-kids-small)',
                        marginTop: 'calc(var(--mobile-gap) * 0.25)',
                        opacity: 0.8
                      }}
                    >
                      {apiKeyTest.result.message || apiKeyTest.result.error}
                    </div>
                    {apiKeyTest.result.keyLength && (
                      <div 
                        style={{
                          fontSize: 'var(--text-kids-small)',
                          marginTop: 'calc(var(--mobile-gap) * 0.25)',
                          opacity: 0.75
                        }}
                      >
                        Key uzunluk: {apiKeyTest.result.keyLength}, Prefix: {apiKeyTest.result.keyPrefix}
                      </div>
                    )}
                  </div>
                )}

                <div 
                  style={{
                    backgroundColor: 'rgba(10, 132, 255, 0.1)',
                    borderRadius: 'var(--radius-card)',
                    padding: 'calc(var(--mobile-gap) * 0.75)'
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'calc(var(--mobile-gap) * 0.5)'
                    }}
                  >
                    <span 
                      style={{
                        color: 'var(--color-chart-1)',
                        fontSize: 'var(--text-kids-large)'
                      }}
                    >
                      💡
                    </span>
                    <div>
                      <p 
                        style={{
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-chart-1)'
                        }}
                      >
                        {detailedInfo?.services.elevenlabs || detailedInfo?.services.openai 
                          ? 'AI Sesler Aktif!' 
                          : 'Daha Gerçekçi Sesler İçin'
                        }
                      </p>
                      <p 
                        style={{
                          fontSize: 'var(--text-kids-small)',
                          fontFamily: 'var(--font-text)',
                          color: 'var(--color-chart-1)',
                          marginTop: 'calc(var(--mobile-gap) * 0.25)',
                          opacity: 0.8
                        }}
                      >
                        {detailedInfo?.services.elevenlabs || detailedInfo?.services.openai 
                          ? 'Gerçek AI sesler kullanılıyor! Çocuklar çok daha doğal ve duygusal sesler duyacak.' 
                          : 'Demo sesleri kullanılıyor. ElevenLabs veya OpenAI API anahtarı ekleyerek gerçek AI sesleri aktif hale getirebilirsiniz.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--mobile-gap)'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'calc(var(--mobile-gap) * 0.75)'
                }}
              >
                <span 
                  style={{
                    fontSize: 'var(--text-kids-big)'
                  }}
                >
                  🎭
                </span>
                <div>
                  <h4 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-chart-4)',
                      fontSize: 'var(--text-kids-medium)',
                      marginBottom: 'calc(var(--mobile-gap) * 0.25)'
                    }}
                  >
                    AI Sesler Nasıl Çalışır?
                  </h4>
                  <p 
                    style={{
                      fontSize: 'var(--text-kids-small)',
                      fontFamily: 'var(--font-text)',
                      color: 'var(--color-chart-4)',
                      opacity: 0.9
                    }}
                  >
                    Her karakter için özel eğitilmiş AI sesleri kullanıyoruz. 
                    Bu sesler duygulara göre değişiyor ve çocuklar için optimize edilmiş.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}