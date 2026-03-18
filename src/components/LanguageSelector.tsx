import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSelector = ({ isDropup = false, isScrolled = false, variant = 'navbar' }: { isDropup?: boolean, isScrolled?: boolean, variant?: 'navbar' | 'mobile' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'uz', name: 'O\'zbekcha', short: 'UZ' },
    { code: 'ru', name: 'Русский', short: 'RU' },
    { code: 'en', name: 'English', short: 'EN' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const navbarBtnClasses = `flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-500 ease-in-out focus:outline-none border backdrop-blur-md drop-shadow-sm ${
    isOpen 
      ? (isScrolled ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'text-white border-white/60 bg-white/20')
      : (isScrolled 
          ? 'bg-white/50 dark:bg-transparent text-slate-700 dark:text-gray-200 border-slate-200 dark:border-white/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20' 
          : 'bg-transparent text-white/90 border-white/40 hover:text-white hover:bg-white/10 hover:border-white/60')
  }`;

  const mobileBtnClasses = "flex items-center justify-center gap-2 w-full h-12 bg-white dark:bg-[#2A2F3A] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white transition-all active:scale-95 focus:outline-none";

  return (
    <div className={`relative z-[110] ${variant === 'mobile' ? 'w-full' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={variant === 'mobile' ? mobileBtnClasses : navbarBtnClasses}
      >
        <Globe size={variant === 'mobile' ? 20 : 16} className={variant === 'mobile' ? "text-emerald-600 dark:text-emerald-400" : "text-current"} />
        <span className={`${variant === 'mobile' ? 'text-base' : 'text-sm'} font-medium tracking-wide`}>{currentLanguage.short}</span>
        <ChevronDown 
          size={variant === 'mobile' ? 18 : 14} 
          className={`transition-transform duration-500 ease-out text-current ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isDropup ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isDropup ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute ${isDropup ? 'bottom-full mb-3 left-0' : 'top-full mt-3 right-0'} bg-white dark:bg-[#1A1D23] border border-neutral-100 dark:border-white/10 rounded-2xl shadow-2xl py-2 ${variant === 'mobile' ? 'w-full' : 'w-40'} z-[120] overflow-hidden backdrop-blur-xl`}
          >
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 mb-1">
              Select Language
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all duration-200 group ${
                  i18n.language === lang.code 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>{lang.name}</span>
                {i18n.language === lang.code && (
                  <motion.div 
                    layoutId="activeLang"
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
