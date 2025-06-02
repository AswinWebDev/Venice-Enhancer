import React from 'react';
import { HistoryItem, EnhanceSettings } from '../types';
import { RefreshCcw, Eye, Settings2 } from 'lucide-react';

interface HistoryPanelProps {
  history?: HistoryItem[];
  onApplyHistoryItem: (settings: EnhanceSettings) => void;
  onPreviewHistoryItem: (imageUrl: string, originalUrl: string, operationType: 'enhanced' | 'upscaled') => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  imageName?: string;
  originalPreviewUrl?: string; // Needed to compare with a history item's enhancedUrl
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onApplyHistoryItem,
  onPreviewHistoryItem,
  isVisible,
  toggleVisibility,
  imageName,
  originalPreviewUrl
}) => {
  if (!isVisible) {
    return (
      <button 
        onClick={toggleVisibility}
        className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-l-md shadow-lg hover:bg-gray-600 transition-colors z-50"
        title="Show Enhancement History"
      >
        <Settings2 size={24} />
      </button>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], { 
      dateStyle: 'short', 
      timeStyle: 'short', 
      hour12: true 
    });
  };

  return (
    <div className="fixed top-0 right-0 h-full w-80 sm:w-96 bg-gray-100 dark:bg-gray-800 shadow-xl p-4 z-50 transition-transform duration-300 ease-in-out transform translate-x-0 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Enhancement History</h3>
        <button 
          onClick={toggleVisibility}
          className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          title="Hide History Panel"
        >
          &times;
        </button>
      </div>
      {imageName && <p className='text-sm text-gray-600 dark:text-gray-400 mb-1 truncate'>For: {imageName}</p>}

      {(!history || history.length === 0) ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No enhancement history for this image yet.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 pr-1">
          {history.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow">
              <div className="flex items-start space-x-3">
                <img src={item.enhancedUrl} alt="Enhanced version" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(item.timestamp)}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {item.operationType === 'enhanced' ? 'Enhanced' : 'Upscaled'} ({item.settingsUsed.scale})
                  </p>
                  {item.operationType === 'enhanced' && (
                     <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={item.settingsUsed.prompt || 'No prompt'}>
                      Prompt: {item.settingsUsed.prompt ? `"${item.settingsUsed.prompt}"` : 'N/A'}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Creativity: {item.settingsUsed.enhance ? item.settingsUsed.creativity : 'N/A'}, Adherence: {item.settingsUsed.enhance ? item.settingsUsed.adherence : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-2">
                <button 
                  onClick={() => onApplyHistoryItem(item.settingsUsed)}
                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center transition-colors"
                  title="Re-apply these settings"
                >
                  <RefreshCcw size={12} className="mr-1" /> Apply
                </button>
                {originalPreviewUrl && (
                  <button 
                    onClick={() => onPreviewHistoryItem(item.enhancedUrl, originalPreviewUrl, item.operationType)}
                    className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center transition-colors"
                    title="Preview this enhancement (vs original)"
                  >
                    <Eye size={12} className="mr-1" /> Preview
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
