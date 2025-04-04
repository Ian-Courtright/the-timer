
import React from 'react';
import Logo from './Logo';
import QuickSets from './QuickSets';
import CircularTimer from './CircularTimer';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  isRunning: boolean;
  progress: number; // Add progress prop
}

const Header: React.FC<HeaderProps> = ({ onSetTimer, isRunning, progress }) => {
  return (
    <header className="flex justify-between items-center w-full py-5 px-5">
      <div className="flex items-center gap-4">
        <CircularTimer isRunning={isRunning} progress={progress} />
        <Logo />
      </div>
      
      <div className="flex items-center">
        <QuickSets onSetTimer={onSetTimer} />
        
        <div className="flex items-center ml-4 text-white/80 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>TimerFlow</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
