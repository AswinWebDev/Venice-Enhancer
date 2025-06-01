import React from 'react';
import { ImageFile } from '../types';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface ThumbnailItemProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({ image, isSelected, onClick }) => {
  const baseRingClass = 'ring-2 transition-all duration-150 ease-in-out';
  const selectedRingClass = isSelected ? 'ring-venice-red ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800' : 'ring-transparent hover:ring-venice-red/50';

  return (
    <div
      className={`relative aspect-square w-24 h-24 m-1 cursor-pointer rounded-md overflow-hidden group ${baseRingClass} ${selectedRingClass}`}
      onClick={() => onClick(image.id)}
      title={image.name}
    >
      <img 
        src={image.preview} 
        alt={image.name} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Status Indicator */}
      <div className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full">
        {image.status === 'scanning' && <Loader2 size={16} className="text-white animate-spin" />}
        {image.status === 'processing' && <Loader2 size={16} className="text-white animate-spin" />}
        {image.status === 'error' && <AlertTriangle size={16} className="text-red-400" />}
        {image.status === 'complete' && <CheckCircle size={16} className="text-green-400" />}
      </div>

      {/* Overlay for name on hover - optional */}
      {/* <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {image.name}
      </div> */}
    </div>
  );
};

export default ThumbnailItem;
