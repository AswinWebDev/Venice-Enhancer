import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ThumbnailItem from './ThumbnailItem';
import { Images } from 'lucide-react';

const ThumbnailBar: React.FC = () => {
  const { images, selectedImageId, selectImage } = useApp();
  const [isBarOpen, setIsBarOpen] = useState(false); // Start collapsed

  if (images.length === 0) {
    return null; 
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 shadow-top-strong z-40 transition-all duration-300 ease-in-out ${isBarOpen ? 'h-auto pb-2' : 'h-10 cursor-pointer'}`}
      onMouseEnter={() => !isBarOpen && setIsBarOpen(true)} // Open if collapsed
      onMouseLeave={() => isBarOpen && setIsBarOpen(false)}   // Close if open
    >
      <div className={`max-w-screen-xl mx-auto px-2 sm:px-4 h-full flex ${isBarOpen ? 'flex-col' : 'items-center justify-center'}`}>
        {!isBarOpen && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 animate-pulse">
            <Images size={20} className="mr-2" />
            <span className="text-sm font-medium">Show Uploaded Images</span>
          </div>
        )}
        <div 
          className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${isBarOpen ? 'max-h-40 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0'}`}
        >
          <div className="flex overflow-x-auto space-x-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 py-2">
            {images.map(image => (
              <ThumbnailItem 
                key={image.id}
                image={image}
                isSelected={image.id === selectedImageId}
                onClick={(id) => {
                  selectImage(id);
                  // Clicking an item should not interfere with hover open/close logic
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailBar;
