import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-site-gradient overflow-hidden">
      {/* Background decorative elements - more subtle and elegant */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" 
      />
      
      <div className="relative flex flex-col items-center">
        {/* Logo with sophisticated entrance */}
        <motion.div
          initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-12"
        >
          <Logo className="h-24 md:h-32 w-auto" />
        </motion.div>

        {/* Minimalist loading indicator */}
        <div className="relative w-64 h-[2px] bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-emerald-500"
            initial={{ left: "-100%", width: "30%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Elegant text with letter spacing animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600/80 dark:text-emerald-400/80">
            Intensive
          </span>
          <span className="text-xs font-medium text-neutral-400 dark:text-gray-500 tracking-widest uppercase">
            Nemis tili markazi
          </span>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
      />
    </div>
  );
};
