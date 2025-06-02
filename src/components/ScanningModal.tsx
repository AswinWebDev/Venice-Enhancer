import React from 'react';
import { X } from 'lucide-react';
import ScanningAnimation from './ScanningAnimation';

interface ScanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageName: string;
  imageUrl: string | null; // Allow null if no image is specifically being scanned
}

const ScanningModal: React.FC<ScanningModalProps> = ({ isOpen, onClose, imageName, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-modalFade">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Analyzing Image
        </h3>
        
        <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
          {imageUrl ? <ScanningAnimation imageUrl={imageUrl} progress={0.5} /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><p className='text-gray-500'>Preparing image...</p></div>}
        </div>
        
        <p className="mt-4 text-sm text-gray-600">
          Analyzing {imageName} for optimal enhancement...
        </p>
      </div>
    </div>
  );
};

export default ScanningModal;