import React from 'react';
import { useApp } from '../context/AppContext';
import ThumbnailItem from './ThumbnailItem';
import CompactHistoryView from './CompactHistoryView';
import { Images, History } from 'lucide-react';

const ThumbnailBar: React.FC = () => {
  const { images, selectedImageId, selectImage, activeBottomPanelView, setActiveBottomPanelView } = useApp();
  const selectedImage = images.find(img => img.id === selectedImageId);

  if (images.length === 0) {
    return null;
  }

  // Define heights for clarity
  const buttonStripHeightClass = 'h-12'; // Approx 3rem (buttons have py-3)
  const contentAreaHeightClass = 'h-[12rem]'; // 12rem for content
  
  // Max heights for the main animated container
  const closedPanelMaxHeight = 'max-h-12'; // Should match buttonStripHeightClass
  const openPanelMaxHeight = 'max-h-[15rem]'; // buttonStripHeight (3rem) + contentAreaHeight (12rem)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-end pointer-events-none">
      {/* Main Animated Container - This entire block changes height */}
      <div
        className={`pointer-events-auto transition-all duration-300 ease-in-out w-full max-w-screen-lg 
                    bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl shadow-2xl rounded-t-2xl border-x border-t border-white/30 dark:border-slate-700/30
                    overflow-hidden 
                    ${activeBottomPanelView !== 'closed' ? openPanelMaxHeight : closedPanelMaxHeight}`}
      >
        {/* Content Area - Appears/disappears within the main container */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden 
                      ${activeBottomPanelView !== 'closed' ? `${contentAreaHeightClass} opacity-100 p-2` : 'max-h-0 opacity-0 p-0'}`}
        >
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-500/50 scrollbar-track-transparent">
            {activeBottomPanelView === 'thumbnails' && (
              <div className="flex overflow-x-auto space-x-2 py-1">
                {images.map(image => (
                  <ThumbnailItem
                    key={image.id}
                    image={image}
                    isSelected={image.id === selectedImageId}
                    isPromptGenerated={!!image.settings.prompt && image.status !== 'scanning'}
                    onClick={(id) => {
                      selectImage(id);
                    }}
                  />
                ))}
              </div>
            )}
            {activeBottomPanelView === 'history' && selectedImage && (
              <CompactHistoryView selectedImage={selectedImage} />
            )}
          </div>
        </div>

        {/* Button Strip - Always at the bottom of the main animated container */}
        <div className={`flex justify-center ${buttonStripHeightClass} border-t border-white/20 dark:border-slate-700/20`}>
          <button
            onClick={() => setActiveBottomPanelView(activeBottomPanelView === 'thumbnails' ? 'closed' : 'thumbnails')}
            className={`flex-1 flex items-center justify-center text-sm px-6 transition-colors focus:outline-none h-full hover:bg-white/10 dark:hover:bg-slate-700/10 ${activeBottomPanelView === 'thumbnails' ? 'bg-venice-red/70 text-white' : 'text-gray-700 dark:text-gray-200'}`}
            aria-label="Show thumbnails"
            title="Show thumbnails"
          >
            <Images size={16} className="mr-2" />
            Thumbnails
          </button>
          <div className="w-px bg-white/30 dark:bg-slate-700/30"></div> {/* Vertical separator */}
          <button
            onClick={() => setActiveBottomPanelView(activeBottomPanelView === 'history' ? 'closed' : 'history')}
            disabled={!selectedImageId}
            className={`flex-1 flex items-center justify-center text-sm px-6 transition-colors focus:outline-none h-full hover:bg-white/10 dark:hover:bg-slate-700/10 ${activeBottomPanelView === 'history' ? 'bg-venice-red/70 text-white' : 'text-gray-700 dark:text-gray-200'} ${!selectedImageId ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Show history"
            title="Show history"
          >
            <History size={16} className="mr-2" />
            History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailBar;
