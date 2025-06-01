import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ImageFile, HistoryItem, EnhanceSettings, ScaleOption, BottomPanelView } from '../types';
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
  isAdvancedOpen: boolean;
  isSidebarOpen: boolean;
  isScanningModalOpen: boolean;
  isGeneratingPrompt: boolean; // Derived from activePromptGenerations > 0
  scanningImageName: string | null;
  scanningImageUrl: string | null;
  successNotification: string | null;
  apiErrorNotification: string | null;
  isComparisonModalOpen: boolean;
  comparisonImages: { original: string; enhanced: string; operationType: 'enhanced' | 'upscaled' } | null;
  activeBottomPanelView: BottomPanelView;

  // State Setters & Functions
  setSuccessNotification: (message: string | null) => void;
  setApiErrorNotification: (message: string | null) => void;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  selectImage: (id: string | null) => void;
  updateSettings: (settings: Partial<EnhanceSettings>) => void;
  setScale: (scale: ScaleOption) => void; // Assuming this was for global settings, might need re-evaluation for per-image
  toggleAdvanced: () => void;
  toggleSidebar: () => void;
  closeScanningModal: () => void; // This might be redundant if modal is purely controlled by activePromptGenerations
  enhanceImages: (ids: string[], scale: ScaleOption) => Promise<void>; // Assuming enhanceImages is the correct name
  clearImages: () => void;
  generatePromptFromImage: (imageToAnalyze: ImageFile) => Promise<void>; // Kept for now, though primarily internal
  openComparisonModal: (originalUrl: string, enhancedUrl: string, operationType: 'enhanced' | 'upscaled') => void;
  closeComparisonModal: () => void;
  setActiveBottomPanelView: (view: BottomPanelView) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  // const [settings, setSettings] = useState<EnhanceSettings>({ // Removed for per-image settings
  //   scale: '2x',
  //   enhance: true,
  //   creativity: 0.35,
  //   adherence: 0.35,
  //   prompt: "",
  // });

  const DEFAULT_ENHANCE_SETTINGS: EnhanceSettings = {
    scale: '2x',
    enhance: true,
    creativity: 0.35,
    adherence: 0.35,
    prompt: "",
  };
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [promptQueue, setPromptQueue] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false); // Manages the lock for sequential prompt generation
  const [activePromptGenerations, setActivePromptGenerations] = useState(0);
  const [scanningImageName, setScanningImageName] = useState<string | null>(null);
  const [scanningImageUrl, setScanningImageUrl] = useState<string | null>(null); 
  // const [promptGenerationError, setPromptGenerationError] = useState<string | null>(null); // Removed
  const [successNotification, setSuccessNotification] = useState<string | null>(null); 
  const [apiErrorNotification, setApiErrorNotification] = useState<string | null>(null); 
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false); 
  const [comparisonImages, setComparisonImages] = useState<{ original: string; enhanced: string; operationType: 'enhanced' | 'upscaled' } | null>(null);
  const [activeBottomPanelView, setActiveBottomPanelViewState] = useState<BottomPanelView>('closed');

  // --- Utility and Core Logic Functions ---


  // useEffect(() => { // Commented out: History will be per-image and localStorage logic needs rework
  //   const savedHistory = localStorage.getItem('venice-history');
  //   if (savedHistory) {
  //     try {
  //       const parsedHistory = JSON.parse(savedHistory);
  //       if (Array.isArray(parsedHistory) && parsedHistory.every(item => item.id && item.originalImage && item.enhancedImage && item.settings && item.timestamp)) {
  //         setHistory(parsedHistory);
  //       } else {
  //         console.warn('Invalid history format in localStorage. Clearing.');
  //         localStorage.removeItem('venice-history');
  //       }
  //     } catch (error) {
  //       console.error('Failed to parse history from localStorage:', error);
  //       localStorage.removeItem('venice-history');
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('venice-history', JSON.stringify(history));
  // }, [history]);

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

  // --- Image Management Functions ---
  const addImages = async (files: File[]) => {
    setIsScanningModalOpen(true);
    const newImagesToAdd: ImageFile[] = [];

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
        settings: { ...DEFAULT_ENHANCE_SETTINGS }, // Initialize with default settings
        history: [], // Initialize with empty history
      };
      newImagesToAdd.push(newImage);
    }
    setIsScanningModalOpen(false);

    if (newImagesToAdd.length > 0) {
      setImages(prevImages => [...prevImages, ...newImagesToAdd]);
      
      const newImageIds = newImagesToAdd.map(img => img.id);
      setPromptQueue(prevQueue => [...prevQueue, ...newImageIds]);

      // If no image was previously selected, select the first of the newly added images.
      // Prompt generation will be handled by the queue.
      if (!selectedImageId && newImagesToAdd.length > 0) {
        const firstNewImage = newImagesToAdd[0];
        setSelectedImageId(firstNewImage.id);
        // No direct prompt trigger here, queue will handle it.
      }
    }
  };

  const removeImage = (id: string) => {
    let imageToRevokePreview: ImageFile | undefined;
    let newSelectedImageIdAfterRemove: string | null = null;

    setImages(prevImages => {
      imageToRevokePreview = prevImages.find(img => img.id === id);
      const remainingImages = prevImages.filter(img => img.id !== id);
      if (selectedImageId === id) {
        if (remainingImages.length > 0) {
          newSelectedImageIdAfterRemove = remainingImages[0].id;
          setSelectedImageId(newSelectedImageIdAfterRemove);
        } else {
          setSelectedImageId(null);
          newSelectedImageIdAfterRemove = null;
        }
      }
      return remainingImages;
    });

    // Also remove from prompt queue if it's there
    setPromptQueue(prevQueue => prevQueue.filter(queuedId => queuedId !== id));

    if (imageToRevokePreview) {
      URL.revokeObjectURL(imageToRevokePreview.preview);
      if (imageToRevokePreview.enhanced) { // Also revoke enhanced if it exists
        URL.revokeObjectURL(imageToRevokePreview.enhanced);
      }
      // Revoke all history item URLs for the removed image
      if (imageToRevokePreview.history && imageToRevokePreview.history.length > 0) {
        imageToRevokePreview.history.forEach(historyItem => {
          URL.revokeObjectURL(historyItem.enhancedUrl);
        });
      }
    }

    // If a new image was selected as a result of deletion, check if it needs a prompt
    // Need to find the image from the 'images' state which would have been updated by setImages
    if (newSelectedImageIdAfterRemove) {
      // Use a slight delay or useEffect to ensure 'images' state is updated before finding
      // For now, let's assume 'images' might not be immediately updated here for the find.
      // A more robust way would be to pass the image object or rely on useEffect based on selectedImageId change.
      // However, for queueing, adding the ID is sufficient if processPromptQueue correctly finds it.
      const newlySelectedImage = images.find(img => img.id === newSelectedImageIdAfterRemove);
      if (newlySelectedImage && (newlySelectedImage.status === 'idle' || (newlySelectedImage.status !== 'scanning' && !newlySelectedImage.settings.prompt))) {
        setPromptQueue((prevQueue: string[]) => {
          const filteredQueue = prevQueue.filter((queuedId: string) => queuedId !== newlySelectedImage.id);
          // Add to front of queue, ensuring no duplicates if it was already there (filteredQueue handles this)
          return [newlySelectedImage.id, ...filteredQueue]; 
        });
      }
    }
  };

  const selectImage = (id: string | null) => {
    const previouslySelectedId = selectedImageId;
    setSelectedImageId(id);
    const image = images.find(img => img.id === id);
    if (image && previouslySelectedId !== id) {
      // If selection changes, and the new image doesn't have a prompt yet (or we always want to refresh)
      // We might want to clear the global prompt or trigger generation for the newly selected one.
      // For now, let's clear the global prompt and trigger generation if it's 'idle'.
      if (image.status === 'idle' || (image.status !== 'scanning' && !image.settings.prompt)) {
        setPromptQueue((prevQueue: string[]) => {
          const filteredQueue = prevQueue.filter((queuedId: string) => queuedId !== image.id);
          // Add to front of queue, ensuring no duplicates
          return [image.id, ...filteredQueue]; 
        });
      }
      // If the image already has a prompt (e.g. loaded from history or previously generated and stored on ImageFile object)
      // you might want to load that into settings.prompt instead.
      // else if (image.generatedPrompt) { updateSettings({ prompt: image.generatedPrompt }); }
    }
  };

  const updateSettings = (newSettings: Partial<EnhanceSettings>) => {
    setImages(prevImages => prevImages.map(img => {
      if (img.id === selectedImageId) {
        // Start with the current image settings and apply incoming newSettings
        let updatedImgSettings = { ...img.settings, ...newSettings };

        // If 'enhance' is explicitly being set in newSettings
        if (newSettings.hasOwnProperty('enhance')) {
          if (newSettings.enhance === false) {
            // If enhance is being turned off, set creativity to 0
            updatedImgSettings.creativity = 0;
          } else if (newSettings.enhance === true && img.settings.enhance === false) {
            // If enhance is being turned on from a previously 'off' state,
            // and creativity was 0 (or we decide to always reset), reset creativity.
            // Using DEFAULT_ENHANCE_SETTINGS.creativity ensures consistency.
            if (updatedImgSettings.creativity === 0) { // Check if it was 0
                 updatedImgSettings.creativity = DEFAULT_ENHANCE_SETTINGS.creativity;
            }
          }
        }
        return { ...img, settings: updatedImgSettings };
      }
      return img;
    }));
  };

  const setScale = (scale: ScaleOption) => {
    updateSettings({ scale });
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
      const scaleValue = parseInt(imageToProcess.settings.scale.replace('x', ''), 10);

      const payload = {
        image: imageBase64,
        scale: scaleValue,
        enhance: imageToProcess.settings.enhance,
        enhanceCreativity: imageToProcess.settings.creativity,
        replication: imageToProcess.settings.adherence, // Mapping adherence to replication as per API docs
        enhancePrompt: imageToProcess.settings.enhance ? (imageToProcess.settings.prompt || '') : '', // Send empty prompt if enhance is false
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

        const operationType: 'enhanced' | 'upscaled' = imageToProcess.settings.enhance ? 'enhanced' : 'upscaled';
        setImages(prev =>
          prev.map(img => {
            if (img.id === selectedImageId) {
              // const oldEnhancedUrl = img.enhanced; // Keep for potential later, more granular revocation if needed

              const newHistoryItem: HistoryItem = {
                id: uuidv4(),
                timestamp: Date.now(),
                settingsUsed: { ...img.settings }, // Snapshot of settings used
                enhancedUrl: enhancedImageUrl,
                operationType: operationType,
              };

              const updatedImage = {
                ...img,
                status: 'complete' as const,
                enhanced: enhancedImageUrl,
                error: undefined,
                operationType,
                history: [newHistoryItem, ...(img.history || [])].slice(0, 20), // Add to per-image history, limit to 20
              };
              return updatedImage;
            }
            return img;
          })
        );
        setSuccessNotification('Image enhanced successfully!');
        openComparisonModal(imageToProcess.preview, enhancedImageUrl, operationType); // Pass operationType
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
      // Revoke all history item URLs for each image being cleared
      if (img.history && img.history.length > 0) {
        img.history.forEach(historyItem => {
          URL.revokeObjectURL(historyItem.enhancedUrl);
        });
      }
    });
    setImages([]);
    setSelectedImageId(null);
  };

  const generatePromptFromImage = async (imageToAnalyze: ImageFile) => { 
    if (!imageToAnalyze || !imageToAnalyze.preview || !imageToAnalyze.file) {
      console.error("[generatePromptFromImage] Invalid imageToAnalyze or missing preview/file for ID:", imageToAnalyze?.id);
      // setPromptGenerationError("Cannot generate prompt: Image data is missing.");
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
    // setPromptGenerationError(null); // Clear global prompt generation error state
    setActivePromptGenerations(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 1) {
        setIsScanningModalOpen(true);
      }
      setScanningImageName(imageToAnalyze.name);
      setScanningImageUrl(imageToAnalyze.preview);
      return newCount;
    });
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

      setImages(prevImages => prevImages.map(img => {
        if (img.id === imageToAnalyze.id) {
          return {
            ...img,
            settings: { ...img.settings, prompt: description, enhance: true },
            status: 'idle' as const, // Ensure status is of the correct literal type
            error: undefined
          };
        }
        return img;
      }));
      console.log("[generatePromptFromImage] Prompt updated in settings for image ID:", imageToAnalyze.id);

    } catch (error) { 
      console.error("[generatePromptFromImage] Error during prompt generation for image ID:", imageToAnalyze?.id, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompt.';
      // setPromptGenerationError(errorMessage); // Set global prompt generation error
      setApiErrorNotification(errorMessage); // Show notification
      // Update specific image status to 'error' and set the error message
      if (imageToAnalyze?.id) {
        setImages(prev => prev.map(img => img.id === imageToAnalyze.id ? { ...img, status: 'error', error: errorMessage } : img));
      }
    } finally {
      setActivePromptGenerations(prevCount => {
        const newCount = prevCount - 1;
        if (newCount === 0) {
          setIsScanningModalOpen(false);
          setScanningImageName(null);
          setScanningImageUrl(null);
        }
        // If other images are in queue and being processed by processPromptQueue,
        // the modal will update its name/image when the next generatePromptFromImage starts.
        return newCount;
      });
      setIsGeneratingPrompt(false); // Crucial for processPromptQueue to pick up next item
    }
    console.log("[generatePromptFromImage] Finished for image ID:", imageToAnalyze?.id);
  }; 

  const processPromptQueue = async () => {
    if (isGeneratingPrompt || promptQueue.length === 0) {
      return;
    }
    const nextImageId = promptQueue[0];
    const imageToProcess = images.find(img => img.id === nextImageId);

    if (imageToProcess) {
      setIsGeneratingPrompt(true); // Lock for this generation
      setPromptQueue((prevQueue: string[]) => prevQueue.slice(1));
      try {
        await generatePromptFromImage(imageToProcess);
      } finally {
        setIsGeneratingPrompt(false); // Unlock after this specific generation is done, regardless of success/failure
      }
    } else {
      console.warn(`[processPromptQueue] Image with ID ${nextImageId} not found. Removing from queue.`);
      setPromptQueue((prevQueue: string[]) => prevQueue.filter((id: string) => id !== nextImageId));
      if (promptQueue.length === 0) {
         setIsGeneratingPrompt(false); // Ensure it's false if queue becomes empty
      }
    }
  };

  const openComparisonModal = (originalUrl: string, enhancedUrl: string, operationType: 'enhanced' | 'upscaled') => {
    setComparisonImages({ original: originalUrl, enhanced: enhancedUrl, operationType });
    setIsComparisonModalOpen(true);
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
    setComparisonImages(null);
  };

  const setActiveBottomPanelView = (view: BottomPanelView) => {
    setActiveBottomPanelViewState((currentView: BottomPanelView) => {
      return currentView === view ? 'closed' : view;
    });
  };

  useEffect(() => {
    if (successNotification) {
      const timer = setTimeout(() => {
        setSuccessNotification(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successNotification]);

  useEffect(() => {
    if (apiErrorNotification) {
      const timer = setTimeout(() => {
        setApiErrorNotification(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [apiErrorNotification]);

  useEffect(() => {
    // Process the prompt queue
    if (!isGeneratingPrompt && promptQueue.length > 0) {
      processPromptQueue();
    }
  }, [isGeneratingPrompt, promptQueue, images, processPromptQueue]);

  return (
    <AppContext.Provider
      value={{
        images,
        selectedImageId,
        isAdvancedOpen,
        isSidebarOpen,
        isScanningModalOpen,
        isGeneratingPrompt: activePromptGenerations > 0, // Derived state
        scanningImageName,
        scanningImageUrl,
        successNotification,
        apiErrorNotification,
        isComparisonModalOpen,
        comparisonImages,
        activeBottomPanelView, // Added
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
        generatePromptFromImage, // Still exposed, might be for direct calls or testing
        openComparisonModal,
        closeComparisonModal,
        setActiveBottomPanelView, // Added
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