import React from 'react';
import { useApp } from '../context/AppContext';
import { ImageFile } from '../types';
import ThumbnailItem from './ThumbnailItem';
import CompactHistoryView from './CompactHistoryView';
import { Images, History, Plus, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

const ThumbnailBar: React.FC = () => {
  const { images, selectedImageId, selectImage, activeBottomPanelView, setActiveBottomPanelView, addImages, hasUnseenThumbnails } = useApp();
  const selectedImage = images.find((img: ImageFile) => img.id === selectedImageId);
  const panelRef = useRef<HTMLDivElement>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file: File) =>
      file.type.startsWith('image/')
    );
    if (imageFiles.length > 0) {
      addImages(imageFiles);
    }
  }, [addImages]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    noClick: true,
    noKeyboard: true,
  });

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
  }, [activeBottomPanelView, panelRef, setActiveBottomPanelView]);

  if (images.length === 0) {
    return null;
  }

  const buttonStripHeightClass = 'h-12';
  const contentOpenMaxHeightClass = 'max-h-40';
  const closedPanelMaxHeight = 'max-h-12';
  const openPanelMaxHeight = 'max-h-52';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-end pointer-events-none">
      {/* Hidden file input for the \"Add More\" button */}
      <div {...getRootProps()} style={{ display: 'none' }}>
        <input {...getInputProps()} />
      </div>

      {/* Main Animated Container - Controls overall height and positioning. Ref for click outside. */}
      <div
        ref={panelRef}
        className={`pointer-events-auto transition-[max-height] duration-500 ease-out w-full 
                    overflow-visible 
                    ${activeBottomPanelView !== 'closed' ? openPanelMaxHeight : closedPanelMaxHeight}`}
      >
        {/* Wrapper for Centered Button Strip */}
        <div className="w-full flex justify-center">
          {/* Actual Button Strip */}
          <div
            className={`flex justify-center ${buttonStripHeightClass} w-full max-w-lg
                        backdrop-blur-2xl shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.20)] rounded-t-[2rem] 
                        overflow-hidden relative z-10`} style={{ backgroundColor: 'rgba(243, 240, 221, 0.4)' }}
          >
            <button
              onClick={open}
              className={`flex-1 flex items-center justify-center text-sm px-4 md:px-6 transition-colors focus:outline-none h-full text-slate-600 hover:bg-black/5`}
              aria-label="Add more images"
              title="Add more images"
            >
              <Plus size={18} className="mr-1 md:mr-2" />
              Add
            </button>
            <div className="w-px bg-black/10"></div>
            <button
              onClick={() => setActiveBottomPanelView(activeBottomPanelView === 'thumbnails' ? 'closed' : 'thumbnails')}
              className={`group flex-1 flex items-center justify-center text-sm px-4 md:px-6 transition-colors focus:outline-none h-full ${activeBottomPanelView === 'thumbnails' ? 'bg-venice-red/70 text-white' : 'text-slate-600 hover:bg-black/5'} ${(hasUnseenThumbnails && activeBottomPanelView !== 'thumbnails') ? 'animate-blinkBg' : ''}`}
              aria-label="Show thumbnails"
              title="Show thumbnails"
              disabled={images.length === 0}
            >
              <Images size={16} className="mr-1 md:mr-2" /> 
              Thumbnails
              {activeBottomPanelView === 'thumbnails' && <ChevronDown size={18} className="ml-1 animate-pulse" />}
            </button>
            <div className="w-px bg-black/10"></div>
            <button
              onClick={() => setActiveBottomPanelView(activeBottomPanelView === 'history' ? 'closed' : 'history')}
              disabled={!selectedImageId || images.length === 0}
              className={`group flex-1 flex items-center justify-center text-sm px-4 md:px-6 transition-colors focus:outline-none h-full ${activeBottomPanelView === 'history' ? 'bg-venice-red/70 text-white' : 'text-slate-600 hover:bg-black/5'} ${(!selectedImageId || images.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Show history"
              title="Show history"
            >
              <History size={16} className="mr-1 md:mr-2" /> 
              History
              {activeBottomPanelView === 'history' && <ChevronDown size={18} className="ml-1 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* Content Area - Conditionally rendered and animated */}
        {images.length > 0 && (
          <div // Outermost container for the content area (thumbnails/history)
            className={`transition-[max-height] duration-500 ease-out overflow-hidden w-full shadow-[0_10px_15px_-3px_rgba(0,0,0,0.9),_0_4px_6px_-4px_rgba(0,0,0,0.9)]
                        ${activeBottomPanelView !== 'closed' ? contentOpenMaxHeightClass : 'max-h-0'}`}
          >
            <div // Middle container for opacity/visibility transition and background
              className={`transition-[opacity,visibility] duration-500 ease-out w-full h-full 
                          backdrop-blur-2xl 
                          ${activeBottomPanelView !== 'closed' ? 'opacity-100 visible' : 'opacity-0 delay-500 invisible'}`} style={{ backgroundColor: 'rgba(243, 240, 221, 0.4)' }}
            >
              <div // Innermost container for padding and scrolling content
                className={`h-36 ${activeBottomPanelView !== 'closed' ? 'p-2 py-3' : 'p-0'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 dark:scrollbar-thumb-gray-500/50 scrollbar-track-transparent`}
              >
                {activeBottomPanelView === 'thumbnails' && (
                  <div className="flex flex-nowrap overflow-x-auto space-x-2 py-1 px-2">
                    {images.map(image => (
                      <ThumbnailItem
                        key={image.id}
                        image={image}
                        isSelected={image.id === selectedImageId}
                        isPromptGenerated={!!image.settings.prompt && image.status !== 'scanning'}
                        onClick={(id) => selectImage(id)}
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
        )}
      </div>
    </div>
  );
};

export default ThumbnailBar;
