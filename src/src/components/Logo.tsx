import React from 'react';
import { useData } from '../context/DataContext';

export const Logo = ({ className = "w-32 h-auto" }: { className?: string }) => {
  const { settings } = useData();

  if (settings?.logoUrl) {
    return (
      <img 
        src={settings.logoUrl} 
        alt="Intensive Nemis tili markazi - Toshkent" 
        className={`${className} object-contain`} 
        referrerPolicy="no-referrer" 
      />
    );
  }

  return (
    <svg viewBox="40 0 220 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.9">
        <circle cx="100" cy="60" r="50" fill="#1a1a1a" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
        <circle cx="150" cy="60" r="50" fill="#e32636" opacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
        <circle cx="200" cy="60" r="50" fill="#ffcc00" opacity="0.9" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      </g>
      
      <rect x="40" y="46" width="220" height="28" fill="white" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      
      <text 
        x="150" 
        y="67" 
        fontFamily="Georgia, 'Times New Roman', serif" 
        fontWeight="900" 
        fontSize="22" 
        textAnchor="middle" 
        className="fill-black"
        letterSpacing="3"
      >
        INTENSIVE
      </text>
    </svg>
  );
};
