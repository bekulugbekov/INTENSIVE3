import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Facebook, Twitter, Send, Maximize2, Download } from 'lucide-react';

const images = [
  { src: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&h=1000&q=80", captionKey: "gallery_img1" }, // Berlin (taller)
  { src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&h=600&q=80", captionKey: "gallery_img2" }, // Study process (wider)
  { src: "https://images.unsplash.com/photo-1534313314376-a72289b6181e?auto=format&fit=crop&w=800&h=1200&q=80", captionKey: "gallery_img3" }, // German architecture (tallest)
  { src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&h=800&q=80", captionKey: "gallery_img4" }, // Library (square)
  { src: "https://images.pexels.com/photos/2382806/pexels-photo-2382806.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop", captionKey: "gallery_img5" }, // Munich streets (Pexels)
  { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&h=600&q=80", captionKey: "gallery_img6" }, // Students (wider)
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const Gallery = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
      }
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
  };

  const handleShare = (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(t(images[selectedIndex].captionKey));
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    const link = document.createElement('a');
    link.href = images[selectedIndex].src;
    link.download = `gallery-image-${selectedIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <section id="gallery" className="mb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA] mb-12 text-center"
        >
          {t('gallery_title')}
        </motion.h2>
        
        {/* Fixed Aspect Ratio Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative group overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-neutral-200 dark:border-white/5 aspect-[4/5]"
              onClick={() => setSelectedIndex(idx)}
            >
              <img 
                src={img.src} 
                alt={t(img.captionKey)} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white mb-4"
                >
                  <Maximize2 size={24} />
                </motion.div>
                <p className="text-white font-serif italic text-lg px-6 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {t(img.captionKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110]">
              <div className="text-white/70 font-mono text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  className="p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full"
                  title="Download"
                >
                  <Download size={20} />
                </button>
                <button
                  className="p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full"
                  onClick={() => setSelectedIndex(null)}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Carousel Navigation Buttons */}
            <button
              className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-all z-[110] p-4 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm hidden md:block"
              onClick={handlePrev}
            >
              <ChevronLeft size={32} />
            </button>

            <button
              className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-all z-[110] p-4 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm hidden md:block"
              onClick={handleNext}
            >
              <ChevronRight size={32} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-6xl w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedIndex].src}
                alt={t(images[selectedIndex].captionKey)}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
              
              <div className="mt-8 text-center max-w-2xl px-4">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-white text-2xl md:text-3xl font-serif font-bold mb-4"
                >
                  {t(images[selectedIndex].captionKey)}
                </motion.h3>
                
                {/* Social Share Buttons */}
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={(e) => handleShare('facebook', e)}
                    className="p-3 bg-white/5 hover:bg-[#1877F2] text-white rounded-full transition-all duration-300 border border-white/10"
                    aria-label="Share on Facebook"
                  >
                    <Facebook size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleShare('twitter', e)}
                    className="p-3 bg-white/5 hover:bg-[#1DA1F2] text-white rounded-full transition-all duration-300 border border-white/10"
                    aria-label="Share on Twitter"
                  >
                    <Twitter size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleShare('telegram', e)}
                    className="p-3 bg-white/5 hover:bg-[#0088cc] text-white rounded-full transition-all duration-300 border border-white/10"
                    aria-label="Share on Telegram"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
