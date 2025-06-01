import React from 'react';
import { useApp } from '../context/AppContext';
import ThumbnailItem from './ThumbnailItem';
import CompactHistoryView from './CompactHistoryView';
import { Images, ChevronUp, ChevronDown } from 'lucide-react';

const ThumbnailBar: React.FC = () => {
  const { images, selectedImageId, selectImage, activeBottomPanelView, setActiveBottomPanelView } = useApp();
  const selectedImage = images.find(img => img.id === selectedImageId);


  if (images.length === 0) {
    return null; 
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 shadow-top-strong z-40 flex flex-col">
      {/* Thumbnails Container - content visibility toggled */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${activeBottomPanelView !== 'closed' ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 pt-2 pb-1">
                    {activeBottomPanelView === 'thumbnails' && (
            <div className="flex overflow-x-auto space-x-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 py-2">
              {images.map(image => (
                <ThumbnailItem 
                  key={image.id}
                  image={image}
                  isSelected={image.id === selectedImageId}
                  onClick={(id) => {
                    selectImage(id);
                  }}
                />
              ))}
            </div>
          )}
          {activeBottomPanelView === 'history' && (
            <CompactHistoryView selectedImage={selectedImage} />
          )}
        </div>
      </div>

      {/* Control Strip - always visible. TODO: Consider if this should also be part of the collapsible area or always visible */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600">
                <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-2 sm:px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveBottomPanelView('thumbnails')}
                className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-venice-red-500 ${activeBottomPanelView === 'thumbnails' ? 'bg-venice-red-100 dark:bg-venice-red-700 text-venice-red-700 dark:text-venice-red-100' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                aria-label="Show thumbnails"
                title="Show thumbnails"
              >
                <Images size={16} className="mr-1.5 opacity-80" />
                Thumbnails
              </button>
              <button
                onClick={() => setActiveBottomPanelView('history')}
                disabled={!selectedImageId} // Disable if no image is selected
                className={`flex items-center text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-venice-red-500 ${activeBottomPanelView === 'history' ? 'bg-venice-red-100 dark:bg-venice-red-700 text-venice-red-700 dark:text-venice-red-100' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} ${!selectedImageId ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Show history"
                title="Show history"
              >
                <ChevronUp size={16} className="mr-1.5 opacity-80" /> {/* Placeholder Icon, replace with History icon later */}
                History
              </button>
            </div>
            <button 
              onClick={() => setActiveBottomPanelView(activeBottomPanelView !== 'closed' ? 'closed' : 'thumbnails')} // Toggle open/close, defaults to thumbnails if opening from closed state
              className="flex items-center text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors"
              aria-label={activeBottomPanelView !== 'closed' ? 'Close panel' : 'Open panel'}
              title={activeBottomPanelView !== 'closed' ? 'Close panel' : 'Open panel'}
            >
              {activeBottomPanelView !== 'closed' ? <ChevronDown size={18} className="mr-1.5" /> : <ChevronUp size={18} className="mr-1.5" />}
              <span>{activeBottomPanelView !== 'closed' ? 'Close' : 'Open'} Panel</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailBar;
