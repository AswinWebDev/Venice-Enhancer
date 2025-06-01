import React from 'react';
import CompactHistoryItem from './CompactHistoryItem';
import { ImageFile } from '../types';

// interface CompactHistoryViewProps {
//   selectedImageId: string | null; // Keep this if passing ID and finding image here
// }

// Alternative: Pass the selected image object directly if available where CompactHistoryView is used
interface CompactHistoryViewProps {
  selectedImage: ImageFile | undefined; 
}

const CompactHistoryView: React.FC<CompactHistoryViewProps> = ({ selectedImage }) => {
  if (!selectedImage) {
    return (
      <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        No image selected to display history.
      </div>
    );
  }

  if (!selectedImage.history || selectedImage.history.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        No enhancement history for {selectedImage.name}.
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto space-x-3 p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
      {selectedImage.history.map(historyItem => (
        <CompactHistoryItem 
          key={historyItem.id} 
          historyItem={historyItem} 
          originalImagePreviewUrl={selectedImage.preview} // The base preview of the selected image
        />
      ))}
    </div>
  );
};

export default CompactHistoryView;
