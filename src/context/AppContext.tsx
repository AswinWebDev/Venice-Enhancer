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
  isGeneratingPrompt: boolean; 
  promptGenerationError: string | null; 
  successNotification: string | null; 
  apiErrorNotification: string | null; 
  isComparisonModalOpen: boolean; 
  comparisonImages: { original: string; enhanced: string } | null; 
  
  // Actions
  addImages: (files: File[]) => Promise<void>;
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
  openComparisonModal: (originalUrl: string, enhancedUrl: string) => void; 
  closeComparisonModal: () => void; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<EnhanceSettings>({
    scale: '2x',
    enhance: true,
    creativity: 0.35, // Default updated
    adherence: 0.35,  // Default updated
    prompt: "",
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false); 
  const [promptGenerationError, setPromptGenerationError] = useState<string | null>(null); 
  const [successNotification, setSuccessNotification] = useState<string | null>(null); 
  const [apiErrorNotification, setApiErrorNotification] = useState<string | null>(null); 
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false); 
  const [comparisonImages, setComparisonImages] = useState<{ original: string; enhanced: string } | null>(null); 
  
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

  const triggerPromptGeneration = (imageToProcess: ImageFile | null) => {
    if (!imageToProcess) {
      updateSettings({ prompt: "" });
      console.log("[triggerPromptGeneration] No image to process, cleared prompt.");
      return;
    }

    // Check if a prompt is already being generated for THIS specific image ID
    // This is a local check to prevent re-triggering for the same image if called in quick succession
    // The global isGeneratingPrompt is the main gatekeeper for concurrent API calls.
    if (imageToProcess.status === 'scanning') { 
        console.log(`[triggerPromptGeneration] Skipped for ${imageToProcess.id}, already in 'scanning' state.`);
        return;
    }

    if (!isGeneratingPrompt) {
      console.log(`[triggerPromptGeneration] Attempting for image: ${imageToProcess.id}`);
      updateSettings({ prompt: "" }); // Clear previous global prompt from settings/UI
      generatePromptFromImage(imageToProcess);
    } else {
      console.log(`[triggerPromptGeneration] Skipped for ${imageToProcess.id}, another prompt generation in progress (global isGeneratingPrompt).`);
    }
  };

  const addImages = async (files: File[]) => {
    setIsScanningModalOpen(true);
    const newImagesToAdd: ImageFile[] = [];
    let newlySelectedImageForPrompt: ImageFile | null = null;

    const MAX_PIXELS = 4096 * 4096;
    const MAX_FILE_SIZE_MB = 20;

    for (const file of Array.from(files)) {
      if (images.length + newImagesToAdd.length >= 5) {
        setApiErrorNotification('You can upload a maximum of 5 images.');
        break;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setApiErrorNotification(`File ${file.name} is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      try {
        // Dimension check
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl); // Revoke immediately after getting dimensions
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            console.error("Error loading image for dimension check:", err);
            reject(new Error(`Could not read image dimensions for ${file.name}.`));
          };
          img.src = objectUrl;
        });

        if (dimensions.width * dimensions.height > MAX_PIXELS) {
          setApiErrorNotification(`Image ${file.name} (${dimensions.width}x${dimensions.height}) is too large. Max dimensions ${4096}x${4096} pixels.`);
          continue;
        }
      } catch (error: any) {
        setApiErrorNotification(error.message || `Could not process ${file.name}.`);
        continue;
      }

      const imageId = uuidv4();
      const newImage: ImageFile = {
        id: imageId,
        file: file, // Store the original file object
        name: file.name,
        preview: URL.createObjectURL(file), // Create object URL for preview
        status: 'idle',
        progress: 0,
        selected: false,
      };
      newImagesToAdd.push(newImage);
    }
    setIsScanningModalOpen(false);

    if (newImagesToAdd.length > 0) {
      setImages(prevImages => [...prevImages, ...newImagesToAdd]);
      
      // If no image was previously selected, select the first of the newly added images
      // and mark it for prompt generation.
      if (!selectedImageId && newImagesToAdd.length > 0) {
        const firstNewImage = newImagesToAdd[0];
        setSelectedImageId(firstNewImage.id);
        newlySelectedImageForPrompt = firstNewImage; 
      }
    }

    // Trigger prompt generation outside the setImages updater, after state has likely updated
    if (newlySelectedImageForPrompt) {
        triggerPromptGeneration(newlySelectedImageForPrompt);
    }
  };

  const removeImage = (id: string) => {
    let imageToRevokePreview: ImageFile | undefined;
    let nextSelectedImageForPrompt: ImageFile | null = null;

    setImages(prevImages => {
      imageToRevokePreview = prevImages.find(img => img.id === id);
      const remainingImages = prevImages.filter(img => img.id !== id);
      
      if (selectedImageId === id) {
        if (remainingImages.length > 0) {
          const newSelectedImage = remainingImages[0];
          setSelectedImageId(newSelectedImage.id);
          nextSelectedImageForPrompt = newSelectedImage;
        } else {
          setSelectedImageId(null);
          nextSelectedImageForPrompt = null; // Signal to clear prompt
        }
      }
      return remainingImages;
    });

    if (imageToRevokePreview) {
      URL.revokeObjectURL(imageToRevokePreview.preview);
    }

    // Trigger prompt generation for the new selection or clear prompt
    // Do this after state updates have settled.
    // Need to handle the case where nextSelectedImageForPrompt is null (clear prompt)
    // or an actual image (generate for it).
    // The triggerPromptGeneration function handles null correctly.
    if (selectedImageId === id || (selectedImageId === null && !nextSelectedImageForPrompt)) { // ensures it's called if selection changed or cleared
        triggerPromptGeneration(nextSelectedImageForPrompt);
    }
  };

  const selectImage = (id: string) => {
    const previouslySelectedId = selectedImageId;
    setSelectedImageId(id);
    const image = images.find(img => img.id === id);
    if (image && previouslySelectedId !== id) {
      // If selection changes, and the new image doesn't have a prompt yet (or we always want to refresh)
      // We might want to clear the global prompt or trigger generation for the newly selected one.
      // For now, let's clear the global prompt and trigger generation if it's 'idle'.
      if (image.status === 'idle' || !settings.prompt) { // or some other condition
        updateSettings({ prompt: "" }); // Clear current prompt from UI
        triggerPromptGeneration(image);
      }
      // If the image already has a prompt (e.g. loaded from history or previously generated and stored on ImageFile object)
      // you might want to load that into settings.prompt instead.
      // else if (image.generatedPrompt) { updateSettings({ prompt: image.generatedPrompt }); }
    }
  };

  const updateSettings = (newSettings: Partial<EnhanceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // If enhance is being turned off, set creativity to 0
      if (newSettings.enhance === false) {
        updated.creativity = 0;
      }
      // If enhance is being turned on and creativity was 0 (likely due to enhance being off previously),
      // reset creativity to default.
      if (newSettings.enhance === true && prev.enhance === false && updated.creativity === 0) {
        updated.creativity = 0.35; // Reset to default when re-enabling enhance
      }
      return updated;
    });
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
        enhancePrompt: settings.enhance ? (settings.prompt || '') : '', // Send empty prompt if enhance is false
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

        // Auto-download the enhanced image
        const link = document.createElement('a');
        link.href = enhancedImageUrl;
        // Try to get a reasonable filename
        const originalFilename = imageToProcess.file.name.split('.').slice(0, -1).join('.');
        const fileExtension = imageToProcess.file.name.split('.').pop() || 'png';
        link.download = `${originalFilename}_enhanced.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // link.remove(); // Alternative for modern browsers

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
                originalImage: img.preview, // Changed back from url to preview
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
        openComparisonModal(imageToProcess.preview, enhancedImageUrl); // Changed back from url to preview
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
      URL.revokeObjectURL(img.preview); // Changed back from url to preview
      if (img.enhanced) URL.revokeObjectURL(img.enhanced);
    });
    setImages([]);
    setSelectedImageId(null);
  };

  const generatePromptFromImage = async (imageToAnalyze: ImageFile) => { 
    if (!imageToAnalyze || !imageToAnalyze.preview || !imageToAnalyze.file) {
      console.error("[generatePromptFromImage] Invalid imageToAnalyze or missing preview/file for ID:", imageToAnalyze?.id);
      setPromptGenerationError("Cannot generate prompt: Image data is missing.");
      // Update specific image status to 'error' if it exists in the array
      if (imageToAnalyze?.id) {
        setImages(prev => prev.map(img => img.id === imageToAnalyze.id ? { ...img, status: 'error', error: 'Image data missing' } : img));
      }
      setIsGeneratingPrompt(false); 
      return;
    }

    console.log("[generatePromptFromImage] Starting for image ID:", imageToAnalyze.id);
    // Update specific image status to 'scanning' and clear any previous error
    setImages(prev => prev.map(img => img.id === imageToAnalyze.id ? { ...img, status: 'scanning', error: undefined } : img));
    setIsGeneratingPrompt(true);
    setPromptGenerationError(null); // Clear global prompt generation error state
    console.log("[generatePromptFromImage] State set for prompt generation. Attempting fileToDataURL for image ID:", imageToAnalyze.id);

    try {
      const imageDataUrl = await fileToDataURL(imageToAnalyze.file); // Use the stored File object
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
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
      // Reset status to 'idle' and clear error on success
      setImages(prev => prev.map(img => img.id === imageToAnalyze.id ? { ...img, status: 'idle', error: undefined } : img)); 
      console.log("[generatePromptFromImage] Prompt updated in settings for image ID:", imageToAnalyze.id);

    } catch (error) { 
      console.error("[generatePromptFromImage] Error during prompt generation for image ID:", imageToAnalyze?.id, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompt.';
      setPromptGenerationError(errorMessage); // Set global prompt generation error
      setApiErrorNotification(errorMessage); // Show notification
      // Update specific image status to 'error' and set the error message
      if (imageToAnalyze?.id) {
        setImages(prev => prev.map(img => img.id === imageToAnalyze.id ? { ...img, status: 'error', error: errorMessage } : img));
      }
    }
    setIsGeneratingPrompt(false);
    console.log("[generatePromptFromImage] Finished for image ID:", imageToAnalyze?.id, "Current global prompt error state:", promptGenerationError);
  }; 

  const openComparisonModal = (originalUrl: string, enhancedUrl: string) => {
    setComparisonImages({ original: originalUrl, enhanced: enhancedUrl });
    setIsComparisonModalOpen(true);
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
    setComparisonImages(null);
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
        isGeneratingPrompt, 
        promptGenerationError, 
        successNotification, 
        apiErrorNotification, 
        isComparisonModalOpen, 
        comparisonImages, 
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
        openComparisonModal, 
        closeComparisonModal 
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