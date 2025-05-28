import React from 'react';
import { ChevronDown, Wand2, Info, X, Loader2 } from 'lucide-react';
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
    selectedImageId,
    isGeneratingPrompt,
    promptGenerationError
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
    <div className="w-full">
      <div className="bg-venice-white dark:bg-gray-850 rounded-lg p-6 shadow-lg border border-venice-beige dark:border-gray-700">
        <h3 className="text-xl font-semibold text-venice-olive-brown mb-6">
          Enhancement Settings
        </h3>
        
        <div className={`space-y-6 ${isGeneratingPrompt ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-venice-dark-olive dark:text-venice-stone mb-2">
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
              className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-md text-venice-dark-olive dark:text-venice-stone hover:bg-venice-beige/60 dark:hover:bg-venice-deep-olive/30 transition-colors"
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
                  <label className="text-sm font-medium text-venice-dark-olive dark:text-venice-stone">
                    Creativity
                  </label>
                  <span className="text-sm text-venice-olive-brown dark:text-venice-stone/80">
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
                  className="w-full h-2 bg-venice-beige rounded-lg appearance-none cursor-pointer accent-venice-bright-red dark:bg-venice-stone/50"
                />
                <div className="flex justify-between text-xs text-venice-olive-brown dark:text-venice-stone/80 mt-1">
                  <span>Subtle</span>
                  <span>Inventive</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-venice-dark-olive dark:text-venice-stone">
                    Adherence
                  </label>
                  <span className="text-sm text-venice-olive-brown dark:text-venice-stone/80">
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
                  className="w-full h-2 bg-venice-beige rounded-lg appearance-none cursor-pointer accent-venice-bright-red dark:bg-venice-stone/50"
                />
                <div className="flex justify-between text-xs text-venice-olive-brown dark:text-venice-stone/80 mt-1">
                  <span>Loose</span>
                  <span>Faithful</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-venice-dark-olive dark:text-venice-stone mb-1.5">
              <div className="flex items-center">
                Prompt (Optional)
                <Info size={14} className="ml-1.5 text-venice-stone dark:text-venice-stone/70" />
              </div>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                className={`w-full p-3 pr-10 border rounded-md shadow-sm focus:ring-venice-bright-red focus:border-venice-bright-red sm:text-sm resize-none dark:text-white
                  ${isGeneratingPrompt ? 'bg-venice-beige/50 dark:bg-venice-deep-olive/30 cursor-wait' : 'border-venice-stone/70 bg-white dark:bg-venice-deep-olive/20 dark:border-venice-stone/50'}
                `}
                placeholder={isGeneratingPrompt ? "Analyzing image, please wait..." : "Describe desired style or changes..."}
                value={settings.prompt || ''}
                onChange={(e) => updateSettings({ prompt: e.target.value })}
                disabled={isGeneratingPrompt}
              />
              {isGeneratingPrompt && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-850/70 rounded-md">
                  <Loader2 size={24} className="animate-spin text-venice-red" />
                </div>
              )}
              {!isGeneratingPrompt && settings.prompt && (
                <button
                  type="button"
                  onClick={() => updateSettings({ prompt: '' })}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label="Clear prompt"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {promptGenerationError && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                Error generating prompt: {promptGenerationError}
              </p>
            )}
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={() => { 
                updateSettings({ prompt: '', creativity: 0.5, adherence: 0.5, scale: '2x', enhance: true });
                // Optionally clear history too, or make a separate button
              }}
              className="w-full py-2.5 px-4 rounded-lg text-sm text-venice-olive-brown dark:text-venice-stone hover:bg-venice-beige/70 dark:hover:bg-venice-deep-olive/40 border border-venice-stone/50 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div> 

        <button
          type="button"
          className={`
            w-full py-3.5 px-4 mt-8 rounded-lg text-white font-semibold flex items-center justify-center transition-all text-base
            ${!hasSelectedImage || isProcessing || isGeneratingPrompt
              ? 'bg-venice-stone/70 dark:bg-venice-deep-olive/70 cursor-not-allowed'
              : 'bg-venice-bright-red hover:bg-d94f38 shadow-lg hover:shadow-xl transform hover:scale-105'}
          `}
          onClick={enhanceImages}
          disabled={!hasSelectedImage || isProcessing || isGeneratingPrompt}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2.5"></div>
              Enhancing...
            </>
          ) : isGeneratingPrompt ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2.5" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 size={20} className="mr-2" />
              Enhance Image
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UpscaleOptions;