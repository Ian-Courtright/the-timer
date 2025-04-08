import React, { useState } from 'react';
import { soundEffects } from '@/lib/sounds/soundEffects';
import { cn } from '@/lib/utils';

// Define the props for the Logo component
interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className, size = 'md' }: LogoProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleMouseEnter = () => {
    setShowTooltip(true);
    soundEffects.playHoverLogo();
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  // Define styles based on size
  const containerSizeClasses = {
    'sm': 'w-12 h-12',
    'md': 'w-16 h-16', // Default size
    'lg': 'w-20 h-20'
  };

  const iconSizeClasses = {
    'sm': 'w-6 h-6',
    'md': 'w-8 h-8',
    'lg': 'w-10 h-10'
  };

  const textSizeClasses = {
    'sm': 'text-sm',
    'md': 'text-base', // Adjusted for better fit
    'lg': 'text-lg'
  };

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full bg-white overflow-hidden cursor-default",
        containerSizeClasses[size],
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background elements for pie-chart effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'conic-gradient(transparent 0deg, transparent 270deg, #1A1A1A 270deg, #1A1A1A 360deg)'
        }}
      />
      <div className="absolute top-1/2 left-1/2 w-[90%] h-[90%] bg-[#1A1A1A] rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* Clock Icon */}
      <div className={cn("z-20", iconSizeClasses[size])}>
        <img src="/clock-favicon.svg" alt="Logo" className="w-full h-full text-white filter brightness-0 invert" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded whitespace-nowrap z-50",
          textSizeClasses[size],
          {
            '-bottom-10': size === 'sm',
            '-bottom-12': size === 'md',
            '-bottom-14': size === 'lg'
          }
        )}>
          THE Timer
        </div>
      )}
    </div>
  );
};

export default Logo;
