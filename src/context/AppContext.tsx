import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ImageFile, HistoryItem, EnhanceSettings, ScaleOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    if (images.length === 0) return;
    
    setImages(prev => 
      prev.map(img => 
        img.id === selectedImageId ? { ...img, status: 'processing' as const } : img
      )
    );
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setImages(prev => 
      prev.map(img => {
        if (img.id === selectedImageId) {
          const enhancedImage = { 
            ...img, 
            status: 'complete' as const,
            enhanced: img.preview
          };
          
          const historyItem: HistoryItem = {
            id: uuidv4(),
            originalImage: img.preview,
            enhancedImage: img.preview,
            settings: { ...settings },
            timestamp: Date.now()
          };
          
          setHistory(prev => [historyItem, ...prev]);
          
          return enhancedImage;
        }
        return img;
      })
    );
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