import { useEffect, useRef, useCallback } from 'react';

// Performance optimization hook
export function usePerformance() {
  const frameId = useRef<number>();
  const isVisible = useRef(true);

  // Throttle function for better performance
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // RequestAnimationFrame wrapper
  const requestFrame = useCallback((callback: () => void) => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }
    frameId.current = requestAnimationFrame(callback);
  }, []);

  // Visibility API integration
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, []);

  return {
    throttle,
    debounce,
    requestFrame,
    isVisible: isVisible.current
  };
}

// Memory cleanup utility
export function useCleanup(cleanupFn: () => void, deps: any[] = []) {
  useEffect(() => {
    return cleanupFn;
  }, deps);
}

// Audio context management
export function useAudioContext() {
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended
    if (contextRef.current.state === 'suspended') {
      contextRef.current.resume();
    }
    
    return contextRef.current;
  }, []);

  const closeContext = useCallback(() => {
    if (contextRef.current && contextRef.current.state !== 'closed') {
      contextRef.current.close();
      contextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      closeContext();
    };
  }, [closeContext]);

  return { getContext, closeContext };
}