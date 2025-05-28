import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ImageFile, HistoryItem, EnhanceSettings, ScaleOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert File to base64 string (without data:image/... prefix)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error('Base64 string is empty after splitting data URL.'));
        }
      } else {
        reject(new Error('Failed to read file as a data URL string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

interface AppContextType {
  images: ImageFile[];
  selectedImageId: string | null;
  history: HistoryItem[];
  settings: EnhanceSettings;
  isAdvancedOpen: boolean;
  isSidebarOpen: boolean;
  isScanningModalOpen: boolean;
  scanningImageName: string;
  
  // Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  selectImage: (id: string) => void;
  updateSettings: (newSettings: Partial<EnhanceSettings>) => void;
  setScale: (scale: ScaleOption) => void;
  toggleAdvanced: () => void;
  toggleSidebar: () => void;
  closeScanningModal: () => void;
  enhanceImages: () => Promise<void>;
  clearImages: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<EnhanceSettings>({
    scale: '2x',
    enhance: true,
    creativity: 0.5,
    adherence: 0.5,
    prompt: "",
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [scanningImageName, setScanningImageName] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('venice-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('venice-history', JSON.stringify(history));
  }, [history]);

  const addImages = (files: File[]) => {
    const newImages = files.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      selected: false,
      status: 'idle' as const,
    }));
    
    setImages(prev => [...prev, ...newImages]);
    
    if (!selectedImageId && newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
    }
    
    if (newImages.length > 0) {
      setScanningImageName(newImages[0].file.name);
      setIsScanningModalOpen(true);
      
      setTimeout(() => {
        setImages(prev => 
          prev.map(img => 
            img.id === newImages[0].id ? { ...img, status: 'scanning' as const } : img
          )
        );
        
        setTimeout(() => {
          setIsScanningModalOpen(false);
          setImages(prev => 
            prev.map(img => 
              img.id === newImages[0].id ? { ...img, status: 'idle' as const } : img
            )
          );
        }, 2000);
      }, 500);
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    setImages(prev => prev.filter(img => img.id !== id));
    
    if (selectedImageId === id) {
      const remainingImages = images.filter(img => img.id !== id);
      setSelectedImageId(remainingImages.length > 0 ? remainingImages[0].id : null);
    }
  };

  const selectImage = (id: string) => {
    setSelectedImageId(id);
  };

  const updateSettings = (newSettings: Partial<EnhanceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setScale = (scale: ScaleOption) => {
    setSettings(prev => ({ ...prev, scale }));
  };

  const toggleAdvanced = () => {
    setIsAdvancedOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const closeScanningModal = () => {
    setIsScanningModalOpen(false);
  };

  const enhanceImages = async () => {
    const apiKey = import.meta.env.VITE_VENICE_API_KEY;

    if (!apiKey) {
      console.error("Venice API key not found. Ensure VITE_VENICE_API_KEY is set in your .env file and the development server was restarted.");
      setImages(prev =>
        prev.map(img =>
          img.id === selectedImageId ? { ...img, status: 'error' as const, error: 'Configuration error: API key missing.' } : img
        )
      );
      return;
    }

    if (!selectedImageId) {
      console.warn('enhanceImages called without a selected image.');
      return;
    }

    const imageToProcess = images.find(img => img.id === selectedImageId);
    if (!imageToProcess) {
      console.warn(`Selected image with id ${selectedImageId} not found.`);
      return;
    }

    setImages(prev =>
      prev.map(img =>
        img.id === selectedImageId ? { ...img, status: 'processing' as const, error: undefined } : img
      )
    );

    try {
      const imageBase64 = await fileToBase64(imageToProcess.file);
      const scaleValue = parseInt(settings.scale.replace('x', ''), 10);

      const payload = {
        image: imageBase64,
        scale: scaleValue,
        enhance: settings.enhance,
        enhanceCreativity: settings.creativity,
        replication: settings.adherence, // Mapping adherence to replication as per API docs
        enhancePrompt: settings.prompt || '', // API expects a string, send empty if no prompt
      };

      const response = await fetch('https://api.venice.ai/api/v1/image/upscale', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        const enhancedImageUrl = URL.createObjectURL(imageBlob);

        setImages(prev =>
          prev.map(img => {
            if (img.id === selectedImageId) {
              // Revoke old enhanced image URL if it exists, before assigning new one
              if (img.enhanced) {
                URL.revokeObjectURL(img.enhanced);
              }
              const updatedImage = {
                ...img,
                status: 'complete' as const,
                enhanced: enhancedImageUrl,
                error: undefined,
              };

              const historyItem: HistoryItem = {
                id: uuidv4(),
                originalImage: img.preview, // Original image preview
                enhancedImage: enhancedImageUrl, // New enhanced image URL
                settings: { ...settings }, // Current settings used for enhancement
                timestamp: Date.now(),
              };
              setHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 50)); // Keep history to 50 items
              return updatedImage;
            }
            return img;
          })
        );
      } else {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
        } catch (e) {
          // Failed to parse JSON error, use status text or response text if available
          const textError = await response.text();
          if (textError) errorMessage += ` - ${textError}`;
        }
        console.error('API Error:', errorMessage, response);
        setImages(prev =>
          prev.map(img =>
            img.id === selectedImageId ? { ...img, status: 'error' as const, error: errorMessage } : img
          )
        );
      }
    } catch (error) {
      console.error('Failed to enhance image:', error);
      let errorMessage = 'An unexpected error occurred during enhancement.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setImages(prev =>
        prev.map(img =>
          img.id === selectedImageId ? { ...img, status: 'error' as const, error: errorMessage } : img
        )
      );
    }
  };
  
  const clearImages = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.enhanced) URL.revokeObjectURL(img.enhanced);
    });
    setImages([]);
    setSelectedImageId(null);
  };

  return (
    <AppContext.Provider
      value={{
        images,
        selectedImageId,
        history,
        settings,
        isAdvancedOpen,
        isSidebarOpen,
        isScanningModalOpen,
        scanningImageName,
        addImages,
        removeImage,
        selectImage,
        updateSettings,
        setScale,
        toggleAdvanced,
        toggleSidebar,
        closeScanningModal,
        enhanceImages,
        clearImages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};