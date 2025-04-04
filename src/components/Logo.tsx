
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="w-16 h-16 rounded-full bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-3/4 h-3/4 bg-timer-background rounded-full transform translate-x-1/4 translate-y-1/4"></div>
    </div>
  );
};

export default Logo;
