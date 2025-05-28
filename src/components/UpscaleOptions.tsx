import React from 'react';
import { ChevronDown, Wand2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScaleOption } from '../types';

const UpscaleOptions: React.FC = () => {
  const { 
    settings, 
    setScale, 
    toggleAdvanced, 
    isAdvancedOpen, 
    updateSettings,
    enhanceImages,
    images,
    selectedImageId
  } = useApp();
  
  const scaleOptions: { value: ScaleOption; label: string }[] = [
    { value: '1x', label: '1× Original' },
    { value: '2x', label: '2× Upscale' },
    { value: '4x', label: '4× Max' }
  ];
  
  const hasSelectedImage = images.length > 0 && selectedImageId;
  const selectedImage = images.find(img => img.id === selectedImageId);
  const isProcessing = selectedImage?.status === 'processing';

  return (
    <div className="mt-6">
      <div className="bg-white dark:bg-gray-850 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Enhancement Options
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upscale Factor
            </label>
            <div className="grid grid-cols-3 gap-3">
              {scaleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`
                    py-2.5 px-4 rounded-md text-sm font-medium transition-all
                    ${settings.scale === option.value 
                      ? 'bg-venice-red/10 text-venice-red border-2 border-venice-red'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-750'}
                  `}
                  onClick={() => setScale(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={toggleAdvanced}
              className="flex items-center justify-between w-full py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="font-medium">Advanced Options</span>
              <ChevronDown
                size={18}
                className={`transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
              />
            </button>
            
            <div className={`
              mt-3 transition-all duration-300 overflow-hidden
              ${isAdvancedOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Creativity
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.creativity.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.creativity}
                  onChange={(e) => updateSettings({ creativity: parseFloat(e.target.value) })}
                  className="w-full accent-venice-red"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adherence
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.adherence.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.adherence}
                  onChange={(e) => updateSettings({ adherence: parseFloat(e.target.value) })}
                  className="w-full accent-venice-red"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Flexible</span>
                  <span>Strict</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            className={`
              w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all
              ${!hasSelectedImage || isProcessing
                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-70'
                : 'bg-venice-red hover:bg-venice-dark shadow-md hover:shadow-lg'}
            `}
            onClick={enhanceImages}
            disabled={!hasSelectedImage || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Wand2 size={18} className="mr-2" />
                Enhance Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpscaleOptions;