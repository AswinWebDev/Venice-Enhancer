export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  selected: boolean;
  status: 'idle' | 'scanning' | 'processing' | 'complete' | 'error';
  enhanced?: string;
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
}

export type ScaleOption = '1x' | '2x' | '4x';