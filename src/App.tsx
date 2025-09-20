import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { aiVoiceManager } from './components/utils/AIVoiceManager';

// Lazy load components
const MainHub = lazy(() => import('./components/MainHub').then(module => ({ default: module.MainHub })));
const TocaPiano = lazy(() => import('./components/TocaPiano').then(module => ({ default: module.TocaPiano })));
const SongSelector = lazy(() => import('./components/SongSelector').then(module => ({ default: module.SongSelector })));
const SongLearning = lazy(() => import('./components/SongLearning').then(module => ({ default: module.SongLearning })));
const TocaBackground = lazy(() => import('./components/TocaBackground').then(module => ({ default: module.TocaBackground })));
const GameSelector = lazy(() => import('./components/GameSelector').then(module => ({ default: module.GameSelector })));
const GamePlayer = lazy(() => import('./components/GamePlayer').then(module => ({ default: module.GamePlayer })));
const StorySelector = lazy(() => import('./components/stories/StorySelector'));
const InteractiveStory = lazy(() => import('./components/stories/InteractiveStory'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export default function App() {
  // Always dark mode - no toggle needed
  const volume = useMemo(() => 0.7, []); // Memoized fixed volume
  const [currentPage, setCurrentPage] = useState<'home' | 'piano' | 'songs' | 'learning' | 'games' | 'game-play' | 'stories' | 'story-play'>('home');
  const [selectedSong, setSelectedSong] = useState<string>('twinkle');
  const [selectedGame, setSelectedGame] = useState<string>('bubbles');
  const [selectedStory, setSelectedStory] = useState<string>('red-riding-hood');

  // Set dark mode on mount - optimized with performance monitoring
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Enhanced error handling for speech synthesis
    const handleSpeechError = (event: Event) => {
      console.warn('🎤 Global speech error caught:', event);
      // Prevent the error from propagating
      event.preventDefault();
      event.stopPropagation();
    };
    
    // Add global speech error listeners
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('error', handleSpeechError);
      
      // Also handle voiceschanged errors
      speechSynthesis.addEventListener('voiceschanged', () => {
        console.log('🔄 Speech voices updated');
      });
    }
    
    // Global unhandled error catcher for speech-related issues
    const handleUnhandledError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      if (error && typeof error === 'string' && error.includes('speech')) {
        console.warn('🎤 Speech-related error caught globally:', error);
        event.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('error', handleUnhandledError);
    
    // Performance optimizations
    const initOptimizations = () => {
      // Preload audio context
      if (!window.audioContextPreloaded) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctx.close();
        window.audioContextPreloaded = true;
      }

      // Memory management
      if ('gc' in window && typeof window.gc === 'function') {
        setTimeout(() => window.gc(), 5000);
      }

      // Preload critical images/resources
      const criticalResources = ['🎹', '🎵', '🌟', '🎼'];
      criticalResources.forEach(emoji => {
        const img = new Image();
        img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">${emoji}</text></svg>`;
      });
    };

    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initOptimizations, { timeout: 1000 });
    } else {
      setTimeout(initOptimizations, 100);
    }

    // Cleanup function
    return () => {
      if (window.audioContextPreloaded) {
        window.audioContextPreloaded = false;
      }
      
      // Remove event listeners
      if ('speechSynthesis' in window) {
        speechSynthesis.removeEventListener('error', handleSpeechError);
      }
      window.removeEventListener('error', handleUnhandledError);
    };
  }, []);

  // Optimized handlers
  const handleNotePlay = useMemo(() => () => {
    // Simplified - no tracking for performance
  }, []);

  // INTELLIGENT AUDIO SHUTDOWN when navigating between pages
  const handlePageChange = (newPage: 'home' | 'piano' | 'songs' | 'learning' | 'games' | 'game-play' | 'stories' | 'story-play') => {
    console.log('🔄 Navigating to:', newPage);
    
    // SMART AUDIO SHUTDOWN
    try {
      // Stop AI Voice Manager
      aiVoiceManager.stop();
      
      // Gracefully stop speech synthesis
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        
        // Wait a bit then try again if still speaking
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
        }, 100);
      }
      
      // Stop and cleanup audio elements
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        try {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
          // Don't remove from DOM, just stop playback
        } catch (error) {
          // Silent cleanup
        }
      });
      
    } catch (error) {
      console.warn('Audio cleanup error:', error);
    }
    
    // Set page with slight delay to ensure cleanup
    setTimeout(() => {
      setCurrentPage(newPage);
    }, 50);
  };

  return (
    <div className="min-h-screen relative overflow-hidden dark flex flex-col">
      {/* Optimized Background - Lazy loaded */}
      <Suspense fallback={null}>
        <TocaBackground />
      </Suspense>
      
      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center flex-1"
        style={{ padding: 'var(--mobile-padding)' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <motion.div 
            key={`page-${currentPage}-${selectedSong}`}
            className="w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          >
            {currentPage === 'home' && (
              <MainHub 
                onNavigate={handlePageChange}
              />
            )}
            
            {currentPage === 'piano' && (
              <TocaPiano 
                volume={volume} 
                onNotePlay={handleNotePlay} 
                onNoteChange={() => {}}
                onGoToLearning={() => handlePageChange('songs')}
              />
            )}
            
            {currentPage === 'songs' && (
              <SongSelector 
                onSelectSong={(songId) => {
                  setSelectedSong(songId);
                  handlePageChange('learning');
                }}
                onGoBack={() => handlePageChange('home')}
              />
            )}
            
            {currentPage === 'learning' && (
              <SongLearning 
                volume={volume}
                songId={selectedSong}
                onGoBack={() => handlePageChange('songs')}
              />
            )}
            
            {currentPage === 'games' && (
              <GameSelector 
                onSelectGame={(gameId) => {
                  setSelectedGame(gameId);
                  handlePageChange('game-play');
                }}
                onGoBack={() => handlePageChange('home')}
              />
            )}
            
            {currentPage === 'game-play' && (
              <GamePlayer 
                volume={volume}
                gameId={selectedGame}
                onGoBack={() => handlePageChange('games')}
              />
            )}
            
            {currentPage === 'stories' && (
              <StorySelector 
                onSelectStory={(storyId) => {
                  setSelectedStory(storyId);
                  handlePageChange('story-play');
                }}
                onGoBack={() => handlePageChange('home')}
              />
            )}
            
            {currentPage === 'story-play' && (
              <InteractiveStory 
                storyId={selectedStory}
                onGoBack={() => handlePageChange('stories')}
              />
            )}
          </motion.div>
        </Suspense>
      </main>

      {/* Footer - Developer Credit */}
      <footer className="relative z-20 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-center"
          style={{ padding: 'var(--mobile-padding)' }}
        >
          <div style={{
            fontSize: 'var(--text-kids-small)',
            fontFamily: 'var(--font-text)',
            fontWeight: 'var(--font-weight-normal)',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.5px'
          }}>
            Developed by Onat Özmen
          </div>
        </motion.div>
      </footer>
    </div>
  );
}