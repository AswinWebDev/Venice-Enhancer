import React from 'react';
import { Trash2, Check, AlertTriangle, Eye } from 'lucide-react'; // Added Eye for View & Compare
import { useApp } from '../context/AppContext';
import ScanningAnimation from './ScanningAnimation';

const ImagePreview: React.FC = () => {
  const { 
    images, 
    removeImage, 
    selectImage, 
    selectedImageId,
    // openComparisonModal // Assuming this will be added back to context later for ComparisonModal
  } = useApp();

  if (images.length === 0) return null;

  // Determine if the selected image (if any) has an enhanced version for comparison
  const selectedImg = images.find(img => img.id === selectedImageId);
  const canCompareSelected = selectedImg?.status === 'complete' && selectedImg?.enhanced;

  return (
    <div className="w-full">
      {/* Title changes based on single or multiple images */} 
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-venice-olive-brown">
          {images.length === 1 ? 'Your Image' : `Uploaded Images (${images.length})`}
        </h3>
        {images.length === 1 && canCompareSelected && (
          <button 
            // onClick={() => openComparisonModal(selectedImg.preview, selectedImg.enhanced!)} // For when ComparisonModal is re-integrated
            className="flex items-center px-3 py-1.5 text-sm bg-venice-stone hover:bg-venice-dark-olive text-white rounded-md transition-colors"
          >
            <Eye size={16} className="mr-1.5" /> View & Compare
          </button>
        )}
      </div>
      
      {/* Single Image Display */} 
      {images.length === 1 ? (
        images.map((image) => {
          const isSelected = true; // If only one image, it's always considered 'selected' for display purposes here
          
          return (
            <div 
              key={image.id}
              className={`
                relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer 
                bg-white dark:bg-venice-charcoal
                ${isSelected 
                  ? 'border-venice-bright-red shadow-xl'
                  : 'border-venice-stone hover:border-venice-dark-olive'}
              `}
              onClick={() => selectImage(image.id)} // Still allow selection for context consistency
            >
              <img 
                src={image.enhanced || image.preview} 
                alt={image.name || "Preview"} 
                className="w-full h-full object-contain"
              />
              
              {image.status === 'scanning' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <ScanningAnimation />
                  <p className='mt-2 text-sm'>Analyzing...</p>
                </div>
              )}
              
              {image.status === 'processing' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <div className="w-10 h-10 border-4 border-venice-bright-red border-t-transparent rounded-full animate-spin"></div>
                  <p className='mt-2 text-sm'>Enhancing...</p>
                </div>
              )}
              
              {image.status === 'complete' && !image.enhanced && (
                 <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5">
                    <Check size={18} />
                  </div>
              )}

              {image.status === 'complete' && image.enhanced && (
                 <div className="absolute top-2 right-2 bg-venice-coral text-white rounded-full p-1.5">
                    <Check size={18} />
                  </div>
              )}
              
              {image.status === 'error' && (
                <div className="absolute inset-0 bg-red-700/80 flex flex-col items-center justify-center p-3 text-white text-center">
                  <AlertTriangle size={28} className="mb-1.5" />
                  <p className="text-sm font-semibold">Enhancement Error</p>
                  {image.error && <p className="text-xs mt-1 leading-tight line-clamp-3">{image.error}</p>}
                </div>
              )}
              
              {/* Remove button appears on hover for the single image view */} 
              <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity group">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="p-2 bg-black/50 hover:bg-red-600/80 rounded-full text-white transition-colors"
                  aria-label="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* No need for the bottom selection bar if it's the only image and always 'selected' visually */}
            </div>
          );
        })
      ) : (
        // Multiple Images Display (Grid) - existing logic with minor style updates
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {images.map((image) => {
            const isSelected = image.id === selectedImageId;
            const canCompare = image.status === 'complete' && image.enhanced;
            
            return (
              <div 
                key={image.id}
                className={`
                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 group cursor-pointer
                  bg-venice-beige/30 dark:bg-venice-deep-olive/30
                  ${isSelected 
                    ? 'border-venice-bright-red shadow-lg'
                    : 'border-venice-stone hover:border-venice-dark-olive'}
                `}
                onClick={() => selectImage(image.id)}
              >
                <img 
                  src={image.preview} // Always show preview in grid, enhanced shown in modal/large view
                  alt={image.name || "Preview"} 
                  className="w-full h-full object-cover"
                />
                
                {image.status === 'scanning' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <ScanningAnimation />
                  </div>
                )}
                
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-venice-bright-red border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {image.status === 'complete' && image.enhanced && (
                  <div className="absolute top-1.5 right-1.5 bg-venice-coral text-white rounded-full p-1">
                    <Check size={14} />
                  </div>
                )}

                {image.status === 'complete' && !image.enhanced && (
                  <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full p-1">
                    <Check size={14} />
                  </div>
                )}
                
                {image.status === 'error' && (
                  <div className="absolute inset-0 bg-red-700/80 flex flex-col items-center justify-center p-2 text-white text-center">
                    <AlertTriangle size={20} className="mb-0.5" />
                    <p className="text-xs font-medium">Error</p>
                  </div>
                )}
                
                {/* Action buttons on hover */} 
                <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="p-1.5 bg-black/50 hover:bg-red-600/70 rounded-full text-white transition-colors"
                    aria-label="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                  {canCompare && (
                    <button 
                      // onClick={(e) => { e.stopPropagation(); openComparisonModal(image.preview, image.enhanced!); }} // For when ComparisonModal is re-integrated
                      className="p-1.5 bg-black/50 hover:bg-blue-600/70 rounded-full text-white transition-colors"
                      aria-label="View & Compare"
                    >
                      <Eye size={12} />
                    </button>
                  )}
                </div>
                
                {isSelected && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-venice-bright-red"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;