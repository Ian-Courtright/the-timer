
import React from 'react';
import Logo from './Logo';
import QuickSets from './QuickSets';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const Header: React.FC<HeaderProps> = ({ onSetTimer }) => {
  return (
    <header className="flex justify-between items-center w-full py-5 px-5">
      <Logo />
      
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
