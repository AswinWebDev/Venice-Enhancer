import React from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string;
  enhancedImage: string;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ 
  isOpen, 
  onClose, 
  originalImage, 
  enhancedImage 
}) => {
  if (!isOpen) return null;

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
          title: 'Enhanced Image',
          text: 'Check out this image I enhanced!',
          files: await urlToFiles(absoluteEnhancedImageUrl, 'enhanced-image.png', 'image/png')
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-venice-cream p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-venice-olive-brown/20 transform transition-all duration-300 ease-in-out scale-95 group-hover:scale-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-venice-olive-brown hover:text-venice-red p-1 rounded-full hover:bg-venice-red/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={28} />
        </button>

        <h2 className="text-3xl font-bold mb-8 text-center text-venice-charcoal">Compare Images</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Original Image Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-3 text-venice-olive-brown">Original</h3>
            <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-4">
              <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
            </div>
            <button 
              onClick={() => handleDownload(originalImage, 'original_image.png')}
              className="mt-2 bg-venice-stone text-white py-2.5 px-5 rounded-lg hover:bg-venice-dark-olive transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <Download size={18} className="mr-2" />
              Download Original
            </button>
          </div>

          {/* Enhanced Image Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-3 text-venice-olive-brown">Enhanced</h3>
            <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mb-4">
              <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-contain" />
            </div>
            <button 
              onClick={() => handleDownload(enhancedImage, 'enhanced_image.png')}
              className="mt-2 bg-venice-red-dark text-white py-2.5 px-5 rounded-lg hover:bg-venice-red transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <Download size={18} className="mr-2" />
              Download Enhanced
            </button>
          </div>
        </div>

        {/* Share Button Section */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-venice-olive-brown/20 text-center">
          <button 
            onClick={handleShare}
            className="bg-venice-blue-dark text-white py-2.5 px-6 rounded-lg hover:bg-venice-blue transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!navigator.share} 
          >
            <Share2 size={18} className="mr-2" />
            Share Enhanced Image
          </button>
          { !navigator.share && <p className='text-xs text-venice-gray-medium mt-2'>Sharing not available in this browser.</p>}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
