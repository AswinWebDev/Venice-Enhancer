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

  const buttonStripHeightClass = 'h-12'; // Approx 3rem
  const contentAreaTargetHeightClass = 'h-[12rem]'; // 12rem for content when open

  const closedPanelMaxHeight = 'max-h-12'; // Should match buttonStripHeightClass
  const openPanelMaxHeight = 'max-h-[15rem]'; // buttonStripHeight (3rem) + contentAreaHeight (12rem)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-end pointer-events-none">
      {/* Main Animated Container - Controls overall height and positioning */}
      <div
        className={`pointer-events-auto transition-all duration-300 ease-in-out w-full 
                    overflow-visible /* Allow children to overflow for different widths/shadows */ 
                    ${activeBottomPanelView !== 'closed' ? openPanelMaxHeight : closedPanelMaxHeight}`}
      >
        {/* Wrapper for Centered Button Strip */}
        <div className="w-full flex justify-center">
          {/* Actual Button Strip - Narrower, Rounded Top, Glassmorphic */}
          <div
            className={`flex justify-center ${buttonStripHeightClass} w-full max-w-md /* Narrower width */
                        bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl shadow-2xl rounded-t-[2rem] 
                        border-x border-t border-white/25 dark:border-slate-700/25 overflow-hidden relative z-10`}
          >
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

        {/* Content Area - Wider, Appears/disappears BELOW the button strip */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden w-full 
                      bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl shadow-lg /* Glassmorphic */
                      /* No top rounding, should feel like it's under the button strip */
                      /* The connection point is tricky. Button strip has bottom edge. Content area has top edge. */
                      /* We want them to look like one surface. */
                      mt-[-1px] /* Attempt to pull up to meet button strip bottom */
                      ${activeBottomPanelView !== 'closed' ? `${contentAreaTargetHeightClass} opacity-100 p-2 border-x border-b border-white/25 dark:border-slate-700/25` : 'max-h-0 opacity-0 p-0'}`}
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
      </div>
    </div>
  );
};

export default ThumbnailBar;
