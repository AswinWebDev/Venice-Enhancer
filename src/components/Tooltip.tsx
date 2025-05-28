// src/components/Tooltip.tsx
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right'; // Allows specifying tooltip position
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getTooltipPositionStyles = (): React.CSSProperties => {
    // Basic positioning, can be enhanced with dynamic adjustments if needed
    switch (position) {
      case 'bottom':
        return { top: '110%', left: '50%', transform: 'translateX(-50%)', marginTop: '0.5rem' };
      case 'left':
        return { top: '50%', right: '110%', transform: 'translateY(-50%)', marginRight: '0.5rem' };
      case 'right':
        return { top: '50%', left: '110%', transform: 'translateY(-50%)', marginLeft: '0.5rem' };
      case 'top':
      default:
        return { bottom: '110%', left: '50%', transform: 'translateX(-50%)', marginBottom: '0.5rem' };
    }
  };

  return (
    <div 
      className="relative inline-flex items-center" // Changed to inline-flex for better alignment with text
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 whitespace-nowrap"
          style={getTooltipPositionStyles()}
          role="tooltip"
        >
          {text}
          {/* Optional: triangle/arrow for the tooltip if desired later */}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
