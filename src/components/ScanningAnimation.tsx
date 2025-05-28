import React from 'react';

interface ScanningAnimationProps {
  imageUrl: string;
  progress: number; // 0 to 1, representing the scan line's position
}

const ScanningAnimation: React.FC<ScanningAnimationProps> = ({ imageUrl, progress }) => {
  const scanPosition = progress * 100; // Convert progress to percentage

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Grayscale image (bottom layer) */}
      <img
        src={imageUrl}
        alt="Scanning background"
        className="absolute inset-0 w-full h-full object-contain filter grayscale-[100%]"
      />
      
      {/* Color image (top layer, clipped) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: `inset(0 0 ${100 - scanPosition}% 0)`,
        }}
      >
        <img
          src={imageUrl}
          alt="Scanning foreground"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {/* Scan line */}
      {progress > 0 && progress < 1 && (
        <div
          className="absolute w-full h-0.5 bg-venice-red-dark opacity-75 shadow-lg"
          style={{
            top: `${scanPosition}%`,
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </div>
  );
};

export default ScanningAnimation;