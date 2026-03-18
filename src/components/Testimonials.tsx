import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const Testimonials = () => {
  const { t } = useTranslation();
  const baseTestimonials = [
    { id: 1, name: t('t1_name'), quote: t('t1_quote'), avatar: 'https://i.pravatar.cc/150?u=dilnoza' },
    { id: 2, name: t('t2_name'), quote: t('t2_quote'), avatar: 'https://i.pravatar.cc/150?u=azizbek' },
    { id: 3, name: t('t3_name'), quote: t('t3_quote'), avatar: 'https://i.pravatar.cc/150?u=madina' },
    { id: 4, name: t('t4_name'), quote: t('t4_quote'), avatar: 'https://i.pravatar.cc/150?u=jasur' },
    { id: 5, name: t('t5_name'), quote: t('t5_quote'), avatar: 'https://i.pravatar.cc/150?u=gulnora' },
    { id: 6, name: t('t6_name'), quote: t('t6_quote'), avatar: 'https://i.pravatar.cc/150?u=bobur' }
  ];

  // Triplicate the array for seamless infinite looping
  const testimonials = [...baseTestimonials, ...baseTestimonials, ...baseTestimonials];
  
  const [currentIndex, setCurrentIndex] = useState(baseTestimonials.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardsToShow = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3;
  const centerOffset = Math.floor(cardsToShow / 2);

  const slideNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const slidePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Handle the infinite loop jump
  const handleAnimationComplete = () => {
    if (currentIndex >= baseTestimonials.length * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - baseTestimonials.length);
    } else if (currentIndex < baseTestimonials.length) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + baseTestimonials.length);
    }
  };

  useEffect(() => {
    const timer = setInterval(slideNext, 5000);
    return () => clearInterval(timer);
  }, [slideNext]);

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-neutral-50/50 dark:bg-[#1A1D23]/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA] mb-4">
            {t('testimonials_title')}
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden py-10 px-4">
            <motion.div
              animate={{ x: `-${(currentIndex / testimonials.length) * 100}%` }}
              transition={isTransitioning ? { type: "spring", stiffness: 200, damping: 25 } : { duration: 0 }}
              onAnimationComplete={handleAnimationComplete}
              className="flex"
              style={{ width: `${(testimonials.length / cardsToShow) * 100}%` }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) slideNext();
                else if (info.offset.x > 50) slidePrev();
              }}
            >
              {testimonials.map((item, idx) => {
                // Focus logic: the card in the center of the viewport is highlighted
                const isActive = idx === currentIndex + centerOffset;
                
                return (
                  <div 
                    key={`${item.id}-${idx}`} 
                    className="px-4"
                    style={{ width: `${100 / testimonials.length}%` }}
                  >
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.05 : 0.9,
                        opacity: isActive ? 1 : 0.4,
                        y: isActive ? 0 : 15,
                        filter: isActive ? "blur(0px)" : "blur(1px)"
                      }}
                      transition={{ duration: 0.5 }}
                      className={`h-full bg-white dark:bg-[#242830] p-6 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-neutral-100 dark:border-white/5 relative flex flex-col min-h-[320px] overflow-hidden`}
                    >
                      <Quote className="absolute top-6 right-6 text-emerald-500/10 dark:text-emerald-400/10 w-16 h-16" />
                      
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-[#1A1D23] shadow-lg flex-shrink-0">
                          <img 
                            src={item.avatar} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-neutral-900 dark:text-[#EAEAEA]">
                            {item.name}
                          </h4>
                          <div className="flex gap-1 mt-1.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-base md:text-lg text-neutral-600 dark:text-[#A0AEC0] italic leading-relaxed font-serif flex-grow break-words">
                        "{item.quote}"
                      </p>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 left-0 md:-left-4 flex items-center">
            <button
              onClick={slidePrev}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#242830] shadow-xl flex items-center justify-center text-neutral-900 dark:text-white hover:bg-emerald-500 hover:text-white transition-all duration-300 border border-neutral-100 dark:border-white/5 z-20"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 md:-right-4 flex items-center">
            <button
              onClick={slideNext}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#242830] shadow-xl flex items-center justify-center text-neutral-900 dark:text-white hover:bg-emerald-500 hover:text-white transition-all duration-300 border border-neutral-100 dark:border-white/5 z-20"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3 mt-10">
          {baseTestimonials.map((_, idx) => {
            const normalizedIndex = (currentIndex % baseTestimonials.length);
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setCurrentIndex(idx + baseTestimonials.length);
                }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === normalizedIndex 
                    ? 'w-8 bg-emerald-500' 
                    : 'w-2 bg-neutral-300 dark:bg-white/10 hover:bg-neutral-400'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -z-0" />
    </section>
  );
};
