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
        await navigator.share({
          title: 'Enhanced Image',
          text: 'Check out this image I enhanced!',
          files: await urlToFiles(enhancedImage, 'enhanced-image.png', 'image/png')
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Sharing failed. Your browser might not fully support sharing files, or an error occurred.');
      }
    } else {
      alert('Web Share API is not supported in your browser. You can download the image and share it manually.');
    }
  };

  // Helper to convert URL to File object for navigator.share
  async function urlToFiles(url: string, filename: string, mimeType: string): Promise<File[]> {
    const response = await fetch(url);
    const blob = await response.blob();
    return [new File([blob], filename, { type: mimeType })];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-venice-cream p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-venice-olive-brown hover:text-venice-red transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={28} />
        </button>

        <h2 className="text-3xl font-semibold mb-6 text-center text-venice-olive-brown">Compare Images</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-medium mb-3 text-venice-olive-brown">Original</h3>
            <img src={originalImage} alt="Original" className="rounded-md shadow-md w-full h-auto max-h-[60vh] object-contain" />
            <button 
              onClick={() => handleDownload(originalImage, 'original_image.png')}
              className="mt-4 bg-venice-red-dark text-white py-2 px-4 rounded-md hover:bg-venice-red transition-colors flex items-center justify-center w-full md:w-auto mx-auto"
            >
              <Download size={20} className="mr-2" />
              Download Original
            </button>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium mb-3 text-venice-olive-brown">Enhanced</h3>
            <img src={enhancedImage} alt="Enhanced" className="rounded-md shadow-md w-full h-auto max-h-[60vh] object-contain" />
            <button 
              onClick={() => handleDownload(enhancedImage, 'enhanced_image.png')}
              className="mt-4 bg-venice-green-dark text-white py-2 px-4 rounded-md hover:bg-venice-green transition-colors flex items-center justify-center w-full md:w-auto mx-auto"
            >
              <Download size={20} className="mr-2" />
              Download Enhanced
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={handleShare}
            className="bg-venice-blue-dark text-white py-2 px-6 rounded-md hover:bg-venice-blue transition-colors flex items-center justify-center w-full md:w-auto mx-auto"
            disabled={!navigator.share} // Disable if Web Share API not supported
          >
            <Share2 size={20} className="mr-2" />
            Share Enhanced Image
          </button>
          { !navigator.share && <p className='text-xs text-venice-gray-medium mt-2'>Sharing not supported in your browser.</p>}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
