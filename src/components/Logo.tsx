import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="w-16 h-16 rounded-full bg-white overflow-hidden relative">
      {/* Create the pie-chart appearance by hiding a portion */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'conic-gradient(transparent 0deg, transparent 270deg, #1A1A1A 270deg, #1A1A1A 360deg)'
        }}
      />
      
      {/* Inner circle cutout */}
      <div className="absolute top-1/2 left-1/2 w-[90%] h-[90%] bg-[#1A1A1A] rounded-full -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
};

export default Logo;
