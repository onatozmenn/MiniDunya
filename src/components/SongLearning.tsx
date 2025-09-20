import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { getSoundManager } from './utils/SoundManager';

interface PianoKey {
  note: string;
  frequency: number;
  animal: string;
  emoji: string;
  color: string;
  tocaColor: string;
  tocaStyle: string;
  sound: string;
}

interface SongNote {
  note: string;
  lyric: string;
  emoji: string;
}

const SONGS: { [key: string]: { notes: SongNote[], title: string, emoji: string, color: string } } = {
  'twinkle': {
    title: 'Twinkle Twinkle Little Star',
    emoji: '⭐',
    color: 'from-yellow-500/20 to-orange-500/20',
    notes: [
      // First verse - complete
      { note: 'C4', lyric: 'Twin-', emoji: '✨' },
      { note: 'C4', lyric: 'kle', emoji: '⭐' },
      { note: 'G4', lyric: 'twin-', emoji: '✨' },
      { note: 'G4', lyric: 'kle', emoji: '⭐' },
      { note: 'A4', lyric: 'lit-', emoji: '🌟' },
      { note: 'A4', lyric: 'tle', emoji: '✨' },
      { note: 'G4', lyric: 'star', emoji: '⭐' },
      { note: 'F4', lyric: 'How', emoji: '❓' },
      { note: 'F4', lyric: 'I', emoji: '👀' },
      { note: 'E4', lyric: 'won-', emoji: '🤔' },
      { note: 'E4', lyric: 'der', emoji: '💭' },
      { note: 'D4', lyric: 'what', emoji: '❓' },
      { note: 'D4', lyric: 'you', emoji: '👆' },
      { note: 'C4', lyric: 'are', emoji: '⭐' },
      // Second verse
      { note: 'G4', lyric: 'Up', emoji: '⬆️' },
      { note: 'G4', lyric: 'a-', emoji: '☁️' },
      { note: 'F4', lyric: 'bove', emoji: '🌌' },
      { note: 'F4', lyric: 'the', emoji: '🌍' },
      { note: 'E4', lyric: 'world', emoji: '🌎' },
      { note: 'E4', lyric: 'so', emoji: '🔝' },
      { note: 'D4', lyric: 'high', emoji: '⬆️' },
      { note: 'G4', lyric: 'Like', emoji: '✨' },
      { note: 'G4', lyric: 'a', emoji: '💎' },
      { note: 'F4', lyric: 'dia-', emoji: '💍' },
      { note: 'F4', lyric: 'mond', emoji: '💎' },
      { note: 'E4', lyric: 'in', emoji: '🌌' },
      { note: 'E4', lyric: 'the', emoji: '🌃' },
      { note: 'D4', lyric: 'sky', emoji: '🌟' },
      // Final verse
      { note: 'C4', lyric: 'Twin-', emoji: '✨' },
      { note: 'C4', lyric: 'kle', emoji: '⭐' },
      { note: 'G4', lyric: 'twin-', emoji: '✨' },
      { note: 'G4', lyric: 'kle', emoji: '⭐' },
      { note: 'A4', lyric: 'lit-', emoji: '🌟' },
      { note: 'A4', lyric: 'tle', emoji: '✨' },
      { note: 'G4', lyric: 'star', emoji: '⭐' },
      { note: 'F4', lyric: 'How', emoji: '❓' },
      { note: 'F4', lyric: 'I', emoji: '👀' },
      { note: 'E4', lyric: 'won-', emoji: '🤔' },
      { note: 'E4', lyric: 'der', emoji: '💭' },
      { note: 'D4', lyric: 'what', emoji: '❓' },
      { note: 'D4', lyric: 'you', emoji: '👆' },
      { note: 'C4', lyric: 'are!', emoji: '🎉' }
    ]
  },
  'happy-birthday': {
    title: 'Happy Birthday',
    emoji: '🎂',
    color: 'from-pink-500/20 to-purple-500/20',
    notes: [
      // Complete 4 verses
      { note: 'C4', lyric: 'Hap-', emoji: '🎉' },
      { note: 'C4', lyric: 'py', emoji: '😊' },
      { note: 'D4', lyric: 'birth-', emoji: '🎂' },
      { note: 'C4', lyric: 'day', emoji: '🎈' },
      { note: 'F4', lyric: 'to', emoji: '🎁' },
      { note: 'E4', lyric: 'you', emoji: '👏' },
      { note: 'C4', lyric: 'Hap-', emoji: '🎉' },
      { note: 'C4', lyric: 'py', emoji: '😊' },
      { note: 'D4', lyric: 'birth-', emoji: '🎂' },
      { note: 'C4', lyric: 'day', emoji: '🎈' },
      { note: 'G4', lyric: 'to', emoji: '🎁' },
      { note: 'F4', lyric: 'you', emoji: '👏' },
      { note: 'C4', lyric: 'Hap-', emoji: '🎉' },
      { note: 'C4', lyric: 'py', emoji: '😊' },
      { note: 'A4', lyric: 'birth-', emoji: '🎂' },
      { note: 'F4', lyric: 'day', emoji: '🎈' },
      { note: 'E4', lyric: 'dear', emoji: '❤️' },
      { note: 'D4', lyric: 'friend', emoji: '👦' },
      { note: 'G4', lyric: 'Hap-', emoji: '🎉' },
      { note: 'G4', lyric: 'py', emoji: '😊' },
      { note: 'F4', lyric: 'birth-', emoji: '🎂' },
      { note: 'E4', lyric: 'day', emoji: '🎈' },
      { note: 'D4', lyric: 'to', emoji: '🎁' },
      { note: 'C4', lyric: 'you!', emoji: '🎊' }
    ]
  },
  'mary-lamb': {
    title: 'Mary Had a Little Lamb',
    emoji: '🐑',
    color: 'from-green-500/20 to-emerald-500/20',
    notes: [
      // Complete 3 verses
      { note: 'E4', lyric: 'Ma-', emoji: '👧' },
      { note: 'D4', lyric: 'ry', emoji: '🐑' },
      { note: 'C4', lyric: 'had', emoji: '❤️' },
      { note: 'D4', lyric: 'a', emoji: '🐑' },
      { note: 'E4', lyric: 'lit-', emoji: '👶' },
      { note: 'E4', lyric: 'tle', emoji: '🐑' },
      { note: 'E4', lyric: 'lamb', emoji: '🐑' },
      { note: 'D4', lyric: 'Its', emoji: '🌟' },
      { note: 'D4', lyric: 'fleece', emoji: '☁️' },
      { note: 'D4', lyric: 'was', emoji: '⚪' },
      { note: 'E4', lyric: 'white', emoji: '🤍' },
      { note: 'G4', lyric: 'as', emoji: '❄️' },
      { note: 'G4', lyric: 'snow', emoji: '❄️' },
      // Second verse
      { note: 'E4', lyric: 'And', emoji: '➕' },
      { note: 'D4', lyric: 'ev-', emoji: '👀' },
      { note: 'C4', lyric: 'ery-', emoji: '📍' },
      { note: 'D4', lyric: 'where', emoji: '🌍' },
      { note: 'E4', lyric: 'that', emoji: '👧' },
      { note: 'E4', lyric: 'Ma-', emoji: '👧' },
      { note: 'E4', lyric: 'ry', emoji: '🚶' },
      { note: 'D4', lyric: 'went', emoji: '🦶' },
      { note: 'D4', lyric: 'The', emoji: '🐑' },
      { note: 'D4', lyric: 'lamb', emoji: '🐑' },
      { note: 'E4', lyric: 'was', emoji: '👀' },
      { note: 'G4', lyric: 'sure', emoji: '✅' },
      { note: 'G4', lyric: 'to', emoji: '👉' },
      { note: 'C4', lyric: 'go', emoji: '🚶' }
    ]
  },
  'old-macdonald': {
    title: 'Old MacDonald Had a Farm',
    emoji: '🚜',
    color: 'from-green-500/20 to-blue-500/20',
    notes: [
      { note: 'C4', lyric: 'Old', emoji: '👴' },
      { note: 'C4', lyric: 'Mac-', emoji: '🚜' },
      { note: 'C4', lyric: 'Don-', emoji: '👨‍🌾' },
      { note: 'G4', lyric: 'ald', emoji: '🏡' },
      { note: 'G4', lyric: 'had', emoji: '🫴' },
      { note: 'G4', lyric: 'a', emoji: '🚜' },
      { note: 'F4', lyric: 'farm', emoji: '🏡' },
      { note: 'E4', lyric: 'E-', emoji: '🎵' },
      { note: 'E4', lyric: 'I-', emoji: '🎵' },
      { note: 'E4', lyric: 'E-', emoji: '🎵' },
      { note: 'C4', lyric: 'I-', emoji: '🎵' },
      { note: 'C4', lyric: 'O', emoji: '🎵' },
      { note: 'C4', lyric: 'And', emoji: '➕' },
      { note: 'C4', lyric: 'on', emoji: '📍' },
      { note: 'C4', lyric: 'his', emoji: '👨‍🌾' },
      { note: 'G4', lyric: 'farm', emoji: '🏡' },
      { note: 'G4', lyric: 'he', emoji: '👨‍🌾' },
      { note: 'G4', lyric: 'had', emoji: '🫴' },
      { note: 'F4', lyric: 'some', emoji: '🐄' },
      { note: 'E4', lyric: 'cows', emoji: '🐄' },
      { note: 'E4', lyric: 'E-', emoji: '🎵' },
      { note: 'E4', lyric: 'I-', emoji: '🎵' },
      { note: 'C4', lyric: 'E-', emoji: '🎵' },
      { note: 'C4', lyric: 'I-', emoji: '🎵' },
      { note: 'C4', lyric: 'O!', emoji: '🎉' }
    ]
  },
  'row-boat': {
    title: 'Row Row Row Your Boat',
    emoji: '🚣',
    color: 'from-blue-500/20 to-cyan-500/20',
    notes: [
      { note: 'C4', lyric: 'Row', emoji: '🚣' },
      { note: 'C4', lyric: 'row', emoji: '🚣' },
      { note: 'C4', lyric: 'row', emoji: '🚣' },
      { note: 'D4', lyric: 'your', emoji: '👆' },
      { note: 'E4', lyric: 'boat', emoji: '⛵' },
      { note: 'E4', lyric: 'Gent-', emoji: '😌' },
      { note: 'D4', lyric: 'ly', emoji: '🌊' },
      { note: 'E4', lyric: 'down', emoji: '⬇️' },
      { note: 'F4', lyric: 'the', emoji: '🌊' },
      { note: 'G4', lyric: 'stream', emoji: '💧' },
      { note: 'G4', lyric: 'Mer-', emoji: '😊' },
      { note: 'F4', lyric: 'ri-', emoji: '🎵' },
      { note: 'E4', lyric: 'ly', emoji: '😄' },
      { note: 'F4', lyric: 'mer-', emoji: '🎵' },
      { note: 'G4', lyric: 'ri-', emoji: '🎵' },
      { note: 'E4', lyric: 'ly', emoji: '😄' },
      { note: 'E4', lyric: 'mer-', emoji: '🎵' },
      { note: 'D4', lyric: 'ri-', emoji: '🎵' },
      { note: 'E4', lyric: 'ly', emoji: '😄' },
      { note: 'F4', lyric: 'mer-', emoji: '🎵' },
      { note: 'G4', lyric: 'ri-', emoji: '🎵' },
      { note: 'C4', lyric: 'ly', emoji: '😄' },
      { note: 'C4', lyric: 'Life', emoji: '🌱' },
      { note: 'D4', lyric: 'is', emoji: '✨' },
      { note: 'E4', lyric: 'but', emoji: '🌟' },
      { note: 'C4', lyric: 'a', emoji: '💭' },
      { note: 'C4', lyric: 'dream!', emoji: '💤' }
    ]
  },
  'wheels-bus': {
    title: 'The Wheels on the Bus',
    emoji: '🚌',
    color: 'from-orange-500/20 to-red-500/20',
    notes: [
      { note: 'C4', lyric: 'The', emoji: '🚌' },
      { note: 'C4', lyric: 'wheels', emoji: '⚙️' },
      { note: 'C4', lyric: 'on', emoji: '📍' },
      { note: 'C4', lyric: 'the', emoji: '🚌' },
      { note: 'F4', lyric: 'bus', emoji: '🚌' },
      { note: 'F4', lyric: 'go', emoji: '🔄' },
      { note: 'G4', lyric: 'round', emoji: '🔄' },
      { note: 'G4', lyric: 'and', emoji: '➕' },
      { note: 'A4', lyric: 'round', emoji: '🔄' },
      { note: 'A4', lyric: 'Round', emoji: '🔄' },
      { note: 'A4', lyric: 'and', emoji: '➕' },
      { note: 'A4', lyric: 'round', emoji: '🔄' },
      { note: 'A4', lyric: 'round', emoji: '🔄' },
      { note: 'A4', lyric: 'and', emoji: '➕' },
      { note: 'G4', lyric: 'round', emoji: '🔄' },
      { note: 'C4', lyric: 'The', emoji: '🚌' },
      { note: 'C4', lyric: 'wheels', emoji: '⚙️' },
      { note: 'C4', lyric: 'on', emoji: '📍' },
      { note: 'C4', lyric: 'the', emoji: '🚌' },
      { note: 'F4', lyric: 'bus', emoji: '🚌' },
      { note: 'F4', lyric: 'go', emoji: '🔄' },
      { note: 'G4', lyric: 'round', emoji: '🔄' },
      { note: 'G4', lyric: 'and', emoji: '➕' },
      { note: 'C4', lyric: 'round!', emoji: '🎉' }
    ]
  },
  'baa-sheep': {
    title: 'Baa Baa Black Sheep',
    emoji: '🐑',
    color: 'from-gray-500/20 to-purple-500/20',
    notes: [
      { note: 'C4', lyric: 'Baa', emoji: '🐑' },
      { note: 'C4', lyric: 'baa', emoji: '🐑' },
      { note: 'G4', lyric: 'black', emoji: '⚫' },
      { note: 'G4', lyric: 'sheep', emoji: '🐑' },
      { note: 'A4', lyric: 'Have', emoji: '❓' },
      { note: 'A4', lyric: 'you', emoji: '👆' },
      { note: 'G4', lyric: 'any', emoji: '🤷' },
      { note: 'G4', lyric: 'wool?', emoji: '☁️' },
      { note: 'F4', lyric: 'Yes', emoji: '✅' },
      { note: 'F4', lyric: 'sir', emoji: '👨' },
      { note: 'E4', lyric: 'yes', emoji: '✅' },
      { note: 'E4', lyric: 'sir', emoji: '👨' },
      { note: 'D4', lyric: 'Three', emoji: '3️⃣' },
      { note: 'D4', lyric: 'bags', emoji: '🛍️' },
      { note: 'C4', lyric: 'full!', emoji: '🎒' },
      { note: 'G4', lyric: 'One', emoji: '1️⃣' },
      { note: 'F4', lyric: 'for', emoji: '👉' },
      { note: 'E4', lyric: 'the', emoji: '👨' },
      { note: 'D4', lyric: 'mas-', emoji: '👑' },
      { note: 'C4', lyric: 'ter', emoji: '👨‍💼' },
      { note: 'G4', lyric: 'One', emoji: '1️⃣' },
      { note: 'F4', lyric: 'for', emoji: '👉' },
      { note: 'E4', lyric: 'the', emoji: '👩' },
      { note: 'D4', lyric: 'dame', emoji: '👸' },
      { note: 'C4', lyric: 'And', emoji: '➕' },
      { note: 'G4', lyric: 'one', emoji: '1️⃣' },
      { note: 'F4', lyric: 'for', emoji: '👉' },
      { note: 'E4', lyric: 'the', emoji: '👶' },
      { note: 'D4', lyric: 'lit-', emoji: '👶' },
      { note: 'D4', lyric: 'tle', emoji: '👦' },
      { note: 'C4', lyric: 'boy', emoji: '👦' }
    ]
  },
  'if-happy': {
    title: 'If You\'re Happy and You Know It',
    emoji: '😊',
    color: 'from-yellow-500/20 to-green-500/20',
    notes: [
      { note: 'F4', lyric: 'If', emoji: '❓' },
      { note: 'F4', lyric: 'you\'re', emoji: '👆' },
      { note: 'F4', lyric: 'hap-', emoji: '😊' },
      { note: 'F4', lyric: 'py', emoji: '😄' },
      { note: 'A4', lyric: 'and', emoji: '➕' },
      { note: 'A4', lyric: 'you', emoji: '👆' },
      { note: 'A4', lyric: 'know', emoji: '🧠' },
      { note: 'A4', lyric: 'it', emoji: '✨' },
      { note: 'C4', lyric: 'clap', emoji: '👏' },
      { note: 'A4', lyric: 'your', emoji: '👐' },
      { note: 'F4', lyric: 'hands!', emoji: '👏' },
      { note: 'F4', lyric: 'If', emoji: '❓' },
      { note: 'F4', lyric: 'you\'re', emoji: '👆' },
      { note: 'F4', lyric: 'hap-', emoji: '😊' },
      { note: 'F4', lyric: 'py', emoji: '😄' },
      { note: 'A4', lyric: 'and', emoji: '➕' },
      { note: 'A4', lyric: 'you', emoji: '👆' },
      { note: 'A4', lyric: 'know', emoji: '🧠' },
      { note: 'A4', lyric: 'it', emoji: '✨' },
      { note: 'C4', lyric: 'clap', emoji: '👏' },
      { note: 'A4', lyric: 'your', emoji: '👐' },
      { note: 'F4', lyric: 'hands!', emoji: '👏' },
      { note: 'F4', lyric: 'If', emoji: '❓' },
      { note: 'F4', lyric: 'you\'re', emoji: '👆' },
      { note: 'D4', lyric: 'hap-', emoji: '😊' },
      { note: 'D4', lyric: 'py', emoji: '😄' },
      { note: 'G4', lyric: 'and', emoji: '➕' },
      { note: 'G4', lyric: 'you', emoji: '👆' },
      { note: 'E4', lyric: 'know', emoji: '🧠' },
      { note: 'E4', lyric: 'it', emoji: '✨' },
      { note: 'A4', lyric: 'Then', emoji: '👉' },
      { note: 'A4', lyric: 'your', emoji: '👆' },
      { note: 'F4', lyric: 'face', emoji: '😊' },
      { note: 'F4', lyric: 'will', emoji: '💫' },
      { note: 'D4', lyric: 'sure-', emoji: '✅' },
      { note: 'D4', lyric: 'ly', emoji: '💯' },
      { note: 'C4', lyric: 'show', emoji: '✨' },
      { note: 'F4', lyric: 'it!', emoji: '😄' }
    ]
  },
  'london-bridge': {
    title: 'London Bridge is Falling Down',
    emoji: '🌉',
    color: 'from-red-500/20 to-orange-500/20',
    notes: [
      { note: 'G4', lyric: 'Lon-', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { note: 'A4', lyric: 'don', emoji: '🌉' },
      { note: 'G4', lyric: 'Bridge', emoji: '🌉' },
      { note: 'F4', lyric: 'is', emoji: '📍' },
      { note: 'G4', lyric: 'fall-', emoji: '⬇️' },
      { note: 'A4', lyric: 'ing', emoji: '💥' },
      { note: 'G4', lyric: 'down', emoji: '⬇️' },
      { note: 'G4', lyric: 'Fall-', emoji: '⬇️' },
      { note: 'A4', lyric: 'ing', emoji: '💥' },
      { note: 'G4', lyric: 'down', emoji: '⬇️' },
      { note: 'G4', lyric: 'fall-', emoji: '⬇️' },
      { note: 'A4', lyric: 'ing', emoji: '💥' },
      { note: 'G4', lyric: 'down', emoji: '⬇️' },
      { note: 'G4', lyric: 'Lon-', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { note: 'A4', lyric: 'don', emoji: '🌉' },
      { note: 'G4', lyric: 'Bridge', emoji: '🌉' },
      { note: 'F4', lyric: 'is', emoji: '📍' },
      { note: 'G4', lyric: 'fall-', emoji: '⬇️' },
      { note: 'A4', lyric: 'ing', emoji: '💥' },
      { note: 'G4', lyric: 'down', emoji: '⬇️' },
      { note: 'F4', lyric: 'My', emoji: '👆' },
      { note: 'E4', lyric: 'fair', emoji: '✨' },
      { note: 'D4', lyric: 'la-', emoji: '👸' },
      { note: 'C4', lyric: 'dy!', emoji: '💖' }
    ]
  },
  'humpty-dumpty': {
    title: 'Humpty Dumpty',
    emoji: '🥚',
    color: 'from-yellow-500/20 to-red-500/20',
    notes: [
      { note: 'C4', lyric: 'Hump-', emoji: '🥚' },
      { note: 'D4', lyric: 'ty', emoji: '😊' },
      { note: 'E4', lyric: 'Dump-', emoji: '🥚' },
      { note: 'F4', lyric: 'ty', emoji: '😊' },
      { note: 'G4', lyric: 'sat', emoji: '🪑' },
      { note: 'G4', lyric: 'on', emoji: '📍' },
      { note: 'F4', lyric: 'a', emoji: '🧱' },
      { note: 'E4', lyric: 'wall', emoji: '🧱' },
      { note: 'C4', lyric: 'Hump-', emoji: '🥚' },
      { note: 'D4', lyric: 'ty', emoji: '😊' },
      { note: 'E4', lyric: 'Dump-', emoji: '🥚' },
      { note: 'F4', lyric: 'ty', emoji: '😊' },
      { note: 'G4', lyric: 'had', emoji: '💥' },
      { note: 'F4', lyric: 'a', emoji: '😱' },
      { note: 'E4', lyric: 'great', emoji: '💔' },
      { note: 'D4', lyric: 'fall', emoji: '⬇️' },
      { note: 'C4', lyric: 'All', emoji: '👥' },
      { note: 'D4', lyric: 'the', emoji: '👑' },
      { note: 'E4', lyric: 'king\'s', emoji: '🐎' },
      { note: 'F4', lyric: 'hor-', emoji: '🐎' },
      { note: 'G4', lyric: 'ses', emoji: '👥' },
      { note: 'G4', lyric: 'And', emoji: '➕' },
      { note: 'F4', lyric: 'all', emoji: '👥' },
      { note: 'E4', lyric: 'the', emoji: '👑' },
      { note: 'D4', lyric: 'king\'s', emoji: '👨‍⚕️' },
      { note: 'C4', lyric: 'men', emoji: '👥' },
      { note: 'G4', lyric: 'Could-', emoji: '❌' },
      { note: 'F4', lyric: 'n\'t', emoji: '❌' },
      { note: 'E4', lyric: 'put', emoji: '🔧' },
      { note: 'D4', lyric: 'Hump-', emoji: '🥚' },
      { note: 'C4', lyric: 'ty', emoji: '💔' },
      { note: 'G4', lyric: 'to-', emoji: '🔗' },
      { note: 'F4', lyric: 'geth-', emoji: '🔧' },
      { note: 'E4', lyric: 'er', emoji: '💔' },
      { note: 'D4', lyric: 'a-', emoji: '😢' },
      { note: 'C4', lyric: 'gain', emoji: '😢' }
    ]
  },
  'five-ducks': {
    title: 'Five Little Ducks',
    emoji: '🦆',
    color: 'from-blue-500/20 to-yellow-500/20',
    notes: [
      { note: 'C4', lyric: 'Five', emoji: '5️⃣' },
      { note: 'D4', lyric: 'lit-', emoji: '👶' },
      { note: 'E4', lyric: 'tle', emoji: '🦆' },
      { note: 'F4', lyric: 'ducks', emoji: '🦆' },
      { note: 'G4', lyric: 'went', emoji: '🚶' },
      { note: 'G4', lyric: 'swim-', emoji: '🏊' },
      { note: 'F4', lyric: 'ming', emoji: '💧' },
      { note: 'E4', lyric: 'one', emoji: '1️⃣' },
      { note: 'D4', lyric: 'day', emoji: '☀️' },
      { note: 'C4', lyric: 'O-', emoji: '🏔️' },
      { note: 'D4', lyric: 'ver', emoji: '⬇️' },
      { note: 'E4', lyric: 'the', emoji: '⛰️' },
      { note: 'F4', lyric: 'hill', emoji: '🏔️' },
      { note: 'G4', lyric: 'and', emoji: '➕' },
      { note: 'F4', lyric: 'far', emoji: '🔭' },
      { note: 'E4', lyric: 'a-', emoji: '↗️' },
      { note: 'D4', lyric: 'way', emoji: '🔭' },
      { note: 'C4', lyric: 'Moth-', emoji: '🦆' },
      { note: 'D4', lyric: 'er', emoji: '👩' },
      { note: 'E4', lyric: 'duck', emoji: '🦆' },
      { note: 'F4', lyric: 'said', emoji: '💬' },
      { note: 'G4', lyric: 'Quack', emoji: '🗣️' },
      { note: 'G4', lyric: 'quack', emoji: '🗣️' },
      { note: 'F4', lyric: 'quack', emoji: '🗣️' },
      { note: 'E4', lyric: 'quack', emoji: '🗣️' },
      { note: 'D4', lyric: 'But', emoji: '😢' },
      { note: 'C4', lyric: 'on-', emoji: '4️⃣' },
      { note: 'D4', lyric: 'ly', emoji: '😢' },
      { note: 'E4', lyric: 'four', emoji: '4️⃣' },
      { note: 'F4', lyric: 'lit-', emoji: '👶' },
      { note: 'G4', lyric: 'tle', emoji: '🦆' },
      { note: 'F4', lyric: 'ducks', emoji: '🦆' },
      { note: 'E4', lyric: 'came', emoji: '🔙' },
      { note: 'D4', lyric: 'back', emoji: '🔙' }
    ]
  },
  'itsy-spider': {
    title: 'The Itsy Bitsy Spider',
    emoji: '🕷️',
    color: 'from-purple-500/20 to-pink-500/20',
    notes: [
      { note: 'G4', lyric: 'The', emoji: '🕷️' },
      { note: 'C4', lyric: 'it-', emoji: '👶' },
      { note: 'C4', lyric: 'sy', emoji: '🤏' },
      { note: 'C4', lyric: 'bit-', emoji: '👶' },
      { note: 'D4', lyric: 'sy', emoji: '🤏' },
      { note: 'E4', lyric: 'spi-', emoji: '🕷️' },
      { note: 'E4', lyric: 'der', emoji: '🕷️' },
      { note: 'E4', lyric: 'Climbed', emoji: '🧗' },
      { note: 'E4', lyric: 'up', emoji: '⬆️' },
      { note: 'F4', lyric: 'the', emoji: '💧' },
      { note: 'G4', lyric: 'wa-', emoji: '💧' },
      { note: 'G4', lyric: 'ter', emoji: '💧' },
      { note: 'G4', lyric: 'spout', emoji: '🚰' },
      { note: 'G4', lyric: 'Down', emoji: '⬇️' },
      { note: 'A4', lyric: 'came', emoji: '☔' },
      { note: 'G4', lyric: 'the', emoji: '☔' },
      { note: 'F4', lyric: 'rain', emoji: '🌧️' },
      { note: 'E4', lyric: 'And', emoji: '➕' },
      { note: 'D4', lyric: 'washed', emoji: '💦' },
      { note: 'C4', lyric: 'the', emoji: '🕷️' },
      { note: 'D4', lyric: 'spi-', emoji: '🕷️' },
      { note: 'E4', lyric: 'der', emoji: '💦' },
      { note: 'C4', lyric: 'out', emoji: '⬇️' },
      { note: 'E4', lyric: 'Out', emoji: '☀️' },
      { note: 'F4', lyric: 'came', emoji: '☀️' },
      { note: 'G4', lyric: 'the', emoji: '☀️' },
      { note: 'A4', lyric: 'sun', emoji: '☀️' },
      { note: 'G4', lyric: 'And', emoji: '➕' },
      { note: 'F4', lyric: 'dried', emoji: '🌬️' },
      { note: 'E4', lyric: 'up', emoji: '⬆️' },
      { note: 'D4', lyric: 'all', emoji: '💨' },
      { note: 'C4', lyric: 'the', emoji: '☔' },
      { note: 'D4', lyric: 'rain', emoji: '☔' },
      { note: 'G4', lyric: 'And', emoji: '➕' },
      { note: 'C4', lyric: 'the', emoji: '🕷️' },
      { note: 'C4', lyric: 'it-', emoji: '👶' },
      { note: 'C4', lyric: 'sy', emoji: '🤏' },
      { note: 'D4', lyric: 'bit-', emoji: '👶' },
      { note: 'E4', lyric: 'sy', emoji: '🤏' },
      { note: 'E4', lyric: 'spi-', emoji: '🕷️' },
      { note: 'E4', lyric: 'der', emoji: '🕷️' },
      { note: 'E4', lyric: 'Climbed', emoji: '🧗' },
      { note: 'F4', lyric: 'up', emoji: '⬆️' },
      { note: 'G4', lyric: 'the', emoji: '💧' },
      { note: 'A4', lyric: 'spout', emoji: '🚰' },
      { note: 'G4', lyric: 'a-', emoji: '🔄' },
      { note: 'C4', lyric: 'gain!', emoji: '🎉' }
    ]
  }
};

const TOCA_PIANO_KEYS: PianoKey[] = [
  { 
    note: 'C4', frequency: 261.63,
    animal: 'Kedi', emoji: '🐱',
    color: 'bg-gradient-to-br from-pink-400 via-pink-300 to-pink-500',
    tocaColor: 'from-pink-400 via-rose-300 to-pink-500',
    tocaStyle: 'shadow-2xl shadow-pink-300/40 border-4 border-pink-200/80',
    sound: 'Miyav miyav!'
  },
  { 
    note: 'D4', frequency: 293.66,
    animal: 'Köpek', emoji: '🐶',
    color: 'bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500',
    tocaColor: 'from-orange-400 via-amber-300 to-orange-500',
    tocaStyle: 'shadow-2xl shadow-orange-300/40 border-4 border-orange-200/80',
    sound: 'Hav hav!'
  },
  { 
    note: 'E4', frequency: 329.63,
    animal: 'Ördek', emoji: '🦆',
    color: 'bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500',
    tocaColor: 'from-yellow-400 via-yellow-300 to-amber-400',
    tocaStyle: 'shadow-2xl shadow-yellow-300/40 border-4 border-yellow-200/80',
    sound: 'Vak vak!'
  },
  { 
    note: 'F4', frequency: 349.23,
    animal: 'Kurbağa', emoji: '🐸',
    color: 'bg-gradient-to-br from-green-400 via-green-300 to-green-500',
    tocaColor: 'from-green-400 via-emerald-300 to-green-500',
    tocaStyle: 'shadow-2xl shadow-green-300/40 border-4 border-green-200/80',
    sound: 'Vırak vırak!'
  },
  { 
    note: 'G4', frequency: 392.00,
    animal: 'Kuş', emoji: '🐦',
    color: 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500',
    tocaColor: 'from-blue-400 via-sky-300 to-blue-500',
    tocaStyle: 'shadow-2xl shadow-blue-300/40 border-4 border-blue-200/80',
    sound: 'Cik cik!'
  },
  { 
    note: 'A4', frequency: 440.00,
    animal: 'Fare', emoji: '🐭',
    color: 'bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500',
    tocaColor: 'from-purple-400 via-violet-300 to-purple-500',
    tocaStyle: 'shadow-2xl shadow-purple-300/40 border-4 border-purple-200/80',
    sound: 'Cit cit!'
  }
];

interface SongLearningProps {
  volume: number;
  songId: string;
  onGoBack: () => void;
}

export function SongLearning({ volume, songId, onGoBack }: SongLearningProps) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [currentSongStep, setCurrentSongStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [songComplete, setSongComplete] = useState(false);
  const [stars, setStars] = useState<{ id: number, x: number, y: number }[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [lastCorrectNote, setLastCorrectNote] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(true); // Önce dinleme modu
  const [isPlayingDemo, setIsPlayingDemo] = useState(false); // Demo çalıyor mu
  const [demoProgress, setDemoProgress] = useState(0); // Demo ilerleme
  const particleIdRef = useRef(0);
  const demoTimeoutsRef = useRef<NodeJS.Timeout[]>([]); // Demo timeout'larını takip et

  const pianoKeys = useMemo(() => TOCA_PIANO_KEYS, []);
  const currentSong = SONGS[songId] || SONGS['twinkle'];
  const songNotes = currentSong.notes;

  // Reset when song changes or resets
  useEffect(() => {
    setLastCorrectNote(null);
    setIsProcessingStep(false);
    setCurrentSongStep(0);
    setIsListening(true); // Her yeni şarkıda önce dinle
    setDemoProgress(0);
    setIsPlayingDemo(false);
    
    // Önceki demo timeout'larını temizle
    demoTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    demoTimeoutsRef.current = [];
  }, [songId]);

  // Component unmount olduğunda timeout'ları temizle
  useEffect(() => {
    return () => {
      demoTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      demoTimeoutsRef.current = [];
    };
  }, []);

  const playNote = (frequency: number, duration: number = 0.8) => {
    if (volume === 0) return;
    const soundManager = getSoundManager(volume);
    soundManager.playNote(frequency, duration);
  };

  // Demo şarkı çalma fonksiyonu
  const playDemoSong = useCallback(() => {
    if (isPlayingDemo) return;
    
    // Önceki timeout'ları temizle
    demoTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    demoTimeoutsRef.current = [];
    
    setIsPlayingDemo(true);
    setDemoProgress(0);
    
    songNotes.forEach((note, index) => {
      const timeout = setTimeout(() => {
        // Eğer component unmount olduysa çalma
        if (!isPlayingDemo && demoTimeoutsRef.current.length === 0) return;
        
        const key = TOCA_PIANO_KEYS.find(k => k.note === note.note);
        if (key) {
          playNote(key.frequency, 0.6);
          setDemoProgress(index + 1);
          
          // Görsel feedback
          setActiveKeys(prev => new Set(prev).add(key.note));
          const visualTimeout = setTimeout(() => {
            setActiveKeys(prev => {
              const newSet = new Set(prev);
              newSet.delete(key.note);
              return newSet;
            });
          }, 400);
          demoTimeoutsRef.current.push(visualTimeout);
        }
        
        // Son nota çalındığında
        if (index === songNotes.length - 1) {
          const endTimeout = setTimeout(() => {
            setIsPlayingDemo(false);
            setDemoProgress(0);
            // Tüm timeout'ları temizle
            demoTimeoutsRef.current.forEach(t => clearTimeout(t));
            demoTimeoutsRef.current = [];
          }, 1000);
          demoTimeoutsRef.current.push(endTimeout);
        }
      }, index * 600); // Her nota arası 600ms
      
      demoTimeoutsRef.current.push(timeout);
    });
  }, [songNotes, isPlayingDemo]);

  // Demo durdurma fonksiyonu
  const stopDemo = useCallback(() => {
    demoTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    demoTimeoutsRef.current = [];
    setIsPlayingDemo(false);
    setDemoProgress(0);
    setActiveKeys(new Set()); // Aktif tuşları temizle
  }, []);

  // Öğrenme moduna geçiş
  const startLearning = () => {
    setIsListening(false);
    setCurrentSongStep(0);
  };

  const createParticle = useCallback((key: PianoKey, rect: DOMRect) => {
    const particleId = `${Date.now()}-${particleIdRef.current++}`;
    const newParticle = {
      id: particleId,
      x: rect.left + rect.width / 2,
      y: rect.top,
      emoji: key.emoji,
      color: key.tocaColor
    };
    
    setParticles(prev => {
      const filtered = prev.length > 10 ? prev.slice(-5) : prev;
      return [...filtered, newParticle];
    });
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 1000);
  }, []);

  const createStars = (rect: DOMRect) => {
    const newStars = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 100,
      y: rect.top + rect.height / 2 + (Math.random() - 0.5) * 50
    }));
    
    setStars(prev => [...prev, ...newStars]);
    
    setTimeout(() => {
      setStars(prev => prev.filter(star => !newStars.some(newStar => newStar.id === star.id)));
    }, 2000);
  };

  const handleKeyPress = (key: PianoKey, event: React.MouseEvent | React.TouchEvent) => {
    setActiveKeys(prev => new Set(prev).add(key.note));
    playNote(key.frequency);

    // Dinleme modunda sadece ses çıkar, öğretim yapmaz
    if (isListening) {
      // Sadece ses çıkar ve görsel efekt
      const rect = event.currentTarget.getBoundingClientRect();
      createParticle(key, rect);
      
      setTimeout(() => {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key.note);
          return newSet;
        });
      }, 300);
      return;
    }

    // Learning mode logic - sadece öğrenme modunda çalışır
    if (!songComplete && !isProcessingStep) {
      const expectedNote = songNotes[currentSongStep]?.note;
      
      if (key.note === expectedNote) {
        // Correct note! Allow rapid playing for familiar songs
        setIsProcessingStep(true);
        setLastCorrectNote(key.note);
        setShowSuccess(true);
        createStars(event.currentTarget.getBoundingClientRect());
        
        // Much faster progression - only 300ms delay
        setTimeout(() => {
          setShowSuccess(false);
          setIsProcessingStep(false);
          
          if (currentSongStep < songNotes.length - 1) {
            setCurrentSongStep(prev => prev + 1);
          } else {
            // Song complete!
            setSongComplete(true);
            setLastCorrectNote(null); // Reset for next play
            setTimeout(() => {
              setSongComplete(false);
              setCurrentSongStep(0);
              setIsListening(true); // Başarılı bitirince tekrar dinleme moduna
            }, 4000);
          }
        }, 300);
      } else {
        // Wrong note
        setLastCorrectNote(null);
        setShowError(true);
        setTimeout(() => setShowError(false), 800);
      }
    }

    // Toca Boca style effects
    const rect = event.currentTarget.getBoundingClientRect();
    createParticle(key, rect);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.note);
        return newSet;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 relative overflow-hidden min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="text-center mb-4"
      >
        <div className="text-6xl mb-2">{currentSong.emoji}</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          {currentSong.title}
        </div>
        <div className="text-base opacity-70 mb-4">Şarkıyı adım adım öğren! 🌟</div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={() => {
              stopDemo(); // Demo çalıyorsa durdur
              onGoBack();
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg hover:shadow-xl"
          >
            🎵 Şarkı Seç
          </Button>
          
          <Button
            onClick={() => {
              stopDemo(); // Demo çalıyorsa durdur
              setCurrentSongStep(0);
              setLastCorrectNote(null);
              setIsProcessingStep(false);
              setShowSuccess(false);
              setShowError(false);
              setSongComplete(false);
              setIsListening(true); // Baştan başlarken önce dinle
              setDemoProgress(0);
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:shadow-xl"
          >
            🔄 Baştan Başla
          </Button>
        </div>
      </motion.div>

      {/* Dinleme Modu */}
      {isListening && !songComplete && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`w-full max-w-md mb-6 p-6 bg-gradient-to-r ${currentSong.color} rounded-3xl backdrop-blur-sm border border-white/20 text-center`}
        >
          <div className="text-5xl mb-4">🎧</div>
          <div className="text-2xl font-bold mb-3">Önce Dinle!</div>
          <div className="text-base opacity-80 mb-4">
            Şarkıyı nasıl çalındığını duyarak öğren
          </div>
          
          {/* Demo Progress */}
          {isPlayingDemo && (
            <div className="mb-4">
              <div className="text-sm opacity-70 mb-2">Çalıyor... {demoProgress}/{songNotes.length}</div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${(demoProgress / songNotes.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {!isPlayingDemo ? (
              <Button
                onClick={playDemoSong}
                className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
              >
                ▶️ Şarkıyı Dinle
              </Button>
            ) : (
              <Button
                onClick={stopDemo}
                className="px-6 py-3 rounded-2xl bg-red-500/80 hover:bg-red-500 text-white border-2 border-red-300/30"
              >
                ⏹️ Durdur
              </Button>
            )}
            
            <Button
              onClick={startLearning}
              disabled={isPlayingDemo}
              className="px-6 py-3 rounded-2xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Öğrenmeye Başla
            </Button>
          </div>
        </motion.div>
      )}

      {/* Learning Progress - Sadece öğrenme modunda */}
      {!isListening && !songComplete && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`w-full max-w-md mb-6 p-4 bg-gradient-to-r ${currentSong.color} rounded-3xl backdrop-blur-sm border border-white/20`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-80">İlerleme</span>
              <span className="text-sm font-bold">{currentSongStep + 1}/{songNotes.length}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                style={{ width: `${((currentSongStep + 1) / songNotes.length) * 100}%` }}
                layoutId={`progress-${songId}`}
              />
            </div>
          </div>

          {/* Current Note Display */}
          <div className="text-center">
            <div className="text-4xl mb-2">
              {songNotes[currentSongStep]?.emoji || currentSong.emoji}
            </div>
            <div className="text-xl font-bold mb-2">
              "{songNotes[currentSongStep]?.lyric}"
            </div>
            <div className="text-lg opacity-80">
              {(() => {
                const note = songNotes[currentSongStep]?.note;
                const key = TOCA_PIANO_KEYS.find(k => k.note === note);
                return key ? `${key.animal} ${key.emoji} tuşuna bas!` : '';
              })()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Song Complete */}
      {songComplete && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mb-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl backdrop-blur-sm border border-white/20"
        >
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-2xl font-bold mb-2 text-yellow-400">Muhteşem!</div>
          <div className="text-lg opacity-80">Şarkıyı tamamen öğrendin! 🌟</div>
          <div className="text-base opacity-60 mt-2">Tekrar başlamak için istediğin zaman çalabilirsin!</div>
        </motion.div>
      )}

      {/* Success/Error Feedback */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key={`success-${songId}`}
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl text-xl font-bold shadow-2xl">
              ✅ Doğru! 🎉
            </div>
          </motion.div>
        )}
        
        {showError && (
          <motion.div
            key={`error-${songId}`}
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl text-xl font-bold shadow-2xl">
              ❌ Tekrar dene! 💪
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Piano Keys */}
      <div className="w-full max-w-3xl">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {pianoKeys.map((key, index) => (
            <motion.div
              key={`piano-key-${songId}-${index}-${key.note}`}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.03,
                duration: 0.4,
                type: "spring",
                bounce: 0.5
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className={`
                  ${key.color} hover:opacity-95 border-0
                  ${key.tocaStyle}
                  w-full h-full rounded-3xl sm:rounded-[2rem] relative
                  ${activeKeys.has(key.note) ? 'scale-95 shadow-inner' : 'shadow-xl'}
                  ${!isListening && songNotes[currentSongStep]?.note === key.note ? 'ring-4 ring-green-400 ring-opacity-90 scale-105 animate-pulse' : ''}
                  transition-all duration-150 overflow-hidden
                  flex flex-col items-center justify-center gap-2 sm:gap-3
                  min-h-[120px] sm:min-h-[140px] md:min-h-[160px]
                  hardware-accelerated
                `}
                onMouseDown={(e) => handleKeyPress(key, e)}
                onTouchStart={(e) => handleKeyPress(key, e)}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-3xl" />
                  <div className="absolute inset-4 bg-white/10 rounded-full opacity-30" />
                  <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 bg-white/20 rounded-full" />
                </div>
                
                {/* Big bouncy emoji */}
                <motion.div 
                  className="text-5xl sm:text-6xl md:text-7xl"
                  animate={activeKeys.has(key.note) ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {key.emoji}
                </motion.div>
                
                {/* Animal name */}
                <div className="text-xs sm:text-sm md:text-base font-bold text-white bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  {key.animal}
                </div>

                {/* Next Note Indicator - Sadece öğrenme modunda */}
                {!isListening && songNotes[currentSongStep]?.note === key.note && (
                  <>
                    <motion.div
                      className="absolute inset-0 border-4 border-green-400 rounded-3xl pointer-events-none"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl pointer-events-none"
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      👆
                    </motion.div>
                  </>
                )}

                {/* Sparkles */}
                {activeKeys.has(key.note) && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-2 text-yellow-300 text-lg">✨</div>
                    <div className="absolute bottom-2 right-2 text-yellow-300 text-lg">🌟</div>
                  </div>
                )}

                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 rounded-3xl"
                  initial={{ x: '-100%' }}
                  animate={activeKeys.has(key.note) ? { x: '200%' } : { x: '-100%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Particle Effects */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute pointer-events-none z-50 text-4xl"
            style={{ left: particle.x, top: particle.y }}
            initial={{ scale: 1, y: 0, opacity: 1 }}
            animate={{ 
              scale: [1, 1.5, 0],
              y: [-50, -100, -150],
              x: [(Math.random() - 0.5) * 100],
              opacity: [1, 1, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Success Stars Animation */}
      <AnimatePresence>
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute pointer-events-none z-60 text-4xl"
            style={{ left: star.x, top: star.y }}
            initial={{
              scale: 0,
              opacity: 1,
              y: 0
            }}
            animate={{
              scale: [0, 1.5, 1, 0],
              opacity: [1, 1, 1, 0],
              y: [0, -50, -80, -120],
              x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60]
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: 2,
              ease: "easeOut"
            }}
          >
            ⭐
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}