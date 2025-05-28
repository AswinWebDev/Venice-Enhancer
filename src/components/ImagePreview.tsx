import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScanningAnimation from './ScanningAnimation';

const ImagePreview: React.FC = () => {
  const { images, removeImage, selectImage, selectedImageId } = useApp();

  if (images.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Uploaded Images ({images.length})
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => {
          const isSelected = image.id === selectedImageId;
          
          return (
            <div 
              key={image.id}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-venice-red shadow-md' 
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'}
              `}
              onClick={() => selectImage(image.id)}
            >
              <img 
                src={image.enhanced || image.preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              
              {image.status === 'scanning' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <ScanningAnimation />
                </div>
              )}
              
              {image.status === 'processing' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-venice-red border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {image.status === 'complete' && (
                <div className="absolute top-2 right-2 bg-venice-red text-white rounded-full p-1">
                  <Check size={16} />
                </div>
              )}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="p-1.5 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
                  aria-label="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {isSelected && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-venice-red"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImagePreview;