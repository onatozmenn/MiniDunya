import React from 'react';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface RecentNotesProps {
  notes: string[];
  animalEmojis: { [key: string]: string };
}

export function RecentNotes({ notes, animalEmojis }: RecentNotesProps) {
  if (notes.length === 0) return null;

  return (
    <Card className="p-4 w-full max-w-lg border-0 shadow-lg rounded-3xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-600/30 dark:to-pink-600/30 dark:bg-slate-800/50 transition-all duration-300">
      <div className="text-center">
        <div className="text-3xl mb-3">🎶</div>
        <div className="flex justify-center gap-2 flex-wrap">
          {notes.slice(-6).map((note, index) => (
            <motion.div
              key={`${note}-${index}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                bounce: 0.6 
              }}
              className="text-4xl"
            >
              {animalEmojis[note] || '🎵'}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}