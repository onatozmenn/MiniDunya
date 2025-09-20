import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { getSoundManager } from '../utils/SoundManager';

interface MusicMakerProps {
  volume: number;
}

const INSTRUMENTS = [
  { id: 'drum', emoji: '🥁', name: 'Davul', color: 'from-red-400 to-red-600', sound: 'error' },
  { id: 'guitar', emoji: '🎸', name: 'Gitar', color: 'from-orange-400 to-brown-500', sound: 'success' },
  { id: 'piano', emoji: '🎹', name: 'Piyano', color: 'from-purple-400 to-purple-600', sound: 'pop' },
  { id: 'trumpet', emoji: '🎺', name: 'Trompet', color: 'from-yellow-400 to-gold-500', sound: 'success' },
  { id: 'violin', emoji: '🎻', name: 'Keman', color: 'from-amber-600 to-brown-600', sound: 'error' },
  { id: 'bells', emoji: '🔔', name: 'Çan', color: 'from-blue-400 to-blue-600', sound: 'pop' },
  { id: 'maracas', emoji: '🥁', name: 'Marakas', color: 'from-green-400 to-green-600', sound: 'success' },
  { id: 'flute', emoji: '🎵', name: 'Flüt', color: 'from-pink-400 to-purple-400', sound: 'error' }
];

const RHYTHM_PATTERNS = [
  { name: 'Yavaş', tempo: 'slow', emoji: '🐢', bpm: 60 },
  { name: 'Normal', tempo: 'medium', emoji: '🚶', bpm: 120 },
  { name: 'Hızlı', tempo: 'fast', emoji: '🏃', bpm: 180 },
  { name: 'Çok Hızlı', tempo: 'very-fast', emoji: '⚡', bpm: 240 }
];

type PlayedNote = {
  id: string;
  instrument: typeof INSTRUMENTS[0];
  x: number;
  y: number;
  timestamp: number;
};

export function MusicMaker({ volume }: MusicMakerProps) {
  const [activeInstrument, setActiveInstrument] = useState<string | null>(null);
  const [playedNotes, setPlayedNotes] = useState<PlayedNote[]>([]);
  const [currentTempo, setCurrentTempo] = useState(RHYTHM_PATTERNS[1]);
  const [isRecording, setIsRecording] = useState(false);

  const playInstrument = useCallback((instrument: typeof INSTRUMENTS[0], event: React.MouseEvent) => {
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      
      // Play different sounds based on instrument
      switch (instrument.sound) {
        case 'error':
          soundManager.playError();
          break;
        case 'success':
          soundManager.playSuccess();
          break;
        case 'pop':
          soundManager.playPop();
          break;
      }
    }

    setActiveInstrument(instrument.id);
    
    // Add visual note
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;
    
    const newNote: PlayedNote = {
      id: `note-${Date.now()}-${Math.random()}`,
      instrument,
      x,
      y,
      timestamp: Date.now()
    };

    setPlayedNotes(prev => [...prev, newNote]);

    // Clear active state and old notes
    setTimeout(() => {
      setActiveInstrument(null);
      setPlayedNotes(prev => prev.filter(note => 
        Date.now() - note.timestamp < 2000
      ));
    }, 300);
  }, [volume]);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }
  }, [isRecording, volume]);

  const clearNotes = useCallback(() => {
    setPlayedNotes([]);
    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playError();
    }
  }, [volume]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 relative overflow-hidden">
      {/* Floating Music Notes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-25"
            style={{
              left: `${8 + i * 10}%`,
              top: `${12 + i * 8}%`
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4
            }}
          >
            {['🎵', '🎶', '🎼', '🎤', '🎧', '🔊', '🎪', '🌟', '✨', '💫'][i]}
          </motion.div>
        ))}
      </div>

      {/* Played Notes Visualization */}
      <div className="absolute inset-0 pointer-events-none">
        {playedNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 0], 
              opacity: [0, 1, 0],
              y: [0, -100]
            }}
            transition={{ duration: 2 }}
            className="absolute text-4xl"
            style={{
              left: `${note.x}%`,
              top: `${note.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {note.instrument.emoji}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 p-6 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="text-6xl mb-3">🎵</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Müzik Yapıcı
          </h1>
          <p className="text-lg text-white/90 mt-2">
            Dokun ve müzik yap! 🎶
          </p>
        </motion.div>
      </div>

      {/* Tempo Controls */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 mb-2">⚡ Ritim Hızı</h2>
        </motion.div>

        <div className="flex justify-center gap-3 flex-wrap max-w-lg mx-auto">
          {RHYTHM_PATTERNS.map((pattern, index) => (
            <motion.button
              key={pattern.tempo}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentTempo(pattern)}
              className={`
                p-4 rounded-2xl shadow-lg border-4 transition-all
                ${currentTempo.tempo === pattern.tempo 
                  ? 'bg-yellow-400 border-yellow-300 scale-110' 
                  : 'bg-white/90 border-white/50'
                }
              `}
            >
              <div className="text-2xl mb-1">{pattern.emoji}</div>
              <div className="text-sm font-bold text-gray-800">{pattern.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instruments Grid */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white/90 mb-2">🎸 Enstrümanlar</h2>
          <p className="text-white/70">Dokun ve çal!</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {INSTRUMENTS.map((instrument, index) => (
            <motion.button
              key={instrument.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => playInstrument(instrument, e)}
              className={`
                relative group p-6 rounded-3xl bg-gradient-to-br ${instrument.color} 
                shadow-2xl border-4 border-white/30 transition-all duration-300
                ${activeInstrument === instrument.id ? 'scale-110 shadow-3xl' : ''}
              `}
            >
              <motion.div
                animate={activeInstrument === instrument.id ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -15, 15, 0]
                } : {}}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl mb-2 filter drop-shadow-lg">
                  {instrument.emoji}
                </div>
                <div className="text-white font-bold text-sm md:text-base">
                  {instrument.name}
                </div>
              </motion.div>

              {/* Active Wave Effect */}
              {activeInstrument === instrument.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-3xl bg-white/20 border-4 border-white/50"
                />
              )}

              {/* Sound Ripples */}
              {activeInstrument === instrument.id && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 3, 0], opacity: [0, 0.5, 0] }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="absolute w-20 h-20 rounded-full border-2 border-white/40"
                      style={{ 
                        left: '50%', 
                        top: '50%', 
                        transform: 'translate(-50%, -50%)' 
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 mb-8">
        <div className="flex justify-center gap-4 max-w-lg mx-auto">
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`
              px-8 py-4 rounded-2xl shadow-lg border-4 transition-all font-bold
              ${isRecording 
                ? 'bg-red-400 border-red-300 text-white' 
                : 'bg-green-400 border-green-300 text-white'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isRecording ? '⏹️' : '⏺️'}</span>
              <span>{isRecording ? 'Durdur' : 'Kaydet'}</span>
            </div>
          </motion.button>

          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearNotes}
            className="px-8 py-4 rounded-2xl bg-orange-400 border-4 border-orange-300 text-white shadow-lg font-bold"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧹</span>
              <span>Temizle</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-6 left-6 z-30">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎼</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Müzik Yap!</p>
              <p className="text-xs text-gray-600">
                Ritim: {currentTempo.name} {currentTempo.emoji}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Character Helper */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎭</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Müzik Ustası</p>
              <p className="text-xs text-gray-600">
                {isRecording ? 'Kaydediyorum! 🔴' : 'Harika müzik! 🎵'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recording Indicator */}
      {isRecording && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed top-6 right-6 z-30"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg font-bold"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span>Kaydediliyor</span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tempo Indicator */}
      <div className="fixed top-6 left-6 z-30">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="text-2xl">{currentTempo.emoji}</div>
            <div>
              <p className="text-sm font-bold text-gray-800">{currentTempo.name}</p>
              <p className="text-xs text-gray-600">{currentTempo.bpm} BPM</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MusicMaker;