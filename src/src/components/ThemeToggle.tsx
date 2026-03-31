import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = ({ isScrolled = false, variant = 'navbar' }: { isScrolled?: boolean, variant?: 'navbar' | 'mobile' }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const navbarClasses = `flex items-center justify-center w-9 h-9 transition-all duration-500 ease-in-out rounded-full focus:outline-none backdrop-blur-md drop-shadow-sm border ${
    isScrolled
      ? 'bg-white/50 dark:bg-transparent text-slate-700 dark:text-gray-200 border-slate-200 dark:border-white/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
      : 'bg-transparent text-white/90 border-white/40 hover:text-white hover:bg-white/10 hover:border-white/60'
  }`;

  const mobileClasses = "flex items-center justify-center w-full h-12 bg-white dark:bg-[#2A2F3A] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white transition-all active:scale-95 focus:outline-none";

  return (
    <button
      onClick={toggleTheme}
      className={variant === 'mobile' ? mobileClasses : navbarClasses}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <Sun size={variant === 'mobile' ? 20 : 18} className={variant === 'mobile' ? "text-emerald-600 dark:text-emerald-400" : ""} />
      ) : (
        <Moon size={variant === 'mobile' ? 20 : 18} className={variant === 'mobile' ? "text-emerald-600 dark:text-emerald-400" : ""} />
      )}
    </button>
  );
};
