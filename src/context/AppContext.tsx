import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ImageFile, HistoryItem, EnhanceSettings, ScaleOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert File to base64 string (without data:image/... prefix for upscale API)
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

// Helper function to convert File to full Data URL (for chat/completions API)
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as a data URL.'));
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
  isGeneratingPrompt: boolean; 
  promptGenerationError: string | null; 
  successNotification: string | null; 
  apiErrorNotification: string | null; 
  
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
  generatePromptFromImage: (imageFile: ImageFile) => Promise<void>; 
  setSuccessNotification: (message: string | null) => void; 
  setApiErrorNotification: (message: string | null) => void; 
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
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false); 
  const [promptGenerationError, setPromptGenerationError] = useState<string | null>(null); 
  const [successNotification, setSuccessNotification] = useState<string | null>(null); 
  const [apiErrorNotification, setApiErrorNotification] = useState<string | null>(null); 

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

  // Auto-dismiss success notification
  useEffect(() => {
    if (successNotification) {
      const timer = setTimeout(() => {
        setSuccessNotification(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successNotification]);

  // Auto-dismiss API error notification
  useEffect(() => {
    if (apiErrorNotification) {
      const timer = setTimeout(() => {
        setApiErrorNotification(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [apiErrorNotification]);

  const addImages = (files: File[]) => {
    const newImages = files.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      selected: false,
      status: 'idle' as const,
    }));
    
    setImages(prev => [...prev, ...newImages]);
    
    if (newImages.length > 0) {
      const firstNewImageId = newImages[0].id;
      if (!selectedImageId) {
        setSelectedImageId(firstNewImageId);
      }
      
      setScanningImageName(newImages[0].file.name);
      setIsScanningModalOpen(true);
      
      setTimeout(() => {
        setImages(prev => 
          prev.map(img => 
            img.id === firstNewImageId ? { ...img, status: 'scanning' as const } : img
          )
        );
        
        setTimeout(async () => { 
          setIsScanningModalOpen(false);            
          
          // Get the ImageFile object that we want to generate a prompt for.
          // It should be in the `newImages` array created at the start of `addImages`.
          const imageToProcessForPrompt = newImages.find(img => img.id === firstNewImageId);

          // Update its status to 'idle'
          setImages(prev =>                         
            prev.map(img => 
              img.id === firstNewImageId ? { ...img, status: 'idle' as const } : img
            )
          );
          
          // Now, call generatePromptFromImage with the found image object.
          if (imageToProcessForPrompt) {
            console.log("addImages: Calling generatePromptFromImage for image ID:", imageToProcessForPrompt.id);
            await generatePromptFromImage(imageToProcessForPrompt);
          } else {
            console.error("addImages: CRITICAL - Could not find image in newImages array. ID:", firstNewImageId);
            setPromptGenerationError("Internal error: Failed to prepare image for prompt.");
          }
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
      setApiErrorNotification('Configuration error: API key missing.');
      return;
    }

    if (!selectedImageId) {
      console.warn('enhanceImages called without a selected image.');
      setApiErrorNotification('No image selected for enhancement.');
      return;
    }

    const imageToProcess = images.find(img => img.id === selectedImageId);
    if (!imageToProcess) {
      console.warn(`Selected image with id ${selectedImageId} not found.`);
      setApiErrorNotification('Selected image not found.');
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
        setSuccessNotification('Image enhanced successfully!');
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
        setApiErrorNotification(errorMessage);
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
      setApiErrorNotification(errorMessage);
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

  const generatePromptFromImage = async (imageToAnalyze: ImageFile) => { 
    console.log("[generatePromptFromImage] Called for image ID:", imageToAnalyze?.id);
    const apiKey = import.meta.env.VITE_VENICE_API_KEY;
    if (!apiKey) {
      console.error("[generatePromptFromImage] Venice API key not found.");
      setPromptGenerationError('Configuration error: API key missing.');
      setApiErrorNotification('Configuration error: API key missing.');
      return;
    }
    console.log("[generatePromptFromImage] API key found.");

    if (!imageToAnalyze || !imageToAnalyze.file) {
      console.error("[generatePromptFromImage] Invalid image data passed. Image ID:", imageToAnalyze?.id, "File exists:", !!imageToAnalyze?.file);
      setPromptGenerationError('Internal error: Invalid image data for prompt generation.');
      setApiErrorNotification('Internal error: Invalid image data for prompt generation.');
      return;
    }
    console.log("[generatePromptFromImage] Image data appears valid. File name:", imageToAnalyze.file.name);

    setIsGeneratingPrompt(true);
    setPromptGenerationError(null);
    console.log("[generatePromptFromImage] State set for prompt generation. Attempting fileToDataURL for image ID:", imageToAnalyze.id);

    try {
      const imageDataUrl = await fileToDataURL(imageToAnalyze.file);
      console.log("[generatePromptFromImage] fileToDataURL successful for image ID:", imageToAnalyze.id, "Data URL length:", imageDataUrl?.length);

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen-2.5-vl",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "First give a short, concise title (3-5 words) for this image, then write a detailed prompt with which I can replicate this image with an AI image generator. Format your response exactly like this - Title: [title] Prompt: [detailed prompt]",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageDataUrl, // Use the full Data URL here
                  },
                },
              ],
            },
          ],
          venice_parameters: {
            include_venice_system_prompt: true,
          },
          temperature: 0.7,
          max_tokens: 400,
          stream: false,
        }),
      };

      const response = await fetch(
        "https://api.venice.ai/api/v1/chat/completions",
        options
      );
      
      console.log("[generatePromptFromImage] Fetch response status:", response.status, "for image ID:", imageToAnalyze.id);
    
      if (!response.ok) {
        let errorMsg = `API Error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.detail || errorData.error || errorMsg;
        } catch (e) {
            errorMsg += ` - ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      console.log("[generatePromptFromImage] API response OK for image ID:", imageToAnalyze.id);

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error("[generatePromptFromImage] No content in API response for image ID:", imageToAnalyze.id);
        throw new Error('No content in API response for prompt generation.');
      }
      console.log("[generatePromptFromImage] Content received from API for image ID:", imageToAnalyze.id);

      const promptMatch = content.match(/Prompt:\s*(.*)/is);
      
      const description = promptMatch ? promptMatch[1].trim() : content.trim();

      updateSettings({ prompt: description });
      console.log("[generatePromptFromImage] Prompt updated in settings for image ID:", imageToAnalyze.id);

    } catch (error) {
      console.error("[generatePromptFromImage] Error during prompt generation for image ID:", imageToAnalyze?.id, error);
      setPromptGenerationError(error instanceof Error ? error.message : 'Failed to generate prompt.');
      setApiErrorNotification(error instanceof Error ? error.message : 'Failed to generate prompt.');
    }
    setIsGeneratingPrompt(false);
    console.log("[generatePromptFromImage] Finished for image ID:", imageToAnalyze?.id, "Error state:", promptGenerationError);
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
        isGeneratingPrompt, 
        promptGenerationError, 
        successNotification, 
        apiErrorNotification, 
        setSuccessNotification, 
        setApiErrorNotification, 
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
        generatePromptFromImage, 
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