import React from 'react';
import { motion } from 'motion/react';

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}

const FloatingElement = React.memo(({ children, delay = 0, duration = 8, style }: FloatingElementProps) => {
  return (
    <motion.div
      className="absolute opacity-15 pointer-events-none select-none hardware-accelerated"
      style={style}
      animate={{
        y: [-30, 30, -30], // Reduced movement
        x: [-15, 15, -15], // Reduced movement
        rotate: [0, 10, -10, 0], // Reduced rotation
        scale: [1, 1.1, 0.95, 1], // Reduced scale
      }}
      transition={{
        duration: duration + 2, // Slower for better performance
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
});

export function TocaBackground() {
  // Reduced background elements for better performance
  const backgroundElements = [
    { emoji: '🌟', size: 'text-6xl', top: '5%', left: '5%', delay: 0 },
    { emoji: '🎵', size: 'text-5xl', top: '15%', right: '10%', delay: 1 },
    { emoji: '🌈', size: 'text-6xl', bottom: '20%', left: '8%', delay: 2 },
    { emoji: '⭐', size: 'text-5xl', bottom: '5%', right: '15%', delay: 3 },
    { emoji: '🎈', size: 'text-4xl', top: '40%', left: '2%', delay: 4 },
    { emoji: '🦋', size: 'text-4xl', top: '60%', right: '5%', delay: 5 },
    { emoji: '🎨', size: 'text-4xl', top: '70%', left: '15%', delay: 6 },
    { emoji: '🌸', size: 'text-4xl', top: '25%', left: '20%', delay: 7 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Toca Boca style gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-orange-800 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900" />
      
      {/* Simplified gradient overlay for performance */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-blue-500/15"
        animate={{
          opacity: [0.15, 0.25, 0.15] // Simple opacity animation instead of complex gradients
        }}
        transition={{
          duration: 8, // Faster cycle
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating elements */}
      {backgroundElements.map((element, index) => (
        <FloatingElement
          key={index}
          delay={element.delay}
          duration={6 + Math.random() * 4} // Vary duration for natural movement
          style={{
            top: element.top,
            bottom: element.bottom,
            left: element.left,
            right: element.right,
          }}
        >
          <div className={element.size}>{element.emoji}</div>
        </FloatingElement>
      ))}

      {/* Toca style geometric shapes */}
      <motion.div
        className="absolute top-20 left-10 w-16 h-16 bg-yellow-400/30 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-32 right-16 w-12 h-12 bg-pink-400/30 rotate-45"
        animate={{
          rotate: [45, 225, 45],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/2 left-20 w-8 h-20 bg-blue-400/30 rounded-full"
        animate={{
          scaleY: [1, 1.5, 1],
          x: [-10, 10, -10]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Reduced sparkle effects for performance */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-30 hardware-accelerated"
          style={{
            top: `${20 + Math.random() * 60}%`, // Keep sparkles in visible area
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}