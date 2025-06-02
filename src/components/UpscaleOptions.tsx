import React from 'react';
import { ChevronDown, Wand2, Info, X, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScaleOption, EnhanceSettings } from '../types';
import Tooltip from './Tooltip';

const UpscaleOptions: React.FC = () => {
  const {
    setScale, 
    toggleAdvanced, 
    isAdvancedOpen, 
    updateSettings,
    enhanceImages,
    images,
    selectedImageId
    // settings and promptGenerationError are now per-image
    // isGeneratingPrompt (global flag) is no longer used here for disabling UI elements directly;
    // we now use selectedImage.status to determine if the *selected* image is scanning.
  } = useApp();

  const FALLBACK_SETTINGS: EnhanceSettings = {
    scale: '2x',
    enhance: true,
    creativity: 0.35,
    adherence: 0.35,
    prompt: "",
  };

  const selectedImage = images.find(img => img.id === selectedImageId);
  const currentSettings = selectedImage?.settings || FALLBACK_SETTINGS;
  const currentPromptError = selectedImage?.status === 'error' && selectedImage?.error ? selectedImage.error : null;
  const isSelectedImageScanning = selectedImage?.status === 'scanning';
  
  const scaleOptions: { value: ScaleOption; label: string }[] = [
    { value: '1x', label: '1×' },
    { value: '2x', label: '2×' },
    { value: '4x', label: 'Max' }
  ];
  
  const hasSelectedImage = images.length > 0 && selectedImageId;
  const isProcessing = selectedImage?.status === 'processing';

  return (
    <div className="w-full">
      <div className="bg-venice-white rounded-lg p-6 shadow-lg border border-venice-beige 2xl:min-h-[399.46px]">
        {/* <h3 className="text-xl font-semibold text-venice-olive-brown mb-6">
          Enhancement Settings
        </h3> */}


        <div className='mb-6'>
            <label className="block text-sm font-medium text-venice-dark-olive mb-2">
              <div className="flex items-center">
                Scale
                <Tooltip text="The scale of the image to upscale. 2x is the default and recommended. 4x is the maximum scale.">
                  <Info size={14} className="ml-1.5 text-venice-stone cursor-help" />
                </Tooltip>
              </div>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {scaleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`
                    py-2.5 px-4 rounded-md text-sm font-medium transition-all
                    ${currentSettings.scale === option.value 
                      ? 'bg-venice-red/10 text-venice-red border-2 border-venice-red'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'}
                    ${!currentSettings.enhance && option.value === '1x' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => setScale(option.value)}
                  disabled={!currentSettings.enhance && option.value === '1x'}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {/* Enhance Image Toggle Section (MOVED HERE) */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-venice-dark-olive">
                <div className="flex items-center">
                  Enhance Image
                  <Tooltip text="Redraws the image at a higher resolution with added detail and creativity. Unlike simple upscaling, it lets the AI reinterpret parts of the image, often resulting in a more artistic or stylized version.">
                    <Info size={14} className="ml-1.5 text-venice-stone cursor-help" />
                  </Tooltip>
                </div>
              </label>
              <label htmlFor="enhance-toggle" className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="enhance-toggle"
                  className="sr-only peer" 
                  checked={currentSettings.enhance}
                  onChange={(e) => {
                    const isEnhanceEnabled = e.target.checked;
                    updateSettings({ enhance: isEnhanceEnabled });
                  }}
                />
                <div className="w-11 h-6 bg-venice-beige peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-venice-red/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-venice-bright-red"></div>
              </label>
            </div>
          </div>

          {/* Original settings div, now only with space-y-6 */}
          <div className="space-y-6">
            {/* Prompt Section - Conditionally Rendered */}
            {currentSettings.enhance && (
              <div>
                <label className="block text-sm font-medium text-venice-dark-olive mb-1.5">
                  <div className="flex items-center">
                    Prompt (Optional)
                    <Tooltip text="Describe the style (e.g. photo, anime) or materials (e.g. metal, glass) to guide results. Use simple prompts to preserve the image, or add subjects (e.g. mountain, cloud) to change it.">
                      <Info size={14} className="ml-1.5 text-venice-stone cursor-help" />
                    </Tooltip>
                  </div>
                </label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    rows={3}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-venice-red focus:ring-venice-red sm:text-sm p-3 resize-none placeholder-gray-400 ${isSelectedImageScanning ? 'bg-gray-100 cursor-wait' : 'bg-white'}`}
                    placeholder={isSelectedImageScanning ? "Analyzing image and generating prompt..." : currentPromptError ? "Error generating prompt. Check console or try again." : "Describe your desired style or leave blank for auto-magic..."}
                    value={currentSettings.prompt || ''}
                    onChange={(e) => updateSettings({ prompt: e.target.value })}
                    disabled={isSelectedImageScanning || !hasSelectedImage || isProcessing}
                  />
                  {isSelectedImageScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                      <Loader2 size={24} className="animate-spin text-venice-red" />
                    </div>
                  )}
                  {currentSettings.prompt && !isSelectedImageScanning && (
                    <button 
                      onClick={() => updateSettings({ prompt: '' })}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full"
                      aria-label="Clear prompt"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {currentPromptError && (
                  <p className="mt-2 text-sm text-red-600">{currentPromptError}</p>
                )}
              </div>
            )}

      
          
          <div>
            <button
              type="button"
              onClick={toggleAdvanced}
              className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-md text-venice-dark-olive hover:bg-venice-beige/60 transition-colors"
            >
              <span className="font-medium">Advanced Options</span>
              <ChevronDown
                size={18}
                className={`transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
              />
            </button>
            
            <div className={`mt-3 transition-all duration-300 overflow-hidden ${isAdvancedOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-venice-dark-olive">
                    <div className="flex items-center">
                      Creativity
                      <Tooltip text="How much creative freedom the AI has. Higher values can lead to more imaginative and stylized results, but may deviate more from the original image. Lower values stick closer to the original." position="bottom">
                        <Info size={14} className="ml-1.5 text-venice-stone cursor-help" />
                      </Tooltip>
                    </div>
                  </label>
                  <span className="text-sm text-venice-olive-brown">
                    {currentSettings.creativity.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05" // Step updated
                  value={currentSettings.creativity}
                  disabled={!currentSettings.enhance || isSelectedImageScanning} // Creativity disabled if enhance is off or selected image is scanning
                  onChange={(e) => updateSettings({ creativity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-venice-beige rounded-lg appearance-none cursor-pointer accent-venice-bright-red"
                />
                <div className="flex justify-between text-xs text-venice-olive-brown mt-1">
                  <span>Subtle</span>
                  <span>Inventive</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-venice-dark-olive">
                    <div className="flex items-center">
                      Adherence
                      <Tooltip text="How closely the output should adhere to the original image. Lower values allow more smoothing and AI interpretation. Higher values preserve details but may amplify imperfections or noise." position="top">
                        <Info size={14} className="ml-1.5 text-venice-stone cursor-help" />
                      </Tooltip>
                    </div>
                  </label>
                  <span className="text-sm text-venice-olive-brown">
                    {currentSettings.adherence.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05" // Step updated
                  value={currentSettings.adherence}
                  disabled={isSelectedImageScanning || !hasSelectedImage} // Adherence disabled if selected image is scanning or no image selected
                  onChange={(e) => updateSettings({ adherence: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-venice-beige rounded-lg appearance-none cursor-pointer accent-venice-bright-red"
                />
                <div className="flex justify-between text-xs text-venice-olive-brown mt-1">
                  <span>Loose</span>
                  <span>Faithful</span>
                </div>
              </div>


            </div>
          </div>
          

          
          {/* Buttons Row */}
          <div className="mt-8 flex flex-col items-center space-y-3 xs:flex-row xs:items-stretch xs:justify-center xs:space-x-3 xs:space-y-0">
            <button
              type="button"
              onClick={() => { 
                updateSettings({ 
                  prompt: '', 
                  creativity: 0.35,
                  adherence: 0.35,
                  scale: '2x', 
                  enhance: true 
                });
              }}
              className="w-4/5 xs:w-auto py-2 px-3 rounded-lg text-sm text-venice-olive-brown hover:bg-venice-beige/70 border border-venice-stone/50 transition-colors flex items-center justify-center"
              disabled={isSelectedImageScanning || isProcessing || !hasSelectedImage} 
              style={{minWidth: '30%'}}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className={`
               w-4/5 xs:w-auto py-2 px-3 rounded-lg text-white font-semibold flex items-center justify-center transition-all text-sm
                ${(!hasSelectedImage || isProcessing || isSelectedImageScanning || (!currentSettings.enhance && currentSettings.scale === '1x'))
                  ? 'bg-venice-stone/70 cursor-not-allowed'
                  : 'bg-venice-bright-red hover:bg-d94f38 shadow-md hover:shadow-lg transform hover:scale-102'}
              `}
              style={{minWidth: '45%'}}
              onClick={() => {
                if (selectedImage && selectedImage.id && currentSettings) {
                  enhanceImages([selectedImage.id], currentSettings.scale);
                }
              }}
              disabled={!hasSelectedImage || isProcessing || isSelectedImageScanning || (!currentSettings.enhance && currentSettings.scale === '1x')}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> {/* Adjusted icon size */}
                  Enhancing...
                </>
              ) : isSelectedImageScanning ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> {/* Adjusted icon size */}
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 size={18} className="mr-1.5" /> {/* Adjusted icon size */}
                  {(() => {
                    const scaleLabel = currentSettings.scale === '1x' ? 'Original' : currentSettings.scale === '2x' ? '2x' : 'Max';
                    if (currentSettings.enhance) {
                      return `Enhance ${scaleLabel}`;
                    }
                    if (currentSettings.scale === '1x') {
                      return `Upscale Original`;
                    }
                    return `Upscale ${scaleLabel}`;
                  })()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpscaleOptions;