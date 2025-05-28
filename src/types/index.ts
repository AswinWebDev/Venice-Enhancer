export interface ImageFile {
  id: string;
  file: File; // Original file object, might not be needed long-term if preview is generated
  name: string; // Added to store the original file name
  preview: string; // Data URL for preview
  selected: boolean;
  status: 'idle' | 'scanning' | 'processing' | 'complete' | 'error';
  progress?: number; // Added for upload/enhancement progress tracking
  enhanced?: string; // Data URL for enhanced image
  error?: string;
}

export interface HistoryItem {
  id: string;
  originalImage: string;
  enhancedImage: string;
  settings: EnhanceSettings;
  timestamp: number;
}

export interface EnhanceSettings {
  scale: '1x' | '2x' | '4x';
  enhance: boolean;
  creativity: number;
  adherence: number;
  prompt?: string;
}

export type ScaleOption = '1x' | '2x' | '4x';