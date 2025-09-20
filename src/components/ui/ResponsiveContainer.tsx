import React from 'react';
import { motion } from 'motion/react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const spacingMap = {
  tight: 'p-2 gap-2',
  normal: 'p-4 gap-4', 
  loose: 'p-6 gap-6'
};

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg', 
  xl: 'max-w-xl',
  full: 'max-w-full'
};

export function ResponsiveContainer({
  children,
  className = '',
  spacing = 'normal',
  maxWidth = 'md'
}: ResponsiveContainerProps) {
  return (
    <motion.div
      className={`
        w-full mx-auto
        ${spacingMap[spacing]}
        ${maxWidthMap[maxWidth]}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Grid system for child-friendly layouts
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gridMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
};

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
};

export function ResponsiveGrid({
  children,
  columns = 2,
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  return (
    <div className={`
      grid ${gridMap[columns]} ${gapMap[gap]} w-full
      ${className}
    `}>
      {children}
    </div>
  );
}

// Safe area support for mobile devices
interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeAreaContainer({ children, className = '' }: SafeAreaContainerProps) {
  return (
    <div 
      className={`
        min-h-screen w-full
        pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right
        ${className}
      `}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
        paddingRight: 'max(env(safe-area-inset-right), 1rem)'
      }}
    >
      {children}
    </div>
  );
}

// Viewport height container for mobile
interface ViewportContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ViewportContainer({ children, className = '' }: ViewportContainerProps) {
  return (
    <div 
      className={`w-full ${className}`}
      style={{
        minHeight: '100vh',
        minHeight: '100dvh' // Dynamic viewport height for mobile
      }}
    >
      {children}
    </div>
  );
}