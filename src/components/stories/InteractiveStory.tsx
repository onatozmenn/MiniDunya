import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, ArrowLeft } from 'lucide-react';
import { aiVoiceManager } from '../utils/AIVoiceManager';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// Story data with REAL PHOTOS - FARKLILIĞI VAR! 
const storyData = {
  'red-riding-hood': {
    title: "Kırmızı Başlıklı Kız",
    scenes: [
      {
        id: 1,
        text: "Evvel zaman içinde, kalbur saman içinde, kırmızı başlığı çok seven minik bir kız yaşarmış.",
        character: "narrator",
        emotion: "gentle",
        imageUrl: "https://images.unsplash.com/photo-1698434189115-4bde2ff041d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXR0bGUlMjBnaXJsJTIwcmVkJTIwaG9vZCUyMGNvdHRhZ2V8ZW58MXx8fHwxNzU3ODI4NzgzfDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2, 
        text: "Annesi ona demiş ki: 'Büyükanneye bu kurabiyelerden götürmelisinmiş.'",
        character: "mother",
        emotion: "loving",
        imageUrl: "https://images.unsplash.com/photo-1610897799366-318af40adad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBkYXVnaHRlciUyMGNvb2tpZXMlMjBiYXNrZXR8ZW58MXx8fHwxNzU3ODI4OTEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "Kırmızı Başlıklı Kız sevinçle ormana doğru yola çıkmış.",
        character: "narrator", 
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1557912312-ec5dba9260aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXJsJTIwd2Fsa2luZyUyMGZvcmVzdCUyMHBhdGglMjBmbG93ZXJzfGVufDF8fHx8MTc1NzgyODkxMXww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Ormanda büyük kötü kurt onu görmüş ve yanına gelmiş.",
        character: "wolf",
        emotion: "mysterious",
        imageUrl: "https://images.unsplash.com/photo-1652606878210-d0a58394defb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwd29sZiUyMGZvcmVzdCUyMHRyZWVzJTIwbXlzdGVyaW91c3xlbnwxfHx8fDE3NTc4Mjg5MTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 5,
        text: "Kırmızı Başlıklı Kız masumca 'Büyükanneme gidiyormuşum' demiş.",
        character: "girl",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1597241627887-3b107956c01a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vY2VudCUyMGNoaWxkJTIwdGFsa2luZyUyMG5hdHVyZXxlbnwxfHx8fDE3NTc4Mjg5MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 6,
        text: "Kurt kurnazca başka yoldan büyükannenin evine koşmuş.",
        character: "narrator",
        emotion: "mysterious",
        imageUrl: "https://images.unsplash.com/photo-1657182688415-c3c6a936308c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b2xmJTIwcnVubmluZyUyMHRocm91Z2glMjBkYXJrJTIwZm9yZXN0fGVufDF8fHx8MTc1NzgyODkxNHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 7,
        text: "Büyükannenin kapısını çaldı ve içeri girdi.",
        character: "wolf",
        emotion: "mysterious",
        imageUrl: "https://images.unsplash.com/photo-1568633960859-e96f49f8902a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBjb3R0YWdlJTIwZG9vciUyMHdvb2RlbiUyMGhvdXNlfGVufDF8fHx8MTc1NzgyODkxNHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 8,
        text: "Büyükanne korktu ama kurt ona zarar vermedi.",
        character: "grandmother",
        emotion: "scared",
        imageUrl: "https://images.unsplash.com/photo-1705769945608-b425ca92871d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBjb3R0YWdlJTIwaW50ZXJpb3IlMjBjb3p5fGVufDF8fHx8MTc1NzgyODkxNHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 9,
        text: "Kırmızı Başlıklı geldiğinde ev çok sessizdi.",
        character: "girl", 
        emotion: "calm",
        imageUrl: "https://images.unsplash.com/photo-1737415779418-50da1e121d98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXJsJTIwYXBwcm9hY2hpbmclMjBjb3R0YWdlJTIwZG9vciUyMGRheWxpZ2h0fGVufDF8fHx8MTc1NzgyODkxNHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 10,
        text: "Orman bekçisi sesleri duydu ve koşarak geldi.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1626693721685-5355da59d239?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjByYW5nZXIlMjBoZXJvJTIwcnVubmluZyUyMHRyZWVzfGVufDF8fHx8MTc1NzgyODkxNHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 11,
        text: "Kurt özür diledi ve hep birlikte kurabiye yediler.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1640079620012-b814961c684a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMHNoYXJpbmclMjBjb29raWVzJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzU3ODI4OTE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  'three-little-pigs': {
    title: "Üç Küçük Domuz",
    scenes: [
      {
        id: 1,
        text: "Bir zamanlar üç küçük domuz kardeş varmış. Artık kendi evlerini yapma zamanı gelmişti.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1674880785058-2c98aff0a62f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMHBpZ3MlMjBmYW1pbHklMjBmYXJtJTIwaGFwcHl8ZW58MXx8fHwxNzU3ODI5ODc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2,
        text: "İlk domuz tembel bir domuzdu. Hızlıca samandan bir ev yaptı ve dinlenmeye gitti!",
        character: "narrator",
        emotion: "calm",
        imageUrl: "https://images.unsplash.com/photo-1671864085485-c641fab97093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWclMjBidWlsZGluZyUyMGhvdXNlJTIwc3RyYXd8ZW58MXx8fHwxNzU3ODI5ODY0fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "İkinci domuz odun topladı ve ahşaptan güzel bir ev inşa etti.",
        character: "narrator",
        emotion: "calm",
        imageUrl: "https://images.unsplash.com/photo-1673924967772-05d3e6d7ae0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBob3VzZSUyMGNvbnN0cnVjdGlvbiUyMGxvZ3N8ZW58MXx8fHwxNzU3ODI5ODY3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Üçüncü domuz çok çalışkandı. Tuğlalarla sağlam bir ev yaptı.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1639380366818-6053eb8f174c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmljayUyMGhvdXNlJTIwc3Ryb25nJTIwY29uc3RydWN0aW9ufGVufDF8fHx8MTc1NzgyOTg3MHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 5,
        text: "Büyük kötü kurt geldi! 'Hüüü hüüü üfleyeceğim evinizi!' diye bağırdı.",
        character: "wolf",
        emotion: "angry",
        imageUrl: "https://images.unsplash.com/photo-1664018696932-a2fb6da3d585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmdyeSUyMHdvbGYlMjBzdG9ybXklMjB3ZWF0aGVyfGVufDF8fHx8MTc1NzgyOTg3NHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 6,
        text: "Kurt üfledi üfledi! Saman ve ahşap evler yıkıldı!",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1682351888333-a01951ffb66a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGRlc3Ryb3llZCUyMHN0b3JtJTIwZGFtYWdlfGVufDF8fHx8MTc1NzgyOTg4MHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 7,
        text: "Ama tuğla ev çok sağlamdı! Kurt ne kadar üflerse üflesin yıkamadı.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1639380366818-6053eb8f174c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmljayUyMGhvdXNlJTIwc3Ryb25nJTIwY29uc3RydWN0aW9ufGVufDF8fHx8MTc1NzgyOTg3MHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 8,
        text: "Kurt yoruldu ve uzaklaştı. Üç kardeş güvenle tuğla evde yaşadılar.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1674880785058-2c98aff0a62f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMHBpZ3MlMjBmYW1pbHklMjBmYXJtJTIwaGFwcHl8ZW58MXx8fHwxNzU3ODI5ODc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 9,
        text: "Çalışkanlık her zaman kazanır! Sağlam işler yapmak çok önemlidir.",
        character: "narrator",
        emotion: "loving",
        imageUrl: "https://images.unsplash.com/photo-1674880785058-2c98aff0a62f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMHBpZ3MlMjBmYW1pbHklMjBmYXJtJTIwaGFwcHl8ZW58MXx8fHwxNzU3ODI5ODc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  'goldilocks': {
    title: "Altın Saçlı Kız ve Üç Ayı",
    scenes: [
      {
        id: 1,
        text: "Bir zamanlar Altın Saçlı Kız adında meraklı bir kız yaşarmış.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1662301646666-4f6081fb01ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkaWxvY2tzJTIwdGhyZWUlMjBiZWFycyUyMGNvdHRhZ2V8ZW58MXx8fHwxNzU3ODI5MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2,
        text: "Ormanda ayıların evini buldu ve içeri girdi.",
        character: "girl",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1602996062644-551ba2de0d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFycyUyMGZhbWlseSUyMHBvcnJpZGdlJTIwYm93bHN8ZW58MXx8fHwxNzU3ODI5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "Küçük ayının yatağında uyuya kaldı.",
        character: "narrator",
        emotion: "calm",
        imageUrl: "https://images.unsplash.com/photo-1662301646666-4f6081fb01ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkaWxvY2tzJTIwdGhyZWUlMjBiZWFycyUyMGNvdHRhZ2V8ZW58MXx8fHwxNzU3ODI5MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Ayılar döndüklerinde onu buldular ama arkadaş oldular.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1602996062644-551ba2de0d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFycyUyMGZhbWlseSUyMHBvcnJpZGdlJTIwYm93bHN8ZW58MXx8fHwxNzU3ODI5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  'ugly-duckling': {
    title: "Çirkin Ördek Yavrusu",
    scenes: [
      {
        id: 1,
        text: "Bir zamanlar farklı görünen bir ördek yavrusu yaşarmış.",
        character: "narrator",
        emotion: "sad",
        imageUrl: "https://images.unsplash.com/photo-1592802116876-626de446eb90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1Z2x5JTIwZHVja2xpbmclMjBwb25kJTIwc3dhbnN8ZW58MXx8fHwxNzU3ODI5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2,
        text: "Diğer hayvanlar onu farklı diye dışladılar.",
        character: "narrator",
        emotion: "sad",
        imageUrl: "https://images.unsplash.com/photo-1592802116876-626de446eb90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1Z2x5JTIwZHVja2xpbmclMjBwb25kJTIwc3dhbnN8ZW58MXx8fHwxNzU3ODI5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "Büyüdüğünde aslında güzel bir kuğu olduğunu anladı.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1592802116876-626de446eb90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1Z2x5JTIwZHVja2xpbmclMjBwb25kJTIwc3dhbnN8ZW58MXx8fHwxNzU3ODI5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Artık diğer kuğularla mutlu yaşıyor.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1592802116876-626de446eb90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1Z2x5JTIwZHVja2xpbmclMjBwb25kJTIwc3dhbnN8ZW58MXx8fHwxNzU3ODI5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  'tortoise-and-hare': {
    title: "Kaplumbağa ile Tavşan",
    scenes: [
      {
        id: 1,
        text: "Hızlı tavşan yavaş kaplumbağayla yarışmaya karar verdi.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1672745609023-a402f0a329c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3J0b2lzZSUyMGhhcmUlMjByYWNlJTIwZm9yZXN0fGVufDF8fHx8MTc1NzgyOTE4OHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2,
        text: "Tavşan çok hızlı koştu ve ileride uyumaya karar verdi.",
        character: "narrator",
        emotion: "calm",
        imageUrl: "https://images.unsplash.com/photo-1672745609023-a402f0a329c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3J0b2lzZSUyMGhhcmUlMjByYWNlJTIwZm9yZXN0fGVufDF8fHx8MTc1NzgyOTE4OHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "Kaplumbağa yavaşça ama kararlıca ilerlemeye devam etti.",
        character: "narrator",
        emotion: "calm",
        imageUrl: "https://images.unsplash.com/photo-1672745609023-a402f0a329c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3J0b2lzZSUyMGhhcmUlMjByYWNlJTIwZm9yZXN0fGVufDF8fHx8MTc1NzgyOTE4OHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Sonunda kaplumbağa yarışı kazandı! Azim her zaman kazanır.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1672745609023-a402f0a329c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3J0b2lzZSUyMGhhcmUlMjByYWNlJTIwZm9yZXN0fGVufDF8fHx8MTc1NzgyOTE4OHww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  'jack-and-beanstalk': {
    title: "Jack ve Fasulye Sırığı",
    scenes: [
      {
        id: 1,
        text: "Jack büyülü fasulyelerle dev sırık yetiştirdi.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1744664105896-0c25f76802d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYWNrJTIwYmVhbnN0YWxrJTIwZ2lhbnQlMjBjYXN0bGV8ZW58MXx8fHwxNzU3ODI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2,
        text: "Sırığa tırmanarak bulutların üstündeki kaleye çıktı.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1744664105896-0c25f76802d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhqYWNrJTIwYmVhbnN0YWxrJTIwZ2lhbnQlMjBjYXN0bGV8ZW58MXx8fHwxNzU3ODI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "Devle karşılaştı ama kaçmayı başardı.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1744664105896-0c25f76802d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhqYWNrJTIwYmVhbnN0YWxrJTIwZ2lhbnQlMjBjYXN0bGV8ZW58MXx8fHwxNzU3ODI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Cesaretiyle ailesini kurtardı ve mutlu yaşadılar.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1744664105896-0c25f76802d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhqYWNrJTIwYmVhbnN0YWxrJTIwZ2lhbnQlMjBjYXN0bGV8ZW58MXx8fHwxNzU3ODI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  'cinderella': {
    title: "Külkedisi",
    scenes: [
      {
        id: 1,
        text: "Külkedisi üvey ailesiyle zor günler geçiriyordu.",
        character: "narrator",
        emotion: "sad",
        imageUrl: "https://images.unsplash.com/photo-1659412325622-e1d05fcf7da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5kZXJlbGxhJTIwcHVtcGtpbiUyMGNhcnJpYWdlfGVufDF8fHx8MTc1NzgyOTE4OXww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 2,
        text: "Peri annesi ona büyülü bir elbise verdi.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1659412325622-e1d05fcf7da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5kZXJlbGxhJTIwcHVtcGtpbiUyMGNhcnJpYWdlfGVufDF8fHx8MTc1NzgyOTE4OXww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 3,
        text: "Baloyla gitti ve prensle dans etti.",
        character: "narrator",
        emotion: "excited",
        imageUrl: "https://images.unsplash.com/photo-1659412325622-e1d05fcf7da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5kZXJlbGxhJTIwcHVtcGtpbiUyMGNhcnJpYWdlfGVufDF8fHx8MTc1NzgyOTE4OXww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: 4,
        text: "Cam terlikle tanışıp prensin karısı oldu.",
        character: "narrator",
        emotion: "happy",
        imageUrl: "https://images.unsplash.com/photo-1659412325622-e1d05fcf7da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5kZXJlbGxhJTIwcHVtcGtpbiUyMGNhcnJpYWdlfGVufDF8fHx8MTc1NzgyOTE4OXww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  }
};

interface InteractiveStoryProps {
  storyId: string;
  onGoBack: () => void;
}

export default function InteractiveStory({ storyId, onGoBack }: InteractiveStoryProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMountedRef = useRef(true);

  const story = storyData[storyId as keyof typeof storyData] || storyData['red-riding-hood'];

  // Component lifecycle
  useEffect(() => {
    aiVoiceManager.start();
    
    // AUTO START - play first scene after mount
    setTimeout(() => {
      if (isMountedRef.current) {
        playCurrentScene();
      }
    }, 1000);
    
    return () => {
      isMountedRef.current = false;
      aiVoiceManager.stop();
      
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [storyId]);

  // Go back handler
  const handleGoBack = () => {
    isMountedRef.current = false;
    aiVoiceManager.stop();
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      }, i * 20);
    }
    
    setTimeout(() => {
      onGoBack();
    }, 100);
  };

  // Stop audio handler
  const handleStop = () => {
    if (!isMountedRef.current) return;
    
    aiVoiceManager.stop();
    setIsPlaying(false);
  };

  // Play specific scene
  const playScene = async (sceneIndex: number) => {
    if (!isMountedRef.current) return;
    
    const scene = story.scenes[sceneIndex];
    if (!scene) return;

    setIsPlaying(true);

    try {
      await aiVoiceManager.speakStory({
        id: `${scene.id}-${Date.now()}`,
        text: scene.text,
        character: scene.character,
        emotion: scene.emotion as any
      });

      // Auto advance to next scene after pause
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current && sceneIndex < story.scenes.length - 1) {
            const nextScene = sceneIndex + 1;
            setCurrentScene(nextScene);
            setIsPlaying(false);
            // Auto-play next scene
            setTimeout(() => {
              if (isMountedRef.current) {
                playScene(nextScene);
              }
            }, 800);
          } else {
            // Story finished
            setIsPlaying(false);
          }
        }, 1200);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    }
  };

  // Play current scene (wrapper)
  const playCurrentScene = () => {
    playScene(currentScene);
  };

  const currentSceneData = story.scenes[currentScene];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-chart-2) 100%)',
        padding: 'var(--mobile-padding)',
        fontFamily: 'var(--font-display)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Fixed Header Controls - Only 2 buttons */}
        <div 
          className="flex justify-between items-center mb-8"
          style={{ gap: 'var(--mobile-gap)' }}
        >
          <motion.button
            onClick={handleGoBack}
            className="flex items-center"
            style={{
              gap: 'var(--mobile-gap)',
              padding: 'var(--kids-button-padding)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-widget)',
              color: 'white',
              fontSize: 'var(--text-kids-medium)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--font-weight-semibold)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={32} />
            Hikayeler
          </motion.button>

          <motion.button
            onClick={handleStop}
            className="flex items-center"
            style={{
              gap: 'var(--mobile-gap)',
              padding: 'var(--kids-button-padding)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-widget)',
              color: 'white',
              fontSize: 'var(--text-kids-medium)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--font-weight-semibold)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pause size={32} />
            Durdur
          </motion.button>
        </div>

        {/* Story Title */}
        <h1 
          className="text-center mb-6"
          style={{
            fontSize: 'var(--text-kids-huge)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {story.title}
        </h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div 
            className="w-full rounded-full"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              height: '8px'
            }}
          >
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: 'white' }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentScene + 1) / story.scenes.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p 
            className="text-center mt-2"
            style={{ 
              color: 'white',
              fontSize: 'var(--text-kids-medium)',
              fontFamily: 'var(--font-text)'
            }}
          >
            {currentScene + 1} / {story.scenes.length}
          </p>
        </div>

        {/* Main Story Card */}
        <div 
          className="backdrop-blur-md rounded-3xl mb-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: 'var(--kids-button-padding)',
            borderRadius: 'var(--radius-widget)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Beautiful Scene Image - REAL PHOTOS! */}
              <div 
                className="w-full mb-6 overflow-hidden"
                style={{
                  height: '300px',
                  borderRadius: 'var(--radius-card)'
                }}
              >
                <ImageWithFallback
                  src={currentSceneData?.imageUrl || ""}
                  alt={`Hikaye sahnesi ${currentScene + 1}: ${currentSceneData?.text.substring(0, 50)}`}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: 'var(--radius-card)' }}
                />
              </div>

              {/* Scene Text */}
              <p 
                className="leading-relaxed mb-6"
                style={{ 
                  fontSize: 'var(--text-kids-large)',
                  color: 'white',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-text)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {currentSceneData?.text}
              </p>

              {/* Voice Indicator */}
              {isPlaying && (
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <div 
                    className="flex items-center"
                    style={{
                      padding: 'var(--mobile-gap)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius)',
                      gap: 'var(--mobile-gap)'
                    }}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: 'var(--color-chart-2)' }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span 
                      style={{ 
                        color: 'white',
                        fontSize: 'var(--text-kids-medium)',
                        fontFamily: 'var(--font-text)'
                      }}
                    >
                      Dinleniyor...
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Story Complete */}
        {currentScene >= story.scenes.length - 1 && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div 
              className="backdrop-blur-sm rounded-2xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: 'var(--kids-button-padding)',
                borderRadius: 'var(--radius-widget)'
              }}
            >
              <div 
                className="mb-4"
                style={{ marginBottom: 'var(--mobile-gap)' }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1606041008023-472dfb5e530f"
                  alt="Hikaye tamamlandı"
                  className="w-32 h-32 object-cover rounded-full mx-auto"
                  style={{ borderRadius: '50%' }}
                />
              </div>
              <h2 
                className="mb-4"
                style={{ 
                  fontSize: 'var(--text-kids-big)',
                  color: 'white',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {story.title} Bitti!
              </h2>
              <p 
                className="mb-6"
                style={{ 
                  color: 'white',
                  fontSize: 'var(--text-kids-medium)',
                  fontFamily: 'var(--font-text)'
                }}
              >
                Güzel bir hikayeydi!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}