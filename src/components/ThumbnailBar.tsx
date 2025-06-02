import React from 'react';
import { useApp } from '../context/AppContext';
import ThumbnailItem from './ThumbnailItem';
import CompactHistoryView from './CompactHistoryView';
import { Images, History } from 'lucide-react';
import { useEffect, useRef } from 'react';

const ThumbnailBar: React.FC = () => {
  const { images, selectedImageId, selectImage, activeBottomPanelView, setActiveBottomPanelView } = useApp();
  const selectedImage = images.find(img => img.id === selectedImageId);
  const panelRef = useRef<HTMLDivElement>(null);

  // useEffect must be called before any conditional returns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActiveBottomPanelView('closed');
      }
    };

    if (activeBottomPanelView !== 'closed') {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeBottomPanelView, panelRef, setActiveBottomPanelView]); // Added panelRef, removed duplicate

  // Conditional return now after all hooks
  if (images.length === 0) {
    return null;
  }

  const buttonStripHeightClass = 'h-12'; // Approx 3rem
  const contentOpenMaxHeightClass = 'max-h-40'; // 10rem, matches h-40 content

  const closedPanelMaxHeight = 'max-h-12'; // Should match buttonStripHeightClass
  const openPanelMaxHeight = 'max-h-52'; // buttonStripHeight (h-12, 3rem) + contentAreaHeight (h-40, 10rem) = 13rem

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-end pointer-events-none">
      {/* Main Animated Container - Controls overall height and positioning. Ref for click outside. */}
      <div
        ref={panelRef} // Add ref here
        className={`pointer-events-auto transition-[max-height] duration-500 ease-out w-full 
                    overflow-visible /* Allow children to overflow for different widths/shadows */ 
                    ${activeBottomPanelView !== 'closed' ? openPanelMaxHeight : closedPanelMaxHeight}`}
      >
        {/* Wrapper for Centered Button Strip */}
        <div className="w-full flex justify-center">
          {/* Actual Button Strip - Narrower, Rounded Top, Glassmorphic */}
          <div
            className={`flex justify-center ${buttonStripHeightClass} w-full max-w-md /* Narrower width */
                        dark:bg-slate-800/20 backdrop-blur-2xl shadow-2xl rounded-t-[2rem] 
                        border-x border-t border-white/25 dark:border-slate-700/25 overflow-hidden relative z-10`} style={{ backgroundColor: 'rgba(243, 240, 221, 0.4)' }}
          >
            <button
              onClick={() => setActiveBottomPanelView(activeBottomPanelView === 'thumbnails' ? 'closed' : 'thumbnails')}
              className={`flex-1 flex items-center justify-center text-sm px-6 transition-colors focus:outline-none h-full ${activeBottomPanelView === 'thumbnails' ? 'bg-venice-red/70 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/10'}`}
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
              className={`flex-1 flex items-center justify-center text-sm px-6 transition-colors focus:outline-none h-full ${activeBottomPanelView === 'history' ? 'bg-venice-red/70 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/10'} ${!selectedImageId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          className={`transition-[max-height] duration-500 ease-out overflow-hidden w-full
                      ${activeBottomPanelView !== 'closed' ? contentOpenMaxHeightClass : 'max-h-0'}`}
        >
          {/* Middle Content Div: Handles opacity, background, borders, shadow */}
          <div
            className={`transition-[opacity,visibility] duration-500 ease-out w-full h-full 
                        dark:bg-slate-800/20 backdrop-blur-2xl shadow-lg /* Glassmorphic */
                        ${activeBottomPanelView !== 'closed' ? 'opacity-100 visible border-x border-b border-t border-white/25 dark:border-slate-700/25' : 'opacity-0 delay-500 invisible border-transparent'}`} style={{ backgroundColor: 'rgba(243, 240, 221, 0.4)' }}
          >
            {/* Innermost Content Div: Handles padding and scrolling */}
            <div className={`h-40 ${activeBottomPanelView !== 'closed' ? 'p-2' : 'p-0'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-500/50 scrollbar-track-transparent`}> 
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
            </div> {/* Closing tag for Innermost Content Div */}
          </div>   {/* Closing tag for Middle Content Div */}
        </div>     {/* Closing tag for Outermost Content Div */}
      </div>
    </div>
  );
};

export default ThumbnailBar;
