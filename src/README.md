# 🌟 MiniDünya - Çocuklar İçin Eğlence Dünyası

**MiniDünya**, 3-6 yaş arası çocuklar için özel olarak geliştirdiğim kapsamlı bir eğitici eğlence uygulamasıdır. Modern web teknolojileri kullanarak tamamen görsel odaklı ve ses destekli bir deneyim sunmaktadır.

![MiniDünya Screenshot](https://via.placeholder.com/800x400/6366f1/ffffff?text=MiniDünya+Screenshot)

## 🎯 **Proje Amacı**

Çocukların dijital dünyada güvenli ve eğlenceli bir öğrenme deneyimi yaşaması için geliştirdim. Toca Boca ve Khan Academy Kids tarzında, sıfır metin okuma gereksinimi ile tamamen görsel etkileşim sağlar.

## ✨ **Ana Özellikler**

### 🎹 **Müzik Dünyası**
- **Serbest Çalma**: İnteraktif piano ile yaratıcılık
- **Şarkı Öğrenme**: Popüler çocuk şarkıları ile adım adım öğretim
- **Ses Desteği**: High-quality Türkçe ses sistemi

### 🎮 **Eğlenceli Oyunlar**
- **BubblePopMagic**: Baloncuk patlatma + fizik simülasyonu
- **AlphabetPainting**: Türk alfabesi ile harf boyama
- **AnimalFeeding**: Sürükle-bırak ile hayvan besleme
- **ColorMixer**: Renkleri karıştırma ve öğrenme
- **MemoryCards**: Hafıza geliştirici kartlar
- **Ve daha fazlası...**

### 📖 **İnteraktif Hikayeler**
- Geleneksel Türk masalları
- Karakterlerle etkileşim
- "-mış/-miş" geçmiş zaman anlatımı
- AI destekli sesli anlatım

## 🛠 **Teknoloji Stack'i**

```typescript
Frontend:
├── React 18 + TypeScript
├── Tailwind CSS v4 (Custom Design System)
├── Motion/React (Premium Animations)
├── Vite (Build Tool)
└── PWA Support

Backend:
├── Supabase (Database & Auth)
├── Edge Functions (Hono.js)
├── Real-time Updates
└── File Storage

Audio:
├── Web Speech API (Turkish)
├── Web Audio API (Synthesizer)
├── Custom Sound Manager
└── AI Voice Integration
```

## 🎨 **Design Philosophy**

Çocuk odaklı tasarım prensipleri:
- **Touch-First**: Büyük, dostane butonlar
- **Visual Feedback**: Her etkileşimde animasyon
- **Safe Colors**: Göz dostu pastel tonlar
- **Responsive**: Tüm cihazlarda mükemmel deneyim

## 🚀 **Kurulum & Çalıştırma**

### **Gereksinimler**
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Modern Web Browser
```

### **Development Setup**
```bash
# Repository klonla
git clone https://github.com/yourusername/minidunya.git
cd minidunya

# Dependencies yükle
npm install

# Environment setup
cp .env.example .env.local
# .env.local dosyasını düzenle

# Development server başlat
npm run dev
```

### **Production Build**
```bash
npm run build
npm run preview
```

## ⚙️ **Environment Variables**

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: AI Voice Services
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_VOICEMAKER_API_KEY=your_voicemaker_key
```

## 🏗 **Proje Mimarisi**

```
src/
├── components/
│   ├── games/          # Oyun bileşenleri
│   ├── stories/        # Hikaye sistemi
│   ├── ui/            # Yeniden kullanılabilir UI
│   └── utils/         # Yardımcı fonksiyonlar
├── styles/
│   └── globals.css    # Design system
├── supabase/
│   └── functions/     # Edge functions
└── utils/
    └── supabase/      # Database utils
```

## 🎵 **Ses Sistemi**

### **Çok Katmanlı Ses Mimarisi**
1. **Web Audio API**: Piano synthesizer
2. **Speech Synthesis**: Türkçe metin-konuşma
3. **AI Voices**: Premium ses kalitesi (opsiyonel)
4. **Sound Manager**: Merkezi ses kontrolü

### **Türkçe Dil Desteği**
- Özel Türkçe foneme haritası
- Harf telaffuz optimizasyonu
- Çocuk dostu ses tonu

## 📱 **Progressive Web App**

- **Offline Support**: Temel oyunlar çevrimdışı çalışır
- **Install Prompt**: Ana ekrana ekleme
- **Native Feel**: App-like deneyim
- **Fast Loading**: Intelligent caching

## 🧪 **Testing & Performance**

```bash
# Type checking
npm run type-check

# Performance audit
npm run lighthouse

# Bundle analysis
npm run analyze
```

### **Performance Metrikleri**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm run build
npx vercel deploy --prod
```

### **Netlify**
```bash
npm run build
# dist/ folder'ını Netlify'a upload et
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔐 **Güvenlik & Privacy**

- **No Data Collection**: Çocuk verisi toplanmaz
- **Safe Content**: El ile curated içerik
- **Parental Controls**: Ses ve etkileşim kontrolleri
- **COPPA Compliant**: Çocuk gizliliği yasalarına uygun

## 🤝 **Katkıda Bulunma**

Projeye katkıda bulunmak isteyenler için:

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- TypeScript strict mode kullanın
- ESLint rules'larına uyun
- Accessibility standards'ları takip edin
- Performance impact'i göz önünde bulundurun

## 📊 **Roadmap**

### **v2.0 (Planned)**
- [ ] Çoklu dil desteği (İngilizce, Almanca)
- [ ] Ebeveyn dashboard'u
- [ ] İlerleme takip sistemi
- [ ] Offline mod genişletmesi

### **v2.1 (Future)**
- [ ] AR/VR entegrasyonu
- [ ] Sosyal özellikler (güvenli)
- [ ] Öğretmen portal'ı
- [ ] Advanced analytics

## 📈 **Analytics & Monitoring**

```typescript
// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  // Custom performance tracking
});

// Error tracking
window.addEventListener('error', (error) => {
  // Error logging without personal data
});
```

## 📄 **Lisans**

Bu proje **MIT License** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 **Developer**

**Onat Özmen**
- 🌐 Portfolio: [onat-ozmen.dev](https://onat-ozmen.dev)
- 💼 LinkedIn: [/in/onat-ozmen](https://linkedin.com/in/onat-ozmen)
- 📧 Email: hello@onat-ozmen.dev

## 🙏 **Acknowledgments**

- **React Team** - Amazing framework
- **Tailwind CSS** - Utility-first CSS
- **Supabase** - Backend infrastructure
- **Motion/React** - Animation library
- **Unsplash** - Beautiful stock images

---

### 🔗 **Demo**

**[🌟 Canlı Demo'yu Deneyin](https://minidunya.vercel.app)**

---

### 📱 **QR Code for Mobile Testing**

```
█████████████████████████████
█████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄█ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ █ █   █ ████
████ █▄▄▄█ █▀ █▀▄█ █▄▄▄█ ████
█████████████████████████████
```

**MiniDünya ile çocuklar güvenli bir dijital ortamda öğrenir, eğlenir ve yaratıcılıklarını geliştirir! 🚀**