import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Eye, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import ScanningAnimation from './ScanningAnimation';


const ImagePreview: React.FC = () => {
  const {
    images,
    selectedImageId,
    removeImage,
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


  return (
    <div className="w-full bg-venice-cream-dark rounded-lg shadow-lg">
      {/* Main Image Display Area */}
      <div className="mb-6 bg-white p-1 rounded-lg shadow-xl relative aspect-video sm:aspect-[4/3] md:aspect-video lg:aspect-[16/9]">
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
            <div className="text-lg font-bold text-gray-400">No image selected</div>
          </div>
        )}
      </div>

      {/* The redundant thumbnail grid has been removed. Image selection is now handled by ThumbnailBar. */}
    </div>
  );
};

export default ImagePreview;