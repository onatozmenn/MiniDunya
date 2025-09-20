import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TouchFeedbackProps {
  children: React.ReactNode;
  onTouch?: () => void;
  className?: string;
  hapticFeedback?: boolean;
  rippleColor?: string;
  scale?: number;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

export function TouchFeedback({
  children,
  onTouch,
  className = '',
  hapticFeedback = true,
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  scale = 0.95
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  const handleTouch = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (onTouch) onTouch();

    // Haptic feedback for supported devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Create ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newRipple: RippleEffect = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 800);
  }, [onTouch, hapticFeedback]);

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  }, []);

  return (
    <motion.div
      className={`relative overflow-hidden cursor-pointer select-none touch-friendly ${className}`}
      whileTap={{ scale }}
      onTouchStart={handleTouch}
      onMouseDown={handleTouch}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
      
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              background: rippleColor,
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ 
              width: 200, 
              height: 200, 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut" 
            }}
            onAnimationComplete={() => removeRipple(ripple.id)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Çocuk dostu dokunma geri bildirimi için özel hook
export function useChildFriendlyTouch() {
  const [isPressed, setIsPressed] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    
    // Success feedback
    setSuccessCount(prev => prev + 1);
    
    // Audio feedback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback for browsers without audio context
      console.log('Audio feedback not available');
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  return {
    isPressed,
    successCount,
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
      onMouseLeave: handleTouchEnd
    }
  };
}