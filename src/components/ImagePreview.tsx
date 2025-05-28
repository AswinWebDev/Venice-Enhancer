import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ImageFile } from '../types';
import { Trash2, Eye, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import ScanningAnimation from './ScanningAnimation';

// Props for the individual image card in the grid
interface ImageCardProps {
  image: ImageFile;
  isSelectedInGrid: boolean; 
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onEnhanceSingleInGrid: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  isSelectedInGrid, 
  onSelect, 
  onRemove, 
  onEnhanceSingleInGrid 
}) => {
  const { openComparisonModal } = useApp();
  const canEnhance = image.status === 'idle' || image.status === 'error' || image.status === 'complete';
  const canCompare = image.status === 'complete' && image.enhanced;

  return (
    <div 
      className={`relative group border-2 rounded-lg overflow-hidden shadow-lg transition-all duration-300 cursor-pointer 
        ${isSelectedInGrid ? 'border-venice-red-dark ring-2 ring-venice-red-dark' : 'border-transparent hover:border-venice-red-light'}`}
      onClick={() => onSelect(image.id)}
      title={image.name}
    >
      <img 
        src={image.preview} 
        alt={image.name || 'Uploaded image'} 
        className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Overlay for status and actions */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex space-x-2 mb-1">
          {canEnhance && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEnhanceSingleInGrid(image.id); }}
              className="p-1.5 bg-black/60 hover:bg-venice-green-dark/80 rounded-full text-white transition-colors"
              aria-label="Enhance Image"
            >
              <RefreshCw size={18} />
            </button>
          )}
          {canCompare && image.enhanced && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                openComparisonModal(image.preview, image.enhanced!, image.operationType!); 
              }}
              className="p-1.5 bg-black/60 hover:bg-venice-blue-dark/80 rounded-full text-white transition-colors"
              aria-label="View & Compare"
            >
              <Eye size={18} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
            className="p-1.5 bg-black/60 hover:bg-venice-red-dark/80 rounded-full text-white transition-colors"
            aria-label="Remove Image"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <p className="text-white text-xs truncate max-w-full px-1 mt-1">{image.name}</p>
        {/* Status icons visible on hover */}
        <div className='mt-1'>
            {image.status === 'processing' && <RefreshCw size={18} className="animate-spin text-venice-blue-light" />}
            {image.status === 'scanning' && <RefreshCw size={18} className="animate-spin text-venice-yellow-dark" />}
            {image.status === 'complete' && <CheckCircle size={18} className="text-venice-green-dark" />}
            {image.status === 'error' && <AlertTriangle size={18} className="text-venice-red-dark" />}
        </div>
      </div>
      {/* Static status display when not hovering (for selected or specific states) */}
      {!navigator.maxTouchPoints && (
        <div className="absolute bottom-1 right-1 p-1 bg-black/40 rounded-full">
          {image.status === 'processing' && <RefreshCw size={14} className="animate-spin text-venice-blue-light" />}
          {image.status === 'scanning' && <RefreshCw size={14} className="animate-spin text-venice-yellow-dark" />}
          {image.status === 'complete' && <CheckCircle size={14} className="text-venice-green-dark" />}
          {image.status === 'error' && <AlertTriangle size={14} className="text-venice-red-dark" />}
        </div>
      )}
    </div>
  );
};

const ImagePreview: React.FC = () => {
  const {
    images,
    selectedImageId,
    selectImage,
    removeImage,
    enhanceImages, 
    openComparisonModal,
  } = useApp();

  const [scanAnimationProgress, setScanAnimationProgress] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const [isScanningDown, setIsScanningDown] = useState(true);

  const imageToDisplay = images.find(img => img.id === selectedImageId);

  useEffect(() => {
    const shouldAnimate = imageToDisplay?.status === 'scanning';

    if (shouldAnimate) {
      let startTime: number | null = null;
      const duration = 2000; // Scan duration for one sweep (e.g., 2 seconds)

      const animateScan = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp;
        }
        const elapsedTimeSinceLastDirectionChange = timestamp - startTime;
        let currentSweepProgress = elapsedTimeSinceLastDirectionChange / duration;

        if (currentSweepProgress >= 1) {
          currentSweepProgress = 0; 
          startTime = timestamp;    
          setIsScanningDown(prevDirection => !prevDirection); 
        }
        
        if (isScanningDown) {
          setScanAnimationProgress(currentSweepProgress);
        } else { 
          setScanAnimationProgress(1 - currentSweepProgress);
        }

        animationFrameId.current = requestAnimationFrame(animateScan);
      };

      setIsScanningDown(true);
      setScanAnimationProgress(0);
      animationFrameId.current = requestAnimationFrame(animateScan);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      setScanAnimationProgress(0); 
      setIsScanningDown(true); 
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [imageToDisplay?.status, isScanningDown]);

  const handleEnhanceSingleImageInGrid = async (id: string) => {
    if (selectedImageId !== id) {
      selectImage(id);
      setTimeout(() => enhanceImages(), 0); 
    } else {
      enhanceImages(); 
    }
  };

  return (
    <div className="w-full bg-venice-cream-dark rounded-lg shadow-lg">
      {/* Main Image Display Area */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-xl relative aspect-video sm:aspect-[4/3] md:aspect-video lg:aspect-[16/9]">
        {imageToDisplay ? (
          <>
            {imageToDisplay.status === 'scanning' ? (
              <div className="absolute inset-0 w-full h-full">
                <ScanningAnimation imageUrl={imageToDisplay.preview} progress={scanAnimationProgress} />
              </div>
            ) : (
              <img 
                src={imageToDisplay.enhanced || imageToDisplay.preview} 
                alt={imageToDisplay.name || 'Selected image'} 
                className="absolute inset-0 w-full h-full object-contain rounded-md"
              />
            )}
            {/* Actions for the main displayed image */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2 z-10">
              {imageToDisplay.status === 'complete' && imageToDisplay.enhanced && (
                <button 
                  onClick={() => openComparisonModal(imageToDisplay.preview, imageToDisplay.enhanced!, imageToDisplay.operationType!)}
                  className="p-2 rounded-full transition-colors shadow-md"
                  aria-label="View & Compare Selected Image"
                  title="View & Compare"
                  style={{
                    backgroundColor: '#5a4d14',
                    color: '#ffffff'
                  }}
                >
                  <Eye size={20} />
                </button>
              )}
              <button 
                onClick={() => removeImage(imageToDisplay!.id)} 
                className="p-2 rounded-full transition-colors shadow-md"
                aria-label="Remove Selected Image"
                title="Remove Image"
                style={{
                  backgroundColor: '#ff0000',
                  color: '#ffffff'
                }}
              >
                <Trash2 size={20} />
              </button>
            </div>
            {/* Status indicator for main displayed image */}
            <div className="absolute bottom-2 left-2 z-10">
              {imageToDisplay.status === 'processing' && 
                <div 
                  className='flex items-center text-xs px-2 py-1 rounded-full'
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff' }}
                >
                  <RefreshCw size={14} className="animate-spin mr-1.5" /> Processing...
                </div>}
              {imageToDisplay.status === 'scanning' && 
                <div 
                  className='flex items-center text-xs px-2 py-1 rounded-full'
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff' }}
                >
                  <RefreshCw size={14} className="animate-spin mr-1.5" /> Analyzing...
                </div>}
              {imageToDisplay.status === 'complete' && 
                <div 
                  className='flex items-center text-xs px-2 py-1 rounded-full'
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fdfcf8' /* Lime Green */ }}
                >
                  <CheckCircle size={14} className="mr-1.5" /> {imageToDisplay.operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'}
                </div>}
              {imageToDisplay.status === 'error' && 
                <div 
                  className='flex items-center text-xs px-2 py-1 rounded-full' 
                  title={imageToDisplay.error}
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ff4d4d' /* venice-light */ }}
                >
                  <AlertTriangle size={14} className="mr-1.5" /> Error
                </div>}
            </div>
            {imageToDisplay.error && imageToDisplay.status === 'error' && (
              <p className="absolute bottom-8 left-2 text-xs text-red-400 bg-gray-900/70 p-1 rounded max-w-[calc(100%-1rem)] truncate z-10">
                {imageToDisplay.error}
              </p>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-lg font-bold text-gray-400 dark:text-gray-600">No image selected</div>
          </div>
        )}
      </div>

      {/* Thumbnail Grid Area - only show if more than one image exists */}
      {images.length > 1 && (
        <div className="mb-2">
          <h3 className="text-lg font-semibold mb-3 text-venice-olive-brown dark:text-venice-cream-dark">Uploaded Images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {images.map(img => (
              <ImageCard 
                key={img.id} 
                image={img} 
                isSelectedInGrid={img.id === selectedImageId} 
                onSelect={selectImage} 
                onRemove={removeImage} 
                onEnhanceSingleInGrid={handleEnhanceSingleImageInGrid}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;