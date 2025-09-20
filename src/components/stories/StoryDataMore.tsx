// Additional Story Data for SevSaMut App
// Classic Children's Tales - Part 2

export interface StoryScene {
  id: string;
  type: 'visual' | 'interaction' | 'choice';
  character?: 'narrator' | 'girl' | 'mother' | 'wolf' | 'grandmother' | 'pig' | 'bear' | 'goldilocks' | 'swan' | 'rabbit' | 'tortoise' | 'jack' | 'ant' | 'grasshopper' | 'cinderella' | 'fairy';
  text: string;
  emotion: 'happy' | 'sad' | 'excited' | 'calm' | 'scared' | 'angry' | 'surprised' | 'loving' | 'mysterious' | 'dramatic' | 'triumphant' | 'lazy' | 'determined' | 'boastful' | 'steady' | 'panicked' | 'adventurous' | 'wonder' | 'joyful' | 'curious' | 'sleepy' | 'shocked' | 'confident' | 'proud' | 'amazed' | 'melancholic' | 'hopeful' | 'playful';
  visualCue: string;
  mainCharacter: {
    emoji: string;
    position: [number, number];
    size: number;
    animation?: 'wave' | 'bounce' | 'walk' | 'run' | 'sleep' | 'celebration' | 'surprised' | 'happy' | 'sing' | 'blow' | 'angry' | 'sad' | 'discover' | 'proud' | 'sit' | 'climb' | 'grow' | 'panic';
  };
  backgroundEmojis: string[];
  interactables: Array<{
    id: string;
    emoji: string;
    position: [number, number];
    size: number;
    action?: string;
    sound?: string;
  }>;
  choices?: Array<{
    id: string;
    emoji: string;
    position: [number, number];
    nextScene: string;
  }>;
}

export interface StoryData {
  id: string;
  title: string;
  emoji: string;
  scenes: StoryScene[];
}

// ===============================
// ANT AND GRASSHOPPER STORY
// ===============================
export const ANT_AND_GRASSHOPPER_STORY: StoryData = {
  id: 'ant-and-grasshopper',
  title: 'Karınca ile Ağustos Böceği',
  emoji: '🐜🦗',
  scenes: [
    {
      id: 'intro',
      type: 'visual',
      character: 'narrator',
      text: 'Evvel zaman içinde, kalbur saman içinde, bir çalışkan karınca ile bir ağustos böceği yaşarmış. Yaz günlerinde karınca kış için hazırlık yaparmış, ağustos böceği ise şarkı söylermiş.',
      emotion: 'calm',
      visualCue: '🐜🦗☀️',
      mainCharacter: { emoji: '🐜', position: [35, 55], size: 115, animation: 'walk' },
      backgroundEmojis: ['☀️', '🌸', '🌿', '🦗', '🎵'],
      interactables: [
        { id: 'ant', emoji: '🐜', position: [25, 60], size: 100, action: 'work' },
        { id: 'grasshopper', emoji: '🦗', position: [65, 45], size: 105, action: 'sing' },
        { id: 'sun', emoji: '☀️', position: [50, 25], size: 90, action: 'warm' }
      ]
    },
    {
      id: 'ant-working',
      type: 'interaction',
      character: 'ant',
      text: 'Karınca demiş ki: "Kış gelecekmiş, yiyecek topluyormuşum. Sen de hazırlık yapmalısınmış!"',
      emotion: 'determined',
      visualCue: '🐜🌾💪',
      mainCharacter: { emoji: '🐜', position: [45, 55], size: 110 },
      backgroundEmojis: ['🌾', '💪', '🏠', '📦'],
      interactables: [
        { id: 'grain', emoji: '🌾', position: [60, 65], size: 85, action: 'collect' },
        { id: 'storage', emoji: '📦', position: [30, 40], size: 80, action: 'store' }
      ]
    },
    {
      id: 'grasshopper-playing',
      type: 'interaction',
      character: 'grasshopper',
      text: 'Ağustos böceği demiş ki: "Hava çok güzelmiş! Şarkı söyleyip dans ediyormuşum. Kış çok uzakmış!"',
      emotion: 'happy',
      visualCue: '🦗🎵💃',
      mainCharacter: { emoji: '🦗', position: [50, 45], size: 115, animation: 'bounce' },
      backgroundEmojis: ['🎵', '💃', '🌺', '🦋'],
      interactables: [
        { id: 'music', emoji: '🎵', position: [70, 30], size: 75, action: 'music' },
        { id: 'dance', emoji: '💃', position: [30, 35], size: 70, action: 'dance' }
      ]
    },
    {
      id: 'winter-comes',
      type: 'visual',
      character: 'narrator',
      text: 'Derken kış gelmiş! Kar yağmış, hava çok soğukmuş. Artık yiyecek bulmak zorlaşmış.',
      emotion: 'dramatic',
      visualCue: '❄️🌨️🥶',
      mainCharacter: { emoji: '❄️', position: [50, 40], size: 130, animation: 'wave' },
      backgroundEmojis: ['🌨️', '🥶', '🌬️', '⛄'],
      interactables: [
        { id: 'snow', emoji: '🌨️', position: [30, 30], size: 80, action: 'cold' },
        { id: 'cold', emoji: '🥶', position: [70, 60], size: 75, action: 'shiver' }
      ]
    },
    {
      id: 'grasshopper-hungry',
      type: 'interaction',
      character: 'grasshopper',
      text: 'Ağustos böceği aç kalmış: "Ah! Keşke yazın hazırlık yapmış olsaydım!" diye ağlamış.',
      emotion: 'sad',
      visualCue: '🦗😢🍽️',
      mainCharacter: { emoji: '🦗', position: [50, 55], size: 110, animation: 'sad' },
      backgroundEmojis: ['😢', '🍽️', '💔', '��️'],
      interactables: [
        { id: 'crying', emoji: '😢', position: [35, 40], size: 65, action: 'cry' },
        { id: 'empty-plate', emoji: '🍽️', position: [65, 65], size: 80, action: 'empty' }
      ]
    },
    {
      id: 'ant-helps',
      type: 'interaction',
      character: 'ant',
      text: 'İyi kalpli karınca demiş ki: "Gel, yiyeceğimizi paylaşalım. Ama bundan ders çıkarmalısın!"',
      emotion: 'loving',
      visualCue: '🐜❤️🍞',
      mainCharacter: { emoji: '🐜', position: [40, 50], size: 110 },
      backgroundEmojis: ['❤️', '🍞', '🤗', '💕'],
      interactables: [
        { id: 'sharing', emoji: '🤗', position: [60, 45], size: 90, action: 'share' },
        { id: 'food', emoji: '🍞', position: [50, 65], size: 85, action: 'give' }
      ]
    },
    {
      id: 'lesson-learned',
      type: 'interaction',
      character: 'narrator',
      text: 'Ağustos böceği ders almış: "Gelecek yıl ben de çalışacağım!" demiş. Böylece dostluk ve çalışkanlık kazanmış. İşte böyle bitmiş bu masal.',
      emotion: 'happy',
      visualCue: '🦗🐜🤝📚',
      mainCharacter: { emoji: '🦗', position: [50, 50], size: 110, animation: 'celebration' },
      backgroundEmojis: ['🤝', '📚', '⭐', '🎉'],
      interactables: [
        { id: 'friendship', emoji: '🤝', position: [45, 55], size: 100, action: 'friends' },
        { id: 'lesson', emoji: '📚', position: [65, 35], size: 80, action: 'learn' }
      ]
    }
  ]
};

// ===============================
// CINDERELLA STORY
// ===============================
export const CINDERELLA_STORY: StoryData = {
  id: 'cinderella',
  title: 'Külkedisi',
  emoji: '👗✨',
  scenes: [
    {
      id: 'intro',
      type: 'visual',
      character: 'narrator',
      text: 'Bir varmış bir yokmuş, evvel zaman içinde, Külkedisi adında güzel bir kız yaşarmış. Üvey annesi ve kızkardeşleri için sürekli temizlik yaparmış.',
      emotion: 'sad',
      visualCue: '👗🧹😔',
      mainCharacter: { emoji: '👗', position: [45, 55], size: 115, animation: 'sad' },
      backgroundEmojis: ['🧹', '🏠', '😔', '💔'],
      interactables: [
        { id: 'broom', emoji: '🧹', position: [30, 65], size: 85, action: 'clean' },
        { id: 'house', emoji: '🏠', position: [65, 45], size: 100, action: 'work' }
      ]
    },
    {
      id: 'ball-invitation',
      type: 'visual',
      character: 'narrator',
      text: 'Bir gün krallıktan baloya davetiye gelmiş! Herkes çok heyecanlanmış.',
      emotion: 'excited',
      visualCue: '📜👑💃',
      mainCharacter: { emoji: '📜', position: [50, 50], size: 120 },
      backgroundEmojis: ['👑', '💃', '✨', '🎭'],
      interactables: [
        { id: 'invitation', emoji: '📜', position: [50, 60], size: 95, action: 'read' },
        { id: 'crown', emoji: '👑', position: [35, 40], size: 85, action: 'royal' }
      ]
    },
    {
      id: 'left-behind',
      type: 'interaction',
      character: 'cinderella',
      text: 'Külkedisi üzülerek demiş ki: "Keşke ben de gidebilsem... Ama güzel elbisem yokmuş."',
      emotion: 'sad',
      visualCue: '👗😢💭',
      mainCharacter: { emoji: '👗', position: [50, 55], size: 110, animation: 'sad' },
      backgroundEmojis: ['😢', '💭', '👗', '💔'],
      interactables: [
        { id: 'tears', emoji: '😢', position: [35, 40], size: 70, action: 'cry' },
        { id: 'dream', emoji: '💭', position: [70, 35], size: 75, action: 'wish' }
      ]
    },
    {
      id: 'fairy-appears',
      type: 'interaction',
      character: 'fairy',
      text: 'O sırada peri anne belirmiş: "Merak etme canım! Sana yardım edeceğim!" demiş.',
      emotion: 'magical',
      visualCue: '🧚‍♀️✨🪄',
      mainCharacter: { emoji: '🧚‍♀️', position: [45, 40], size: 120, animation: 'wave' },
      backgroundEmojis: ['✨', '🪄', '⭐', '🌟'],
      interactables: [
        { id: 'fairy', emoji: '🧚‍♀️', position: [45, 40], size: 115, action: 'magic' },
        { id: 'wand', emoji: '🪄', position: [65, 35], size: 80, action: 'spell' }
      ]
    },
    {
      id: 'transformation',
      type: 'visual',
      character: 'narrator',
      text: 'Peri anne büyü yapmış! Güzel elbise, cam ayakkabılar ve altın araba belirmiş!',
      emotion: 'amazed',
      visualCue: '👗👠🚗✨',
      mainCharacter: { emoji: '👗', position: [50, 50], size: 125, animation: 'celebration' },
      backgroundEmojis: ['👠', '🚗', '✨', '⭐'],
      interactables: [
        { id: 'dress', emoji: '👗✨', position: [40, 55], size: 110, action: 'beautiful' },
        { id: 'shoes', emoji: '👠', position: [60, 65], size: 85, action: 'glass' },
        { id: 'carriage', emoji: '🚗', position: [30, 40], size: 100, action: 'golden' }
      ]
    },
    {
      id: 'at-ball',
      type: 'interaction',
      character: 'cinderella',
      text: 'Külkedisi baloda prensle dans etmiş: "Ne kadar güzelmiş!" demiş.',
      emotion: 'happy',
      visualCue: '👗🤴💃',
      mainCharacter: { emoji: '👗', position: [45, 50], size: 115, animation: 'bounce' },
      backgroundEmojis: ['🤴', '💃', '🎭', '✨'],
      interactables: [
        { id: 'prince', emoji: '🤴', position: [55, 50], size: 110, action: 'dance' },
        { id: 'dancing', emoji: '💃', position: [35, 35], size: 85, action: 'elegant' }
      ]
    },
    {
      id: 'midnight',
      type: 'interaction',
      character: 'cinderella',
      text: 'Gece yarısı çalmış! "Ah! Büyü bozulacakmış, kaçmalıyım!" diye koşmuş.',
      emotion: 'panicked',
      visualCue: '👗🏃‍♀️🕛',
      mainCharacter: { emoji: '👗', position: [40, 50], size: 110, animation: 'run' },
      backgroundEmojis: ['🏃‍♀️', '🕛', '💨', '⚡'],
      interactables: [
        { id: 'running', emoji: '🏃‍♀️', position: [60, 55], size: 100, action: 'hurry' },
        { id: 'clock', emoji: '🕛', position: [30, 35], size: 80, action: 'time' }
      ]
    },
    {
      id: 'glass-slipper',
      type: 'visual',
      character: 'narrator',
      text: 'Kaçarken cam ayakkabı düşmüş. Prens onu bulmuş ve sahipini aramaya başlamış.',
      emotion: 'romantic',
      visualCue: '👠🤴❤️',
      mainCharacter: { emoji: '👠', position: [50, 60], size: 110 },
      backgroundEmojis: ['🤴', '❤️', '🔍', '✨'],
      interactables: [
        { id: 'slipper', emoji: '👠', position: [50, 65], size: 100, action: 'find' },
        { id: 'prince-search', emoji: '🤴🔍', position: [35, 45], size: 105, action: 'search' }
      ]
    },
    {
      id: 'perfect-fit',
      type: 'interaction',
      character: 'narrator',
      text: 'Ayakkabı sadece Külkedisi\'ye uymuş! Prensle evlenmiş ve sonsuza dek mutlu yaşamışlar. İşte böyle bitmiş bu güzel masal.',
      emotion: 'joyful',
      visualCue: '👗🤴👑💍',
      mainCharacter: { emoji: '👗', position: [45, 50], size: 115, animation: 'celebration' },
      backgroundEmojis: ['🤴', '👑', '💍', '🎉'],
      interactables: [
        { id: 'couple', emoji: '👗🤴', position: [50, 55], size: 120, action: 'love' },
        { id: 'ring', emoji: '💍', position: [70, 40], size: 80, action: 'marry' },
        { id: 'celebration', emoji: '🎉', position: [30, 35], size: 85, action: 'party' }
      ]
    }
  ]
};