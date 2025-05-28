import React from 'react';

const ScanningAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center">
        <div className="absolute w-full h-0.5 bg-venice-red animate-scanMove">
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-transparent via-venice-light to-transparent animate-scanPulse"></div>
        </div>
      </div>
      
      <div className="absolute inset-0 border border-venice-red/30 grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="border border-venice-red/20"></div>
        ))}
      </div>
      
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-venice-red"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-venice-red"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-venice-red"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-venice-red"></div>
      
      <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded-md z-10">
        Analyzing Image
      </div>
    </div>
  );
};

export default ScanningAnimation;