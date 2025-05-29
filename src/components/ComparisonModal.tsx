import React from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useApp } from '../context/AppContext';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  // originalImage and enhancedImage will be sourced from context via comparisonImages
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { comparisonImages } = useApp();
  if (!isOpen || !comparisonImages) return null;
  const { original: originalImage, enhanced: enhancedImage, operationType } = comparisonImages;

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Ensure the image URL is absolute or a data URL for sharing
        const absoluteEnhancedImageUrl = new URL(enhancedImage, window.location.origin).href;
        await navigator.share({
          title: `${operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'} Image`, // Dynamic title
          text: `Check out this image I ${operationType}!`, // Dynamic text
          files: await urlToFiles(absoluteEnhancedImageUrl, `${operationType}-image.png`, 'image/png') // Dynamic filename
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Provide more specific feedback if possible, or a generic message
        let alertMessage = 'Sharing failed. An error occurred.';
        if (error instanceof Error && error.name === 'AbortError') {
          alertMessage = 'Sharing was cancelled.';
        } else if (error instanceof Error) {
          alertMessage = `Sharing failed: ${error.message}`;
        }
        alert(alertMessage);
      }
    } else {
      alert('Web Share API is not supported in your browser. You can download the image and share it manually.');
    }
  };

  // Helper to convert URL to File object for navigator.share
  async function urlToFiles(url: string, filename: string, mimeType: string): Promise<File[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image for sharing: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return [new File([blob], filename, { type: mimeType })];
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300 ease-in-out">
      <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl shadow-xl w-full max-w-3xl lg:max-w-4xl max-h-[90vh] aspect-square overflow-hidden relative transition-all duration-300 ease-out">
        {/* Full-modal Interactive Image Comparison Slider */}
        <div className="absolute inset-0 w-full h-full z-0">
          <ReactCompareSlider
            itemOne={<ReactCompareSliderImage src={originalImage} alt="Original Image" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
            itemTwo={<ReactCompareSliderImage src={enhancedImage} alt={operationType === 'upscaled' ? 'Upscaled Image' : 'Enhanced Image'} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Overlaid Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white p-2 bg-black/40 hover:bg-black/60 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/70 z-20"
          aria-label="Close modal"
        >
          <X size={28} />
        </button>

        {/* Overlaid Title */}
        <h2 className="hidden sm:block absolute top-4 left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-bold text-white p-2 bg-black/40 rounded-md z-20">Compare Images</h2>
        
        {/* Overlaid Original Badge */}
        <div 
          className="absolute top-16 left-4 px-2 py-1 rounded text-xs font-semibold bg-black/50 text-white z-10"
        >
          Original
        </div>
        
        {/* Overlaid Enhanced/Upscaled Badge */}
        <div 
          className="absolute top-16 right-4 px-2 py-1 rounded text-xs font-semibold bg-black/50 text-white z-10"
        >
          {operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'}
        </div>

        {/* Overlaid Action Buttons & Share Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center w-full max-w-xs sm:max-w-md z-20">
          <div className="flex flex-row space-x-2 w-full items-center justify-center p-2 bg-black/30 rounded-md">
            <button 
              onClick={() => handleDownload(enhancedImage, `${operationType}_image.png`)}
              className="bg-venice-red hover:bg-venice-red-dark text-white p-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-150 flex items-center justify-center"
              aria-label={`Download ${operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'} Image`}
            >
              <Download size={16} />
            </button>
            <button 
              onClick={handleShare}
              disabled={!navigator.share}
              className={`bg-venice-blue hover:bg-venice-blue-dark text-white p-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-150 flex items-center justify-center ${navigator.share ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              aria-label={`Share ${operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'} Image`}
            >
              <Share2 size={16} />
            </button>
          </div>
          { !navigator.share && 
            <p 
              className='text-xs mt-2 text-center text-white/80 bg-black/30 px-2 py-1 rounded-md w-full'
            >
              Sharing not available in this browser.
            </p>
          }
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;

//