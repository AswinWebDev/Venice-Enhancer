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
    <div className="flex items-center p-3 space-x-3 bg-white border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 min-w-[240px] max-w-[320px]">
      <img 
        src={historyItem.enhancedUrl} 
        alt={`History ${historyItem.id}`} 
        className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
      />
      <div className="flex-grow flex flex-col justify-center">
        <p className="text-sm font-semibold text-gray-800 leading-snug" title={operationLabel}>
          {operationLabel}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          {new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <button 
        onClick={handlePreview}
        className="p-1.5 text-gray-500 hover:text-venice-red focus:outline-none focus-visible:ring-2 focus-visible:ring-venice-red-500 rounded-full transition-colors flex-shrink-0"
        title="Preview this version"
      >
        <Eye size={22} />
      </button>
    </div>
  );
};

export default CompactHistoryItem;
