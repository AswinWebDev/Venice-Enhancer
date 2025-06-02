import React from 'react';
import { HistoryItem } from '../types';
import { useApp } from '../context/AppContext';
import { Eye } from 'lucide-react';

interface CompactHistoryItemProps {
  historyItem: HistoryItem;
  originalImagePreviewUrl: string; // The preview URL of the original, unenhanced image
}

const CompactHistoryItem: React.FC<CompactHistoryItemProps> = ({ historyItem, originalImagePreviewUrl }) => {
  const { openComparisonModal } = useApp();

  const handlePreview = () => {
    openComparisonModal(originalImagePreviewUrl, historyItem.enhancedUrl, historyItem.operationType || 'enhanced');
  };

  // Determine a concise label for the operation
  let operationLabel = 'Enhanced';
  if (historyItem.operationType === 'upscaled') {
    operationLabel = `Upscaled ${historyItem.settingsUsed.scale}`;
  } else if (historyItem.settingsUsed.prompt && historyItem.settingsUsed.prompt.length > 0) {
    operationLabel = 'Prompt Enhanced';
  }

  return (
    <div className="flex items-center p-2 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow duration-200 space-x-3 min-w-[200px] max-w-[280px]">
      <img 
        src={historyItem.enhancedUrl} 
        alt={`History ${historyItem.id}`} 
        className="w-16 h-16 object-cover rounded-md border border-gray-300"
      />
      <div className="flex-grow overflow-hidden">
        <p className="text-xs font-semibold text-black truncate" title={operationLabel}>
          {operationLabel}
        </p>
        <p className="text-xs text-neutral-700">
          {new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <button 
        onClick={handlePreview}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-venice-red dark:hover:text-venice-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-venice-red-500 rounded-full transition-colors"
        title="Preview this version"
      >
        <Eye size={20} />
      </button>
    </div>
  );
};

export default CompactHistoryItem;
