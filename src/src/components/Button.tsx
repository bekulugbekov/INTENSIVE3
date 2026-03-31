import React, { useState } from 'react';

export const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false }: any) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
    secondary: "bg-white text-black border-2 border-black hover:bg-gray-50 dark:bg-neutral-900 dark:text-white dark:border-white dark:hover:bg-neutral-800"
  };
  
  // If className includes background colors, we might not want to apply the variant background
  const hasCustomBg = className.includes('bg-');
  const variantStyle = hasCustomBg ? '' : variants[variant as keyof typeof variants];
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </button>
  );
};
