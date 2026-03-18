import React from 'react';

export const Logo = ({ className = "w-32 h-auto" }: { className?: string }) => {
  return (
    <svg viewBox="40 0 220 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <g>
        <circle cx="100" cy="60" r="50" fill="#1a1a1a" style={{ mixBlendMode: 'multiply' }} />
        <circle cx="150" cy="60" r="50" fill="#e32636" style={{ mixBlendMode: 'multiply' }} />
        <circle cx="200" cy="60" r="50" fill="#ffcc00" style={{ mixBlendMode: 'multiply' }} />
      </g>
      
      <rect x="40" y="46" width="220" height="28" fill="white" />
      
      <text 
        x="150" 
        y="67" 
        fontFamily="Georgia, 'Times New Roman', serif" 
        fontWeight="900" 
        fontSize="22" 
        textAnchor="middle" 
        fill="#000000" 
        letterSpacing="3"
      >
        INTENSIVE
      </text>
    </svg>
  );
};
