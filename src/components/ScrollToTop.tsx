import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    // Check if user has reached the bottom (footer area)
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 150) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  };

  // Set the top coordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    // Initial check
    toggleVisibility();
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && !isAtBottom && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 100 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-2.5 bg-black/70 text-white dark:bg-white/70 dark:text-black rounded-full shadow-lg hover:bg-black dark:hover:bg-white hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white dark:focus:ring-offset-neutral-900 backdrop-blur-sm"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
