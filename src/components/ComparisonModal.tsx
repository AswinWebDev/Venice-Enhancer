import React from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  // originalImage and enhancedImage will be sourced from context via comparisonImages
}

const veniceColors = {
  stone: '#b1a993',
  stoneDark: '#938b76',
  red: '#ea463b',
  redDark: '#c4352d',
  blue: '#5c5330', // Using venice-dark-olive as a blue variant for now
  blueDark: '#423b20',
  white: '#ffffff',
  // Add other Venice palette colors as needed
};

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
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-venice-cream dark:bg-venice-charcoal-dark p-4 py-6 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-xl w-full max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto relative border border-venice-gray-light dark:border-venice-charcoal-medium transition-all duration-300 ease-out">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-venice-gray-dark dark:text-venice-gray-light hover:text-venice-red-dark dark:hover:text-venice-red-light p-2 bg-transparent hover:bg-venice-red/10 dark:hover:bg-venice-red-dark/20 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-venice-red-light focus:ring-opacity-50 z-10"
          aria-label="Close modal"
        >
          <X size={28} />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-venice-charcoal dark:text-venice-cream-dark">Compare Images</h2>
        
        {/* Diagonal Split Image Viewer */}
        <div className="w-full max-w-md mx-auto aspect-square relative overflow-hidden rounded-md shadow-lg mb-3 sm:mb-5" style={{ backgroundColor: '#e0e0e0' /* Fallback background */}}>
          {/* Base Image (Enhanced/Upscaled) */}
          <img 
            src={enhancedImage} 
            alt={operationType === 'upscaled' ? 'Upscaled Version' : 'Enhanced Version'} 
            className="absolute inset-0 w-full h-full object-contain"
          />
          {/* Overlay Image (Original - Clipped) */}
          <img 
            src={originalImage} 
            alt="Original Version (Clipped)" 
            className="absolute inset-0 w-full h-full object-contain"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          {/* Labels */}
          <div 
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs sm:text-sm font-semibold"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
          >
            Original
          </div>
          <div 
            className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs sm:text-sm font-semibold"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: veniceColors.white }}
          >
            {operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'}
          </div>
        </div>

        {/* Action Buttons & Share Info */}
        <div className="flex flex-col items-center w-full mt-4">
          <div className="flex flex-row justify-center space-x-3 w-full">
            <button 
              onClick={() => handleDownload(originalImage, 'original_image.png')}
              style={{
                backgroundColor: veniceColors.stone,
                color: veniceColors.white,
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem', 
                fontSize: '0.9375rem', 
                fontWeight: 500, 
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = veniceColors.stoneDark)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = veniceColors.stone)}
              className="transition-colors duration-150 flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Download Original
            </button>
            <button 
              onClick={() => handleDownload(enhancedImage, `${operationType}_image.png`)}
              style={{
                backgroundColor: veniceColors.red,
                color: veniceColors.white,
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                fontSize: '0.9375rem',
                fontWeight: 500,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = veniceColors.redDark)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = veniceColors.red)}
              className="transition-colors duration-150 flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Download {operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'}
            </button>
            <button 
              onClick={handleShare}
              style={{
                backgroundColor: veniceColors.blue,
                color: veniceColors.white,
                opacity: !navigator.share ? 0.6 : 1,
                cursor: !navigator.share ? 'not-allowed' : 'pointer',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                fontSize: '0.9375rem',
                fontWeight: 500,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => { if (navigator.share) e.currentTarget.style.backgroundColor = veniceColors.blueDark; }}
              onMouseLeave={(e) => { if (navigator.share) e.currentTarget.style.backgroundColor = veniceColors.blue; }}
              disabled={!navigator.share}
              className="transition-colors duration-150 flex items-center justify-center"
            >
              <Share2 size={16} className="mr-2" />
              Share {operationType === 'upscaled' ? 'Upscaled' : 'Enhanced'}
            </button>
          </div>
          { !navigator.share && 
            <p 
              className='text-xs mt-3 text-center'
              style={{ color: '#757575' /* venice-gray. Consider dark mode styling if needed */ }}
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