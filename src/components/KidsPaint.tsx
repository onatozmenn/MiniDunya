import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { getSoundManager } from './utils/SoundManager';

interface KidsPaintProps {
  volume: number;
}

type Tool = 'brush' | 'sticker' | 'eraser';

const PAINT_COLORS = [
  '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
  '#00D2D3', '#FF3838', '#FF6348', '#2ED573'
];

const BRUSH_SIZES = [12, 20, 32, 48];

const STICKERS = [
  '🐱', '🐶', '🐰', '🐸', '🦋', '🐝', '🌸', '🌺',
  '⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌙', '☁️',
  '🍎', '🍌', '🍓', '🍊', '🎈', '🎊', '💖', '🧁'
];

// Güzel Hayvan Boyama Şablonları - Tam vücut, detaylı
const COLORING_TEMPLATES = {
  cat: {
    name: '🐱 Kedi',
    emoji: '🐱',
    paths: [
      // Kedi kafası (yuvarlak)
      'M 200 120 Q 150 100 120 140 Q 110 180 130 210 Q 150 230 200 235 Q 250 230 270 210 Q 290 180 280 140 Q 250 100 200 120 Z',
      // Sol kulak
      'M 160 110 Q 150 80 140 70 Q 130 65 125 75 Q 135 90 145 115 Q 155 125 160 110 Z',
      // Sağ kulak
      'M 240 110 Q 245 125 255 115 Q 265 90 275 75 Q 270 65 260 70 Q 250 80 240 110 Z',
      // Sol kulak içi
      'M 155 105 Q 145 85 140 80 Q 148 88 155 105 Z',
      // Sağ kulak içi
      'M 245 105 Q 252 88 260 80 Q 255 85 245 105 Z',
      // Sol göz (büyük)
      'M 175 150 Q 160 135 145 150 Q 160 165 175 150 Z',
      // Sağ göz (büyük)
      'M 225 150 Q 240 135 255 150 Q 240 165 225 150 Z',
      // Sol göz bebek
      'M 170 150 Q 165 145 160 150 Q 165 155 170 150 Z',
      // Sağ göz bebek
      'M 230 150 Q 235 145 240 150 Q 235 155 230 150 Z',
      // Burun (kalp şekli)
      'M 200 175 Q 195 170 190 175 Q 195 180 200 185 Q 205 180 210 175 Q 205 170 200 175 Z',
      // Ağız
      'M 200 190 Q 180 205 165 195 M 200 190 Q 220 205 235 195',
      // Bıyıklar sol
      'M 100 165 L 140 170 M 105 180 L 140 180 M 100 195 L 140 190',
      // Bıyıklar sağ
      'M 260 170 L 300 165 M 260 180 L 295 180 M 260 190 L 300 195',
      // Vücut (oval)
      'M 200 230 Q 130 220 100 270 Q 90 320 110 370 Q 140 410 200 420 Q 260 410 290 370 Q 310 320 300 270 Q 270 220 200 230 Z',
      // Sol ön pati
      'M 140 350 Q 130 370 125 390 Q 120 400 125 410 Q 135 415 145 410 Q 150 400 145 390 Q 150 370 140 350 Z',
      // Sağ ön pati
      'M 260 350 Q 270 370 255 390 Q 250 400 255 410 Q 265 415 275 410 Q 280 400 275 390 Q 270 370 260 350 Z',
      // Sol arka pati
      'M 130 380 Q 120 400 115 420 Q 110 430 115 440 Q 125 445 135 440 Q 140 430 135 420 Q 140 400 130 380 Z',
      // Sağ arka pati
      'M 270 380 Q 280 400 265 420 Q 260 430 265 440 Q 275 445 285 440 Q 290 430 285 420 Q 280 400 270 380 Z',
      // Kuyruk (kavisli)
      'M 290 280 Q 320 260 340 280 Q 350 300 340 320 Q 330 340 310 350 Q 295 355 285 340 Q 280 320 290 280 Z',
      // Göğüs çizgisi
      'M 160 260 Q 200 250 240 260 Q 200 280 160 260 Z'
    ]
  },
  dog: {
    name: '🐶 Köpek',
    emoji: '🐶',
    paths: [
      // Köpek kafası
      'M 200 130 Q 140 110 110 150 Q 100 190 120 220 Q 150 240 200 245 Q 250 240 280 220 Q 300 190 290 150 Q 260 110 200 130 Z',
      // Sol kulak (sarkık)
      'M 130 140 Q 90 120 70 140 Q 60 160 70 180 Q 90 200 120 190 Q 140 170 130 140 Z',
      // Sağ kulak (sarkık)
      'M 270 140 Q 280 170 260 190 Q 280 200 310 180 Q 340 160 330 140 Q 310 120 270 140 Z',
      // Sol göz
      'M 170 160 Q 155 145 140 160 Q 155 175 170 160 Z',
      // Sağ göz
      'M 230 160 Q 245 145 260 160 Q 245 175 230 160 Z',
      // Sol göz bebek
      'M 165 160 Q 160 155 155 160 Q 160 165 165 160 Z',
      // Sağ göz bebek
      'M 235 160 Q 240 155 245 160 Q 240 165 235 160 Z',
      // Burun (büyük, ıslak)
      'M 200 190 Q 180 185 170 195 Q 175 210 200 215 Q 225 210 230 195 Q 220 185 200 190 Z',
      // Ağız
      'M 200 220 Q 170 240 150 230 M 200 220 Q 230 240 250 230',
      // Dil
      'M 200 235 Q 190 255 200 265 Q 210 255 200 235 Z',
      // Vücut (büyük)
      'M 200 240 Q 120 230 80 290 Q 70 350 90 410 Q 120 460 200 470 Q 280 460 310 410 Q 330 350 320 290 Q 280 230 200 240 Z',
      // Sol ön pati
      'M 130 380 Q 120 400 115 420 Q 110 435 115 450 Q 125 460 140 455 Q 150 445 145 430 Q 150 400 130 380 Z',
      // Sağ ön pati
      'M 270 380 Q 280 400 285 420 Q 290 435 285 450 Q 275 460 260 455 Q 250 445 255 430 Q 250 400 270 380 Z',
      // Sol arka pati
      'M 110 420 Q 100 440 95 460 Q 90 475 95 490 Q 105 500 120 495 Q 130 485 125 470 Q 130 440 110 420 Z',
      // Sağ arka pati
      'M 290 420 Q 300 440 305 460 Q 310 475 305 490 Q 295 500 280 495 Q 270 485 275 470 Q 270 440 290 420 Z',
      // Kuyruk (yukarı kalkık)
      'M 310 320 Q 340 300 360 320 Q 370 340 360 360 Q 350 380 330 385 Q 315 380 310 360 Q 315 340 310 320 Z',
      // Göğüs lekesi
      'M 170 280 Q 200 270 230 280 Q 220 310 200 320 Q 180 310 170 280 Z'
    ]
  },
  rabbit: {
    name: '🐰 Tavşan',
    emoji: '🐰',
    paths: [
      // Tavşan kafası
      'M 200 160 Q 150 140 120 180 Q 110 220 130 250 Q 160 270 200 275 Q 240 270 270 250 Q 290 220 280 180 Q 250 140 200 160 Z',
      // Sol kulak (çok uzun)
      'M 170 150 Q 160 100 155 60 Q 150 30 145 20 Q 140 15 135 25 Q 140 35 150 65 Q 155 105 165 155 Q 175 165 170 150 Z',
      // Sağ kulak (çok uzun)
      'M 230 150 Q 235 165 245 155 Q 255 105 260 65 Q 270 35 275 25 Q 270 15 265 20 Q 260 30 255 60 Q 250 100 240 150 Z',
      // Sol kulak içi
      'M 165 140 Q 155 95 152 65 Q 158 95 165 140 Z',
      // Sağ kulak içi
      'M 235 140 Q 242 95 248 65 Q 245 95 235 140 Z',
      // Sol göz (büyük)
      'M 175 200 Q 160 185 145 200 Q 160 215 175 200 Z',
      // Sağ göz (büyük)
      'M 225 200 Q 240 185 255 200 Q 240 215 225 200 Z',
      // Sol göz bebek
      'M 170 200 Q 165 195 160 200 Q 165 205 170 200 Z',
      // Sağ göz bebek
      'M 230 200 Q 235 195 240 200 Q 235 205 230 200 Z',
      // Burun (üçgen)
      'M 200 220 L 190 235 L 210 235 Z',
      // Ağız (tavşan ağzı)
      'M 200 240 Q 185 255 170 245 M 200 240 Q 215 255 230 245',
      // Ön dişler
      'M 195 250 L 195 265 M 205 250 L 205 265',
      // Vücut (yumuşak)
      'M 200 270 Q 130 260 100 320 Q 90 380 110 440 Q 140 480 200 485 Q 260 480 290 440 Q 310 380 300 320 Q 270 260 200 270 Z',
      // Sol ön pati
      'M 140 400 Q 130 420 125 440 Q 120 455 125 470 Q 135 480 150 475 Q 160 465 155 450 Q 160 420 140 400 Z',
      // Sağ ön pati
      'M 260 400 Q 270 420 275 440 Q 280 455 275 470 Q 265 480 250 475 Q 240 465 245 450 Q 240 420 260 400 Z',
      // Sol arka pati (büyük)
      'M 120 450 Q 100 470 95 490 Q 85 510 95 530 Q 110 545 130 540 Q 145 530 140 510 Q 145 470 120 450 Z',
      // Sağ arka pati (büyük)
      'M 280 450 Q 300 470 305 490 Q 315 510 305 530 Q 290 545 270 540 Q 255 530 260 510 Q 255 470 280 450 Z',
      // Kuyruk (pofuduk)
      'M 290 350 Q 320 340 335 355 Q 340 370 330 380 Q 315 385 300 375 Q 290 365 290 350 Z',
      // Göğüs bölgesi
      'M 170 320 Q 200 310 230 320 Q 220 350 200 360 Q 180 350 170 320 Z'
    ]
  },
  fish: {
    name: '🐠 Balık',
    emoji: '🐠',
    paths: [
      // Ana vücut (büyük oval)
      'M 200 200 Q 100 160 60 200 Q 50 240 60 280 Q 100 320 200 320 Q 300 320 340 280 Q 350 240 340 200 Q 300 160 200 200 Z',
      // Baş bölümü
      'M 200 200 Q 130 180 100 200 Q 90 240 100 280 Q 130 300 200 300 Q 200 250 200 200 Z',
      // Kuyruk yüzgeci (büyük)
      'M 340 200 Q 380 180 420 200 Q 430 220 425 240 Q 430 260 420 280 Q 380 300 340 280 Q 350 240 340 200 Z',
      // Üst yüzgeç
      'M 160 180 Q 140 140 120 130 Q 110 125 100 135 Q 115 145 140 160 Q 165 175 160 180 Z',
      // Alt yüzgeç
      'M 160 300 Q 165 325 140 340 Q 115 355 100 345 Q 110 335 120 330 Q 140 320 160 300 Z',
      // Yan yüzgeç üst
      'M 220 180 Q 240 160 260 155 Q 270 150 275 160 Q 265 170 245 185 Q 225 190 220 180 Z',
      // Yan yüzgeç alt
      'M 220 300 Q 225 310 245 315 Q 265 330 275 320 Q 270 310 260 305 Q 240 300 220 300 Z',
      // Göz (büyük)
      'M 150 220 Q 130 200 110 220 Q 130 240 150 220 Z',
      // Göz bebek
      'M 145 220 Q 140 215 135 220 Q 140 225 145 220 Z',
      // Ağız
      'M 90 230 Q 70 225 60 230 Q 70 235 90 230 Z',
      // Solungaç
      'M 120 210 Q 110 205 105 210 Q 110 215 120 210 Z',
      // Pul desenleri
      'M 140 200 Q 160 200 180 200 M 140 220 Q 160 220 180 220 M 140 240 Q 160 240 180 240 M 140 260 Q 160 260 180 260 M 140 280 Q 160 280 180 280',
      'M 200 180 Q 220 180 240 180 M 200 200 Q 220 200 240 200 M 200 220 Q 220 220 240 220 M 200 240 Q 220 240 240 240 M 200 260 Q 220 260 240 260 M 200 280 Q 220 280 240 280 M 200 300 Q 220 300 240 300',
      'M 260 200 Q 280 200 300 200 M 260 220 Q 280 220 300 220 M 260 240 Q 280 240 300 240 M 260 260 Q 280 260 300 260 M 260 280 Q 280 280 300 280'
    ]
  },
  bird: {
    name: '🐦 Kuş',
    emoji: '🐦',
    paths: [
      // Kafa
      'M 200 120 Q 160 100 140 130 Q 130 160 150 180 Q 180 190 200 185 Q 220 190 250 180 Q 270 160 260 130 Q 240 100 200 120 Z',
      // Gaga
      'M 140 140 Q 110 135 100 140 Q 95 145 100 150 Q 110 155 140 150 Z',
      // Göz
      'M 180 140 Q 170 130 160 140 Q 170 150 180 140 Z',
      // Göz bebek
      'M 175 140 Q 172 137 169 140 Q 172 143 175 140 Z',
      // Vücut (büyük)
      'M 200 180 Q 140 170 110 220 Q 100 270 120 320 Q 150 360 200 365 Q 250 360 280 320 Q 300 270 290 220 Q 260 170 200 180 Z',
      // Sol kanat (detaylı)
      'M 160 200 Q 100 190 70 210 Q 50 230 60 250 Q 80 270 120 280 Q 160 285 180 260 Q 170 230 160 200 Z',
      // Kanat detayları
      'M 90 220 Q 110 215 130 220 M 85 235 Q 105 230 125 235 M 80 250 Q 100 245 120 250 M 85 265 Q 105 260 125 265',
      // Kuyruk
      'M 280 280 Q 320 270 350 280 Q 370 290 365 310 Q 360 330 340 340 Q 320 345 300 335 Q 285 320 280 280 Z',
      // Kuyruk tüyleri
      'M 300 290 Q 320 285 340 290 M 305 305 Q 325 300 345 305 M 310 320 Q 330 315 350 320',
      // Sol bacak
      'M 170 350 Q 165 370 160 390 Q 155 400 150 410',
      // Sol parmaklar
      'M 150 410 L 145 420 M 150 410 L 150 425 M 150 410 L 155 420',
      // Sağ bacak
      'M 230 350 Q 235 370 240 390 Q 245 400 250 410',
      // Sağ parmaklar
      'M 250 410 L 245 420 M 250 410 L 250 425 M 250 410 L 255 420',
      // Gogüs
      'M 170 220 Q 200 210 230 220 Q 220 250 200 260 Q 180 250 170 220 Z',
      // Tüy detayları
      'M 160 240 Q 180 235 200 240 M 165 255 Q 185 250 205 255 M 170 270 Q 190 265 210 270'
    ]
  },
  butterfly: {
    name: '🦋 Kelebek',
    emoji: '🦋',
    paths: [
      // Gövde (uzun ince)
      'M 200 100 Q 195 100 195 150 Q 195 200 195 250 Q 195 300 195 350 Q 195 360 200 360 Q 205 360 205 350 Q 205 300 205 250 Q 205 200 205 150 Q 205 100 200 100 Z',
      // Kafa
      'M 200 100 Q 190 90 185 95 Q 190 105 200 110 Q 210 105 215 95 Q 210 90 200 100 Z',
      // Antenler
      'M 195 95 Q 185 80 180 75 Q 175 70 172 75 Q 175 80 180 85 M 205 95 Q 215 80 220 75 Q 225 70 228 75 Q 225 80 220 85',
      // Sol üst kanat (büyük güzel)
      'M 195 130 Q 140 110 100 130 Q 80 150 85 180 Q 95 210 120 230 Q 150 240 180 220 Q 190 200 195 170 Z',
      // Sağ üst kanat (büyük güzel)
      'M 205 130 Q 210 200 220 220 Q 250 240 280 230 Q 305 210 315 180 Q 320 150 300 130 Q 260 110 205 130 Z',
      // Sol alt kanat
      'M 195 180 Q 190 200 180 220 Q 150 240 120 260 Q 100 280 105 300 Q 115 320 140 325 Q 170 320 185 300 Q 195 280 195 260 Z',
      // Sağ alt kanat
      'M 205 180 Q 205 260 195 280 Q 185 300 200 320 Q 230 325 260 320 Q 285 300 295 280 Q 300 260 280 240 Q 250 220 220 220 Q 210 200 205 180 Z',
      // Sol üst kanat içi desen
      'M 130 150 Q 120 140 110 150 Q 120 160 130 150 Z M 150 170 Q 140 160 130 170 Q 140 180 150 170 Z M 160 200 Q 150 190 140 200 Q 150 210 160 200 Z',
      // Sağ üst kanat içi desen
      'M 270 150 Q 280 140 290 150 Q 280 160 270 150 Z M 250 170 Q 260 160 270 170 Q 260 180 250 170 Z M 240 200 Q 250 190 260 200 Q 250 210 240 200 Z',
      // Sol alt kanat desen
      'M 140 280 Q 130 270 120 280 Q 130 290 140 280 Z M 160 300 Q 150 290 140 300 Q 150 310 160 300 Z',
      // Sağ alt kanat desen
      'M 260 280 Q 270 270 280 280 Q 270 290 260 280 Z M 240 300 Q 250 290 260 300 Q 250 310 240 300 Z',
      // Kanat kenar süsleri
      'M 100 140 Q 95 135 90 140 Q 95 145 100 140 Z M 105 170 Q 100 165 95 170 Q 100 175 105 170 Z M 115 200 Q 110 195 105 200 Q 110 205 115 200 Z',
      'M 300 140 Q 305 135 310 140 Q 305 145 300 140 Z M 295 170 Q 300 165 305 170 Q 300 175 295 170 Z M 285 200 Q 290 195 295 200 Q 290 205 285 200 Z',
      // Gövde segmentleri
      'M 197 120 L 203 120 M 197 140 L 203 140 M 197 160 L 203 160 M 197 180 L 203 180 M 197 200 L 203 200 M 197 220 L 203 220 M 197 240 L 203 240 M 197 260 L 203 260 M 197 280 L 203 280 M 197 300 L 203 300 M 197 320 L 203 320 M 197 340 L 203 340'
    ]
  }
};

export function KidsPaint({ volume }: KidsPaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [selectedSticker, setSelectedSticker] = useState(STICKERS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showStickerPalette, setShowStickerPalette] = useState(false);
  const [showTemplatePalette, setShowTemplatePalette] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas size
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 900);
      const maxHeight = Math.min(window.innerHeight - 180, 600);
      
      canvas.width = maxWidth;
      canvas.height = maxHeight;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, maxWidth, maxHeight);
      
      // Drawing settings
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Apply template if selected
      if (selectedTemplate) {
        drawTemplate(ctx, selectedTemplate);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [selectedTemplate]);

  const drawTemplate = (ctx: CanvasRenderingContext2D, templateKey: string) => {
    const template = COLORING_TEMPLATES[templateKey as keyof typeof COLORING_TEMPLATES];
    if (!template) return;

    // Clear canvas first
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw template outline
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Scale template to fit canvas
    const scaleX = ctx.canvas.width / 400;
    const scaleY = ctx.canvas.height / 400;
    const scale = Math.min(scaleX, scaleY) * 0.8;
    
    const offsetX = (ctx.canvas.width - 400 * scale) / 2;
    const offsetY = (ctx.canvas.height - 400 * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    template.paths.forEach(pathString => {
      const path = new Path2D(pathString);
      ctx.stroke(path);
    });

    ctx.restore();
  };

  const applyTemplate = (templateKey: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setSelectedTemplate(templateKey);
    drawTemplate(ctx, templateKey);

    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'sticker') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
    }

    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playSuccess();
    }
  }, [tool, selectedColor, brushSize, volume]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'sticker') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, tool]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const addSticker = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (tool !== 'sticker') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedSticker, x, y);

    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playPop();
    }
  }, [tool, selectedSticker, volume]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedTemplate) {
      drawTemplate(ctx, selectedTemplate);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (volume > 0) {
      const soundManager = getSoundManager(volume);
      soundManager.playError();
    }
  }, [selectedTemplate, volume]);

  const handleCanvasInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (tool === 'sticker') {
      addSticker(e);
    } else {
      startDrawing(e);
    }
  }, [tool, addSticker, startDrawing]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${15 + i * 10}%`,
              top: `${20 + i * 8}%`
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7
            }}
          >
            {['🎨', '✨', '🌈', '🦋', '🌸', '🎈', '⭐', '🌟'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 p-6 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4"
        >
          <div className="text-6xl mb-3">🎨</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Hayvan Boyama
          </h1>
          <p className="text-lg text-white/90 mt-2">
            Sevimli hayvanları boya! 🐱🐶🐰
          </p>
        </motion.div>
      </div>

      {/* Canvas */}
      <div className="flex justify-center px-4 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-white/50"
        >
          <canvas
            ref={canvasRef}
            className="border-4 border-gray-200 rounded-2xl cursor-crosshair"
            onMouseDown={handleCanvasInteraction}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleCanvasInteraction}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }}
          />
        </motion.div>
      </div>

      {/* Bottom Tool Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 backdrop-blur-lg rounded-full p-4 shadow-2xl border-4 border-white/50 flex gap-4 items-center">
          
          {/* Template Selector */}
          <Button
            onClick={() => setShowTemplatePalette(!showTemplatePalette)}
            className="w-16 h-16 rounded-full text-2xl bg-green-400 hover:bg-green-500 shadow-lg"
          >
            {selectedTemplate ? COLORING_TEMPLATES[selectedTemplate as keyof typeof COLORING_TEMPLATES]?.emoji : '🖼️'}
          </Button>

          {/* Brush Tool */}
          <Button
            onClick={() => setTool('brush')}
            className={`
              w-16 h-16 rounded-full text-2xl transition-all
              ${tool === 'brush' 
                ? 'bg-pink-400 hover:bg-pink-500 scale-110 shadow-lg' 
                : 'bg-gray-200 hover:bg-gray-300'
              }
            `}
          >
            🖌️
          </Button>

          {/* Color Selector */}
          <Button
            onClick={() => setShowColorPalette(!showColorPalette)}
            className="w-16 h-16 rounded-full text-3xl shadow-lg"
            style={{ backgroundColor: selectedColor }}
          >
            🎨
          </Button>

          {/* Brush Sizes */}
          <div className="flex gap-2">
            {BRUSH_SIZES.map((size) => (
              <Button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`
                  w-12 h-12 rounded-full text-lg transition-all
                  ${brushSize === size 
                    ? 'bg-purple-400 hover:bg-purple-500 scale-110' 
                    : 'bg-gray-200 hover:bg-gray-300'
                  }
                `}
              >
                <div 
                  className={`rounded-full ${brushSize === size ? 'bg-white' : 'bg-gray-600'}`}
                  style={{ width: `${size/4 + 6}px`, height: `${size/4 + 6}px` }}
                />
              </Button>
            ))}
          </div>

          {/* Sticker Tool */}
          <Button
            onClick={() => setTool('sticker')}
            className={`
              w-16 h-16 rounded-full text-2xl transition-all
              ${tool === 'sticker' 
                ? 'bg-yellow-400 hover:bg-yellow-500 scale-110 shadow-lg' 
                : 'bg-gray-200 hover:bg-gray-300'
              }
            `}
          >
            ⭐
          </Button>

          {/* Sticker Selector */}
          {tool === 'sticker' && (
            <Button
              onClick={() => setShowStickerPalette(!showStickerPalette)}
              className="w-16 h-16 rounded-full text-3xl bg-yellow-200 hover:bg-yellow-300 shadow-lg"
            >
              {selectedSticker}
            </Button>
          )}

          {/* Eraser */}
          <Button
            onClick={() => setTool('eraser')}
            className={`
              w-16 h-16 rounded-full text-2xl transition-all
              ${tool === 'eraser' 
                ? 'bg-orange-400 hover:bg-orange-500 scale-110 shadow-lg' 
                : 'bg-gray-200 hover:bg-gray-300'
              }
            `}
          >
            🧹
          </Button>

          {/* Clear Button */}
          <Button
            onClick={clearCanvas}
            className="w-16 h-16 rounded-full bg-red-400 hover:bg-red-500 text-2xl shadow-lg"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Template Palette */}
      <AnimatePresence>
        {showTemplatePalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-4 shadow-2xl border-4 border-white/50">
              <div className="text-center mb-3">
                <p className="text-lg font-bold text-gray-800">Hayvan Şablonları</p>
                <p className="text-sm text-gray-600">Boyamak istediğin hayvanı seç!</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(COLORING_TEMPLATES).map(([key, template]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      applyTemplate(key);
                      setShowTemplatePalette(false);
                    }}
                    className={`
                      w-20 h-20 rounded-2xl shadow-lg border-4 transition-all bg-white hover:bg-gray-50
                      ${selectedTemplate === key 
                        ? 'border-green-400 scale-105' 
                        : 'border-gray-200'
                      }
                    `}
                  >
                    <div className="text-3xl mb-1">{template.emoji}</div>
                    <div className="text-xs font-semibold text-gray-700">
                      {template.name.split(' ')[1]}
                    </div>
                  </motion.button>
                ))}
                
                {/* Clear Template Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedTemplate(null);
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                      }
                    }
                    setShowTemplatePalette(false);
                  }}
                  className="w-20 h-20 rounded-2xl shadow-lg border-4 border-gray-200 bg-white hover:bg-gray-50 transition-all"
                >
                  <div className="text-3xl mb-1">🖼️</div>
                  <div className="text-xs font-semibold text-gray-700">Boş</div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Palette */}
      <AnimatePresence>
        {showColorPalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-4 shadow-2xl border-4 border-white/50">
              <div className="grid grid-cols-4 gap-3">
                {PAINT_COLORS.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPalette(false);
                    }}
                    className={`
                      w-14 h-14 rounded-full shadow-lg border-4 transition-all
                      ${selectedColor === color 
                        ? 'border-white scale-110' 
                        : 'border-gray-200'
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker Palette */}
      <AnimatePresence>
        {showStickerPalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-4 shadow-2xl border-4 border-white/50">
              <div className="grid grid-cols-8 gap-2">
                {STICKERS.map((sticker) => (
                  <motion.button
                    key={sticker}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedSticker(sticker);
                      setShowStickerPalette(false);
                    }}
                    className={`
                      w-12 h-12 rounded-xl text-2xl transition-all
                      ${selectedSticker === sticker 
                        ? 'bg-yellow-200 scale-110 shadow-lg' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    {sticker}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute top-32 right-6 z-20">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-xs"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">
              {selectedTemplate ? '🎨' : '🖼️'}
            </div>
            <div className="text-sm font-bold text-gray-800 mb-1">
              {selectedTemplate ? 'Hayvanını Boya!' : 'Şablon Seç!'}
            </div>
            <div className="text-xs text-gray-600">
              {selectedTemplate 
                ? 'Renkleri seç ve hayvanını güzelleştir!' 
                : 'Önce bir hayvan şablonu seç!'
              }
            </div>
          </div>
        </motion.div>
      </div>

      {/* Character Helper */}
      <motion.div
        className="fixed bottom-32 left-8 z-30"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {selectedTemplate ? '🎨' : '🖼️'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {selectedTemplate ? 'Süper!' : 'Haydi!'}
              </p>
              <p className="text-xs text-gray-600">
                {selectedTemplate 
                  ? 'Harika boyuyorsun!' 
                  : 'Bir hayvan seç!'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default KidsPaint;