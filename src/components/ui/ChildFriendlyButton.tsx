import React from 'react';
import { motion } from 'motion/react';
import { TouchFeedback } from './TouchFeedback';

interface ChildFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  gradient?: 'happy' | 'calm' | 'energy' | 'love' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  emoji?: string;
  disabled?: boolean;
  loading?: boolean;
}

const gradientMap = {
  happy: 'var(--btn-gradient-happy)',
  calm: 'var(--btn-gradient-calm)',
  energy: 'var(--btn-gradient-energy)',
  love: 'var(--btn-gradient-love)'
};

const sizeMap = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]',
  xl: 'px-10 py-5 text-xl min-h-[64px]'
};

export function ChildFriendlyButton({
  children,
  onClick,
  className = '',
  gradient = 'happy',
  size = 'md',
  emoji,
  disabled = false,
  loading = false
}: ChildFriendlyButtonProps) {
  const gradientStyle = gradientMap[gradient as keyof typeof gradientMap] || gradient;

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <TouchFeedback
      onTouch={handleClick}
      className={`
        relative rounded-2xl font-semibold shadow-lg transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${sizeMap[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl active:shadow-md'}
        ${className}
      `}
      hapticFeedback={!disabled}
      scale={disabled ? 1 : 0.95}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center gap-3 relative z-10"
        style={{
          background: disabled ? 'var(--muted)' : gradientStyle,
          borderRadius: 'inherit'
        }}
        animate={loading ? { 
          background: [
            'var(--gradient-strawberry)',
            'var(--gradient-lavender)',
            'var(--gradient-mint)',
            'var(--gradient-peach)',
            'var(--gradient-strawberry)'
          ]
        } : {}}
        transition={loading ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        {emoji && (
          <motion.span
            className="text-2xl"
            animate={loading ? {
              rotate: [0, 360]
            } : {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={loading ? {
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            } : {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {loading ? '⭐' : emoji}
          </motion.span>
        )}
        
        <span className="text-white drop-shadow-sm">
          {loading ? 'Yükleniyor...' : children}
        </span>

        {loading && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-white rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Glow effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{
            background: gradientStyle,
            filter: 'blur(8px)',
            transform: 'scale(1.05)'
          }}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </TouchFeedback>
  );
}

// Success animation component
export function ButtonSuccessAnimation({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <motion.div
        className="text-4xl"
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, 360, 720]
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut"
        }}
      >
        ✨
      </motion.div>
    </motion.div>
  );
}